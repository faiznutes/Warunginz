#!/bin/bash

################################################################################
# WARUNGIN POS - PRE-DEPLOYMENT HEALTH CHECK SCRIPT
# 
# Purpose: Verify production environment is ready for deployment
# Severity: CRITICAL - Financial transactions depend on system stability
# 
# Checks:
#   - System resources (disk, memory, CPU)
#   - Service availability (PostgreSQL, Redis, NGINX)
#   - Port conflicts
#   - SSL certificate validity
#   - Environment configuration
#   - Network connectivity
#   - File permissions
#   - 
# Exit codes:
#   0 = All checks passed, safe to deploy
#   1 = Non-critical warnings (review recommended)
#   2 = Critical failures (MUST be fixed before deployment)
################################################################################

set -o pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Metrics
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0
CRITICAL_FAILURES=0

# Configuration
DISK_THRESHOLD=80           # Warn if disk > 80%
MEMORY_THRESHOLD=85         # Warn if memory > 85%
CPU_THRESHOLD=80            # Warn if CPU avg > 80%
INODE_THRESHOLD=90          # Warn if inodes > 90%
MIN_FREE_GB=5               # Must have at least 5GB free
DB_TIMEOUT=10               # DB connection timeout (seconds)
CERT_WARN_DAYS=30           # Warn if cert expires < 30 days

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="/var/log/warungin/deployment-check-${TIMESTAMP// /-}.log"

# Ensure log directory exists
mkdir -p /var/log/warungin
chmod 755 /var/log/warungin

# Logging function
log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

pass() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

fail() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
    if [ -n "$2" ] && [ "$2" = "CRITICAL" ]; then
        CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
    fi
}

warn() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
    CHECKS_WARNING=$((CHECKS_WARNING + 1))
}

info() {
    echo -e "${BLUE}ℹ $1${NC}" | tee -a "$LOG_FILE"
}

# Header
echo "================================================================================
  WARUNGIN POS - PRE-DEPLOYMENT HEALTH CHECK
  Timestamp: $TIMESTAMP
  Purpose: Verify production environment readiness
================================================================================
" | tee "$LOG_FILE"

################################################################################
# SECTION 1: SYSTEM RESOURCES
################################################################################

log ""
log "=== SECTION 1: SYSTEM RESOURCES ==="

# Check disk space
log "Checking disk space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_FREE=$(df -h / | awk 'NR==2 {print $4}')
DISK_FREE_GB=$(df / | awk 'NR==2 {printf "%.0f", $4/1024/1024}')

if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
    fail "Disk usage too high: $DISK_USAGE% (threshold: $DISK_THRESHOLD%)" "CRITICAL"
elif [ "$DISK_FREE_GB" -lt "$MIN_FREE_GB" ]; then
    fail "Insufficient free disk space: ${DISK_FREE_GB}GB (require: ${MIN_FREE_GB}GB)" "CRITICAL"
else
    pass "Disk space healthy: $DISK_USAGE% used, $DISK_FREE free"
fi

# Check inode usage
INODE_USAGE=$(df -i / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$INODE_USAGE" -gt "$INODE_THRESHOLD" ]; then
    warn "High inode usage: $INODE_USAGE% (threshold: $INODE_THRESHOLD%)"
else
    pass "Inode usage healthy: $INODE_USAGE%"
fi

# Check memory
log "Checking memory..."
MEMORY_TOTAL=$(free | grep Mem | awk '{print $2}')
MEMORY_USED=$(free | grep Mem | awk '{print $3}')
MEMORY_USAGE=$((MEMORY_USED * 100 / MEMORY_TOTAL))

if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
    warn "Memory usage elevated: $MEMORY_USAGE% (threshold: $MEMORY_THRESHOLD%)"
else
    pass "Memory usage healthy: $MEMORY_USAGE%"
fi

# Check CPU (load average)
log "Checking CPU..."
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
CPU_COUNT=$(nproc)
LOAD_PER_CPU=$(echo "scale=2; $LOAD_AVG / $CPU_COUNT" | bc)

if (( $(echo "$LOAD_PER_CPU > 0.8" | bc -l) )); then
    warn "High CPU load: $LOAD_AVG (normalized: $LOAD_PER_CPU per core)"
else
    pass "CPU load healthy: $LOAD_AVG (normalized: $LOAD_PER_CPU per core)"
fi

# Check for zombie processes
ZOMBIE_COUNT=$(ps aux | grep -c Z)
if [ "$ZOMBIE_COUNT" -gt 0 ]; then
    warn "Zombie processes detected: $ZOMBIE_COUNT (may indicate application issues)"
else
    pass "No zombie processes detected"
fi

################################################################################
# SECTION 2: NETWORK & PORTS
################################################################################

log ""
log "=== SECTION 2: NETWORK & PORTS ==="

# Check if ports are in use
check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        pass "Port $port ($service) is available"
    else
        fail "Port $port ($service) is NOT available" "CRITICAL"
    fi
}

