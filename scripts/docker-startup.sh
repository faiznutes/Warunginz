#!/bin/sh
set -e

echo "🚀 Starting Warungin Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
RETRIES=30
until node -e "
const { PrismaClient } = require('./dist/generated/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('connected');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Connection error:', e.message);
    process.exit(1);
  });
"; do
  RETRIES=$((RETRIES-1))
  if [ $RETRIES -eq 0 ]; then
    echo "❌ Database connection failed after 30 attempts"
    exit 1
  fi
  echo "   Database not ready, waiting 2 seconds... ($RETRIES attempts left)"
  sleep 2
done
echo "✅ Database is ready"

PRISMA_BIN="./node_modules/.bin/prisma"
if [ ! -x "$PRISMA_BIN" ]; then
  echo "❌ Prisma CLI not found at $PRISMA_BIN"
  exit 1
fi

echo "📤 Synchronizing database schema for test environment..."
"$PRISMA_BIN" db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate || {
  echo "❌ Failed to synchronize database schema"
  exit 1
}
echo "✅ Database schema synchronized"

# Check if super admin exists
echo "🔍 Checking for super admin..."
SUPER_ADMIN_EXISTS=$(node -e "
const { PrismaClient } = require('./dist/generated/client');
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } })
  .then(user => {
    console.log(user ? 'true' : 'false');
    process.exit(0);
  })
  .catch(() => {
    console.log('false');
    process.exit(0);
  });
" 2>/dev/null) || echo "false"

if [ "$SUPER_ADMIN_EXISTS" != "true" ]; then
  echo "👤 Creating super admin..."
  node scripts/create-super-admin-docker.js || {
    echo "⚠️  Super admin creation failed, trying seed..."
    npm run prisma:seed || {
      echo "⚠️  Seed failed, continuing without super admin..."
    }
  }
else
  echo "✅ Super admin already exists"
fi

echo "🧪 Seeding role readiness accounts..."
node scripts/seed-role-readiness-docker.js || {
  echo "⚠️  Role readiness seed failed, continuing with existing accounts..."
}

echo "🎉 Startup completed, starting server..."

# Verify compiled entrypoint exists
if [ ! -f "dist/main.js" ]; then
    echo "❌ Error: dist/main.js not found!"
    exit 1
fi

exec node dist/main
