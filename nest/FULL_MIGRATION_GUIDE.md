# NestJS Full Backend Migration - Complete PHASE Guide
**Enterprise-Grade SaaS POS System**
**Target: 100+ tenant scalability | Zero N+1 queries**

---

## 🎯 PHASE 0 — RULES (MANDATORY)

✅ **Database**: Jangan ubah schema Prisma
✅ **Features**: Jangan tambah fitur baru
✅ **Business Logic**: Jangan ubah kecuali optimasi performa
✅ **Approach**: Migrasi per module (urut sesuai dependencies)
✅ **Data**: Database tetap sama (single source of truth)
✅ **Frontend**: Tidak diubah sampai backend v2 fully stable

---

## ✅ PHASE 1 — BOOTSTRAP NESTJS CORE (COMPLETED)

### Deliverables
- [x] Main.ts dengan Helmet + Rate Limit
- [x] App.module dengan global setup
- [x] Prisma Service integration
- [x] Global Exception Filter
- [x] Global Response Interceptor
- [x] Global Timeout Interceptor (5s default)
- [x] Correlation ID Middleware
- [x] Pino Logger Service
- [x] TypeScript strict mode

### Files Created
```
nest/src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── filters/http-exception.filter.ts
│   ├── interceptors/response.interceptor.ts
│   ├── interceptors/timeout.interceptor.ts
│   ├── middleware/correlation-id.middleware.ts
│   ├── logger/logger.service.ts
│   ├── health/health.module.ts
│   └── utils/pagination.util.ts
```

**Status**: ✅ DONE

---

## ✅ PHASE 2 — AUTH & PRODUCTS MODULE (COMPLETED)

### Auth Module
✅ JWT strategy
✅ Login endpoint
✅ Refresh token
✅ Logout
✅ Get current user

### Products Module
✅ GET /api/products (paginated, max 100)
✅ GET /api/products/:id
✅ GET /api/products/low-stock/all
✅ OPTIMIZED with `select` (no N+1)

**Status**: ✅ DONE

---

## ✅ PHASE 3 — ORDERS MODULE WITH N+1 FIX (COMPLETED)

### Endpoints
✅ GET /api/orders (paginated, role-aware)
✅ GET /api/orders/:id
✅ POST /api/orders (create with items validation)
✅ PUT /api/orders/:id/status

### Optimizations
✅ **N+1 Fix**: Gunakan `select` spesifik, bukan `include`
✅ **Batch Query**: `Promise.all()` untuk parallel fetches
✅ **Type Safety**: Proper DTO + class-validator
✅ **Tenant Scoped**: Semua query punya tenantId filter

**Status**: ✅ DONE

---

## ✅ PHASE 4 — CASH SHIFT MODULE (COMPLETED)

### Endpoints
✅ POST /api/cash-shift/open (CASHIER only)
✅ POST /api/cash-shift/close (auto-calculate sales)
✅ GET /api/cash-shift/current
✅ GET /api/cash-shift/history (paginated)
✅ GET /api/cash-shift/check-active

### Optimizations
✅ **Smart Calculation**: Order.findMany() single query
✅ **No Loop**: Aggregation di database level
✅ **Type Safe**: All parameters typed

**Status**: ✅ DONE

---

## ✅ PHASE 5 — STORE SHIFT MODULE (COMPLETED)

### Endpoints
✅ GET /api/store-shift/current
✅ GET /api/store-shift/open
✅ GET /api/store-shift/history
✅ POST /api/store-shift/open
✅ POST /api/store-shift/close

**Status**: ✅ DONE

---

## ✅ PHASE 6 — MULTI-TENANT HARDENING (COMPLETED)

### Guards Implemented
✅ **TenantGuard**: Ekstrak & validate tenantId dari header
✅ **RolesGuard**: Validate role-based access
✅ **SubscriptionGuard**: Check tenant subscription status
✅ **JwtAuthGuard**: JWT validation

### Decorators Implemented
✅ **@TenantId()**: Auto-extract dari guard
✅ **@CurrentUser()**: Auto-extract user data
✅ **@Roles()**: Metadata untuk RolesGuard
✅ **@TenantRequired()**: Enforce tenant context

### Rules Enforced
✅ Semua query tenant-scoped
✅ SUPER_ADMIN jangan akses tanpa context
✅ No leakage antar tenant
✅ Subscription check sebelum access feature

**Status**: ✅ DONE

---

## ✅ PHASE 7 — SECURITY HARDENING (COMPLETED)

### Implemented
✅ **Helmet.js**: 12 security headers
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security
  - etc.

✅ **Rate Limiting**:
  - Global: 100 req/15min
  - Auth endpoints: 5 req/15min (stricter)

✅ **CORS**: Strict origin validation
✅ **Input Validation**: DTO + class-validator
✅ **Timeout**: 5s default per request

**Status**: ✅ DONE

---

## ⏳ PHASE 8 — CUSTOMERS MODULE (TODO)

