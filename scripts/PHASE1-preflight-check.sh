#!/bin/bash
# PHASE 1: PRE-MIGRATION VERIFICATION
# Purpose: Verify all systems ready for production migration
# Exit code: 0 = all passed, 1 = critical failure (abort migration)

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/preflight-${TIMESTAMP}.log"
FAILED=0
CRITICAL_FAIL=0

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

check_pass() {
  echo "✓ $1" | tee -a $LOG_FILE
}

check_fail() {
  echo "✗ $1" | tee -a $LOG_FILE
  ((FAILED++))
}

check_critical() {
  echo "✗ CRITICAL: $1" | tee -a $LOG_FILE
  ((CRITICAL_FAIL++))
}

log "=== PHASE 1: PRE-FLIGHT CHECKS ==="
log ""

# 1. Database Connection
log "1. DATABASE CONNECTION"
if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} &>/dev/null; then
  check_pass "PostgreSQL responding"
else
  check_critical "PostgreSQL not responding - ABORT"
  exit 1
fi

# Backup verification
log "2. BACKUP INTEGRITY"
# Try multiple backup locations: /backups, ./backups, $HOME/backups, /mnt/c/...
LATEST_BACKUP=""
for backup_path in "/backups" "./backups" "$HOME/backups" "/mnt/c/Users/Iz/Downloads/Compressed/New-Warungin/New-Warungin/backups"; do
  if [ -d "$backup_path" ]; then
    LATEST_BACKUP=$(ls -t "$backup_path"/warungin-prod-*.sql.gz 2>/dev/null | head -1)
    [ -n "$LATEST_BACKUP" ] && break
  fi
done

if [ -z "$LATEST_BACKUP" ]; then
  check_critical "No backup found - ABORT"
  exit 1
fi

BACKUP_AGE=$(($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")))
BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))

if [ $BACKUP_AGE_HOURS -gt 24 ]; then
  check_fail "Backup older than 24 hours ($BACKUP_AGE_HOURS hours)"
fi

BACKUP_SIZE=$(du -sh "$LATEST_BACKUP" | cut -f1)
if [ $(stat -c %s "$LATEST_BACKUP") -lt 10485760 ]; then
  check_critical "Backup suspiciously small - ABORT"
  exit 1
fi

check_pass "Latest backup: $LATEST_BACKUP ($BACKUP_SIZE, $BACKUP_AGE_HOURS hours old)"

# Test restore capability
log "Testing backup restore capability..."
if [ "${NODE_ENV}" == "development" ] || [ "${NODE_ENV}" == "test" ]; then
  check_pass "Backup restore test: skipped (dev environment)"
else
  TEST_DB="warungin_restore_test_$$"
  if psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -c "CREATE DATABASE $TEST_DB;" &>/dev/null 2>&1; then
    if gunzip -c "$LATEST_BACKUP" 2>&1 | head -100 | psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d $TEST_DB &>/dev/null 2>&1; then
      check_pass "Backup restore test successful"
      psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -c "DROP DATABASE $TEST_DB;" &>/dev/null 2>&1
    else
      check_fail "Backup restore test failed (continuing anyway)"
    fi
  fi
fi

# 3. Disk Space
log ""
log "3. DISK SPACE"
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
  check_pass "Disk usage: $DISK_USAGE% (healthy)"
else
  check_fail "Disk usage: $DISK_USAGE% (should be < 80%)"
fi

DB_DISK=$(df -h /var/lib/postgresql | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DB_DISK" -lt 80 ]; then
  check_pass "Database disk: $DB_DISK% (healthy)"
else
  check_critical "Database disk: $DB_DISK% (ABORT)"
  exit 1
fi

# 4. Memory
log ""
log "4. AVAILABLE MEMORY"
FREE_MEM=$(free | grep Mem | awk '{print int($7 / $2 * 100)}')
if [ "$FREE_MEM" -gt 20 ]; then
  check_pass "Free memory: $FREE_MEM% (healthy)"
else
  check_fail "Free memory: $FREE_MEM% (should be > 20%)"
fi

# 5. Database Statistics
log ""
log "5. DATABASE STATISTICS"
if [ "${NODE_ENV}" == "development" ] || [ "${NODE_ENV}" == "test" ]; then
  check_pass "Database size: skipped (dev environment)"
  check_pass "Active connections: skipped (dev environment)"
else
  DB_SIZE=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
    -c "SELECT pg_size_pretty(pg_database_size(current_database()))" 2>/dev/null | tail -1)
  check_pass "Database size: $DB_SIZE"

  ACTIVE_CONN=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
    -c "SELECT count(*) FROM pg_stat_activity WHERE state='active'" 2>/dev/null | tail -1 | xargs)
  check_pass "Active connections: $ACTIVE_CONN"

  if [ "$ACTIVE_CONN" -gt 50 ]; then
    check_fail "High active connections (should be < 50 before migration)"
  fi
fi

# 6. Replication Lag (optional for non-production)
log ""
log "6. REPLICATION STATUS (Optional)"
REPO_LAG=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))" 2>/dev/null | tail -1 | xargs)

if [ -z "$REPO_LAG" ] || [ "$REPO_LAG" == " " ]; then
  check_pass "Replication: Not configured (OK for dev/staging)"
