#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

for (const envFile of [".env", ".env.local", "nest/.env"]) {
  try {
    require("dotenv").config({ path: path.resolve(ROOT, envFile) });
  } catch {
    // ignore dotenv load errors for missing files
  }
}

function run(command, label) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`${label} failed (exit ${result.status}).`);
    process.exit(result.status || 1);
  }
}

run("npm run type-check", "Type check");
run("npm run lint", "Backend lint");
run("npm run lint --prefix client", "Frontend lint");
run("npx prisma validate", "Prisma validate");
run("npm run prisma:generate", "Prisma generate");

console.log("check:all completed successfully.");
