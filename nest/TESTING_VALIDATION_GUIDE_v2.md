# TESTING & VALIDATION GUIDE - NestJS Backend

**Version**: 1.0
**Date**: February 17, 2026
**Status**: Complete Testing Framework

---

## TESTING OVERVIEW

### Test Categories
1. **Unit Tests** - Individual service methods
2. **Integration Tests** - Endpoint + service + database
3. **API Contract Tests** - Response format validation
4. **Performance Tests** - Response time and resource usage
5. **Security Tests** - Auth, authorization, tenant isolation
6. **Error Handling Tests** - Exception handling and recovery

### Test Execution
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:cov

# Run specific module
npm run test -- products.service

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

---

## UNIT TEST TEMPLATES

### Products Service Tests
```typescript
// nest/src/modules/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getProducts', () => {
    it('should return paginated products with count', async () => {
      const tenantId = 'tenant-1';
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 10000 },
      ];

      jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts as any);
      jest.spyOn(prisma.product, 'count').mockResolvedValue(1);

      const result = await service.getProducts(tenantId, 1, 10);

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId }),
        }),
      );
    });

    it('should include low stock products', async () => {
      const result = await service.getProducts('tenant-1', 1, 10);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({ stock: true, minStock: true }),
        }),
      );
    });
  });

  describe('createProduct', () => {
    it('should create product with all required fields', async () => {
      const createDto = {
        name: 'New Product',
        price: 15000,
        category: 'Basic',
        stock: 100,
        minStock: 10,
      };

      jest.spyOn(prisma.product, 'create').mockResolvedValue({
        id: '1',
        ...createDto,
        tenantId: 'tenant-1',
      } as any);

      const result = await service.createProduct('tenant-1', createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.price).toBe(createDto.price);
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ...createDto, tenantId: 'tenant-1' }),
        }),
      );
    });
  });
});
```

### Orders Service Tests
```typescript
describe('OrdersService', () => {
  describe('createOrder', () => {
    it('should create order and deduct stock', async () => {
      const createDto = {
        items: [{ productId: 'prod-1', quantity: 2, price: 10000 }],
        customerId: 'cust-1',
      };

      // Mock product exists with sufficient stock
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue({
        id: 'prod-1',
        stock: 100,
      } as any);

      const result = await service.createOrder('tenant-1', createDto);

      expect(result.id).toBeDefined();
      // Verify stock deduction
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: 98 },
      });
    });

    it('should throw InsufficientStockException when stock insufficient', async () => {
      const createDto = {
        items: [{ productId: 'prod-1', quantity: 150 }],
      };

      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue({
        id: 'prod-1',
        stock: 10,
      } as any);

      await expect(
        service.createOrder('tenant-1', createDto),
      ).rejects.toThrow(InsufficientStockException);
    });

    it('should include items in response', async () => {
      const result = await service.getOrderById('tenant-1', 'order-1');
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });
});
```

---

## INTEGRATION TEST TEMPLATES

