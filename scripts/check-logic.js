#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const reportPath = path.join(ROOT, "AUDIT_AUTH_ROUTE_API_MATRIX.md");

try {
  execSync('node "scripts/generate-auth-api-risk-report.js"', {
    cwd: ROOT,
    stdio: "inherit",
  });

  const content = fs.readFileSync(reportPath, "utf8");
  const p0 = Number((content.match(/- P0:\s*(\d+)/) || [])[1] || 0);
  const p1 = Number((content.match(/- P1:\s*(\d+)/) || [])[1] || 0);

  if (p0 > 0 || p1 > 0) {
    console.error(`Logic audit failed: P0=${p0}, P1=${p1}`);
    process.exit(1);
  }

  console.log(`Logic audit passed: P0=${p0}, P1=${p1}`);
} catch (error) {
  console.error("Logic audit execution failed:", error.message);
  process.exit(1);
}
