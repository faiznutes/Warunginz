# NestJS Backend Migration Guide

## Overview

NestJS backend runs **in parallel** with the existing Express backend during migration.

| Backend | Port | Base URL |
|---------|------|----------|
| Express (legacy) | 3000 | http://localhost:3000 |
| NestJS (new) | 3001 | http://localhost:3001 |

## Prerequisites

1. **Stop Express dev server** before running `prisma generate` (Windows may lock Prisma binaries)
2. Add to `.env`:
   ```
   NEST_PORT=3001
   REQUEST_TIMEOUT_MS=5000
   ```

## Quick Start

```bash
# Install NestJS deps (first time)
cd nest && npm install && cd ..

# Generate Prisma client (stop Express first if locked)
cd nest && npm run prisma:generate && cd ..

# Run NestJS (from project root)
npm run dev:nest

# Or run both backends (two terminals)
# Terminal 1: npm run dev        (Express :3000)
# Terminal 2: npm run dev:nest   (NestJS  :3001)
```

## Endpoints (NestJS Phase 1-4)

### Phase 1 - Auth & Products ✅
| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /health | Public | ✅ |
| GET | /api/auth/me | JWT | ✅ |
| POST | /api/auth/login | Public | ✅ |
| POST | /api/auth/refresh | Public | ✅ |
| POST | /api/auth/logout | JWT | ✅ |
| GET | /api/products | JWT + Tenant + Subscription | ✅ |
| GET | /api/products/low-stock/all | JWT + Tenant + Subscription | ✅ |
| GET | /api/products/:id | JWT + Tenant + Subscription | ✅ |

### Phase 2 - Orders Module ✅
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/orders | JWT + Tenant + Subscription | Paginated, role-aware filtering |
| GET | /api/orders/:id | JWT + Tenant + Subscription | Optimized with select (no N+1) |
| POST | /api/orders | JWT + Tenant + Subscription | Create order with items |
| PUT | /api/orders/:id/status | JWT + Tenant + Subscription | Update order status |

### Phase 3 - Cash Shift Module ✅
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /api/cash-shift/open | JWT + Tenant + Subscription | CASHIER only |
| POST | /api/cash-shift/close | JWT + Tenant + Subscription | CASHIER only, calculates sales |
| GET | /api/cash-shift/current | JWT + Tenant + Subscription | Get active shift |
| GET | /api/cash-shift/history | JWT + Tenant + Subscription | Paginated history |
| GET | /api/cash-shift/check-active | JWT + Tenant + Subscription | Check if user has active shift |

### Phase 4 - Store Shift Module ✅
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/store-shift/current | JWT + Tenant + Subscription | Query param: outletId |
| GET | /api/store-shift/open | JWT + Tenant + Subscription | Get all open shifts |
| GET | /api/store-shift/history | JWT + Tenant + Subscription | Paginated history |
| POST | /api/store-shift/open | JWT + Tenant + Subscription | Create shift for store |
| POST | /api/store-shift/close | JWT + Tenant + Subscription | Close shift |

## Architecture (Phase 1-4)

```
nest/src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── decorators/
│   │   ├── @CurrentUser
│   │   ├── @TenantId
│   │   ├── @Roles
│   │   ├── @TenantRequired
│   │   └── @Public
│   ├── filters/
│   │   └── HttpExceptionFilter
│   ├── guards/
│   │   ├── jwt-auth.guard.ts      (JWT validation)
│   │   ├── tenant.guard.ts        (Tenant extraction)
│   │   ├── roles.guard.ts         (Role-based access)
│   │   └── subscription.guard.ts  (Subscription check)
│   ├── interceptors/
│   │   ├── ResponseInterceptor
│   │   └── TimeoutInterceptor
│   ├── middleware/
│   │   ├── CorrelationIdMiddleware
│   │   └── helmet + rate-limiter
│   ├── logger/
│   │   └── Pino LoggerService
│   ├── utils/
│   │   └── pagination.util.ts
│   └── health/
│       └── Health check
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── auth.module.ts
    │   ├── dto/
    │   ├── guards/
    │   └── strategies/
    ├── products/
    │   ├── products.controller.ts (OPTIMIZED: select fields only)
    │   ├── products.service.ts
    │   ├── products.module.ts
    │   └── dto/
    ├── orders/
    │   ├── orders.controller.ts
    │   ├── orders.service.ts    (OPTIMIZED: no N+1 queries)
    │   ├── orders.module.ts
    │   └── dto/
    ├── cash-shifts/
    │   ├── cash-shifts.controller.ts
    │   ├── cash-shifts.service.ts (calculates sales efficiently)
    │   ├── cash-shifts.module.ts
    │   └── dto/
    └── store-shifts/
        ├── store-shifts.controller.ts
        ├── store-shifts.service.ts
        ├── store-shifts.module.ts
        └── dto/
```

## Security (Phase 1-4)

✅ **Helmet.js**: 12 security headers
✅ **Rate Limiting**: 
- Global: 100 req/15min
- Auth endpoints: 5 req/15min (stricter)

✅ **Guards**:
- JWT Authentication Guard
- Tenant isolation Guard
- Role-based access Guard
- Subscription validation Guard

✅ **Input Validation**: class-validator with DTO payloads

```
nest/src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── decorators/   (@CurrentUser, @TenantId, @Public)
│   ├── filters/      (HttpExceptionFilter)
│   ├── interceptors/ (ResponseInterceptor, TimeoutInterceptor)
│   ├── middleware/   (CorrelationIdMiddleware)
│   ├── logger/       (Pino LoggerService)
│   └── health/       (Health check)
└── modules/
    ├── auth/         (login, refresh, logout, me)
    └── products/     (list, by id, low-stock)
```

## Migration Strategy (Phase 9)

1. **Run both backends** on different ports
2. **Test NestJS endpoints** with Postman
3. **Compare responses** Express vs NestJS
4. **Migrate frontend baseURL** to NestJS when stable
5. **Monitor** for 1 week before deprecating Express

## Remaining Work (Phase 5-8)

- [x] Phase 1: Auth & Products modules ✅
- [x] Phase 2: Orders module (with N+1 fix) ✅
- [x] Phase 3: Cash-shift module ✅
- [x] Phase 4: Store-shift module ✅
- [x] TenantGuard, RoleGuard, SubscriptionGuard ✅
- [x] Helmet security headers ✅
- [x] Rate limiting (global + auth) ✅
- [ ] Phase 5: Customers module
- [ ] Phase 6: Reports module
- [ ] Phase 7: Subscriptions module
- [ ] Phase 8: Remaining modules (Discounts, Payments, etc.)
- [ ] Frontend migration to :3001
- [ ] Performance testing & monitoring
- [ ] Deprecate Express backend

## Rules (Phase 0)

- ❌ Do NOT change Prisma schema
- ❌ Do NOT add new features
- ✅ Migrate per module
- ✅ Same database
- ✅ Frontend unchanged until backend v2 stable
