#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function must(command, label) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`${label} failed\n${output}`);
  }
}

try {
  must("npm run lint", "Lint");
  must("npm run type-check", "Type check");
  must("npm run build", "Build");
  must("npm run check:logic", "Logic checks");
  must("npm run audit:page:api", "Page/API mapping report");
  must("npm run audit:auth:matrix", "Auth/API risk matrix");
  must("npm run audit:page:logic", "Page logic map");
  must("npm run audit:page:business", "Page business flow detail");
  must('node "scripts/start-local-db.js"', "Local DB startup");
  must('node "scripts/seed-role-readiness.js"', "Role readiness seed");
  must("npm run audit:runtime:critical", "Runtime critical endpoint audit");
  must("npm run audit:runtime:routes", "Runtime route checklist");
  must("npm run audit:phase23", "Phase 2-3 audit");
  must('node "scripts/seed-role-readiness.js"', "Role readiness reseed before Playwright");
  must("npm run test:playwright:critical", "Playwright critical role suite");
  must("npm run test:playwright:domain", "Playwright domain walkthrough suite");
  must("npm run audit:uat:package", "UAT handoff artifact package");
  must("npm run audit:status", "Audit health summary");
  must("npm run audit:gate", "Audit gate");
  must('node "scripts/release-readiness.js" --skip-strict', "Release readiness");
  must("npm run audit:uat:package", "UAT handoff refresh after release");
  console.log("Local full audit completed.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
