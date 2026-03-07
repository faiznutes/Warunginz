#!/bin/bash
# scripts/deploy.sh
# THE ONE TRUE DEPLOYMENT SCRIPT
# Usage: ./scripts/deploy.sh

set -e # Exit on error

# Configuration
BRANCH="main"
BACKEND_SERVICE="backend"
FRONTEND_SERVICE="frontend"
NGINX_SERVICE="nginx"

echo "=========================================="
echo "   WARUNGIN MASTER DEPLOYMENT SEQUENCE"
echo "=========================================="
echo "Timestamp: $(date)"

# 1. Update Code
echo ""
echo "Step 1: Pulling latest code..."
git fetch origin $BRANCH
git reset --hard origin/$BRANCH

# 2. Environment Check
echo ""
echo "Step 2: Checking Environment..."
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file missing!"
    exit 1
fi

# Ensure JWT secrets execute (simple check)
if grep -q "CHANGE_THIS" .env; then
    echo "⚠️ WARNING: Default JWT secrets detected. Generating new ones..."
    # Generate random secrets
    JWT_SECRET=$(openssl rand -base64 32 | tr -d /=+ | cut -c -32)
    JWT_REFRESH=$(openssl rand -base64 32 | tr -d /=+ | cut -c -32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH/" .env
    echo "✅ Secrets updated."
fi

# 3. Build & Restart Backend
echo ""
echo "Step 3: Building Backend..."
docker compose build $BACKEND_SERVICE

echo "   Stopping old backend..."
docker compose stop $BACKEND_SERVICE

echo "   Running Migrations..."
# Start a temporary container to run migrations if needed, or just run 'up' and let entrypoint handle it?
# Better to run explicitly to fail fast.
docker compose run --rm $BACKEND_SERVICE npx prisma migrate deploy

echo "   Starting Backend..."
docker compose up -d $BACKEND_SERVICE

# 4. Seeding / Admin Setup
echo ""
echo "Step 4: Verifying Super Admin..."
# Wait for DB to be potentially ready (though migrate handled it)
docker compose exec -T $BACKEND_SERVICE node scripts/create-super-admin-docker.js

# 5. Build & Restart Frontend/Nginx
echo ""
echo "Step 5: Updating Frontend & Nginx..."
docker compose build $FRONTEND_SERVICE
docker compose up -d --no-deps $FRONTEND_SERVICE $NGINX_SERVICE

# 6. Cleanup
echo ""
echo "Step 6: Cleaning up..."
docker image prune -f

# 7. Final Health Check
echo ""
echo "Step 7: Final Status Check..."
docker compose ps
echo ""
./scripts/health-check.sh
