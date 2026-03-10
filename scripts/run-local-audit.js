#!/usr/bin/env node

const path = require("path");
const { runCommand } = require("./utils/run-command");

const ROOT = path.resolve(__dirname, "..");

function runStep(command, label) {
  console.log(`==> ${label}`);
  return runCommand(command, {
    cwd: ROOT,
    env: process.env,
    maxBuffer: 1024 * 1024 * 100,
  });
}

function must(command, label) {
  const result = runStep(command, label);
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`${label} failed\n${output}`);
  }
}

function buildWithRetry() {
  const initial = runStep("npm run build", "Build");
  if (initial.status === 0) {
    return;
  }

  const output = `${initial.stdout || ""}${initial.stderr || ""}`.trim();
  const isPrismaLockError =
    /query_engine-windows\.dll\.node/i.test(output) &&
    /(EPERM|EBUSY|operation not permitted|permission denied|unlink)/i.test(output);

  if (!isPrismaLockError) {
    throw new Error(`Build failed\n${output}`);
  }

  console.log("Build hit Prisma lock. Stopping local UAT environment and retrying once...");
  must(
    ["node", "scripts/stop-uat-environment.js", "--keep-db"],
    "Stop existing UAT environment for build retry",
  );
  must("npm run build", "Build retry after stopping UAT environment");
}

try {
  must("npm run lint", "Lint");
  must("npm run type-check", "Type check");
  buildWithRetry();
  must("npm run check:logic", "Logic checks");
  must("npm run audit:page:api", "Page/API mapping report");
  must("npm run audit:auth:matrix", "Auth/API risk matrix");
  must("npm run audit:page:logic", "Page logic map");
  must("npm run audit:page:business", "Page business flow detail");
  must("npm run uat:start", "Local UAT startup");
  must("npm run audit:runtime:critical", "Runtime critical endpoint audit");
  must("npm run audit:runtime:routes", "Runtime route checklist");
  must("npm run audit:business:rules", "Business rules audit");
  must("npm run audit:phase23", "Phase 2-3 audit");
  must(["node", "scripts/seed-role-readiness.js"], "Role readiness reseed before Playwright");
  must("npm run test:playwright:critical", "Playwright critical role suite");
  must("npm run test:playwright:domain", "Playwright domain walkthrough suite");
  must("npm run test:playwright:billing", "Playwright billing lifecycle suite");
  must("npm run test:playwright:routes", "Playwright all-routes suite");
  must("npm run audit:uat:package", "UAT handoff artifact package");
  must("npm run audit:status", "Audit health summary");
  must("npm run audit:gate", "Audit gate");
  must(["node", "scripts/release-readiness.js", "--skip-strict"], "Release readiness");
  must("npm run audit:uat:package", "UAT handoff refresh after release");
  console.log("Local full audit completed.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
