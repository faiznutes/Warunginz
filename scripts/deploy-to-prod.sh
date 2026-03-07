#!/bin/bash
# Phase 26 Deployment Script with SSH Password Auth
# Usage: bash deploy-to-prod.sh

set -e

SERVER="192.168.1.101"
FAIZ_USER="faiz"
ROOT_PASS="123"

echo "========================================"
echo "Phase 26 Production Deployment"
echo "========================================"
echo ""

# Create expect script for automated SSH with password
cat > /tmp/deploy.expect << 'EXPECT_EOF'
#!/usr/bin/expect -f
set timeout 30
set server [lindex $argv 0]
set user [lindex $argv 1]
set root_pass [lindex $argv 2]

# SSH Connection
spawn ssh $user@$server

# Wait for password prompt
expect {
    "password:" {
        send "$user\r"
        exp_continue
    }
    "root@" {
        # Already at root
        send "cd /root/New-Warungin\r"
    }
    "#" {
        # Prompt received
        send "cd /root/New-Warungin\r"
    }
}

# Step 1: Check Docker
expect "root@*"
send "echo '=== Checking Docker ===' && docker --version && docker ps -q | wc -l\r"
expect "root@*"

# Step 2: Check current git
send "echo '=== Current Git Commit ===' && git log --oneline | head -3\r"
expect "root@*"

# Step 3: Pull latest
send "echo '=== Pulling Latest Code ===' && git pull origin main\r"
expect "root@*"

# Step 4: Show pulled commit
send "echo '=== New Commit ===' && git log --oneline | head -1\r"
expect "root@*"

# Step 5: Stop containers
send "echo '=== Stopping Containers ===' && docker-compose down\r"
expect "root@*"

# Step 6: Build
send "echo '=== Building Docker Images ===' && docker-compose build --no-cache\r"
expect "root@*"

# Step 7: Start
send "echo '=== Starting Containers ===' && docker-compose up -d\r"
expect "root@*"

# Step 8: Wait and verify
send "sleep 30 && echo '=== Verifying Services ===' && docker-compose ps\r"
expect "root@*"

# Step 9: Health check
send "echo '=== Backend Health Check ===' && curl -s http://localhost:3001/api/health | head -20\r"
expect "root@*"

# Done
send "echo '✅ Deployment Complete!'\r"
expect "root@*"
send "exit\r"

EXPECT_EOF

chmod +x /tmp/deploy.expect

echo "Running deployment..."
/tmp/deploy.expect "$SERVER" "$FAIZ_USER" "$ROOT_PASS"

echo ""
echo "✅ Deployment script completed!"
echo ""
echo "Next steps:"
echo "1. Open browser: http://192.168.1.101"
echo "2. Login as SUPER_ADMIN"
echo "3. Navigate to Tenants page"
echo "4. Verify all fixes are working"
