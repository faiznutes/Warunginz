-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "purchasedBy" TEXT NOT NULL DEFAULT 'SELF';

-- AlterTable
ALTER TABLE "tenant_addons" ADD COLUMN "purchasedBy" TEXT NOT NULL DEFAULT 'SELF';

