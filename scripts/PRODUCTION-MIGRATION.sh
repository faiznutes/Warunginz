#!/bin/bash
# PRODUCTION MIGRATION ORCHESTRATION
# Master script - runs all 5 phases in sequence with decision gates
# Exit code: 0 = successful deployment, 1 = deployment failed (rolled back)

set -e

ORCHESTRATION_LOG="/tmp/production-migration-$(date +%Y%m%d_%H%M%S).log"
PHASE_LOGS_DIR="/tmp/migration-logs"
mkdir -p "$PHASE_LOGS_DIR"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $ORCHESTRATION_LOG
}

header() {
  echo "" | tee -a $ORCHESTRATION_LOG
  echo "╔══════════════════════════════════════════════════╗" | tee -a $ORCHESTRATION_LOG
  echo "║ $1" | tee -a $ORCHESTRATION_LOG
  echo "╚══════════════════════════════════════════════════╝" | tee -a $ORCHESTRATION_LOG
  echo "" | tee -a $ORCHESTRATION_LOG
}

log "=== PRODUCTION MIGRATION ORCHESTRATION ==="
log "Start time: $(date)"
log "Orchestration log: $ORCHESTRATION_LOG"
log ""

# ============================================================================
# PHASE 1: PRE-FLIGHT CHECKS
# ============================================================================

header "PHASE 1: PRE-FLIGHT CHECKS"
log "Running pre-migration verification..."

if bash ./scripts/PHASE1-preflight-check.sh 2>&1 | tee -a $ORCHESTRATION_LOG; then
  log "✓ PHASE 1 PASSED - System ready for deployment"
else
  log "✗ PHASE 1 FAILED - Pre-flight checks did not pass"
  log "MIGRATION ABORTED"
  exit 1
fi

log ""
log "Proceed to Phase 2? (Type 'yes' to continue, 'no' to abort)"
read -r PROCEED
if [ "$PROCEED" != "yes" ]; then
  log "MIGRATION ABORTED by user"
  exit 1
fi

# ============================================================================
# PHASE 2: SAFE DEPLOYMENT
# ============================================================================

header "PHASE 2: SAFE DEPLOYMENT"
log "Deploying new version with zero downtime..."

if bash ./scripts/PHASE2-safe-deploy.sh 2>&1 | tee -a $ORCHESTRATION_LOG; then
  log "✓ PHASE 2 PASSED - Deployment successful"
else
  log "✗ PHASE 2 FAILED - Deployment error"
  log "INITIATING AUTOMATIC ROLLBACK"
  bash ./scripts/PHASE5-rollback.sh 2>&1 | tee -a $ORCHESTRATION_LOG
  log "MIGRATION ABORTED - System rolled back to previous version"
  exit 1
fi

log ""
log "Proceed to traffic switch? (Type 'yes' to continue, 'no' to rollback)"
read -r PROCEED
if [ "$PROCEED" != "yes" ]; then
  log "USER REQUESTED ROLLBACK"
  bash ./scripts/PHASE5-rollback.sh 2>&1 | tee -a $ORCHESTRATION_LOG
  exit 1
fi

# ============================================================================
# PHASE 3: TRAFFIC SWITCH (BLUE-GREEN)
# ============================================================================

header "PHASE 3: TRAFFIC SWITCH & MONITORING"
log "Switching traffic to new deployment (5-minute monitoring window)..."

if bash ./scripts/PHASE3-traffic-switch.sh 2>&1 | tee -a $ORCHESTRATION_LOG; then
  log "✓ PHASE 3 PASSED - Traffic switch successful"
else
  log "✗ PHASE 3 FAILED - Automatic revert triggered"
  log "Traffic automatically reverted to previous version"
  log "MIGRATION ABORTED - Investigation required"
  exit 1
fi

# ============================================================================
# PHASE 4: POST-DEPLOYMENT VERIFICATION
# ============================================================================

header "PHASE 4: POST-DEPLOYMENT VERIFICATION"
log "Running production verification (synthetic transactions)..."

sleep 10  # Give system time to stabilize

if bash ./scripts/PHASE4-post-deploy-verify.sh 2>&1 | tee -a $ORCHESTRATION_LOG; then
  log "✓ PHASE 4 PASSED - All production checks successful"
else
  log "✗ PHASE 4 FAILED - Post-deployment verification failed"
  log "Rolling back to previous version..."
  bash ./scripts/PHASE5-rollback.sh 2>&1 | tee -a $ORCHESTRATION_LOG
  log "MIGRATION ABORTED - System rolled back"
  exit 1
fi

# ============================================================================
# MIGRATION COMPLETE
# ============================================================================

header "MIGRATION COMPLETE ✓"
log ""
log "Timeline:"
log "  Phase 1 (Pre-flight):    PASSED"
log "  Phase 2 (Deployment):    PASSED"
log "  Phase 3 (Traffic):       PASSED"
log "  Phase 4 (Verification):  PASSED"
log ""
log "Status: PRODUCTION DEPLOYMENT SUCCESSFUL"
log "Time: $(date)"
log "Log file: $ORCHESTRATION_LOG"
log ""
log "Next steps:"
log "  1. Monitor application metrics for 30 minutes"
log "  2. Check error rates and performance"
log "  3. Gather team feedback"
log "  4. Document any issues found"
log "  5. Keep rollback script ready for 24 hours"
log ""
log "✓ Production migration successful"
exit 0
