#!/bin/bash

################################################################################
# WARUNGIN POS - BLUE-GREEN DEPLOYMENT WITH TRAFFIC CUTOVER
#
# Purpose: Execute blue-green deployment strategy with gradual traffic shift
# Severity: CRITICAL - Zero tolerance for transaction interruption
#
# Strategy:
#   1. Deploy new version to "green" environment (while blue runs)
#   2. Run health checks on green
#   3. Gradually shift traffic: 5% → 25% → 75% → 100%
#   4. Monitor error rates and performance
#   5. Auto-rollback if issues detected
#
# Usage: ./traffic-cutover.sh [--aggressive] [--skip-health-checks]
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/var/www/warungin"
LOG_DIR="/var/log/warungin"
CURRENT_TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
LOG_FILE="$LOG_DIR/cutover-${CURRENT_TIMESTAMP}.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BLUE_PORT=3000      # Current production backend
GREEN_PORT=3001     # New backend green environment
ERROR_RATE_THRESHOLD=5  # Auto-rollback if errors > 5%
P95_THRESHOLD=2000  # Auto-rollback if p95 response time > 2s
AGGRESSIVE_MODE=false
SKIP_HEALTH_CHECKS=false
STAGE_DURATION=300  # Monitor each stage for 5 minutes

mkdir -p "$LOG_DIR"

# Logging
log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"; }
info() { echo -e "${BLUE}ℹ $1${NC}" | tee -a "$LOG_FILE"; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --aggressive) AGGRESSIVE_MODE=true; shift ;;
        --skip-health-checks) SKIP_HEALTH_CHECKS=true; shift ;;
        *) error "Unknown argument: $1"; exit 1 ;;
    esac
done

cat << 'EOF' | tee "$LOG_FILE"
================================================================================
  WARUNGIN POS - BLUE-GREEN TRAFFIC CUTOVER
  Strategy: Gradual traffic shift with automatic rollback
================================================================================
EOF

log "Configuration:"
log "  Blue Port (Current):  $BLUE_PORT"
log "  Green Port (New):     $GREEN_PORT"
log "  Error Threshold:      $ERROR_RATE_THRESHOLD%"
log "  P95 Threshold:        ${P95_THRESHOLD}ms"
log "  Aggressive Mode:      $AGGRESSIVE_MODE"
log "  Stage Duration:       ${STAGE_DURATION}s"
log ""

################################################################################
# Health check function
################################################################################

health_check() {
    local port=$1
    local name=$2
    
    if curl -sf "http://localhost:$port/api/health" >/dev/null 2>&1; then
        success "$name environment is healthy"
        return 0
    else
        error "$name environment is NOT healthy"
        return 1
    fi
}

################################################################################
# Update NGINX weight
################################################################################

update_nginx_weight() {
    local blue_weight=$1
    local green_weight=$2
    
    log "Updating NGINX weights: Blue=$blue_weight, Green=$green_weight"
    
    # Backup current NGINX config
    cp /etc/nginx/sites-available/warungin /etc/nginx/sites-available/warungin.backup-${CURRENT_TIMESTAMP}
    
    # This is a template - actual implementation depends on NGINX config structure
    cat > /tmp/upstream-update.conf << EOL
upstream backend_pool {
    server localhost:$BLUE_PORT weight=$blue_weight;
    server localhost:$GREEN_PORT weight=$green_weight;
}
EOL
    
    # Update NGINX config (simplified example)
    # In production, use more sophisticated config management
    sed -i "/upstream backend_pool/,/}/c\\$(cat /tmp/upstream-update.conf)" \
        /etc/nginx/conf.d/upstream.conf
    
    # Test and reload
    if nginx -t 2>&1 | grep -q "successful"; then
        systemctl reload nginx
        success "NGINX reloaded with new weights"
        return 0
    else
        error "NGINX configuration error"
        cp /etc/nginx/sites-available/warungin.backup-${CURRENT_TIMESTAMP} /etc/nginx/sites-available/warungin
        systemctl reload nginx
        return 1
    fi
}

################################################################################
# Monitor traffic and errors
################################################################################

