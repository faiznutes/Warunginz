# Warungin NestJS Backend

Enterprise-grade NestJS backend for the SaaS POS system. Runs in parallel with the Express backend during migration.

## Quick Start

```bash
# Install dependencies
cd nest && npm install && cd ..

# Generate Prisma client (stop Express server first if you get EPERM)
cd nest && npm run prisma:generate && cd ..

# Run NestJS (port 3001)
npm run dev:nest
```

## Environment

Add to root `.env`:
```env
NEST_PORT=3001
REQUEST_TIMEOUT_MS=5000
```

Uses same `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` as Express backend.

## Migrated Modules

| Module | Endpoints | Status |
|--------|-----------|--------|
| Auth | login, refresh, logout, me | ✅ |
| Products | GET list, GET :id, GET low-stock/all | ✅ |
| Health | GET /health | ✅ |

## Architecture

- **Modular structure**: One module per domain (auth, products, orders, etc.)
- **Multi-tenant**: TenantGuard, TenantId decorator, all queries filtered by tenantId
- **Response format**: `{ success, data?, message?, error? }` via ResponseInterceptor
- **Error handling**: HttpExceptionFilter with correlation ID
- **Validation**: class-validator DTOs, global ValidationPipe
- **Pagination**: Max 100 per request, hard cap via pagination.util
- **Timeout**: 5s default via TimeoutInterceptor

## See Also

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Full migration strategy
- [PHASE1_FULL_SYSTEM_AUDIT.md](../PHASE1_FULL_SYSTEM_AUDIT.md) - Audit findings and N+1 fixes
