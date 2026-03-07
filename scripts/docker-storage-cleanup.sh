#!/bin/bash
# Docker Storage Cleanup Script
# Maintains Docker storage under 10GB limit
# Run daily via cron: 0 2 * * * /root/New-Warungin/scripts/docker-storage-cleanup.sh

set -e

LOG_FILE="/var/log/docker-cleanup.log"
MAX_STORAGE_GB=10
THRESHOLD_PERCENT=80

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to get Docker storage usage in GB
get_docker_storage_gb() {
    docker system df --format "{{.Size}}" | head -1 | sed 's/[^0-9.]//g' | awk '{print $1}'
}

# Function to get storage usage percentage
get_storage_percent() {
    local usage_gb=$1
    local max_gb=$2
    echo "$usage_gb $max_gb" | awk '{printf "%.0f", ($1/$2)*100}'
}

log "Starting Docker storage cleanup..."

# Get current storage usage
STORAGE_USAGE=$(docker system df --format "{{.Size}}" | grep -oE '[0-9]+\.?[0-9]*' | head -1)
STORAGE_UNIT=$(docker system df --format "{{.Size}}" | grep -oE '[A-Z]+' | head -1)

log "Current Docker storage: ${STORAGE_USAGE}${STORAGE_UNIT}"

# Convert to GB for comparison
if [ "$STORAGE_UNIT" = "MB" ]; then
    STORAGE_GB=$(echo "$STORAGE_USAGE / 1024" | bc -l)
elif [ "$STORAGE_UNIT" = "GB" ]; then
    STORAGE_GB=$STORAGE_USAGE
else
    STORAGE_GB=0
fi

# Calculate threshold
THRESHOLD_GB=$(echo "$MAX_STORAGE_GB * $THRESHOLD_PERCENT / 100" | bc -l)
PERCENT_USED=$(get_storage_percent "$STORAGE_GB" "$MAX_STORAGE_GB")

log "Storage limit: ${MAX_STORAGE_GB}GB"
log "Threshold (${THRESHOLD_PERCENT}%): ${THRESHOLD_GB}GB"
log "Current usage: ${STORAGE_GB}GB (${PERCENT_USED}%)"

# Check if cleanup is needed
if (( $(echo "$STORAGE_GB > $THRESHOLD_GB" | bc -l) )); then
    log "Storage usage exceeds threshold. Starting cleanup..."
    
    # Remove unused images older than 7 days
    log "Removing unused images older than 7 days..."
    docker image prune -af --filter "until=168h" 2>&1 | tee -a "$LOG_FILE"
    
    # Remove build cache older than 3 days
    log "Removing build cache older than 3 days..."
    docker builder prune -af --filter "until=72h" 2>&1 | tee -a "$LOG_FILE"
    
    # Remove stopped containers
    log "Removing stopped containers..."
    docker container prune -f 2>&1 | tee -a "$LOG_FILE"
    
    # Get new storage usage
    NEW_STORAGE_USAGE=$(docker system df --format "{{.Size}}" | grep -oE '[0-9]+\.?[0-9]*' | head -1)
    NEW_STORAGE_UNIT=$(docker system df --format "{{.Size}}" | grep -oE '[A-Z]+' | head -1)
    
    log "Cleanup completed. New storage usage: ${NEW_STORAGE_USAGE}${NEW_STORAGE_UNIT}"
    
    # If still over limit, do aggressive cleanup
    if [ "$NEW_STORAGE_UNIT" = "GB" ] && (( $(echo "$NEW_STORAGE_USAGE > $MAX_STORAGE_GB" | bc -l) )); then
        log "Storage still over limit. Performing aggressive cleanup..."
        docker system prune -af --filter "until=24h" 2>&1 | tee -a "$LOG_FILE"
        log "Aggressive cleanup completed"
    fi
else
    log "Storage usage is within limits. No cleanup needed."
fi

# Final storage report
log "=== Final Storage Report ==="
docker system df | tee -a "$LOG_FILE"

log "Cleanup script completed."

