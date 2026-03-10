#!/bin/bash
# =============================================================================
# Warungin POS - Automated Database Backup Script
# =============================================================================
# Usage: ./backup.sh
# Schedule: Run daily via cron: 0 2 * * * /path/to/backup.sh
# =============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="/mnt/backup/warungin"
RETENTION_DAYS=30
DB_NAME="warungin"
DB_USER="postgres"
DB_HOST="localhost"
LOG_FILE="/var/log/warungin-backup.log"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/full_backup_${TIMESTAMP}.sql.gz"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handler
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR" || error_exit "Cannot create backup directory"
fi

# Check disk space (minimum 5GB free)
DISK_FREE=$(df -BG "$BACKUP_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_FREE" -lt 5 ]; then
    error_exit "Insufficient disk space: ${DISK_FREE}GB free"
fi

log "Starting database backup..."

# Perform full database backup
log "Backup file: $BACKUP_FILE"

# Use pg_dump with compression
if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -F c -b -v -f - 2>>"$LOG_FILE" | gzip > "$BACKUP_FILE"; then
    log "Backup created successfully"
else
    error_exit "Backup failed"
fi

# Verify backup file
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup verified: $BACKUP_SIZE"
else
    error_exit "Backup file verification failed"
fi

# Create backup metadata
META_FILE="${BACKUP_DIR}/backup_metadata.txt"
echo "Backup Date: $(date)" >> "$META_FILE"
echo "Backup File: $BACKUP_FILE" >> "$META_FILE"
echo "Database: $DB_NAME" >> "$META_FILE"
echo "Size: $BACKUP_SIZE" >> "$META_FILE"
echo "---" >> "$META_FILE"

# Clean up old backups (retention policy)
log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "full_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "full_backup_*.sql.gz" -type f | wc -l | xargs -I {} log "Total backups remaining: {}"

# Create latest symlink for easy restore
ln -sf "$BACKUP_FILE" "${BACKUP_DIR}/latest_backup.sql.gz"

log "Backup completed successfully!"
log "Latest backup: ${BACKUP_DIR}/latest_backup.sql.gz"

# Exit with success
exit 0
