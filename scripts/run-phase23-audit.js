#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { runCommand } = require("./utils/run-command");

const ROOT = path.resolve(__dirname, "..");

for (const envPath of [".env", ".env.local", "nest/.env"]) {
  const fullPath = path.join(ROOT, envPath);
  if (fs.existsSync(fullPath)) {
    try {
      require("dotenv").config({ path: fullPath });
    } catch {
      // no-op
    }
  }
}

function run(command, description) {
  const result = runCommand(command, {
    cwd: ROOT,
    env: process.env,
  });

  return {
    command,
    description,
    status: result.status === 0 ? "PASS" : "FAIL",
    code: result.status,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

function runBuildWithRetry() {
  const initial = run("npm run build", "Build frontend and backend");
  if (initial.status === "PASS") {
    return initial;
  }

  const output = initial.output || "";
  const isPrismaLockError =
    /query_engine-windows\.dll\.node/i.test(output) &&
    /(EPERM|EBUSY|operation not permitted|permission denied|unlink)/i.test(output);

  if (!isPrismaLockError) {
    return initial;
  }

  const stopResult = run(
    "node scripts/stop-uat-environment.js --keep-db",
    "Stop UAT environment for build retry",
  );
  const retry = run("npm run build", "Build frontend and backend");

  if (retry.status === "PASS") {
    retry.output = [output, "", stopResult.output, "", "Build retry succeeded after stopping UAT environment."].filter(Boolean).join("\n");
    return retry;
  }

  retry.output = [output, "", stopResult.output, "", retry.output].filter(Boolean).join("\n");
  return retry;
}

function toRow(item) {
  return `| ${item.description} | \`${item.command}\` | ${item.status} | ${item.code ?? "-"} |`;
}

const results = [];
results.push(run("npm run check:full-auto", "Static full audit checks"));
results.push(run("npm run type-check", "Type checks"));
results.push(run("npm run test -- --run", "Vitest baseline suite"));
results.push(runBuildWithRetry());
results.push(
  run(
    "npm run audit:runtime:critical",
    "Runtime critical endpoint permission audit",
  ),
);
results.push(
  run(
    "npm run audit:runtime:routes",
    "Runtime critical route checklist generation",
  ),
);
results.push(
  run(
    "node scripts/generate-runtime-role-matrix.js",
    "Runtime route/API role matrix generation",
  ),
);

const runtimeChecks = [
  { command: "npm run test:connection", description: "DB connectivity" },
  { command: "npm run list:users", description: "Role account inventory" },
  { command: "npm run test:all-logins", description: "Role login readiness" },
];

const hasDbUrl = !!process.env.DATABASE_URL;
if (hasDbUrl) {
  for (const item of runtimeChecks) results.push(run(item.command, item.description));
} else {
  for (const item of runtimeChecks) {
    results.push({
      ...item,
      status: "BLOCKED",
      code: null,
      output: "DATABASE_URL is not set in environment",
    });
  }
}

const hardFail = results.some((r) => r.status === "FAIL");
const blocked = results.some((r) => r.status === "BLOCKED");

const lines = [];
lines.push("# PHASE 2-3 EXECUTION RESULT");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("## Command Matrix");
lines.push("");
lines.push("| Check | Command | Status | Exit Code |");
lines.push("|---|---|---|---:|");
for (const r of results) lines.push(toRow(r));
lines.push("");
lines.push("## Verdict");
lines.push("");
if (hardFail) {
  lines.push("- Overall: FAIL");
} else if (blocked) {
  lines.push("- Overall: CONDITIONAL PASS (runtime env blocked)");
} else {
  lines.push("- Overall: PASS");
}
lines.push(`- DATABASE_URL present: ${hasDbUrl ? "yes" : "no"}`);
lines.push("");
lines.push("## Failed/Blocked Details");
lines.push("");
const problemRows = results.filter((r) => r.status !== "PASS");
if (problemRows.length === 0) {
  lines.push("- None");
} else {
  for (const r of problemRows) {
    lines.push(`- ${r.description}: ${r.status}`);
    lines.push("```text");
    lines.push((r.output || "(no output)").slice(0, 6000));
    lines.push("```");
  }
}

const outPath = path.join(ROOT, "PHASE23_EXECUTION.md");
fs.writeFileSync(outPath, lines.join("\n"));
console.log(`Report written: ${outPath}`);

if (hardFail) process.exit(1);