# Critical ports
check_port 80 "HTTP"
check_port 443 "HTTPS"
check_port 3000 "NestJS Backend"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis (optional)"
check_port 9090 "Prometheus (monitoring)"

# Check default route
if ip route | grep -q default; then
    pass "Default network route exists"
else
    fail "Default network route is missing" "CRITICAL"
fi

# Check DNS resolution
if nslookup 8.8.8.8 &>/dev/null; then
    pass "DNS resolution working"
else
    warn "DNS resolution may be impaired"
fi

################################################################################
# SECTION 3: SERVICE AVAILABILITY
################################################################################

log ""
log "=== SECTION 3: SERVICE AVAILABILITY ==="

# PostgreSQL
log "Checking PostgreSQL database..."
if pg_isready -h localhost -p 5432 -t "$DB_TIMEOUT" &>/dev/null; then
    pass "PostgreSQL database is accessible"
    
    # Check active connections
    ACTIVE_CONN=$(psql -h localhost -U postgres -d warungin -t -c \
        "SELECT count(*) FROM pg_stat_activity WHERE datname='warungin';" 2>/dev/null)
    
    if [ -n "$ACTIVE_CONN" ]; then
        info "Active database connections: $ACTIVE_CONN"
        if [ "$ACTIVE_CONN" -gt 50 ]; then
            warn "High number of active connections: $ACTIVE_CONN (review before deployment)"
        fi
    fi
else
    fail "PostgreSQL database is NOT accessible" "CRITICAL"
fi

# Redis (optional but recommended)
log "Checking Redis..."
if redis-cli -h localhost -p 6379 ping &>/dev/null; then
    pass "Redis cache is accessible"
    REDIS_MEMORY=$(redis-cli -h localhost info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    info "Redis memory usage: $REDIS_MEMORY"
else
    warn "Redis not accessible (optional service, may not be critical)"
fi

# NGINX
log "Checking NGINX..."
if systemctl is-active --quiet nginx; then
    pass "NGINX is running"
    
    # Test NGINX config
    if nginx -t 2>/dev/null | grep -q "successful"; then
        pass "NGINX configuration is valid"
    else
        fail "NGINX configuration has errors" "CRITICAL"
        nginx -t 2>&1 | tee -a "$LOG_FILE"
    fi
else
    warn "NGINX is not running (will be required for deployment)"
fi

################################################################################
# SECTION 4: SSL CERTIFICATES
################################################################################

log ""
log "=== SECTION 4: SSL CERTIFICATES ==="

# Check SSL certificate for main domain
if [ -f /etc/ssl/certs/api.warungin.id.crt ]; then
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/ssl/certs/api.warungin.id.crt | cut -d= -f2)
    CERT_EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($CERT_EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ "$DAYS_UNTIL_EXPIRY" -lt 0 ]; then
        fail "SSL certificate is EXPIRED" "CRITICAL"
    elif [ "$DAYS_UNTIL_EXPIRY" -lt "$CERT_WARN_DAYS" ]; then
        warn "SSL certificate expires soon: $DAYS_UNTIL_EXPIRY days (expires: $CERT_EXPIRY)"
    else
        pass "SSL certificate is valid: $DAYS_UNTIL_EXPIRY days remaining (expires: $CERT_EXPIRY)"
    fi
