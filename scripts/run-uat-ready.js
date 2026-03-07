#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function must(command, label) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: process.env,
  });

  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`${label} failed\n${output}`);
  }
}

try {
  must("npm run audit:release", "Release readiness");
  console.log("UAT readiness completed.");
  console.log("Review these files before manual bug hunting:");
  console.log("- AUDIT_UAT_HANDOFF.md");
  console.log("- AUDIT_BUG_REPORT.md");
  console.log("- AUDIT_PLAYWRIGHT_CRITICAL.md");
  console.log("- AUDIT_HEALTH_STATUS.md");
  console.log("- RELEASE_READINESS.md");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
