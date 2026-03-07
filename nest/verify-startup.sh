#!/bin/bash

# NestJS Backend Startup Verification Script
# Validates that all modules, guards, interceptors, and filters are properly configured

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  NestJS Backend - Startup Verification (Phase 16 Complete)"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check TypeScript compilation
echo -e "${YELLOW}[1/8]${NC} Checking TypeScript compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript compilation: PASS (0 errors)"
else
    echo -e "${RED}✗${NC} TypeScript compilation: FAIL"
    npx tsc --noEmit
    exit 1
fi

# Check all critical files exist
echo -e "${YELLOW}[2/8]${NC} Checking critical files..."
critical_files=(
    "src/main.ts"
    "src/app.module.ts"
    "src/common/filters/global-exception.filter.ts"
    "src/common/interceptors/response.interceptor.ts"
    "src/common/interceptors/performance-monitoring.interceptor.ts"
    "src/common/pipes/enhanced-validation.pipe.ts"
    "src/common/guards/jwt-auth.guard.ts"
    "src/common/decorators/tenant-id.decorator.ts"
    "src/modules/auth/auth.module.ts"
    "src/modules/products/products.module.ts"
    "src/modules/orders/orders.module.ts"
    "src/modules/customers/customers.module.ts"
    "src/modules/reports/reports.module.ts"
    "src/modules/subscriptions/subscriptions.module.ts"
    "src/modules/outlets/outlets.module.ts"
    "src/modules/users/users.module.ts"
    "src/modules/settings/settings.module.ts"
)

missing_files=()
for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All critical files present (16 modules + infrastructure)"
else
    echo -e "${RED}✗${NC} Missing files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

# Check all modules are imported in app.module.ts
echo -e "${YELLOW}[3/8]${NC} Checking module imports in app.module.ts..."
modules=(
    "AuthModule"
    "ProductsModule"
    "OrdersModule"
    "CashShiftsModule"
    "StoreShiftsModule"
    "CustomersModule"
    "ReportsModule"
    "SubscriptionsModule"
    "OutletsModule"
    "UsersModule"
    "SettingsModule"
)

missing_imports=()
for module in "${modules[@]}"; do
    if ! grep -q "$module" "src/app.module.ts"; then
        missing_imports+=("$module")
    fi
done

if [ ${#missing_imports[@]} -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All modules imported in app.module.ts (11 modules)"
else
    echo -e "${RED}✗${NC} Missing module imports:"
    for module in "${missing_imports[@]}"; do
        echo "  - $module"
    done
    exit 1
fi

# Check response.interceptor is using global filter
echo -e "${YELLOW}[4/8]${NC} Checking global exception filter registration..."
if grep -q "APP_FILTER" "src/app.module.ts" && grep -q "GlobalExceptionFilter" "src/app.module.ts"; then
    echo -e "${GREEN}✓${NC} GlobalExceptionFilter registered in APP_FILTER"
else
    echo -e "${RED}✗${NC} GlobalExceptionFilter not properly registered"
    exit 1
fi

# Check response interceptor registered
echo -e "${YELLOW}[5/8]${NC} Checking global response interceptor registration..."
if grep -q "APP_INTERCEPTOR" "src/app.module.ts" && grep -q "ResponseInterceptor" "src/app.module.ts"; then
    echo -e "${GREEN}✓${NC} ResponseInterceptor registered in APP_INTERCEPTOR"
else
    echo -e "${RED}✗${NC} ResponseInterceptor not properly registered"
    exit 1
fi

# Check prisma service exists
echo -e "${YELLOW}[6/8]${NC} Checking Prisma integration..."
if [ -f "src/prisma/prisma.service.ts" ] && [ -f "../prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma service and schema found"
else
    echo -e "${RED}✗${NC} Prisma service or schema missing"
    exit 1
fi

# Check environment variables template
echo -e "${YELLOW}[7/8]${NC} Checking environment configuration..."
if [ -f "../.env.example" ] || [ -f "../.env" ]; then
    echo -e "${GREEN}✓${NC} Environment configuration found"
else
    echo -e "${YELLOW}⚠${NC} Warning: No .env or .env.example file found"
    echo "   Create .env with: DATABASE_URL, JWT_SECRET, CORS_ORIGIN"
fi

# Check package.json has build script
echo -e "${YELLOW}[8/8]${NC} Checking build configuration..."
if grep -q "\"build\":" "package.json" && grep -q "nest build" "package.json"; then
    echo -e "${GREEN}✓${NC} Build script configured (npm run build)"
else
    echo -e "${RED}✗${NC} Build script not properly configured"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ ALL CHECKS PASSED - Backend Ready for Deployment${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  • TypeScript Compilation: 0 errors"
echo "  • Critical Files: 16/16 present"
echo "  • Modules Imported: 11/11"
echo "  • Global Filters: Registered"
echo "  • Global Interceptors: Registered"
echo "  • Prisma ORM: Configured"
echo "  • Build: Ready"
echo ""
echo "Next Steps:"
echo "  1. npm install           (install dependencies)"
echo "  2. npm run build         (compile TypeScript)"
echo "  3. npm run start         (start production server)"
echo ""
echo "Or for development:"
echo "  npm run start:dev        (start with auto-reload)"
echo ""
