#!/bin/bash

################################################################################
# WARUNGIN POS - EMERGENCY ROLLBACK SCRIPT
#
# Purpose: Quickly revert to previous stable version in emergency
# Severity: CRITICAL - Use only when system is experiencing outage
#
# What it does:
#   1. Stops new version
#   2. Restores database from backup
#   3. Restores code from backup
#   4. Restarts services
#   5. Validates system is operational
#
# Usage: ./rollback.sh [--backup-file /path/to/backup.sql.gz] [--build-dir /path]
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/var/www/warungin"
BACKEND_DIR="$PROJECT_ROOT/nest"
FRONTEND_DIR="$PROJECT_ROOT/client"
BACKUP_DIR="/backups/warungin"
LOG_DIR="/var/log/warungin"

# Variables
BACKUP_FILE=""
BUILD_BACKUP_DIR=""
FORCE_ROLLBACK=false
CURRENT_TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
LOG_FILE="$LOG_DIR/rollback-${CURRENT_TIMESTAMP}.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
        --backup-file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        --build-dir)
            BUILD_BACKUP_DIR="$2"
            shift 2
            ;;
        --force)
            FORCE_ROLLBACK=true
            shift
            ;;
        *)
            error "Unknown argument: $1"
            exit 1
            ;;
    esac
done

cat << 'EOF' | tee "$LOG_FILE"
================================================================================
  WARUNGIN POS - EMERGENCY ROLLBACK
  WARNING: This will revert to previous version and restore database backup
================================================================================
EOF

log "Rollback Configuration:"
log "  Project Root: $PROJECT_ROOT"
log "  Backup File: ${BACKUP_FILE:-'(auto-detect latest)'}"
log "  Build Backup: ${BUILD_BACKUP_DIR:-'(auto-detect latest)'}"
log "  Force Mode: $FORCE_ROLLBACK"
log "  Timestamp: $CURRENT_TIMESTAMP"
log ""

# Safety check
if [ "$FORCE_ROLLBACK" = false ]; then
    warn "EMERGENCY ROLLBACK - This is a DESTRUCTIVE operation"
    warn "This will:"
    warn "  1. Restore database from backup (all changes since backup will be lost)"
    warn "  2. Restore code from backup (current code changes will be lost)"
    warn "  3. Restart all services"
    warn ""
    echo -ne "To continue, type 'YES I UNDERSTAND': "
    read -r confirmation
    
    if [ "$confirmation" != "YES I UNDERSTAND" ]; then
        log "Rollback cancelled by user"
        exit 1
    fi
fi

################################################################################
# Step 1: Auto-detect backup if not specified
################################################################################

if [ -z "$BACKUP_FILE" ]; then
    log ""
    log "=== DETECTING LATEST DATABASE BACKUP ==="
    
    BACKUP_FILE=$(find "$BACKUP_DIR" -name "warungin-db-*.sql.gz" -type f -printf '%T@ %p\n' | \
        sort -rn | head -1 | cut -d' ' -f2-)
    
    if [ -z "$BACKUP_FILE" ]; then
        error "No database backup found in $BACKUP_DIR"
        error "Cannot proceed without backup"
        exit 1
    fi
    
    success "Found latest backup: $BACKUP_FILE"
fi

# Verify backup file exists and is readable
if [ ! -f "$BACKUP_FILE" ] || [ ! -r "$BACKUP_FILE" ]; then
    error "Backup file not found or not readable: $BACKUP_FILE"
    exit 1
fi

# Verify backup integrity
log "Verifying backup integrity..."
if gunzip -t "$BACKUP_FILE" >/dev/null 2>&1; then
    success "Backup file integrity verified"
else
    error "Backup file is corrupted: $BACKUP_FILE"
    exit 1
fi

################################################################################
# Step 2: Auto-detect build backup if not specified
################################################################################

if [ -z "$BUILD_BACKUP_DIR" ]; then
    log ""
    log "=== DETECTING LATEST BUILD BACKUP ==="
    
    BUILD_BACKUP_DIR=$(find "$BACKUP_DIR/builds" -maxdepth 1 -type d -printf '%T@ %p\n' 2>/dev/null | \
        sort -rn | head -1 | cut -d' ' -f2-)
    
    if [ -n "$BUILD_BACKUP_DIR" ] && [ -d "$BUILD_BACKUP_DIR" ]; then
        success "Found latest build backup: $BUILD_BACKUP_DIR"
    else
        warn "No build backup found (will restart with current code)"
        BUILD_BACKUP_DIR=""
    fi
fi

################################################################################
# Step 3: Notify stakeholders
################################################################################

log ""
log "=== NOTIFYING STAKEHOLDERS ==="

# Send alert notification (example using curl to webhook)
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    log "Sending Slack notification..."
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"🚨 EMERGENCY ROLLBACK INITIATED\",
            \"attachments\": [{
                \"color\": \"danger\",
                \"fields\": [
                    {\"title\": \"Service\", \"value\": \"Warungin POS\", \"short\": true},
                    {\"title\": \"Action\", \"value\": \"Database Rollback\", \"short\": true},
                    {\"title\": \"Timestamp\", \"value\": \"$(date -u '+%Y-%m-%d %H:%M:%S UTC')\", \"short\": false},
                    {\"title\": \"Backup Used\", \"value\": \"$(basename $BACKUP_FILE)\", \"short\": false}
                ]
            }]
        }" 2>/dev/null || true
fi

warn "ROLLBACK STARTING - System will be briefly unavailable"

################################################################################
# Step 4: Stop services
################################################################################

log ""
log "=== STOPPING SERVICES ==="

