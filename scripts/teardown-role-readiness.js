#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local") });

const { PrismaClient } = require("../nest/src/generated/client");

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "audit-tenant" } });
  if (!tenant) {
    console.log("No audit tenant found. Nothing to teardown.");
    return;
  }

  await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenant.delete({ where: { id: tenant.id } });

  console.log("Role readiness teardown completed.");
}

main()
  .catch((error) => {
    console.error("Failed to teardown role readiness:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
