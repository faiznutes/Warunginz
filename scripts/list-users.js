#!/usr/bin/env node

const path = require("path");
for (const envFile of [".env", ".env.local", "nest/.env"]) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", envFile) });
}

const { PrismaClient } = require("../nest/src/generated/client");

async function fetchUsers(prisma) {
  try {
    return await prisma.$queryRawUnsafe(
      'SELECT id, email, role, "tenantId", "isActive" FROM "users" ORDER BY "createdAt" DESC LIMIT 200',
    );
  } catch {
    return prisma.user.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await fetchUsers(prisma);
    console.log(`Users found: ${users.length}`);
    for (const user of users.slice(0, 50)) {
      console.log(
        `${user.role || "UNKNOWN"}\t${user.email || "-"}\tactive=${user.isActive !== false}\ttenant=${user.tenantId || "-"}`,
      );
    }

    const roleCounts = users.reduce((acc, user) => {
      const key = user.role || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    console.log("Role distribution:", roleCounts);
  } catch (error) {
    console.error("Failed to list users:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
