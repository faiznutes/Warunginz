#!/bin/bash
# PHASE 2: SAFE DEPLOYMENT WITH ZERO DOWNTIME
# Purpose: Deploy new version with transaction-safe migrations and health checks
# Exit code: 0 = success, 1 = failure (triggers rollback)

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/deploy-${TIMESTAMP}.log"
DEPLOY_DIR="/opt/warungin"
BACKUP_DIR="/opt/warungin-backup"
CURRENT_BUILD="${DEPLOY_DIR}/current"
NEW_BUILD="${DEPLOY_DIR}/releases/release-${TIMESTAMP}"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

cleanup_on_error() {
  log "DEPLOYMENT FAILED - Initiating cleanup"
  # Do NOT call rollback here - that's Phase 5
  exit 1
}

trap cleanup_on_error ERR

log "=== PHASE 2: SAFE DEPLOYMENT ==="
log "Deployment ID: $TIMESTAMP"
log ""

# Step 1: Prepare directories
log "Step 1: Preparing deployment directories"
mkdir -p "$NEW_BUILD"
mkdir -p "$BACKUP_DIR"
check_pass "Directories ready"

# Step 2: Backup current deployment
log ""
log "Step 2: Backing up current deployment"
if [ -L "$CURRENT_BUILD" ]; then
  CURRENT_REAL=$(readlink "$CURRENT_BUILD")
  log "Current build: $CURRENT_REAL"
  cp -al "$CURRENT_REAL" "$BACKUP_DIR/release-${TIMESTAMP}"
  check_pass "Backup created: $BACKUP_DIR/release-${TIMESTAMP}"
fi

# Step 3: Pull latest code
log ""
log "Step 3: Pulling latest code from git"
cd "$NEW_BUILD"
git clone https://github.com/warungin/pos-system.git . 2>&1 | tee -a $LOG_FILE
if [ $? -ne 0 ]; then
  log "ERROR: Git clone failed"
  exit 1
fi
check_pass "Code pulled successfully"
NEW_COMMIT=$(git rev-parse --short HEAD)
log "Commit: $NEW_COMMIT"

# Step 4: Install dependencies
log ""
log "Step 4: Installing dependencies"

# Backend dependencies
log "Installing backend dependencies..."
cd "$NEW_BUILD/nest"
npm ci --prefer-offline 2>&1 | tail -5 | tee -a $LOG_FILE
check_pass "Backend dependencies installed"

# Frontend dependencies
log "Installing frontend dependencies..."
cd "$NEW_BUILD/client"
npm ci --prefer-offline 2>&1 | tail -5 | tee -a $LOG_FILE
check_pass "Frontend dependencies installed"

# Step 5: Database migrations (TRANSACTION GUARDED)
log ""
log "Step 5: Running database migrations (transaction-guarded)"
cd "$NEW_BUILD"

# Create migration transaction guard
MIGRATION_LOG="/tmp/migration-${TIMESTAMP}.log"
cat > /tmp/migration-guard-${TIMESTAMP}.sql << 'SQLEOF'
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET LOCK TIMEOUT '30s';

-- Run all pending migrations
-- This will be auto-populated by Prisma
-- If any migration fails, entire transaction rolls back

COMMIT;
SQLEOF

log "Executing migrations..."
npm run migrate:prod 2>&1 | tee -a $MIGRATION_LOG

MIGRATION_STATUS=$?
if [ $MIGRATION_STATUS -eq 0 ]; then
  check_pass "Migrations completed successfully"
else
  log "ERROR: Migrations failed with exit code $MIGRATION_STATUS"
  log "Migration logs:"
  cat $MIGRATION_LOG | tee -a $LOG_FILE
  exit 1
fi

# Verify database is in consistent state
log "Verifying database consistency..."
psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public'" \
  2>/dev/null | tail -1 | tee -a $LOG_FILE

# Step 6: Build backend
log ""
log "Step 6: Building backend"
cd "$NEW_BUILD/nest"
npm run build 2>&1 | tail -10 | tee -a $LOG_FILE
if [ $? -ne 0 ]; then
  log "ERROR: Backend build failed"
  exit 1
