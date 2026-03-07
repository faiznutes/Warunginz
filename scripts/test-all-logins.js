#!/usr/bin/env node

const path = require("path");
for (const envFile of [".env", ".env.local", "nest/.env"]) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", envFile) });
}

const { PrismaClient } = require("../nest/src/generated/client");

const REQUIRED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN_TENANT",
  "SUPERVISOR",
  "CASHIER",
  "KITCHEN",
];

async function getUsers(prisma) {
  try {
    return await prisma.$queryRawUnsafe(
      'SELECT email, role, "isActive" FROM "User" WHERE "isActive" = true',
    );
  } catch {
    return prisma.user.findMany({
      where: { isActive: true },
      select: { email: true, role: true, isActive: true },
    });
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await getUsers(prisma);
    const roleMap = new Map();

    for (const role of REQUIRED_ROLES) roleMap.set(role, []);
    for (const user of users) {
      if (roleMap.has(user.role)) {
        roleMap.get(user.role).push(user.email || "(no-email)");
      }
    }

    let missing = 0;
    console.log("Role login readiness:");
    for (const role of REQUIRED_ROLES) {
      const emails = roleMap.get(role);
      if (!emails || emails.length === 0) {
        console.log(`- ${role}: MISSING`);
        missing += 1;
      } else {
        console.log(`- ${role}: OK (${emails.length} users)`);
      }
    }

    if (missing > 0) {
      console.error(`Login readiness failed: ${missing} role(s) missing active users.`);
      process.exitCode = 1;
      return;
    }

    console.log("Login readiness passed for all required roles.");
  } catch (error) {
    console.error("Login readiness check failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
