#!/usr/bin/env node

const path = require("path");
for (const envFile of [".env", ".env.local", "nest/.env"]) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", envFile) });
}

const { PrismaClient } = require("../nest/src/generated/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRawUnsafe("SELECT 1 as ok");
    console.log("Database connection: OK");
    console.log("Probe result:", Array.isArray(result) ? result[0] : result);
  } catch (error) {
    console.error("Database connection: FAILED");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
