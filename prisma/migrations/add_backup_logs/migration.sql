-- CreateTable
CREATE TABLE IF NOT EXISTS "backup_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSentAt" TIMESTAMP(3),
    "size" INTEGER,
    "filePath" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "backup_logs_tenantId_idx" ON "backup_logs"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "backup_logs_tenantId_status_idx" ON "backup_logs"("tenantId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "backup_logs_tenantId_generatedAt_idx" ON "backup_logs"("tenantId", "generatedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "backup_logs_status_idx" ON "backup_logs"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "backup_logs_generatedAt_idx" ON "backup_logs"("generatedAt");

-- AddForeignKey
ALTER TABLE "backup_logs" ADD CONSTRAINT "backup_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
