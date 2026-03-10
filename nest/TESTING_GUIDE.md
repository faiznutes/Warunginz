# NestJS API Testing Guide (Postman)

## Prerequisites

1. NestJS running on port 3001: `npm run dev:nest`
2. Database connected and seeded with test data
3. JWT tokens available (from login endpoint)

## Environment Variables (Postman)

Create a Postman environment with:
```
{{base_url}} = http://localhost:3001/api
{{tenant_id}} = <your-test-tenant-id>
{{user_id}} = <your-test-user-id>
{{jwt_token}} = <from-login-response>
{{cashier_token}} = <cashier-user-jwt>
{{outlet_id}} = <test-outlet-id>
```

---

## Phase 1: Authentication ✅

### 1. Login (Get JWT Token)
```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Response**: Store `access_token` as `{{jwt_token}}`

### 2. Get Current User
```
GET {{base_url}}/auth/me
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

---

## Phase 1: Products ✅

### 1. Get All Products (Paginated)
```
GET {{base_url}}/products?page=1&limit=10
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

**Expected**: `{ data: [...], pagination: { ... } }`

### 2. Get Product By ID
```
GET {{base_url}}/products/<product-id>
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

### 3. Get Low Stock Products
```
GET {{base_url}}/products/low-stock/all
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

---

## Phase 2: Orders ✅

### 1. Create Order
```
POST {{base_url}}/orders
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "outletId": "{{outlet_id}}",
  "items": [
    {
      "productId": "<product-id>",
      "quantity": 2,
      "price": 50000,
      "discount": 0
    }
  ],
  "temporaryCustomerName": "Test Customer",
  "discount": 0,
  "sendToKitchen": false,
  "notes": "Test order"
}
```

**Expected**: Order created with `id`, `orderNumber`, `status: PENDING`

### 2. Get All Orders
```
GET {{base_url}}/orders?page=1&limit=10&status=PENDING
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

**Query parameters**:
- `page`: int (default: 1)
- `limit`: int max 100 (default: 10)
- `status`: PENDING|PROCESSING|COMPLETED|CANCELLED|REFUNDED
- `sortBy`: createdAt|total|orderNumber (default: createdAt)
- `sortOrder`: asc|desc (default: desc)

**Expected**: Paginated list with `data` and `pagination`

### 3. Get Order By ID
```
GET {{base_url}}/orders/<order-id>
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

**Expected**: Full order with items, customer, outlet, etc.

### 4. Update Order Status
```
PUT {{base_url}}/orders/<order-id>/status
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

---

## Phase 3: Cash Shift ✅

### 1. Open Shift (Cashier Only)
```
POST {{base_url}}/cash-shift/open
Authorization: Bearer {{cashier_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "modalAwal": 500000,
  "catatan": "Shift dibuka pukul 08:00"
}
```

**Expected**: `{ success: true, message: "Shift opened successfully", data: { ... } }`

### 2. Get Current Shift
```
GET {{base_url}}/cash-shift/current
Authorization: Bearer {{cashier_token}}
X-Tenant-ID: {{tenant_id}}
```

**Expected**: Active shift or null

### 3. Get Shift History
```
GET {{base_url}}/cash-shift/history?page=1&limit=20&startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer {{cashier_token}}
X-Tenant-ID: {{tenant_id}}
```

### 4. Check Active Shift
```
GET {{base_url}}/cash-shift/check-active
Authorization: Bearer {{cashier_token}}
X-Tenant-ID: {{tenant_id}}
```

**Expected**: `{ hasActiveShift: true|false }`

### 5. Close Shift (Cashier Only)
```
POST {{base_url}}/cash-shift/close
Authorization: Bearer {{cashier_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "uangFisikTutup": 1500000,
  "catatan": "Shift ditutup normal"
}
```

**Expected**: `{ success: true, message: "Shift closed successfully", data: { ... } }`

**Note**: System auto-calculates:
- `totalSales` = sum of completed orders in shift
- `saldoSeharusnya` = modalAwal + totalSales
- `selisih` = uangFisikTutup - saldoSeharusnya

---

## Phase 4: Store Shift ✅

### 1. Open Store Shift
```
POST {{base_url}}/store-shift/open
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "outletId": "{{outlet_id}}",
  "shiftType": "pagi",
  "modalAwal": 1000000,
  "catatan": "Toko dibuka pagi"
}
```

**Expected**: `{ success: true, message: "Shift pagi opened successfully", data: { ... } }`

### 2. Get Current Store Shift
```
GET {{base_url}}/store-shift/current?outletId={{outlet_id}}
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

### 3. Get All Open Shifts
```
GET {{base_url}}/store-shift/open?outletId={{outlet_id}}
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

### 4. Get Store Shift History
```
GET {{base_url}}/store-shift/history?page=1&limit=20&outletId={{outlet_id}}
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

### 5. Close Store Shift
```
POST {{base_url}}/store-shift/close
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "shiftId": "<shift-id>",
  "outletId": "{{outlet_id}}"
}
```

**Expected**: `{ success: true, message: "Shift closed successfully", data: { ... } }`

---

## Error Handling

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Solutions**:
- Add `Authorization: Bearer <jwt_token>` header
- Check if JWT is expired
- Re-login with `/api/auth/login`

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**Solutions**:
- Check user role
- Verify tenant access
- Check subscription status

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

**Solutions**:
- Check request payload
- Validate all required fields
- Check field types and formats

---

## Performance Testing Notes

✅ **N+1 Query Optimizations**:
- Orders endpoint uses `select` to fetch only needed fields
- No separate queries for customers, products per order
- Parallel queries for counts

✅ **Rate Limiting**:
- Global: 100 requests/15 min
- Auth endpoints: 5 requests/15 min
- Monitor with `RateLimit-*` headers in response

✅ **Pagination**:
- Max limit: 100 items
- Default limit: 10 items
- Total count included in response

---

## Next Steps (Phase 5-8)

- Customers module (CRUD, filtering)
- Reports module (analytics, exports)
- Subscriptions module (plan management)
- Payment integration endpoints
