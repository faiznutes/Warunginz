#!/bin/bash
# PHASE 35 Deployment Script for Production Server
# Run this on the target server: root@192.168.1.101

set -e

echo "==================================="
echo "PHASE 35 Production Deployment"
echo "==================================="
echo ""

# Step 1: Navigate to project directory
cd /root/New-Warungin || cd /home/app/New-Warungin || { echo "Directory not found"; exit 1; }
echo "✅ Current directory: $(pwd)"
echo ""

# Step 2: Git pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main
echo "✅ Git pull complete"
echo ""

# Step 3: Install/update dependencies
echo "📦 Installing npm dependencies..."
npm ci --production
echo "✅ Dependencies installed"
echo ""

# Step 4: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Step 5: Apply database migrations
echo "🗄️ Applying database migrations..."
npx prisma migrate deploy
echo "✅ Database migrations applied"
echo ""

# Step 6: Build the application
echo "🏗️ Building application..."
npm run build
echo "✅ Build complete"
echo ""

# Step 7: Display deployment status
echo "==================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "==================================="
echo ""
echo "Summary:"
echo "  Repository: $(git remote -v | head -1)"
echo "  Branch: $(git branch --show-current)"
echo "  Latest commit: $(git log -1 --oneline)"
echo "  Build status: ✅ SUCCESS"
echo ""
echo "Next steps:"
echo "1. Start the application: npm start"
echo "2. Verify health: curl http://localhost:3000/health"
echo "3. Monitor logs: tail -f logs/application.log"
echo ""
