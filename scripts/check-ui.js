#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const reportPath = path.join(ROOT, "AUDIT_PAGE_API_REPORT.md");

try {
  execSync('node "scripts/generate-page-api-audit.js"', {
    cwd: ROOT,
    stdio: "inherit",
  });

  const content = fs.readFileSync(reportPath, "utf8");
  const unresolved = Number(
    (content.match(/API calls with unresolved backend base path:\s*(\d+)/) ||
      [])[1] || 0,
  );
  const duplicates = Number(
    (content.match(/Duplicate route entries found:\s*(\d+)/) || [])[1] || 0,
  );

  if (unresolved > 0 || duplicates > 0) {
    console.error(
      `UI audit failed: unresolved-api=${unresolved}, duplicate-routes=${duplicates}`,
    );
    process.exit(1);
  }

  console.log(
    `UI audit passed: unresolved-api=${unresolved}, duplicate-routes=${duplicates}`,
  );
} catch (error) {
  console.error("UI audit execution failed:", error.message);
  process.exit(1);
}
