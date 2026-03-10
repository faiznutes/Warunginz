-- Create discounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS "discounts" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "discountType" TEXT NOT NULL,
  "discountValue" DECIMAL(10,2) NOT NULL,
  "discountValueType" TEXT NOT NULL,
  "minAmount" DECIMAL(10,2),
  "minQuantity" INTEGER,
  "applicableProducts" JSONB,
  "bundleProducts" JSONB,
  "bundleDiscountProduct" TEXT,
  "applicableTo" TEXT NOT NULL DEFAULT 'ALL',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "discounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "discounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "discounts_tenantId_idx" ON "discounts"("tenantId");
CREATE INDEX IF NOT EXISTS "discounts_tenantId_isActive_idx" ON "discounts"("tenantId", "isActive");