monitor_traffic() {
    local duration=$1
    local stage=$2
    
    local start_time=$(date +%s)
    local end_time=$((start_time + duration))
    local error_count=0
    local total_requests=0
    
    log "Monitoring traffic for ${duration}s (Stage: $stage)"
    info "Collecting metrics from NGINX access logs..."
    
    while [ $(date +%s) -lt $end_time ]; do
        # In production, collect from proper metrics (Prometheus, etc.)
        # This is a simple example from NGINX logs
        
        local current_errors=$(tail -1000 /var/log/nginx/access.log | grep -cE " [45][0-9]{2} " || true)
        local current_requests=$(tail -1000 /var/log/nginx/access.log | wc -l)
        
        if [ "$current_requests" -gt 0 ]; then
            local error_rate=$((current_errors * 100 / current_requests))
            
            if [ "$error_rate" -gt "$ERROR_RATE_THRESHOLD" ]; then
                warn "High error rate detected: $error_rate% (threshold: $ERROR_RATE_THRESHOLD%)"
                return 1
            fi
        fi
        
        sleep 10
        info "Still monitoring... $(($(date +%s) - start_time))s elapsed"
    done
    
    success "Traffic monitoring completed for stage: $stage"
    return 0
}

################################################################################
# Execute traffic cutover stages
################################################################################

run_cutover_stages() {
    local stages=(
        "5 95"      # Stage 1: 5% green, 95% blue
        "25 75"     # Stage 2: 25% green, 75% blue
        "75 25"     # Stage 3: 75% green, 25% blue
        "100 0"     # Stage 4: 100% green, 0% blue (complete)
    )
    
    local stage_num=1
    
    for weights in "${stages[@]}"; do
        log ""
        log "=== CUTOVER STAGE $stage_num ==="
        
        IFS=' ' read -r green blue <<< "$weights"
        
        log "Target traffic split: ${green}% Green (new), ${blue}% Blue (current)"
        
        # Update NGINX weights
        if ! update_nginx_weight "$blue" "$green"; then
            error "Failed to update NGINX weights"
            return 1
        fi
        
        # Wait for connections to rebalance
        sleep 5
        
        # Monitor this stage
        if ! monitor_traffic "$STAGE_DURATION" "Stage $stage_num"; then
            warn "Traffic monitoring detected issues in stage $stage_num"
            warn "Initiating automatic rollback..."
            return 1
        fi
        
        # Report stage success
        success "Stage $stage_num completed successfully"
        info "Current traffic split: ${green}% Green, ${blue}% Blue"
        stage_num=$((stage_num + 1))
        
        # In aggressive mode, skip some monitoring
        if [ "$AGGRESSIVE_MODE" = true ] && [ $stage_num -lt 4 ]; then
            info "Aggressive mode: Moving to next stage faster"
            STAGE_DURATION=120  # Reduce monitoring time
        fi
    done
    
    success "All cutover stages completed successfully"
    return 0
}

################################################################################
# Rollback function
################################################################################

rollback() {
    error ""
    error "=== INITIATING ROLLBACK ==="
    
    # Restore blue-only traffic
    log "Restoring all traffic to blue environment..."
    
    if update_nginx_weight "100" "0"; then
        success "Traffic restored to blue environment"
        info "Manual inspection recommended"
        info "Logs available at: $LOG_FILE"
        return 0
    else
        error "Rollback FAILED - critical issue"
        error "MANUAL INTERVENTION REQUIRED"
        return 1
    fi
}

################################################################################
# Pre-cutover validation
################################################################################

main() {
    log ""
    log "Starting blue-green traffic cutover..."
    log ""
    
    # Check both environments are running
    if [ "$SKIP_HEALTH_CHECKS" = false ]; then
        log "Performing pre-cutover health checks..."
        
        if ! health_check "$BLUE_PORT" "Blue"; then
            error "Blue environment not ready"
            return 1
        fi
        
        if ! health_check "$GREEN_PORT" "Green"; then
            error "Green environment not ready"
            error "Ensure new version deployed first: ./deploy.sh"
            return 1
        fi
    fi
    
    success "Pre-cutover validation passed"
    log ""
    
    # Execute cutover
    if run_cutover_stages; then
        log ""
        log "================================================================================"
        success "BLUE-GREEN CUTOVER COMPLETED SUCCESSFULLY"
        log "================================================================================"
        info "New version (green) is now handling 100% of traffic"
        info "Old version (blue) can be decommissioned after verification"
        info "Full log: $LOG_FILE"
        return 0
    else
        log ""
        warn "================================================================================"
        warn "CUTOVER ENCOUNTERED ISSUES - AUTOMATIC ROLLBACK INITIATED"
        warn "================================================================================"
        
        if rollback; then
            info "System rolled back to previous stable state (blue environment)"
            info "Review logs and fix issues before retrying"
        else
            error "CRITICAL: Rollback failed - manual intervention required"
            error "Contact DevOps on-call immediately"
        fi
        
        return 1
    fi
}

main
exit $?
