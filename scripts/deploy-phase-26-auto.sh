#!/bin/bash
# Phase 26 Production Deployment 
# Automated deployment dengan SSH authentication

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER="192.168.1.101"
USER="faiz"
SSH_KEY="$HOME/.ssh/id_rsa_warungin"

echo -e "${BLUE}========================================"
echo "Phase 26 Production Deployment"
echo "========================================${NC}"
echo ""

# Function untuk SSH command
run_ssh() {
    local cmd="$1"
    local desc="$2"
    
    echo -e "${YELLOW}${desc}${NC}"
    ssh -i "$SSH_KEY" "$USER@$SERVER" "$cmd" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Failed${NC}\n"
        return 1
    fi
}

# Step 1: Test koneksi
echo -e "${YELLOW}[Step 1/9] Testing SSH Connection...${NC}"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$USER@$SERVER" "echo 'OK'" > /dev/null 2>&1; then
    echo -e "${RED}✗ Cannot connect to $SERVER${NC}"
    echo "Trying without key (will prompt for password)..."
fi

# Step 2: Check current state
echo -e "${YELLOW}[Step 2/9] Checking Current State...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
echo "=== Docker Status ==="
sudo docker --version
sudo docker ps --format "table {{.Names}}\t{{.Status}}" | head -10

echo ""
echo "=== Current Git Commit ==="
sudo bash -c 'cd /root/New-Warungin && git log --oneline | head -1'
EOF

# Step 3: Pull latest code
echo -e "${YELLOW}[Step 3/9] Pulling Latest Code...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
sudo bash -c 'cd /root/New-Warungin && git pull origin main'
EOF

# Step 4: Show new commit
echo -e "${YELLOW}[Step 4/9] New Deployment Commit...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
sudo bash -c 'cd /root/New-Warungin && echo "Commit:" && git log --oneline | head -1'
EOF

# Step 5: Stop old containers
echo -e "${YELLOW}[Step 5/9] Stopping Old Containers...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
sudo bash -c 'cd /root/New-Warungin && docker-compose down'
EOF

# Step 6: Build images
echo -e "${YELLOW}[Step 6/9] Building Docker Images (this takes 2-3 min)...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
sudo bash -c 'cd /root/New-Warungin && docker-compose build --no-cache'
EOF

# Step 7: Start containers
echo -e "${YELLOW}[Step 7/9] Starting New Containers...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
sudo bash -c 'cd /root/New-Warungin && docker-compose up -d'
EOF

# Step 8: Wait and verify services
echo -e "${YELLOW}[Step 8/9] Waiting for Services (30 sec)...${NC}"
sleep 30
echo -e "${YELLOW}Verifying Services...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
sudo bash -c 'cd /root/New-Warungin && docker-compose ps'
EOF

# Step 9: Health check
echo -e "${YELLOW}[Step 9/9] Health Check...${NC}"
ssh -i "$SSH_KEY" "$USER@$SERVER" << 'EOF'
echo "Backend health:"
curl -s http://localhost:3001/api/health | head -20
echo ""
echo "Frontend:"
curl -s http://localhost/index.html | head -5
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Open browser: ${BLUE}http://192.168.1.101${NC}"
echo "2. Login as SUPER_ADMIN"
echo "3. Navigate to Tenants page"
echo "4. Verify:"
echo "   - ✓ Stores tab working"
echo "   - ✓ Addons tab working"
echo "   - ✗ NO Points tab"
echo ""
