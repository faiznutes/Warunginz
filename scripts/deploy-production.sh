#!/bin/bash
# PHASE 35 Production Deployment - Bash Script
# For use on Linux/WSL/Git Bash
# Requires: sshpass installed (apt install sshpass or brew install sshpass)
# Usage: bash scripts/deploy-production.sh

set -euo pipefail

# Configuration
SERVER="192.168.1.101"
USER="root"
PASSWORD="123"  # Use SSH keys in production
PROJECT_PATH="/root/New-Warungin"

echo "=========================================="
echo "PHASE 35 Production Deployment"
echo "=========================================="
echo ""

# Step 1: Test SSH connectivity
echo "[1/3] Testing SSH connectivity..."
if ! sshpass -p "$PASSWORD" ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$USER@$SERVER" "echo 'SSH OK'" > /dev/null 2>&1; then
    echo "❌ SSH connection failed"
    exit 1
fi
echo "✅ SSH connection successful"
echo ""

# Step 2: Deploy changes
echo "[2/3] Deploying PHASE 35 changes..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'DEPLOY_SCRIPT'
set -e
cd /root/New-Warungin || exit 1
echo "Pulling changes..."
git pull origin main
echo "Installing dependencies..."
npm ci --production
echo "Generating Prisma client..."
npx prisma generate
echo "Running migrations..."
npx prisma migrate deploy
echo "Building application..."
npm run build
echo "✅ Deployment complete"
DEPLOY_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Deployment commands failed"
    exit 1
fi
echo "✅ Deployment successful"
echo ""

# Step 3: Verify deployment
echo "[3/3] Verifying deployment..."
GIT_LOG=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "cd $PROJECT_PATH && git log -1 --oneline")
echo "✅ Latest commit: $GIT_LOG"

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. SSH to server: sshpass -p $PASSWORD ssh $USER@$SERVER"
echo "2. Start application: npm start"
echo "3. Check health: curl http://localhost:3000/health"
echo ""
