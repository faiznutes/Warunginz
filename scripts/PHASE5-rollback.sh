#!/bin/bash
# PHASE 5: EMERGENCY ROLLBACK
# Purpose: Quickly revert to previous stable version
# Exit code: 0 = rollback successful, 1 = rollback failed (critical)

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/rollback-${TIMESTAMP}.log"
BACKUP_DIR="/opt/warungin-backup"
CURRENT_BUILD="/opt/warungin/current"
DEPLOY_DIR="/opt/warungin"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "=== PHASE 5: EMERGENCY ROLLBACK ==="
log ""

# Step 1: Stop current API service
log "Step 1: Stopping current API service"
if command -v pm2 &>/dev/null; then
  pm2 stop warungin-api 2>&1 | tee -a $LOG_FILE
  sleep 2
else
  systemctl stop warungin-api 2>&1 | tee -a $LOG_FILE
fi
log "✓ API service stopped"

# Step 2: Find previous stable build
log ""
log "Step 2: Finding previous stable build"
BUILDS=$(ls -dt ${DEPLOY_DIR}/releases/* 2>/dev/null | head -2)
if [ -z "$BUILDS" ]; then
  log "ERROR: No previous builds found"
  exit 1
fi

# Get second-most recent (current is first)
PREVIOUS_BUILD=$(echo "$BUILDS" | sed -n '2p')
if [ -z "$PREVIOUS_BUILD" ]; then
  log "ERROR: No previous build available for rollback"
  exit 1
fi

log "Previous stable build: $PREVIOUS_BUILD"

# Step 3: Ask for database rollback (if not auto-rollback)
log ""
log "Step 3: Database state assessment"
READ_MODE=${1:-"auto"}  # Can pass "no-db-rollback" to skip DB restoration

# Check if database needs rollback
CURRENT_BACKUP=$(ls -t /backups/warungin-prod-*.sql.gz 2>/dev/null | head -1)
CURRENT_COMMIT=$(cd "$CURRENT_BUILD" && git rev-parse --short HEAD 2>/dev/null)
PREVIOUS_COMMIT=$(cd "$PREVIOUS_BUILD" && git rev-parse --short HEAD 2>/dev/null)

log "Current database commit: (unknown, check DB directly)"
log "Current build commit: $CURRENT_COMMIT"
log "Previous build commit: $PREVIOUS_COMMIT"

if [ "$READ_MODE" != "no-db-rollback" ]; then
  # Check if there are uncommitted migrations
  PENDING_MIGRATIONS=$(cd "$CURRENT_BUILD" && \
    psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
    -c "SELECT COUNT(*) FROM _prisma_migrations WHERE finished_at IS NULL" 2>/dev/null | tail -1 | xargs)
  
  if [ "$PENDING_MIGRATIONS" -gt 0 ]; then
    log "WARNING: $PENDING_MIGRATIONS pending migrations detected"
    log "Database rollback is RECOMMENDED but skipped to minimize downtime"
  fi
fi

# Step 4: Restore previous build symlink
log ""
log "Step 4: Restoring previous build"
rm -f "$CURRENT_BUILD"
ln -s "$PREVIOUS_BUILD" "$CURRENT_BUILD"
log "✓ Symlink restored to: $PREVIOUS_BUILD"

# Step 5: Start API service with previous build
log ""
log "Step 5: Starting previous version of API"
if command -v pm2 &>/dev/null; then
  cd "$CURRENT_BUILD/nest"
  pm2 start warungin-api --interpreter node 2>&1 | tee -a $LOG_FILE
  sleep 3
else
  systemctl start warungin-api 2>&1 | tee -a $LOG_FILE
  sleep 3
fi
log "✓ API service started"

# Step 6: Health check (critical)
log ""
log "Step 6: Verifying rollback - health check"
MAX_RETRIES=30
RETRY=0
HEALTH_OK=0

while [ $RETRY -lt $MAX_RETRIES ]; do
  HEALTH=$(curl -s -m 5 http://localhost:3000/health 2>/dev/null | jq -r '.status' 2>/dev/null)
  
  if [ "$HEALTH" == "ok" ]; then
    log "✓ API health check PASSED"
    HEALTH_OK=1
    break
  fi
  
  ((RETRY++))
  log "Health check attempt $RETRY/$MAX_RETRIES..."
  sleep 2
done

if [ $HEALTH_OK -ne 1 ]; then
  log "ERROR: Health check failed - rollback incomplete"
  exit 1
fi

# Step 7: Database connectivity
log ""
log "Step 7: Database connectivity check"
DB_TEST=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT COUNT(*) FROM orders LIMIT 1" 2>/dev/null | tail -1 | xargs)

if [ ! -z "$DB_TEST" ]; then
  log "✓ Database connectivity: OK"
else
  log "ERROR: Database connectivity failed"
  exit 1
fi

# Step 8: Restore NGINX routing (if changed during deployment)
log ""
log "Step 8: Restoring NGINX configuration"
if [ -f "/etc/nginx/sites-enabled/warungin.pre-switch-"* ]; then
  LATEST_BACKUP=$(ls -t /etc/nginx/sites-enabled/warungin.pre-switch-* 2>/dev/null | head -1)
  if [ ! -z "$LATEST_BACKUP" ]; then
    cp "$LATEST_BACKUP" /etc/nginx/sites-enabled/warungin
    nginx -t &>/dev/null && systemctl reload nginx
    log "✓ NGINX configuration restored"
  fi
fi

# Step 9: Verify API is responding to traffic
log ""
log "Step 9: API traffic test"
TRAFFIC_TEST=$(curl -s -m 5 https://api.warungin.id/api/health 2>/dev/null | jq -r '.status' 2>/dev/null)

if [ "$TRAFFIC_TEST" == "ok" ]; then
  log "✓ API responding to external traffic"
else
  log "WARNING: API not responding to external requests (check NGINX)"
fi

# Step 10: Transaction integrity check
log ""
log "Step 10: Database integrity check"
ORPHANED=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT COUNT(*) FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id WHERE o.id IS NULL" \
  2>/dev/null | tail -1 | xargs)

if [ "$ORPHANED" -eq 0 ]; then
  log "✓ Database integrity: OK"
else
  log "WARNING: Found $ORPHANED orphaned records (investigate)"
fi

# Step 11: Cleanup
log ""
log "Step 11: Cleaning up deployment artifacts"
FAILED_BUILD=$(ls -dt ${DEPLOY_DIR}/releases/* 2>/dev/null | head -1)
if [ "$FAILED_BUILD" != "$PREVIOUS_BUILD" ]; then
  log "Archiving failed build: $FAILED_BUILD"
  mkdir -p /opt/warungin-failed
  mv "$FAILED_BUILD" /opt/warungin-failed/
  log "✓ Failed build archived"
fi

# Step 12: Status report
log ""
log "=== ROLLBACK COMPLETE ==="
log "Status:"
log "  - Service: RUNNING (previous version)"
log "  - Database: CONNECTED"
log "  - API health: OK"
log "  - Previous build: $PREVIOUS_BUILD"
log "  - Log file: $LOG_FILE"
log ""
log "Next steps:"
log "  1. Review logs for root cause of failure"
log "  2. Investigate issue in failed build"
log "  3. Do NOT re-deploy same version"
log "  4. Fix issue and create new deployment"
log ""
log "✓ System restored to previous stable state"
exit 0