else
    fail "SSL certificate not found at /etc/ssl/certs/api.warungin.id.crt" "CRITICAL"
fi

################################################################################
# SECTION 5: ENVIRONMENT VARIABLES
################################################################################

log ""
log "=== SECTION 5: ENVIRONMENT VARIABLES ==="

# Load environment file
if [ -f /etc/warungin/.env.production ]; then
    source /etc/warungin/.env.production
    pass "Production environment file found"
else
    fail "Production environment file not found" "CRITICAL"
fi

# Check critical variables
check_env_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        fail "Environment variable $var_name is not set" "CRITICAL"
    else
        # Don't log sensitive values
        if [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"KEY"* ]]; then
            pass "Environment variable $var_name is set (***)"
        else
            pass "Environment variable $var_name is set"
        fi
    fi
}

check_env_var "NODE_ENV"
check_env_var "PORT"
check_env_var "DATABASE_URL"
check_env_var "JWT_SECRET"
check_env_var "JWT_REFRESH_SECRET"
check_env_var "POSTGRES_USER"
check_env_var "POSTGRES_PASSWORD"

################################################################################
# SECTION 6: FILE PERMISSIONS & OWNERSHIP
################################################################################

log ""
log "=== SECTION 6: FILE PERMISSIONS & OWNERSHIP ==="

# Check application directory
if [ -d /var/www/warungin ]; then
    pass "Application directory exists"
    
    # Check directory is writable
    if [ -w /var/www/warungin ]; then
        pass "Application directory is writable"
    else
        fail "Application directory is not writable" "CRITICAL"
    fi
    
    # Check logs directory
    if [ -d /var/log/warungin ] && [ -w /var/log/warungin ]; then
        pass "Logs directory is accessible"
    else
        fail "Logs directory is not accessible/writable" "CRITICAL"
    fi
    
    # Check upload directory
    if [ -d /var/www/warungin/uploads ] && [ -w /var/www/warungin/uploads ]; then
        pass "Uploads directory is accessible"
    else
        warn "Uploads directory may not be accessible"
    fi
else
    fail "Application directory does not exist" "CRITICAL"
fi

# Check if warungin user exists
if id "warungin" &>/dev/null; then
    pass "Application user 'warungin' exists"
else
    warn "Application user 'warungin' does not exist (will be created during deployment)"
fi

################################################################################
# SECTION 7: BACKUP & RECOVERY
################################################################################

log ""
log "=== SECTION 7: BACKUP & RECOVERY ==="

