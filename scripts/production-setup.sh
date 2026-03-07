#!/bin/bash
# =============================================================================
# Warungin POS - Production Setup Script
# Run this ONCE on the server before first deployment
# =============================================================================

set -e

echo "========================================"
echo "  Warungin POS - Production Setup"
echo "========================================"

# Create backup directory
echo "[1/5] Creating backup directory..."
sudo mkdir -p /mnt/warungin-backups
sudo chown 999:999 /mnt/warungin-backups  # postgres user
echo "✓ Backup directory created at /mnt/warungin-backups"

# Create logs directory
echo "[2/5] Creating logs directory..."
mkdir -p ./logs
echo "✓ Logs directory created at ./logs"

# Check disk space
echo "[3/5] Checking disk space..."
DISK_FREE=$(df -h / | awk 'NR==2 {print $4}')
echo "✓ Available disk space: $DISK_FREE"

# Check Docker
echo "[4/5] Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✓ Docker installed: $DOCKER_VERSION"
else
    echo "✗ Docker not found. Please install Docker first."
    exit 1
fi

# Check docker-compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✓ Docker Compose installed"
else
    echo "✗ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Create .env from template if not exists
echo "[5/5] Setting up environment..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Created .env from template - EDIT IT BEFORE DEPLOYING!"
    else
        echo "✗ .env.example not found"
        exit 1
    fi
else
    echo "✓ .env already exists"
fi

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo "1. Edit .env and fill in production values"
echo "2. Generate strong JWT secrets:"
echo "   openssl rand -base64 32"
echo "3. Run: docker compose up -d"
echo ""
