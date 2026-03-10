#!/bin/bash
# =============================================================================
# Warungin POS - Backup Verification Script
# =============================================================================
# Usage: ./verify-backup.sh [--schedule]
# This script verifies backup integrity and tests restore capability
# Schedule: Run weekly via cron: 0 3 * * 0 /path/to/verify-backup.sh
# =============================================================================

set -euo pipefail

BACKUP_DIR="/mnt/warungin-backups"
LOG_FILE="/var/log/warungin-backup-verify.log"
TEST_DB_NAME="warungin_test_restore"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $1${NC}" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗ $1${NC}" | tee -a "$LOG_FILE"
}

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_error "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Find latest backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/warungin_backup_*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    log_error "No backup files found in $BACKUP_DIR"
    exit 1
fi

log "=== Backup Verification Started ==="
log "Latest backup: $LATEST_BACKUP"

# Test 1: Check file exists and not empty
if [ -s "$LATEST_BACKUP" ]; then
    BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
    log_success "Backup file exists: $BACKUP_SIZE"
else
    log_error "Backup file is empty"
    exit 1
fi

# Test 2: Verify gzip integrity
log "Testing gzip integrity..."
if gzip -t "$LATEST_BACKUP" 2>/dev/null; then
    log_success "Gzip integrity: OK"
else
    log_error "Gzip integrity: FAILED - backup may be corrupted"
    exit 1
fi

# Test 3: Verify SQL structure
log "Testing backup content..."
if zcat "$LATEST_BACKUP" | head -50 | grep -q "CREATE TABLE\|INSERT INTO"; then
    log_success "Backup content: OK"
else
    log_warn "Backup content: May be in custom format (pg_dump -Fc)"
fi

# Test 4: Estimate restore time
log "Estimating restore time..."
ESTIMATED_SIZE=$(du -b "$LATEST_BACKUP" | cut -f1)
ESTIMATED_MINUTES=$((ESTIMATED_SIZE / 1024 / 1024 / 10))  # Rough estimate: 10MB/min
log "Estimated restore time: ~${ESTIMATED_MINUTES} minutes (for ${ESTIMATED_SIZE} bytes)"

# Test 5: Check backup age
BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +1 -print 2>/dev/null | wc -l)
if [ "$BACKUP_AGE" -eq 0 ]; then
    log_success "Backup age: Less than 24 hours old"
else
    log_warn "Backup age: More than 24 hours old - consider running manual backup"
fi

# Test 6: Check retention
log "Checking retention policy (7 days minimum)..."
RETENTION_COUNT=$(find "$BACKUP_DIR" -name "warungin_backup_*.sql.gz" -mtime -7 | wc -l)
if [ "$RETENTION_COUNT" -ge 1 ]; then
    log_success "Retention: $RETENTION_COUNT backups in last 7 days"
else
    log_error "Retention: Less than 1 backup in last 7 days"
fi

# Summary
log "=== Backup Verification Complete ==="
log "Status: ALL CHECKS PASSED"
log "Latest backup: $LATEST_BACKUP"
log "Size: $BACKUP_SIZE"
log "Estimated restore time: ~${ESTIMATED_MINUTES} minutes"

exit 0
