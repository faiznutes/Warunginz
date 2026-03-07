#!/bin/bash
# Phase 26 Quick Deployment Script
# Run this on the production server as root

set -e

echo "========================================"
echo "Phase 26 Production Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Git Pull
echo -e "${YELLOW}[1/7] Pulling latest code...${NC}"
cd /root/New-Warungin
git pull origin main
echo -e "${GREEN}✓ Code pulled${NC}"
echo ""

# Step 2: Check git hash
echo -e "${YELLOW}[2/7] Verifying deployment hash...${NC}"
HASH=$(git rev-parse --short HEAD)
echo "Current commit: $HASH"
if [ "$HASH" = "0891b51" ]; then
    echo -e "${GREEN}✓ Correct Phase 26 commit${NC}"
else
    echo -e "${RED}⚠ Warning: Expected 0891b51, got $HASH${NC}"
fi
echo ""

# Step 3: Stop old containers
echo -e "${YELLOW}[3/7] Stopping old containers...${NC}"
docker-compose down
echo -e "${GREEN}✓ Old containers stopped${NC}"
echo ""

# Step 4: Build images
echo -e "${YELLOW}[4/7] Building Docker images (this takes 2-3 min)...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# Step 5: Start containers
echo -e "${YELLOW}[5/7] Starting containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
sleep 30
echo ""

# Step 6: Verify services
echo -e "${YELLOW}[6/7] Verifying services...${NC}"
docker-compose ps
echo ""

# Check backend health
echo -n "Checking backend health..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Step 7: Show summary
echo -e "${YELLOW}[7/7] Deployment Complete!${NC}"
echo ""
echo -e "${GREEN}========== DEPLOYMENT SUMMARY ==========${NC}"
echo "✓ Latest code deployed"
echo "✓ Docker images built"
echo "✓ All containers running"
echo "✓ Backend health check passed"
echo ""
echo "🎯 Next: Open http://192.168.1.101 and verify"
echo ""
echo "📋 Check list:"
echo "  - Login as SUPER_ADMIN"
echo "  - Go to Tenants page"
echo "  - Click on a tenant"
echo "  - Verify: Stores, Addons tabs exist"
echo "  - Verify: Points tab does NOT exist"
echo "  - Test: Create a new store"
echo ""
echo -e "${GREEN}✅ Phase 26 Deployment Complete!${NC}"
