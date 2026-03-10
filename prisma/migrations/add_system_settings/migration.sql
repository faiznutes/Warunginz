-- CreateTable SystemSettings
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appName" TEXT NOT NULL DEFAULT 'Warungin',
    "version" TEXT NOT NULL DEFAULT '1.3.0',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT false,
    "maxTenants" INTEGER NOT NULL DEFAULT 1000,
    "maxUsersPerTenant" INTEGER NOT NULL DEFAULT 50,
    "multiOutletEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "accountingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customSettings" JSONB,
    "lastModifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