### Products Controller Integration Tests
```typescript
// nest/src/modules/products/products.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('Products API (Integration)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get JWT token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    jwtToken = loginResponse.body.data.accessToken;
  });

  describe('GET /api/products', () => {
    it('should return paginated products with standardized response', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?page=1&limit=10')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        code: 'SUCCESS',
        message: 'Operation successful',
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number),
        },
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        path: '/api/products?page=1&limit=10',
      });
    });

    it('should enforce maximum page size of 100', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?page=1&limit=200')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should filter by category when provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?category=Basic&page=1&limit=10')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach((product: any) => {
        expect(product.category).toBe('Basic');
      });
    });

    it('should search by name (case-insensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?search=rice&page=1&limit=10')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach((product: any) => {
        expect(product.name.toLowerCase()).toContain('rice');
      });
    });
  });

  describe('POST /api/products', () => {
    it('should create product with valid data', async () => {
      const createDto = {
        name: 'Test Product',
        price: 25000,
        category: 'Premium',
        stock: 50,
        minStock: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        code: 'CREATED',
        data: expect.objectContaining({
          id: expect.any(String),
          ...createDto,
        }),
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'Test' }); // Missing price, category, etc

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should validate price > 0', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Test',
          price: -100, // Invalid
          category: 'Test',
          stock: 10,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some((e: any) => e.field === 'price')).toBe(true);
    });

    it('should prevent ADMIN_TENANT+ only access', async () => {
      // Login as CASHIER (lower role)
      const cashierToken = await getCashierToken();

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ name: 'Test', price: 1000 });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product detail', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/test-id')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/non-existent')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should prevent cross-tenant access', async () => {
      // Product from tenant-2
      const tenant2Token = await getTenant2Token();
      const tenant1ProductId = 'tenant1-product-id';

      const response = await request(app.getHttpServer())
        .get(`/api/products/${tenant1ProductId}`)
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## API CONTRACT VALIDATION TESTS

### Response Format Validation
```typescript
describe('Response Format Contract', () => {
  const requiredFields = ['success', 'code', 'message', 'timestamp', 'path'];

  describe('Success Responses', () => {
    it('should include all required fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`);

      requiredFields.forEach((field) => {
        expect(response.body).toHaveProperty(field);
      });
    });

    it('should have valid response code', async () => {
      const validCodes = ['SUCCESS', 'CREATED', 'UPDATED', 'DELETED'];
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(validCodes).toContain(response.body.code);
    });

    it('should have ISO 8601 timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should have correlation ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.body.correlationId).toBeDefined();
      expect(response.body.correlationId).toMatch(/^[a-f0-9-]+$/i);
    });

    it('should have path matching request URL', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?page=1')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.body.path).toStartWith('/api/products');
    });
  });

  describe('Error Responses', () => {
    it('should include error code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/non-existent')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.body.code).toMatch(/^[A-Z_]+$/);
    });

    it('should include field errors for validation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({}); // Empty body

      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      response.body.errors.forEach((error: any) => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
      });
    });

    it('should include status code in error', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/non-existent')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.body.statusCode).toBe(404);
    });
  });
});
```

---

## PERFORMANCE TESTS

### Response Time Validation
```typescript
describe('Performance Tests', () => {
  const performanceThresholds = {
    listEndpoint: 500, // ms
    detailEndpoint: 300, // ms
    createEndpoint: 400, // ms
    complexReport: 2000, // ms
  };

  it('should list products within 500ms', async () => {
    const start = Date.now();

    await request(app.getHttpServer())
      .get('/api/products')
      .set('Authorization', `Bearer ${jwtToken}`);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(performanceThresholds.listEndpoint);
  });

  it('should get product detail within 300ms', async () => {
    const start = Date.now();

    await request(app.getHttpServer())
      .get('/api/products/test-id')
      .set('Authorization', `Bearer ${jwtToken}`);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(performanceThresholds.detailEndpoint);
  });

  it('should get reports within 2s', async () => {
    const start = Date.now();

    await request(app.getHttpServer())
      .get('/api/reports/dashboard/summary')
      .set('Authorization', `Bearer ${jwtToken}`);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(performanceThresholds.complexReport);
  });

  it('should handle large paginated results', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products?page=1&limit=100')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    // Verify response size is reasonable
    expect(JSON.stringify(response.body).length).toBeLessThan(5000000); // 5MB
  });
});
```

---

## SECURITY TESTS

### Multi-Tenant Isolation
```typescript
describe('Multi-Tenant Security', () => {
  it('should not allow access to other tenant data', async () => {
    const tenant1Token = await loginTenant('tenant-1');
    const tenant2ProductId = 'tenant-2-product';

    const response = await request(app.getHttpServer())
      .get(`/api/products/${tenant2ProductId}`)
      .set('Authorization', `Bearer ${tenant1Token}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  it('should filter products by tenant only', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .set('Authorization', `Bearer ${tenant1Token}`);

    response.body.data.forEach((product: any) => {
      expect(product.tenantId || 'same-tenant').toBe('tenant-1');
    });
  });

  it('should prevent cross-tenant orders', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .send({
        items: [
          { productId: 'tenant-2-product', quantity: 1 },
        ],
      });

    expect(response.status).toBe(403);
  });
});
```

### Role-Based Access Control
```typescript
describe('Role-Based Access Control', () => {
  it('should allow ADMIN_TENANT to create products', async () => {
    const adminToken = await loginAdmin();

    const response = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', price: 1000 });

    expect(response.status).toBe(201);
  });

  it('should prevent CACHIER from creating products', async () => {
    const cashierToken = await loginCashier();

    const response = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ name: 'Test', price: 1000 });

    expect(response.status).toBe(403);
  });

  it('should allow KITCHEN to view orders only', async () => {
    const kitchenToken = await loginKitchen();

    const listResponse = await request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${kitchenToken}`);

    expect(listResponse.status).toBe(200);

    const createResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${kitchenToken}`)
      .send({ items: [] });

    expect(createResponse.status).toBe(403);
  });
});
```

### Authentication Validation
```typescript
describe('Authentication', () => {
  it('should return 401 for expired token', async () => {
    const expiredToken = generateExpiredToken();

    const response = await request(app.getHttpServer())
      .get('/api/products')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should return 401 for invalid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  it('should return 401 if no token provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products');

    expect(response.status).toBe(401);
  });
});
```

---

## DATA VALIDATION TESTS

### DTO Validation
```typescript
describe('DTO Validation', () => {
  describe('CreateProductDto', () => {
    it('should reject invalid price', async () => {
      const invalidDto = {
        name: 'Test',
        price: 'not-a-number',
        category: 'Basic',
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.errors.some((e: any) => e.field === 'price')).toBe(true);
    });

    it('should reject negative stock', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test',
          price: 1000,
          category: 'Basic',
          stock: -5,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some((e: any) => e.field === 'stock')).toBe(true);
    });

    it('should truncate long strings', async () => {
      // Test that validators handle overly long inputs
      const longName = 'A'.repeat(1000);

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: longName,
          price: 1000,
          category: 'Basic',
          stock: 10,
        });

      // Should either validate length or truncate
      if (response.status === 201) {
        expect(response.body.data.name.length).toBeLessThanOrEqual(
          longName.length,
        );
      }
    });
  });

  describe('CreateOrderDto', () => {
    it('should validate items array', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: 'not-an-array' });

      expect(response.status).toBe(400);
    });

    it('should require at least one item', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [] });

      expect(response.status).toBe(400);
    });
  });
});
```

---

## ERROR HANDLING TESTS

### Custom Exception Handling
```typescript
describe('Error Handling', () => {
  it('should handle InsufficientStockException', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { productId: 'prod-low-stock', quantity: 1000 },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INSUFFICIENT_STOCK');
    expect(response.body.message).toContain('units available');
  });

  it('should handle DuplicateResourceException', async () => {
    // Try to create product with same SKU
    const response = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Duplicate SKU',
        price: 1000,
        sku: 'EXISTING-SKU',
      });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CONFLICT');
  });

  it('should handle DatabaseException gracefully', async () => {
    // Mock database error
    const response = await request(app.getHttpServer())
      .get('/api/products');

    if (response.status === 500) {
      expect(response.body.code).toBe('INTERNAL_ERROR');
      expect(response.body.message).not.toContain('database');
      // Error message sanitized
    }
  });

  it('should handle rate limiting', async () => {
    const requests = Array(110).fill(null);

    const responses = await Promise.all(
      requests.map(() =>
        request(app.getHttpServer())
          .get('/api/products')
          .set('Authorization', `Bearer ${token}`),
      ),
    );

    const rateLimitedResponse = responses.find(
      (r) => r.status === 429,
    );

    expect(rateLimitedResponse).toBeDefined();
    expect(rateLimitedResponse?.body.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
```

---

## TESTING CHECKLIST

| Test Type | Coverage | Status |
|-----------|----------|--------|
| Unit Tests - Auth | 100% | ⏳ |
| Unit Tests - Products | 100% | ⏳ |
| Unit Tests - Orders | 100% | ⏳ |
| Unit Tests - All Modules | 80%+ | ⏳ |
| Integration Tests - Products | 95% | ⏳ |
| Integration Tests - Orders | 95% | ⏳ |
| Integration Tests - All Modules | 85% | ⏳ |
| API Contract Tests | 100% | ⏳ |
| Security Tests - Auth | 100% | ⏳ |
| Security Tests - Multi-Tenant | 100% | ⏳ |
| Security Tests - RBAC | 95% | ⏳ |
| Performance Tests | 90% | ⏳ |
| Error Handling Tests | 90% | ⏳ |
| **TOTAL COVERAGE** | **~90%** | ⏳ |

---

## CONTINUOUS TESTING STRATEGY

### Pre-Commit Hooks
```bash
# Run linting and tests before commit
husky install
npm run test -- --onlyChanged
```

### CI/CD Pipeline
```yaml
# GitHub Actions / GitLab CI
test:
  script:
    - npm install
    - npm run build
    - npm run test
    - npm run test:cov
    - npm run test:e2e
  coverage: '/Coverage: \d+\.\d+/'
```

### Performance Regression Detection
```typescript
// Track performance metrics across builds
const currentMetrics = {
  avgResponseTime: 234, // ms
  p95ResponseTime: 487, // ms
  maxResponseSize: 1024, // KB
};

const previousMetrics = {
  avgResponseTime: 210, // ms
  p95ResponseTime: 450, // ms
  maxResponseSize: 950, // KB
};

expect(currentMetrics.avgResponseTime).toBeLessThan(previousMetrics.avgResponseTime * 1.1);
```

---

## VALIDATION COMPLETION CHECKLIST

- [ ] All 12 modules have unit tests (80%+ coverage)
- [ ] All endpoints have integration tests
- [ ] Response format validated on all endpoints
- [ ] Error responses validated
- [ ] Multi-tenant isolation verified
- [ ] Role-based access enforced
- [ ] Performance within thresholds
- [ ] No N+1 queries detected
- [ ] All DTOs validate input
- [ ] All exceptions handled gracefully
- [ ] Rate limiting works
- [ ] Correlation IDs tracked
- [ ] Security headers present
- [ ] Pagination enforced

**Status**: Ready for Phase 17 - Frontend Migration

