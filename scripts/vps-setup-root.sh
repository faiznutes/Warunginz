#!/bin/bash
# Script lengkap untuk setup Warungin di VPS dari repository Root
# Usage: bash scripts/vps-setup-root.sh

set -e

# Configuration
GIT_REPO="https://YOUR_GITHUB_TOKEN@github.com/faiznutes/Root.git"
GIT_BRANCH="main"
PROJECT_DIR="/home/warungin/Warungin"
GITHUB_PAT="YOUR_GITHUB_TOKEN"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo -e "🚀 Warungin VPS Setup dari Root Repository"
echo -e "==========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${YELLOW}⚠️  Jangan jalankan sebagai root. Gunakan user biasa (warungin)${NC}"
   exit 1
fi

# Step 1: Install prerequisites
echo -e "${GREEN}[1/8] Checking prerequisites...${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker tidak ditemukan. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
    echo -e "${YELLOW}⚠️  Logout dan login lagi untuk apply docker group${NC}"
else
    echo -e "${GREEN}✅ Docker sudah terinstall${NC}"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Docker Compose tidak ditemukan. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose sudah terinstall${NC}"
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git tidak ditemukan. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y git
    echo -e "${GREEN}✅ Git installed${NC}"
else
    echo -e "${GREEN}✅ Git sudah terinstall${NC}"
fi

echo ""

# Step 2: Create project directory
echo -e "${GREEN}[2/8] Setting up project directory...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Directory $PROJECT_DIR sudah ada.${NC}"
    read -p "Hapus dan clone ulang? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Menghapus directory lama..."
        rm -rf "$PROJECT_DIR"
    else
        echo -e "${YELLOW}Menggunakan directory yang ada...${NC}"
        cd "$PROJECT_DIR"
        
        # Update remote jika perlu
        echo "Updating git remote..."
        git remote set-url origin "$GIT_REPO"
        
        # Pull latest
        echo "Pulling latest code..."
        git pull origin "$GIT_BRANCH" || echo -e "${YELLOW}⚠️  Pull failed, continuing...${NC}"
        
        # Skip to step 4
        SKIP_CLONE=true
    fi
fi

if [ "$SKIP_CLONE" != "true" ]; then
    # Create directory
    mkdir -p "$(dirname $PROJECT_DIR)"
    cd "$(dirname $PROJECT_DIR)"
    
    # Step 3: Clone repository
    echo -e "${GREEN}[3/8] Cloning repository Root...${NC}"
    git clone "$GIT_REPO" "$PROJECT_DIR" || {
        echo -e "${RED}❌ Clone failed${NC}"
        exit 1
    }
    cd "$PROJECT_DIR"
    git checkout "$GIT_BRANCH" 2>/dev/null || true
    echo -e "${GREEN}✅ Repository cloned${NC}"
    echo ""
fi

cd "$PROJECT_DIR"

# Step 4: Setup environment file
echo -e "${GREEN}[4/8] Setting up environment file...${NC}"
if [ ! -f .env ]; then
    echo "Creating .env from env.example..."
    cp env.example .env
    
    # Generate secure JWT secrets
    echo "Generating secure JWT secrets..."
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_REFRESH=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    # Update .env with generated secrets
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH/" .env
    
    # Generate secure database password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:$DB_PASSWORD@postgres:5432/warungin?schema=public|" .env
    
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env file untuk konfigurasi SMTP, Midtrans, dan Cloudflare Tunnel${NC}"
    echo ""
    echo "Press Enter to continue setelah edit .env (atau Ctrl+C untuk edit sekarang)..."
    read
else
    echo -e "${GREEN}✅ .env file sudah ada${NC}"
fi

echo ""

# Step 5: Setup firewall
echo -e "${GREEN}[5/8] Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    echo "Configuring UFW firewall..."
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  UFW tidak ditemukan, skip firewall setup${NC}"
fi

echo ""

# Step 6: Build Docker images
echo -e "${GREEN}[6/8] Building Docker images...${NC}"
echo "This may take several minutes..."
docker compose build --no-cache || {
    echo -e "${YELLOW}⚠️  Build dengan --no-cache failed, trying without...${NC}"
    docker compose build || {
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    }
}
echo -e "${GREEN}✅ Docker images built${NC}"
echo ""

# Step 7: Start Docker containers
echo -e "${GREEN}[7/8] Starting Docker containers...${NC}"
docker compose down 2>/dev/null || true
docker compose up -d

echo "Waiting for services to start..."
sleep 20

# Check container status
echo ""
echo -e "${BLUE}Container Status:${NC}"
docker compose ps

echo ""

# Step 8: Wait for database and create super admin
echo -e "${GREEN}[8/8] Setting up database and super admin...${NC}"
echo "Waiting for database to be ready..."
sleep 10

# Check if backend container is running
if docker compose ps | grep -q "warungin-backend.*Up"; then
    echo "Backend container is running..."
    
    # Wait a bit more for migrations
    echo "Waiting for migrations to complete..."
    sleep 30
    
    # Create super admin
    echo "Creating super admin..."
    docker compose exec -T backend node scripts/create-super-admin-docker.js || {
        echo -e "${YELLOW}⚠️  Super admin creation failed, mungkin sudah ada${NC}"
    }
    
    echo ""
    echo -e "${GREEN}✅ Super admin setup completed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend container belum running, super admin akan dibuat otomatis saat container start${NC}"
fi

echo ""

# Step 9: Start Cloudflare Tunnel (if configured)
echo -e "${GREEN}[9/9] Checking Cloudflare Tunnel...${NC}"
if grep -q "CLOUDFLARE_TUNNEL_TOKEN=" .env && ! grep -q "CLOUDFLARE_TUNNEL_TOKEN=$" .env; then
    TOKEN=$(grep "CLOUDFLARE_TUNNEL_TOKEN=" .env | cut -d'=' -f2 | tr -d ' ')
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "" ]; then
        echo "Starting Cloudflare Tunnel..."
        docker compose --profile cloudflare up -d cloudflared
        echo -e "${GREEN}✅ Cloudflare Tunnel started${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudflare Tunnel token tidak dikonfigurasi${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cloudflare Tunnel token tidak dikonfigurasi${NC}"
fi

echo ""

# Final status
echo -e "${BLUE}=========================================="
echo -e "✅ Setup Complete!"
echo -e "==========================================${NC}"
echo ""
echo -e "${GREEN}📋 Summary:${NC}"
echo -e "   • Repository: ${GREEN}Root${NC}"
echo -e "   • Project Path: ${GREEN}$PROJECT_DIR${NC}"
echo -e "   • Docker Containers: ${GREEN}Running${NC}"
echo ""
echo -e "${YELLOW}🔑 Super Admin Credentials:${NC}"
echo -e "   • Email: ${GREEN}admin@warungin.com${NC}"
echo -e "   • Password: ${GREEN}admin123${NC}"
echo -e "   • ${RED}⚠️  PENTING: Ganti password setelah login pertama!${NC}"
echo ""
echo -e "${BLUE}📊 Container Status:${NC}"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "   1. Edit .env file untuk konfigurasi lengkap:"
echo -e "      ${YELLOW}nano $PROJECT_DIR/.env${NC}"
echo -e "   2. Cek logs jika ada masalah:"
echo -e "      ${YELLOW}cd $PROJECT_DIR && docker compose logs -f${NC}"
echo -e "   3. Akses aplikasi:"
echo -e "      ${GREEN}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "   4. Health check:"
echo -e "      ${GREEN}curl http://localhost/api/health${NC}"
echo ""
echo -e "${GREEN}🎉 Setup selesai!${NC}"
echo ""

