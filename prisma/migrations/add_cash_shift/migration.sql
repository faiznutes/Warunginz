-- CreateTable
CREATE TABLE "cash_shifts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kasirId" TEXT NOT NULL,
    "shiftStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shiftEnd" TIMESTAMP(3),
    "modalAwal" DECIMAL(10,2) NOT NULL,
    "uangFisikTutup" DECIMAL(10,2),
    "saldoSeharusnya" DECIMAL(10,2),
    "selisih" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'open',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_shifts_tenantId_idx" ON "cash_shifts"("tenantId");

-- CreateIndex
CREATE INDEX "cash_shifts_kasirId_idx" ON "cash_shifts"("kasirId");

-- CreateIndex
CREATE INDEX "cash_shifts_tenantId_kasirId_idx" ON "cash_shifts"("tenantId", "kasirId");

-- CreateIndex
CREATE INDEX "cash_shifts_tenantId_status_idx" ON "cash_shifts"("tenantId", "status");

-- CreateIndex
CREATE INDEX "cash_shifts_tenantId_shiftStart_idx" ON "cash_shifts"("tenantId", "shiftStart");

-- CreatePartialIndex: Satu kasir hanya boleh 1 shift open
CREATE UNIQUE INDEX "cash_shifts_tenantId_kasirId_status_open_idx" ON "cash_shifts"("tenantId", "kasirId") WHERE "status" = 'open';

-- AddForeignKey
ALTER TABLE "cash_shifts" ADD CONSTRAINT "cash_shifts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_shifts" ADD CONSTRAINT "cash_shifts_kasirId_fkey" FOREIGN KEY ("kasirId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
