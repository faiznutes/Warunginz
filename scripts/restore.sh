#!/bin/bash
# =============================================================================
# Warungin POS - Database Restore Script
# =============================================================================
# Usage: ./restore.sh [backup_file] [--dry-run]
# Examples:
#   ./restore.sh                                    # Restore from latest backup
#   ./restore.sh /mnt/backup/warungin/full_backup_20240115_120000.sql.gz
#   ./restore.sh --dry-run                          # Test restore without applying
# =============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="/mnt/backup/warungin"
DB_NAME="warungin"
DB_USER="postgres"
DB_HOST="localhost"
LOG_FILE="/var/log/warungin-restore.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error_exit() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
    exit 1
}

# Parse arguments
BACKUP_FILE=""
DRY_RUN=false

if [ $# -eq 0 ]; then
    # Use latest backup
    BACKUP_FILE="${BACKUP_DIR}/latest_backup.sql.gz"
    if [ ! -f "$BACKUP_FILE" ]; then
        error_exit "No backup file specified and latest backup not found at $BACKUP_DIR"
    fi
    log "Using latest backup: $BACKUP_FILE"
else
    for arg in "$@"; do
        case $arg in
            --dry-run)
                DRY_RUN=true
                ;;
            -*)
                error_exit "Unknown option: $arg"
                ;;
            *)
                BACKUP_FILE="$arg"
                ;;
        esac
    done
fi

# Validate backup file
if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

if [ ! -s "$BACKUP_FILE" ]; then
    error_exit "Backup file is empty: $BACKUP_FILE"
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup file: $BACKUP_FILE ($BACKUP_SIZE)"

# Get confirmation unless dry-run
if [ "$DRY_RUN" = false ]; then
    echo ""
    echo "=============================================="
    echo "  DATABASE RESTORE WARNING"
    echo "=============================================="
    echo "This will OVERWRITE the current database: $DB_NAME"
    echo "Backup file: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"
    echo ""
    read -p "Type 'YES' to confirm: " CONFIRM
    
    if [ "$CONFIRM" != "YES" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

# Pre-restore checks
log "Running pre-restore checks..."

# Check disk space
REQUIRED_SPACE=$(du -b "$BACKUP_FILE" | cut -f1)
AVAILABLE_SPACE=$(df -B1 "$BACKUP_DIR" | awk 'NR==2 {print $4}')
if [ "$REQUIRED_SPACE" -gt "$AVAILABLE_SPACE" ]; then
    error_exit "Insufficient disk space. Required: $REQUIRED_SPACE bytes, Available: $AVAILABLE_SPACE bytes"
fi

# Verify backup integrity
log "Verifying backup integrity..."
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log "Backup file integrity: OK"
else
    error_exit "Backup file is corrupted"
fi

# Check PostgreSQL connection
if ! pg_isready -h "$DB_HOST" -U "$DB_USER" >/dev/null 2>&1; then
    error_exit "PostgreSQL is not running or not accessible"
fi
log "PostgreSQL connection: OK"

# Perform restore
if [ "$DRY_RUN" = true ]; then
    log "DRY RUN MODE - Testing restore without applying changes..."
    log "This would execute the following commands:"
    echo ""
    echo "  # Drop existing connections to $DB_NAME"
    echo "  psql -h $DB_HOST -U $DB_USER -c \"SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();\""
    echo ""
    echo "  # Drop database"
    echo "  psql -h $DB_HOST -U $DB_USER -c \"DROP DATABASE IF EXISTS $DB_NAME;\""
    echo ""
    echo "  # Create database"
    echo "  psql -h $DB_HOST -U $DB_USER -c \"CREATE DATABASE $DB_NAME;\""
    echo ""
    echo "  # Restore from backup"
    echo "  pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME -v $BACKUP_FILE"
    echo ""
    log "Dry run completed successfully"
    exit 0
fi

log "Starting database restore..."

# Drop existing connections
log "Dropping existing connections to database..."
psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>>"$LOG_FILE" || true

# Drop and recreate database
log "Dropping existing database..."
psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>>"$LOG_FILE" || error_exit "Failed to drop database"

log "Creating new database..."
psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>>"$LOG_FILE" || error_exit "Failed to create database"

# Restore from backup
log "Restoring from backup..."
if pg_restore -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v "$BACKUP_FILE" 2>>"$LOG_FILE"; then
    log "Restore completed successfully"
else
    error_exit "Restore failed - check $LOG_FILE for details"
fi

# Verify restore
log "Verifying restore..."
TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>>"$LOG_FILE" | xargs)
log "Tables restored: $TABLE_COUNT"

# Get database size
DB_SIZE=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>>"$LOG_FILE" | xargs)
log "Database size: $DB_SIZE"

# Create restore metadata
META_FILE="${BACKUP_DIR}/restore_metadata.txt"
echo "Restore Date: $(date)" >> "$META_FILE"
echo "Backup File Used: $BACKUP_FILE" >> "$META_FILE"
echo "Database: $DB_NAME" >> "$META_FILE"
echo "Database Size: $DB_SIZE" >> "$META_FILE"
echo "Tables Restored: $TABLE_COUNT" >> "$META_FILE"
echo "---" >> "$META_FILE"

log "=============================================="
log "  RESTORE COMPLETED SUCCESSFULLY"
log "=============================================="
log "Database: $DB_NAME"
log "Backup: $BACKUP_FILE"
log "Size: $DB_SIZE"
log "Tables: $TABLE_COUNT"
log "Log: $LOG_FILE"

exit 0