### Endpoints to Migrate
- [ ] GET /api/customers (paginated, searchable)
- [ ] POST /api/customers (create)
- [ ] PUT /api/customers/:id (update)
- [ ] DELETE /api/customers/:id
- [ ] GET /api/customers/:id
- [ ] GET /api/customers/search

### DTO Files
```
dto/
├── get-customers.dto.ts
├── create-customer.dto.ts
├── update-customer.dto.ts
└── customer-search.dto.ts
```

### Optimizations Required
- [ ] Add `select` untuk pagination (jangan `include`)
- [ ] Search: ILIKE untuk PostgreSQL
- [ ] Pagination max 100
- [ ] Tenant-scoped mandatory

### Expected Completion Time
**2-3 hours**

---

## ⏳ PHASE 9 — REPORTS MODULE (TODO)

### Endpoints to Migrate
- [ ] GET /api/reports/daily-sales
- [ ] GET /api/reports/product-summary
- [ ] GET /api/reports/customer-revenue
- [ ] GET /api/reports/shift-summary
- [ ] POST /api/reports/export (Excel)

### Key Optimizations
- [ ] **Aggregation**: Gunakan `prisma.$queryRaw` untuk complex aggregation
- [ ] **Caching**: Optional Redis cache untuk heavy reports
- [ ] **Time Range**: Enforce date range validation
- [ ] **Performance**: Target < 500ms response

### Expected Completion Time
**4-5 hours** (includes query optimization & caching)

---

## ⏳ PHASE 10 — SUBSCRIPTIONS & ADDONS (TODO)

### Endpoints to Migrate
- [ ] GET /api/subscriptions
- [ ] POST /api/subscriptions/upgrade
- [ ] GET /api/addons
- [ ] POST /api/addons/subscribe
- [ ] PUT /api/addons/:id/unsubscribe

### Expected Completion Time
**2-3 hours**

---

## ⏳ PHASE 11 — REMAINING MODULES (TODO)

### Modules Remaining
1. **Delivery** (2 hours)
   - Courier integration endpoints
   - Shipment tracking

2. **Suppliers** (1.5 hours)
   - CRUD operations
   - Purchase order endpoints

3. **Settings** (1 hour)
   - Tenant configuration
   - Feature toggles

4. **Tenants** (2 hours)
   - Admin-only CRUD
   - Subscription management

5. **Users** (2 hours)
   - User management
   - Permission assignment
   - 2FA endpoints

6. **Dashboard** (3 hours)
   - Widget endpoints
   - Real-time data
   - KPI aggregation

### Total Estimated Time
**11.5 hours**

---

## ⏳ PHASE 12 — RESPONSE STANDARDIZATION (IN PROGRESS)

### Rule
**Semua endpoint HARUS return format:**
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "statusCode": number
}
```

### Implementation
✅ Global Response Interceptor (sudah di main.ts)
✅ Consistent error response
⏳ Audit semua existing endpoints
⏳ Update Express endpoints yang belum compliant

### Expected Completion Time
**1-2 hours**

---

## ⏳ PHASE 13 — ERROR HANDLING ENTERPRISE (IN PROGRESS)

### Global Exception Filter
✅ Implemented (sudah di main.ts)

### Specific Error Handlers
⏳ Prisma errors:
  - Unique constraint violation
  - Foreign key errors
  - Record not found

⏳ Validation errors:
  - DTO validation
  - File upload validation

⏳ Auth errors:
  - JWT expired
  - Invalid token
  - Permission denied

⏳ Timeout errors:
  - Request timeout
  - Graceful degradation

### Logging Strategy
✅ Correlation ID di setiap request
⏳ Error logging ke file + monitoring service
⏳ Alert untuk critical errors

### Expected Completion Time
**3-4 hours**

---

## ⏳ PHASE 14 — PERFORMANCE ENFORCEMENT (TODO)

### Pagination Hard Limit
✅ Max 100 items per page (sudah implemented)
⏳ Audit semua query untuk pagination

### Query Performance Targets
⏳ Normal endpoint: < 200ms
⏳ Report endpoint: < 500ms
⏳ Dashboard: < 1s

### Performance Monitoring
⏳ Query time logging
⏳ Slow query alerts (> 1s)
⏳ N+1 query detection

### Database Optimization
⏳ Index audit
⏳ Query plan analysis
⏳ Connection pool tuning

### Expected Completion Time
**4-5 hours** (includes testing & optimization)

---

## ⏳ PHASE 15 — TESTING & VALIDATION (TODO)

### Unit Tests
- [ ] Service tests untuk setiap module
- [ ] DTO validation tests
- [ ] Guard tests (Tenant, Role, Subscription)
- [ ] Error handling tests

### Integration Tests
- [ ] Auth flow (login → refresh → logout)
- [ ] Order creation → shift management
- [ ] Tenant isolation tests
- [ ] Role-based access tests

### End-to-End Tests
- [ ] Postman collection (sudah ada TESTING_GUIDE.md)
- [ ] Full business flow
- [ ] Performance validation

### Coverage Target
**Minimum 70% coverage** untuk critical paths

### Expected Completion Time
**6-8 hours**

---

## ⏳ PHASE 16 — FRONTEND MIGRATION (TODO)

### Prerequisites
- [ ] NestJS backend fully stable (running 1 week without issues)
- [ ] All endpoints tested & validated
- [ ] Response formats consistent
- [ ] Performance meeting targets

### Migration Steps
1. [ ] Update `vite.config.js` proxy: `http://localhost:3001/api`
2. [ ] Test frontend against NestJS
3. [ ] Monitor error rates
4. [ ] Gradual rollout (if needed)

