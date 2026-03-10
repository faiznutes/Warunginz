#!/bin/bash
# Quick setup script - minimal prompts
# Usage: bash scripts/vps-setup-root-quick.sh

set -e

GIT_REPO="https://YOUR_GITHUB_TOKENKpQBqVwr7Xk6YmdkSqHuKlumGirBTE0Oab0p@github.com/faiznutes/Root.git"
GIT_BRANCH="main"
PROJECT_DIR="/home/warungin/Warungin"

echo "🚀 Quick Setup Warungin dari Root Repository"
echo ""

# Clone atau update
if [ -d "$PROJECT_DIR" ]; then
    echo "📥 Updating existing repository..."
    cd "$PROJECT_DIR"
    git remote set-url origin "$GIT_REPO"
    git pull origin "$GIT_BRANCH" || true
else
    echo "📥 Cloning repository..."
    mkdir -p "$(dirname $PROJECT_DIR)"
    git clone "$GIT_REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Setup .env
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp env.example .env
    
    # Generate secrets
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_REFRESH=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH/" .env
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:$DB_PASSWORD@postgres:5432/warungin?schema=public|" .env
fi

# Build and start
echo "🔨 Building Docker images..."
docker compose build

echo "🚀 Starting containers..."
docker compose down 2>/dev/null || true
docker compose up -d

echo "⏳ Waiting for services..."
sleep 30

# Create super admin
echo "👤 Creating super admin..."
docker compose exec -T backend node scripts/create-super-admin-docker.js 2>/dev/null || echo "Super admin mungkin sudah ada"

# Cloudflare tunnel
if grep -q "CLOUDFLARE_TUNNEL_TOKEN=" .env && ! grep -q "CLOUDFLARE_TUNNEL_TOKEN=$" .env; then
    TOKEN=$(grep "CLOUDFLARE_TUNNEL_TOKEN=" .env | cut -d'=' -f2 | tr -d ' ')
    if [ -n "$TOKEN" ]; then
        docker compose --profile cloudflare up -d cloudflared
    fi
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📊 Status:"
docker compose ps
echo ""
echo "🔑 Login: admin@warungin.com / admin123"
echo ""

