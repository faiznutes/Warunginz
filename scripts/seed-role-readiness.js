#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local") });

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../nest/src/generated/client");

const prisma = new PrismaClient();

async function ensureProduct(tenantId, product) {
  const existing = await prisma.product.findFirst({
    where: { tenantId, sku: product.sku },
  });

  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: {
        ...product,
        isActive: true,
      },
    });
  }

  return prisma.product.create({
    data: {
      tenantId,
      ...product,
      isActive: true,
    },
  });
}

async function main() {
  await prisma.tenant.upsert({
    where: { slug: "audit-tenant" },
    update: {},
    create: {
      name: "Audit Tenant",
      slug: "audit-tenant",
      email: "tenant-audit@example.com",
      isActive: true,
    },
  });

  await prisma.tenant.upsert({
    where: { slug: "audit-tenant-secondary" },
    update: {},
    create: {
      name: "Audit Tenant Secondary",
      slug: "audit-tenant-secondary",
      email: "tenant-audit-secondary@example.com",
      isActive: true,
    },
  });

  const tenant = await prisma.tenant.findUnique({ where: { slug: "audit-tenant" } });
  const secondaryTenant = await prisma.tenant.findUnique({
    where: { slug: "audit-tenant-secondary" },
  });
  if (!tenant) {
    throw new Error("Failed to resolve audit tenant after upsert.");
  }
  if (!secondaryTenant) {
    throw new Error("Failed to resolve secondary audit tenant after upsert.");
  }

  async function ensureOutlet(tenantId, name, address, phone) {
    const existing = await prisma.outlet.findFirst({
      where: { tenantId, name },
    });

    if (existing) {
      return prisma.outlet.update({
        where: { id: existing.id },
        data: { isActive: true, address, phone },
      });
    }

    return prisma.outlet.create({
      data: {
        tenantId,
        name,
        address,
        phone,
        isActive: true,
      },
    });
  }

  const primaryOutlet = await ensureOutlet(
    tenant.id,
    "Audit Store Primary",
    "Jl. Audit No. 1",
    "081234560001",
  );
  const secondaryOutlet = await ensureOutlet(
    tenant.id,
    "Audit Store Secondary",
    "Jl. Audit No. 2",
    "081234560002",
  );
  await ensureOutlet(
    secondaryTenant.id,
    "Audit Secondary Tenant Store",
    "Jl. Secondary No. 1",
    "081234560010",
  );

  await Promise.all([
    ensureProduct(tenant.id, {
      name: "Audit Espresso",
      sku: "AUD-ESP-001",
      barcode: "AUDESP001",
      price: 18000,
      cost: 7000,
      stock: 120,
      minStock: 10,
      category: "Minuman",
    }),
    ensureProduct(tenant.id, {
      name: "Audit Croffle",
      sku: "AUD-CRF-001",
      barcode: "AUDCRF001",
      price: 22000,
      cost: 9000,
      stock: 60,
      minStock: 8,
      category: "Makanan",
    }),
    ensureProduct(tenant.id, {
      name: "Audit Nasi Goreng",
      sku: "AUD-NGR-001",
      barcode: "AUDNGR001",
      price: 28000,
      cost: 12000,
      stock: 75,
      minStock: 10,
      category: "Makanan",
    }),
    ensureProduct(tenant.id, {
      name: "Audit Lemon Tea",
      sku: "AUD-LMT-001",
      barcode: "AUDLMT001",
      price: 15000,
      cost: 5000,
      stock: 90,
      minStock: 12,
      category: "Minuman",
    }),
  ]);

  const hashedPassword = await bcrypt.hash("Password123!", 10);
  const users = [
    {
      email: "superadmin.audit@example.com",
      role: "SUPER_ADMIN",
      name: "Super Admin Audit",
      permissions: {},
    },
    {
      email: "admin.audit@example.com",
      role: "ADMIN_TENANT",
      name: "Admin Tenant Audit",
      permissions: {},
    },
    {
      email: "supervisor.audit@example.com",
      role: "SUPERVISOR",
      name: "Supervisor Audit",
      permissions: {
        allowedStoreIds: [primaryOutlet.id],
        canEditOrders: true,
        canDeleteOrders: true,
        canRefundOrders: true,
        canManageProducts: true,
        canManageCustomers: true,
        canViewReports: true,
      },
    },
    {
      email: "cashier.audit@example.com",
      role: "CASHIER",
      name: "Cashier Audit",
      permissions: {
        assignedStoreId: primaryOutlet.id,
        canEditOrders: true,
        canDeleteOrders: false,
        canRefundOrders: false,
        canManageProducts: true,
        canManageCustomers: true,
      },
    },
    {
      email: "kitchen.audit@example.com",
      role: "KITCHEN",
      name: "Kitchen Audit",
      permissions: {
        assignedStoreId: primaryOutlet.id,
      },
    },
  ];

  const upsertedUsers = new Map();
  for (const user of users) {
    const upserted = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: user.email } },
      update: {
        name: user.name,
        role: user.role,
        isActive: true,
        permissions: user.permissions,
      },
      create: {
        tenantId: tenant.id,
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        isActive: true,
        permissions: user.permissions,
      },
    });
    upsertedUsers.set(user.role, upserted);
  }

  const cashierUser = upsertedUsers.get("CASHIER");
  if (cashierUser?.id) {
    await prisma.cashShift.updateMany({
      where: {
        tenantId: tenant.id,
        kasirId: cashierUser.id,
        status: "open",
      },
      data: {
        status: "closed",
        shiftEnd: new Date(),
        catatan: "Closed by role readiness seed for deterministic audit state",
      },
    });
  }

  console.log("Role readiness seed completed.");
  console.log(`Tenant: ${tenant.id}`);
  console.log(`Primary outlet: ${primaryOutlet.id}`);
  console.log(`Secondary outlet: ${secondaryOutlet.id}`);
  console.log(`Secondary tenant: ${secondaryTenant.id}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed role readiness:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
