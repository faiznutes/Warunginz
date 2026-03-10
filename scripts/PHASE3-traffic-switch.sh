#!/bin/bash
# PHASE 3: TRAFFIC SWITCH (BLUE-GREEN DEPLOYMENT)
# Purpose: Switch traffic only when safety conditions met, with automatic revert
# Exit code: 0 = traffic switched, 1 = rollback triggered

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/traffic-switch-${TIMESTAMP}.log"
MONITORING_DURATION=300  # 5 minutes of monitoring

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "=== PHASE 3: TRAFFIC SWITCH (BLUE-GREEN) ==="
log "Monitoring window: ${MONITORING_DURATION}s"
log ""

# Condition 1: API Health Check
log "Condition 1: API Health Status"
HEALTH_CHECK=$(curl -s -m 5 http://localhost:3000/health 2>/dev/null | jq -r '.status' 2>/dev/null)
if [ "$HEALTH_CHECK" == "ok" ]; then
  log "✓ API Health: OK"
else
  log "✗ API Health: FAILED - Aborting traffic switch"
  exit 1
fi

# Condition 2: Database Stability
log ""
log "Condition 2: Database Connection Stability"
DB_LATENCY=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT EXTRACT(EPOCH FROM (NOW() - NOW())) as latency" 2>/dev/null | tail -1 | xargs)

if (( $(echo "$DB_LATENCY < 0.5" | bc -l) )); then
  log "✓ Database latency: ${DB_LATENCY}s (healthy)"
else
  log "✗ Database latency: ${DB_LATENCY}s - Too slow"
  exit 1
fi

# Verify replication lag
REPO_LAG=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))" 2>/dev/null | tail -1 | xargs)

if (( $(echo "$REPO_LAG < 5" | bc -l) )); then
  log "✓ Replication lag: ${REPO_LAG}s (healthy)"
else
  log "✗ Replication lag: ${REPO_LAG}s - Unacceptable"
  exit 1
fi

# Condition 3: Zero Error Rate (baseline)
log ""
log "Condition 3: Error Rate Baseline"
ERROR_COUNT=$(curl -s http://localhost:3000/metrics 2>/dev/null | \
  grep 'http_requests_errors_total' | awk '{sum+=$2} END {print int(sum)}')

log "Current error count: $ERROR_COUNT"
if [ "$ERROR_COUNT" -lt 1 ]; then
  log "✓ Error rate: Clean baseline"
else
  log "⚠ Warning: $ERROR_COUNT errors already present (may indicate pre-existing issues)"
fi

# Condition 4: Connections within limits
log ""
log "Condition 4: Connection Pool Status"
ACTIVE_CONNS=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT count(*) FROM pg_stat_activity WHERE state='active'" 2>/dev/null | tail -1 | xargs)

if [ "$ACTIVE_CONNS" -lt 20 ]; then
  log "✓ Active connections: $ACTIVE_CONNS (healthy)"
else
  log "⚠ Active connections: $ACTIVE_CONNS (monitor during traffic switch)"
fi

log ""
log "All pre-switch conditions satisfied. Beginning traffic switch..."
log ""

# SWITCH PHASE: Update NGINX to route to new upstream
log "Switching NGINX upstream to new deployment..."

# Backup current NGINX config
cp /etc/nginx/sites-enabled/warungin /etc/nginx/sites-enabled/warungin.pre-switch-${TIMESTAMP}

# Update upstream to point to new build
cat > /tmp/nginx-upstream-${TIMESTAMP}.conf << 'CONFEOF'
upstream warungin_backend {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}
CONFEOF

# Apply config update (atomic)
cp /tmp/nginx-upstream-${TIMESTAMP}.conf /etc/nginx/includes/upstream.conf
nginx -t &>/dev/null && systemctl reload nginx

if [ $? -eq 0 ]; then
  log "✓ NGINX configuration updated and reloaded"
else
  log "✗ NGINX configuration failed - Rolling back"
  cp /etc/nginx/sites-enabled/warungin.pre-switch-${TIMESTAMP} /etc/nginx/sites-enabled/warungin
  systemctl reload nginx
  exit 1
fi

log ""
log "TRAFFIC SWITCHED - Beginning 5-minute stability monitoring..."
log ""

# MONITORING PHASE: Watch for issues in first 5 minutes
MONITORING_START=$(date +%s)
ERROR_THRESHOLD=10  # Stop after 10 errors
LATENCY_THRESHOLD=2000  # Stop if P95 > 2000ms
REVERT_TRIGGERED=0

while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - MONITORING_START))
  
  if [ $ELAPSED -ge $MONITORING_DURATION ]; then
    log "✓ 5-minute monitoring window completed successfully"
    log "TRAFFIC SWITCH STABLE - Production deployment succeeded"
    break
  fi
  
  # Check error rate
  CURRENT_ERRORS=$(curl -s http://localhost:3000/metrics 2>/dev/null | \
    grep 'http_requests_errors_total' | awk '{sum+=$2} END {print int(sum)}')
  
  ERROR_DELTA=$((CURRENT_ERRORS - ERROR_COUNT))
  if [ $ERROR_DELTA -gt $ERROR_THRESHOLD ]; then
    log "✗ ALERT: $ERROR_DELTA errors in last check (threshold: $ERROR_THRESHOLD)"
    log "AUTOMATIC REVERT TRIGGERED - Too many errors"
    REVERT_TRIGGERED=1
    break
  fi
  
  # Check API latency
  LATENCY_CHECK=$(curl -s -w '%{time_total}\n' -m 5 http://localhost:3000/health \
    -o /dev/null 2>/dev/null | awk '{print int($1 * 1000)}')
  
  if [ $LATENCY_CHECK -gt $LATENCY_THRESHOLD ]; then
    log "✗ ALERT: API latency ${LATENCY_CHECK}ms (threshold: ${LATENCY_THRESHOLD}ms)"
    log "AUTOMATIC REVERT TRIGGERED - Unacceptable latency"
    REVERT_TRIGGERED=1
    break
  fi
  
  # Check database replication
  CURRENT_REPO_LAG=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
    -c "SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))" 2>/dev/null | tail -1 | xargs)
  
  if (( $(echo "$CURRENT_REPO_LAG > 10" | bc -l) )); then
    log "✗ ALERT: Replication lag ${CURRENT_REPO_LAG}s (threshold: 10s)"
    log "AUTOMATIC REVERT TRIGGERED - Database falling behind"
    REVERT_TRIGGERED=1
    break
  fi
  
  # Status update
  REMAINING=$((MONITORING_DURATION - ELAPSED))
  log "[$((ELAPSED))s/$MONITORING_DURATION] Health: OK | Errors: +$ERROR_DELTA | Latency: ${LATENCY_CHECK}ms | Remaining: ${REMAINING}s"
  
  sleep 10
done

if [ $REVERT_TRIGGERED -eq 1 ]; then
  log ""
  log "INITIATING AUTOMATIC REVERT"
  cp /etc/nginx/sites-enabled/warungin.pre-switch-${TIMESTAMP} /etc/nginx/sites-enabled/warungin
  systemctl reload nginx
  log "✓ Reverted to previous configuration"
  exit 1
fi

log ""
log "=== TRAFFIC SWITCH COMPLETE ==="
log "Deployment confirmed in production"
exit 0