### Validation
- [ ] All pages load correctly
- [ ] All API calls working
- [ ] No browser console errors
- [ ] Performance acceptable

### Expected Completion Time
**1-2 hours** (mostly testing)

---

## 🚀 PHASE 17 — PRODUCTION DEPLOYMENT (TODO)

### Pre-deployment Checklist
- [ ] All tests passing (unit + integration + e2e)
- [ ] Load testing passed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team trained
- [ ] Rollback plan ready

### Deployment Strategy
1. [ ] Deploy NestJS to staging
2. [ ] Load test & monitoring
3. [ ] Deploy to production (blue-green if possible)
4. [ ] Monitor for 24 hours
5. [ ] Keep Express running for fallback

### Monitoring
- [ ] Error rate monitoring
- [ ] Response time monitoring
- [ ] Database connection pool monitoring
- [ ] Memory & CPU usage

### Expected Completion Time
**2-3 hours** (execution + monitoring)

---

## 📊 MIGRATION TIMELINE SUMMARY

| Phase | Task | Status | Est. Time | Total |
|-------|------|--------|-----------|-------|
| 1 | Bootstrap NestJS | ✅ Done | 2h | 2h |
| 2 | Auth & Products | ✅ Done | 3h | 5h |
| 3 | Orders | ✅ Done | 2h | 7h |
| 4 | Cash Shift | ✅ Done | 1.5h | 8.5h |
| 5 | Store Shift | ✅ Done | 1.5h | 10h |
| 6 | Multi-tenant | ✅ Done | 2h | 12h |
| 7 | Security | ✅ Done | 2h | 14h |
| 8 | Customers | ⏳ TODO | 2.5h | 16.5h |
| 9 | Reports | ⏳ TODO | 4.5h | 21h |
| 10 | Subscriptions | ⏳ TODO | 2.5h | 23.5h |
| 11 | Remaining | ⏳ TODO | 11.5h | 35h |
| 12 | Response Format | ⏳ TODO | 1.5h | 36.5h |
| 13 | Error Handling | ⏳ TODO | 3.5h | 40h |
| 14 | Performance | ⏳ TODO | 4.5h | 44.5h |
| 15 | Testing | ⏳ TODO | 7h | 51.5h |
| 16 | Frontend Migration | ⏳ TODO | 1.5h | 53h |
| 17 | Production Deploy | ⏳ TODO | 2.5h | 55.5h |

**Total Estimated Time**: ~55 hours (~1 week intensive work)

---

## 🔄 MIGRATION SAFETY STRATEGY

### Running Both Backends
```bash
# Terminal 1: Express (legacy) on :3000
npm run dev

# Terminal 2: NestJS (new) on :3001
npm run dev:nest
```

### Validation Approach
1. **Phase-by-phase testing** dengan Postman
2. **Response comparison** (Express vs NestJS)
3. **Load testing** sebelum migration frontend
4. **Monitoring** 1 minggu sebelum deprecate Express

### Rollback Plan
- Keep Express running 2 minggu
- If critical issue, revert frontend baseURL
- Data tetap safe (shared database)

---

## ✨ TARGET ARCHITECTURAL GOALS

✅ **Modular**: Each feature in separate module
✅ **Type-Safe**: TypeScript strict mode
✅ **Observable**: Correlation ID + structured logging
✅ **Secure**: Multi-tenant isolation + role-based + subscription checks
✅ **Performant**: No N+1 + pagination + caching
✅ **Maintainable**: Clear DDD structure
✅ **Scalable**: Ready for 100+ tenants

---

## 📝 CURRENT STATUS

```
Phase 1-7:  ✅ COMPLETED (14 hours work done)
Phase 8-17: ⏳ TODO (41.5 hours remaining)

Overall Progress: 14/55.5 hours = ~25%
```

---

## 🎯 NEXT IMMEDIATE ACTIONS

1. ✅ Fix TypeScript errors (done)
2. ⏳ Test Phase 1-7 endpoints dengan Postman
3. ⏳ Start Phase 8 (Customers module)
4. ⏳ Continue systematically per PHASE guide

---

**Last Updated**: February 17, 2026
**Author**: NestJS Migration Team
**Status**: In Progress - Phase 8 Ready to Start