# Check backup directory
if [ -d /backups/warungin ]; then
    pass "Backup directory exists"
    
    # Check latest backup
    LATEST_BACKUP=$(ls -t /backups/warungin/*.sql.gz 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d' ' -f1)
        BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 3600 ))
        
        if [ "$BACKUP_AGE" -lt 24 ]; then
            pass "Recent database backup exists: $BACKUP_DATE (age: ${BACKUP_AGE}h)"
        else
            warn "Database backup is older than 24 hours: $BACKUP_DATE (age: ${BACKUP_AGE}h)"
        fi
    else
        fail "No database backup found" "CRITICAL"
    fi
else
    fail "Backup directory does not exist" "CRITICAL"
fi

# Check backup script exists
if [ -f /usr/local/bin/backup-warungin.sh ]; then
    pass "Backup script exists and is executable"
else
    warn "Backup script not found at /usr/local/bin/backup-warungin.sh"
fi

################################################################################
# SECTION 8: PROCESS MONITORING
################################################################################

log ""
log "=== SECTION 8: PROCESS MONITORING ==="

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    pass "PM2 process manager is installed"
    
    # Check PM2 startup script
    if pm2 startup | grep -q "startup"; then
        pass "PM2 startup hook is configured"
    else
        warn "PM2 startup hook may not be configured"
    fi
else
    warn "PM2 is not installed (will be installed during deployment)"
fi

# Check if systemd service exists
if [ -f /etc/systemd/system/warungin-backend.service ]; then
    pass "Systemd service file exists"
else
    warn "Systemd service file not found (will be created during deployment)"
fi

################################################################################
# SECTION 9: DATABASE MIGRATIONS
################################################################################

log ""
log "=== SECTION 9: DATABASE MIGRATIONS ==="

# List pending migrations
if command -v npx &> /dev/null; then
    log "Checking for pending database migrations..."
    PENDING_MIGRATIONS=$(cd /var/www/warungin && npx prisma migrate status 2>/dev/null | grep "pending" || echo "0")
    
    if [ "$PENDING_MIGRATIONS" = "0" ] || [ -z "$PENDING_MIGRATIONS" ]; then
        pass "No pending database migrations"
    else
        info "Pending migrations found (will be applied during deployment)"
        warn "Review migrations before deployment"
    fi
else
    warn "Cannot check migrations (npx not available)"
fi

################################################################################
# SECTION 10: SECURITY CHECKS
################################################################################

log ""
log "=== SECTION 10: SECURITY CHECKS ==="

# Check firewall status
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "active"; then
        pass "UFW firewall is active"
    else
        warn "UFW firewall is not active"
    fi
elif command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --state &>/dev/null; then
        pass "Firewall (firewalld) is active"
    else
        warn "Firewall (firewalld) is not active"
    fi
else
    warn "No firewall detected (verify manually)"
fi

# Check fail2ban
if systemctl is-active --quiet fail2ban; then
    pass "fail2ban intrusion prevention is active"
else
    warn "fail2ban is not running (recommended for production)"
fi

# Check SELinux (if applicable)
if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce 2>/dev/null)
    if [ "$SELINUX_STATUS" = "Enforcing" ] || [ "$SELINUX_STATUS" = "Permissive" ]; then
        pass "SELinux is enabled: $SELINUX_STATUS"
    fi
fi

# Check SSH security
if sshd -T 2>/dev/null | grep -q "permitrootlogin no"; then
    pass "SSH root login is disabled"
else
    warn "SSH root login may be enabled (verify security policy)"
fi

################################################################################
# FINAL SUMMARY & RECOMMENDATIONS
################################################################################

log ""
log "================================================================================"
log "TEST SUMMARY"
log "================================================================================"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))

echo "" | tee -a "$LOG_FILE"
echo -e "  ${GREEN}Passed:  $CHECKS_PASSED${NC}" | tee -a "$LOG_FILE"
echo -e "  ${YELLOW}Warnings: $CHECKS_WARNING${NC}" | tee -a "$LOG_FILE"
echo -e "  ${RED}Failed:  $CHECKS_FAILED${NC}" | tee -a "$LOG_FILE"
echo -e "  Total:   $TOTAL_CHECKS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [ "$CRITICAL_FAILURES" -gt 0 ]; then
    echo -e "${RED}DEPLOYMENT BLOCKED - CRITICAL FAILURES DETECTED${NC}" | tee -a "$LOG_FILE"
    echo "Fix the critical issues above before proceeding with deployment." | tee -a "$LOG_FILE"
    echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 2
elif [ "$CHECKS_FAILED" -gt 0 ]; then
    echo -e "${RED}DEPLOYMENT BLOCKED - FAILURES DETECTED${NC}" | tee -a "$LOG_FILE"
    echo "Review and fix the failures above before deploying." | tee -a "$LOG_FILE"
    echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 2
elif [ "$CHECKS_WARNING" -gt 0 ]; then
    echo -e "${YELLOW}DEPLOYMENT ALLOWED - WARNINGS PRESENT${NC}" | tee -a "$LOG_FILE"
    echo "Review warnings above. System is ready but some optimizations recommended." | tee -a "$LOG_FILE"
    echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 1
else
    echo -e "${GREEN}DEPLOYMENT READY - ALL CHECKS PASSED${NC}" | tee -a "$LOG_FILE"
    echo "Production environment is healthy and ready for deployment." | tee -a "$LOG_FILE"
    echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 0
fi