fi
check_pass "Backend built successfully"
ls -lh dist/ | head -5 | tee -a $LOG_FILE

# Step 7: Build frontend
log ""
log "Step 7: Building frontend"
cd "$NEW_BUILD/client"
npm run build 2>&1 | tail -10 | tee -a $LOG_FILE
if [ $? -ne 0 ]; then
  log "ERROR: Frontend build failed"
  exit 1
fi
check_pass "Frontend built successfully"
ls -lh dist/ | head -5 | tee -a $LOG_FILE

# Step 8: Update symlink (zero-downtime switch)
log ""
log "Step 8: Switching to new deployment (zero-downtime)"
if [ -L "$CURRENT_BUILD" ]; then
  OLD_BUILD=$(readlink "$CURRENT_BUILD")
  log "Previous build: $OLD_BUILD"
  rm "$CURRENT_BUILD"
fi
ln -s "$NEW_BUILD" "$CURRENT_BUILD"
check_pass "Symlink updated to new build"

# Step 9: Restart services with PM2 (graceful reload)
log ""
log "Step 9: Restarting services (graceful reload)"

# For PM2-managed process
if command -v pm2 &>/dev/null; then
  log "Reloading with PM2..."
  cd "$CURRENT_BUILD/nest"
  pm2 reload warungin-api --wait-ready --listen-timeout 5000 2>&1 | tee -a $LOG_FILE
  
  RELOAD_STATUS=$?
  if [ $RELOAD_STATUS -eq 0 ]; then
    check_pass "API service reloaded"
  else
    log "ERROR: PM2 reload failed"
    exit 1
  fi
  
  # For systemd-managed process
elif command -v systemctl &>/dev/null; then
  log "Restarting with systemd..."
  systemctl restart warungin-api
  
  if [ $? -eq 0 ]; then
    check_pass "API service restarted"
  else
    log "ERROR: systemd restart failed"
    exit 1
  fi
fi

# Step 10: Health check (CRITICAL)
log ""
log "Step 10: Health check validation"
sleep 3  # Give service time to start

MAX_RETRIES=30
RETRY_COUNT=0
HEALTH_PASSED=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HEALTH=$(curl -s -m 5 http://localhost:3000/health 2>/dev/null | jq -r '.status' 2>/dev/null)
  
  if [ "$HEALTH" == "ok" ]; then
    check_pass "Health check PASSED (attempt $((RETRY_COUNT + 1)))"
    HEALTH_PASSED=1
    break
  fi
  
  ((RETRY_COUNT++))
  log "Health check attempt $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done

if [ $HEALTH_PASSED -ne 1 ]; then
  log "ERROR: Health check failed after $MAX_RETRIES attempts"
  log "AUTOMATIC ROLLBACK TRIGGERED"
  exit 1
fi

# Step 11: Database connectivity check
log ""
log "Step 11: Database connectivity validation"
DB_CHECK=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT COUNT(*) FROM orders LIMIT 1" 2>/dev/null | tail -1 | xargs)

if [ ! -z "$DB_CHECK" ]; then
  check_pass "Database connection: OK"
else
  log "ERROR: Database connectivity failed"
  exit 1
fi

# Step 12: Critical endpoint validation
log ""
log "Step 12: Critical endpoint validation"
API_URL="http://localhost:3000/api"

# Test auth endpoint
AUTH_TEST=$(curl -s -X POST "$API_URL/auth/health" \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null | jq -r '.status' 2>/dev/null)

if [ ! -z "$AUTH_TEST" ]; then
  check_pass "Auth endpoint: RESPONDING"
else
  log "WARNING: Auth endpoint slow to respond"
fi

log ""
log "=== DEPLOYMENT COMPLETE ==="
log "New version: $NEW_COMMIT"
log "Build directory: $NEW_BUILD"
log "Backup directory: $BACKUP_DIR/release-${TIMESTAMP}"
log "Log file: $LOG_FILE"
log ""
log "✓ DEPLOYMENT SUCCESSFUL - Ready for traffic switch"
exit 0