services=("warungin-backend" "warungin-frontend" "nginx")

for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        log "Stopping $service..."
        if systemctl stop "$service"; then
            success "$service stopped"
        else
            warn "Failed to stop $service (continuing anyway)"
        fi
    fi
done

# Wait for services to fully stop
sleep 5

################################################################################
# Step 5: Restore database
################################################################################

log ""
log "=== RESTORING DATABASE BACKUP ==="

log "Database will be restored from: $(basename $BACKUP_FILE)"
log "WARNING: All database changes since backup will be lost"

# Create recovery backup of current state (in case we need to investigate)
if pg_isready -h localhost -p 5432 -t 5 &>/dev/null; then
    log "Creating emergency backup of current database state..."
    
    if pg_dump -h localhost -U postgres -d warungin --compress=0 2>/dev/null | \
       gzip > "$BACKUP_DIR/emergency-backup-${CURRENT_TIMESTAMP}.sql.gz" 2>&1; then
        success "Emergency backup created"
    else
        warn "Failed to create emergency backup (continuing with restore)"
    fi
fi

# Kill any existing connections
log "Terminating existing database connections..."
psql -h localhost -U postgres -d postgres << 'SQL' 2>/dev/null || true
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'warungin'
  AND pid <> pg_backend_pid();
SQL

sleep 2

# Drop and recreate database
log "Dropping current database..."
dropdb -h localhost -U postgres warungin 2>/dev/null || true

log "Creating empty database..."
createdb -h localhost -U postgres warungin

# Restore from backup
log "Restoring database from backup..."
if gunzip -c "$BACKUP_FILE" | psql -h localhost -U postgres -d warungin 2>&1 | \
   tail -20 >> "$LOG_FILE"; then
    success "Database restored successfully"
else
    error "Database restore FAILED"
    error "This is a CRITICAL SITUATION - manual database recovery may be required"
    exit 1
fi

# Verify restore
log "Verifying database integrity..."
TABLE_COUNT=$(psql -h localhost -U postgres -d warungin -t -c \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -gt 0 ]; then
    success "Database restored with $TABLE_COUNT tables"
else
    error "Database restore verification failed"
    exit 1
fi

################################################################################
# Step 6: Restore code
################################################################################

if [ -n "$BUILD_BACKUP_DIR" ] && [ -d "$BUILD_BACKUP_DIR" ]; then
    log ""
    log "=== RESTORING CODE BACKUP ==="
    
    # Backend
    if [ -d "$BUILD_BACKUP_DIR/backend-dist" ]; then
        log "Restoring backend code..."
        rm -rf "$BACKEND_DIR/dist"
        cp -r "$BUILD_BACKUP_DIR/backend-dist" "$BACKEND_DIR/dist"
        success "Backend code restored"
    fi
    
    # Frontend
    if [ -d "$BUILD_BACKUP_DIR/frontend-dist" ]; then
        log "Restoring frontend code..."
        rm -rf "$FRONTEND_DIR/dist"
        cp -r "$BUILD_BACKUP_DIR/frontend-dist" "$FRONTEND_DIR/dist"
        success "Frontend code restored"
    fi
else
    info "No build backup available - will use current code"
fi

################################################################################
# Step 7: Restart services
################################################################################

log ""
log "=== RESTARTING SERVICES ==="

# Start backend
log "Starting backend service..."
if systemctl start warungin-backend; then
    success "Backend started"
else
    error "Failed to start backend"
fi

sleep 5

# Start frontend
log "Starting frontend service..."
if systemctl start warungin-frontend; then
    success "Frontend started"
else
    warn "Failed to start frontend (check manually)"
fi

# Start NGINX
log "Starting NGINX..."
if systemctl start nginx; then
    success "NGINX started"
else
    error "Failed to start NGINX"
fi

################################################################################
# Step 8: Verify system is operational
################################################################################

log ""
log "=== VERIFYING ROLLBACK SUCCESS ==="

sleep 5

# Check backend health
log "Checking backend health..."
if curl -sf "http://localhost:3000/api/health" >/dev/null 2>&1; then
    success "Backend is operational"
else
    error "Backend is not responding"
fi

# Check database connectivity
log "Checking database connectivity..."
if psql -h localhost -U postgres -d warungin -c "SELECT 1;" >/dev/null 2>&1; then
    success "Database is accessible"
else
    error "Database is not accessible"
fi

# Check service status
log "Checking service status..."
systemctl status warungin-backend warungin-frontend nginx --no-pager | tail -20 >> "$LOG_FILE"

################################################################################
# Step 9: Final summary
################################################################################

log ""
log "================================================================================"
success "ROLLBACK COMPLETED"
log "================================================================================"
info "System has been rolled back to previous stable state"
info "Database restored from: $(basename $BACKUP_FILE)"
info "Services are restarting - may take 30-60 seconds for full operation"
info "Please verify system functionality"
info "Logs available at: $LOG_FILE"
log ""

# Alert on completion
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    log "Sending completion notification..."
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"✅ ROLLBACK COMPLETED\",
            \"attachments\": [{
                \"color\": \"warning\",
                \"fields\": [
                    {\"title\": \"Service\", \"value\": \"Warungin POS\", \"short\": true},
                    {\"title\": \"Status\", \"value\": \"Rolled Back\", \"short\": true},
                    {\"title\": \"Action Required\", \"value\": \"Review logs and verify functionality\", \"short\": false}
                ]
            }]
        }" 2>/dev/null || true
fi

warn "IMPORTANT: Review the incident and determine root cause before next deployment"

exit 0