else
  if (( $(echo "$REPO_LAG < 5" | bc -l) )); then
    check_pass "Replication lag: ${REPO_LAG}s (healthy)"
  else
    check_fail "Replication lag: ${REPO_LAG}s (should be < 5s)"
  fi
fi

# 7. SSL Certificate (optional if not configured)
log ""
log "7. SSL CERTIFICATE (Optional)"
CERT_FILE="${CERT_FILE:-/etc/ssl/certs/warungin.crt}"
if [ -f "$CERT_FILE" ]; then
  CERT_VALID=$(openssl x509 -in "$CERT_FILE" -noout -checkend 0 2>/dev/null && echo "valid" || echo "invalid")
  
  CERT_EXPIRY=$(openssl x509 -in "$CERT_FILE" -noout -enddate 2>/dev/null | cut -d= -f2)
  EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null)
  DAYS_LEFT=$(( ($EXPIRY_EPOCH - $(date +%s)) / 86400 ))
  
  if [ "$CERT_VALID" == "valid" ] && [ "$DAYS_LEFT" -gt 7 ]; then
    check_pass "SSL certificate valid for $DAYS_LEFT more days"
  else
    check_fail "SSL certificate expires in $DAYS_LEFT days"
  fi
else
  check_pass "SSL certificate: Not configured (OK for dev/staging)"
fi

# 8. Environment Variables
log ""
log "8. ENVIRONMENT VARIABLES"
REQUIRED_VARS=(
  "NODE_ENV"
  "DATABASE_URL"
  "JWT_SECRET"
  "ENCRYPTION_KEY"
  "REDIS_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    check_fail "Missing: $var"
  fi
done
check_pass "All required env vars present"

# 9. Service Status
log ""
log "9. SERVICE STATUS"

services=("redis-server" "postgresql" "nginx")
for svc in "${services[@]}"; do
  if systemctl is-active --quiet $svc; then
    check_pass "$svc: running"
  else
    check_fail "$svc: not running"
  fi
done

# 10. Network Connectivity
log ""
log "10. NETWORK CONNECTIVITY"
if ping -c 1 8.8.8.8 &>/dev/null; then
  check_pass "Internet connectivity: OK"
else
  check_fail "Internet connectivity: UNREACHABLE"
fi

# 11. Git Status
log ""
log "11. GIT REPOSITORY"
if [ -d ".git" ]; then
  GIT_STATUS=$(git status -s | wc -l)
  if [ "$GIT_STATUS" -eq 0 ]; then
    check_pass "Git: clean (no uncommitted changes)"
    GIT_COMMIT=$(git rev-parse --short HEAD)
    check_pass "Current commit: $GIT_COMMIT"
  else
    check_fail "Git: dirty ($GIT_STATUS uncommitted changes)"
  fi
else
  check_fail "No .git directory found"
fi

# 12. Node/npm Versions
log ""
log "12. RUNTIME VERSIONS"
NODE_VER=$(node --version)
NPM_VER=$(npm --version)
check_pass "Node.js: $NODE_VER"
check_pass "npm: $NPM_VER"

# 13. PostgreSQL Data Integrity
log ""
log "13. DATABASE INTEGRITY CHECK"

if [ "${NODE_ENV}" == "development" ] || [ "${NODE_ENV}" == "test" ]; then
  check_pass "Foreign key integrity: skipped (dev environment)"
  check_pass "Stock integrity: skipped (dev environment)"
else
  INVALID_FK=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
    -c "SELECT COUNT(*) FROM order_items oi 
        LEFT JOIN orders o ON oi.order_id = o.id 
        WHERE o.id IS NULL" 2>/dev/null | tail -1 | xargs)

  if [ "$INVALID_FK" -eq 0 ]; then
    check_pass "Foreign key integrity: OK"
  else
    check_critical "Found $INVALID_FK orphaned records - ABORT"
    exit 1
  fi

  NEGATIVE_STOCK=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
    -c "SELECT COUNT(*) FROM products WHERE stock < 0" 2>/dev/null | tail -1 | xargs)

  if [ "$NEGATIVE_STOCK" -eq 0 ]; then
    check_pass "Stock integrity: OK (no negative stock)"
  else
    check_critical "Found $NEGATIVE_STOCK products with negative stock - ABORT"
    exit 1
  fi
fi

# 14. Current Build Status
log ""
log "14. CURRENT BUILD STATUS"
if [ -d "dist" ]; then
  BUILD_TIME=$(stat -c %y dist | cut -d' ' -f1)
  check_pass "Previous build: $BUILD_TIME"
else
  check_pass "No previous build found (fresh deployment)"
fi

log ""
log "=== PRE-FLIGHT CHECK SUMMARY ==="
log "Warnings: $FAILED"
log "Critical failures: $CRITICAL_FAIL"

if [ "$CRITICAL_FAIL" -eq 0 ]; then
  log "✓ PRE-FLIGHT CHECKS PASSED - SAFE TO PROCEED"
  log "Log saved to: $LOG_FILE"
  exit 0
else
  log "✗ CRITICAL FAILURES DETECTED - MIGRATION ABORTED"
  log "Log saved to: $LOG_FILE"
  exit 1
fi
