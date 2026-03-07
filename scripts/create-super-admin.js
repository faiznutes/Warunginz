const { PrismaClient } = require("../nest/src/generated/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createSuperAdmin() {
  console.log("Creating super admin user...");

  const password = process.env.SUPERADMIN_PASSWORD || "SuperAdmin123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  let tenant = await prisma.tenant.findFirst({
    where: { slug: "warungin-hq" },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Warungin HQ",
        slug: "warungin-hq",
        email: "system@warungin.com",
        isActive: true,
        subscriptionPlan: "ENTERPRISE",
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("Created tenant:", tenant.id);
  } else {
    console.log("Tenant already exists:", tenant.id);
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@warungin.com" },
  });

  if (existingAdmin) {
    console.log("Admin already exists:", existingAdmin.email);

    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    console.log("Password updated to:", password);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      email: "admin@warungin.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      tenantId: tenant.id,
      isActive: true,
    },
  });

  console.log("Super admin created:", admin.email);
  console.log("Password:", password);
  console.log("User ID:", admin.id);
}

createSuperAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
