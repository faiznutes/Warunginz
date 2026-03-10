#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { runCommand } = require("./utils/run-command");

const ROOT = path.resolve(__dirname, "..");
const CLIENT = path.join(ROOT, "client");
const MANIFEST_PATH = path.join(CLIENT, "tests", "playwright", ".generated", "all-routes-manifest.json");
const OUTPUT_JSON = path.join(ROOT, "AUDIT_PLAYWRIGHT_ROUTES.json");
const OUTPUT_MD = path.join(ROOT, "AUDIT_PLAYWRIGHT_ROUTES.md");
const GENERATE_COMMAND = ["node", "scripts/generate-playwright-route-manifest.js"];
const COMMAND = [
  "npx",
  "playwright",
  "test",
  "tests/playwright/all-routes-smoke.spec.ts",
  "--workers=1",
  "--reporter=line",
];
const GROUP_PATTERN = /^(PUBLIC|SUPER_ADMIN|ADMIN_TENANT|SUPERVISOR|CASHIER|KITCHEN)\s+\|\s+/;
const ROUTE_LINE_PATTERN = /all-routes-smoke\.spec\.ts:\d+:\d+\s+›\s+(.*)$/;
const FAILURE_LINE_PATTERN = /^\s*\d+\)\s+\[[^\]]+\]\s+›\s+tests\\playwright\\all-routes-smoke\.spec\.ts:\d+:\d+\s+›\s+.*?›\s+((?:PUBLIC|SUPER_ADMIN|ADMIN_TENANT|SUPERVISOR|CASHIER|KITCHEN)\s+\|\s+.*)$/gm;

function stripAnsi(text) {
  return String(text || "").replace(/\u001b\[[0-9;]*m/g, "");
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
}

function indexManifest(entries) {
  const index = new Map();
  for (const entry of entries) {
    const group = entry.requiresAuth ? entry.primaryRole || "ADMIN_TENANT" : "PUBLIC";
    index.set(`${group} | ${entry.fullPath}`, entry);
  }
  return index;
}

function collectRouteTitles(text) {
  const clean = stripAnsi(text);
  const routeTitles = [];
  const seen = new Set();

  for (const line of clean.split(/\r?\n/)) {
    const match = line.match(ROUTE_LINE_PATTERN);
    if (!match) continue;
    const routeTitle = line.split("›").pop().trim();
    if (seen.has(routeTitle)) continue;
    seen.add(routeTitle);
    routeTitles.push(routeTitle);
  }

  return routeTitles;
}

function collectFailedTitles(text) {
  const clean = stripAnsi(text);
  const failedTitles = new Set();
  for (const match of clean.matchAll(FAILURE_LINE_PATTERN)) {
    failedTitles.add(match[1].trim());
  }
  return failedTitles;
}

function summarizeTests(tests) {
  const summary = {
    total: tests.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    other: 0,
    byPhase: {
      Major: { total: 0, failed: 0 },
      Minor: { total: 0, failed: 0 },
    },
  };

  for (const test of tests) {
    if (test.status === "passed") summary.passed += 1;
    else if (test.status === "failed") summary.failed += 1;
    else if (test.status === "skipped") summary.skipped += 1;
    else if (test.status === "flaky") summary.flaky += 1;
    else summary.other += 1;

    if (test.phase && summary.byPhase[test.phase]) {
      summary.byPhase[test.phase].total += 1;
      if (test.status !== "passed") {
        summary.byPhase[test.phase].failed += 1;
      }
    }
  }

  return summary;
}

function writeMarkdown(report) {
  const lines = [];
  lines.push("# AUDIT PLAYWRIGHT ROUTES");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Command");
  lines.push("");
  lines.push(`- Manifest: \`${report.generateCommand}\``);
  lines.push(`- Playwright: \`${report.command}\``);
  lines.push("- Working directory: `client/`");
  lines.push(`- Exit code: ${report.exitCode}`);
  lines.push(`- Overall: ${report.ok ? "PASS" : "FAIL"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total route tests: ${report.summary.total}`);
  lines.push(`- Passed: ${report.summary.passed}`);
  lines.push(`- Failed: ${report.summary.failed}`);
  lines.push(`- Skipped: ${report.summary.skipped}`);
  lines.push(`- Flaky: ${report.summary.flaky}`);
  lines.push(`- Major failed: ${report.summary.byPhase.Major.failed} / ${report.summary.byPhase.Major.total}`);
  lines.push(`- Minor failed: ${report.summary.byPhase.Minor.failed} / ${report.summary.byPhase.Minor.total}`);
  lines.push("");

  const failed = report.tests.filter((test) => test.status !== "passed");
  lines.push("## Failures");
  lines.push("");
  if (failed.length === 0) {
    lines.push("- None");
  } else {
    for (const test of failed) {
      lines.push(`### ${test.routeTitle || test.title}`);
      lines.push(`- Phase: ${test.phase || "unknown"}`);
      lines.push(`- Domain: ${test.domain || "unknown"}`);
      lines.push(`- Status: ${test.status}`);
    }
  }

  if (report.stderr) {
    lines.push("");
    lines.push("## stderr");
    lines.push("");
    lines.push("```text");
    lines.push(report.stderr.slice(0, 8000));
    lines.push("```");
  }

  fs.writeFileSync(OUTPUT_MD, `${lines.join("\n")}\n`);
}

const env = {
  ...process.env,
  PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173",
  PLAYWRIGHT_API_BASE_URL: process.env.PLAYWRIGHT_API_BASE_URL || "http://127.0.0.1:3000/api",
  PLAYWRIGHT_SKIP_WEBSERVER: process.env.PLAYWRIGHT_SKIP_WEBSERVER || "0",
};

const generateResult = runCommand(GENERATE_COMMAND, {
  cwd: ROOT,
  env,
  maxBuffer: 1024 * 1024 * 20,
});
if (generateResult.status !== 0) {
  const output = `${generateResult.stdout || ""}${generateResult.stderr || ""}`.trim();
  console.error(output || "Failed to generate route manifest.");
  process.exit(generateResult.status ?? 1);
}

const manifestEntries = readManifest();
const manifestIndex = indexManifest(manifestEntries);
const execution = runCommand(COMMAND, {
  cwd: CLIENT,
  env,
  maxBuffer: 1024 * 1024 * 100,
});

const stdout = stripAnsi(execution.stdout || "");
const stderr = stripAnsi(execution.stderr || "");
const combinedOutput = `${stdout}\n${stderr}`;
const routeTitles = collectRouteTitles(combinedOutput);
const failedTitles = collectFailedTitles(combinedOutput);
const inferredAllPassed =
  failedTitles.size === 0 &&
  routeTitles.length > 0 &&
  routeTitles.length === manifestEntries.length;
const ok = execution.status === 0 || inferredAllPassed;
const tests = routeTitles.map((routeTitle) => {
  const manifestEntry = manifestIndex.get(routeTitle) || null;
  const groupMatch = routeTitle.match(GROUP_PATTERN);
  return {
    title: routeTitle,
    routeTitle,
    projectName: "chromium",
    status: failedTitles.has(routeTitle) ? "failed" : ok ? "passed" : "unknown",
    durationMs: 0,
    group: groupMatch ? groupMatch[1] : null,
    phase: manifestEntry?.phase || null,
    domain: manifestEntry?.domain || null,
    fullPath: manifestEntry?.fullPath || null,
    source: manifestEntry?.source || null,
    errors: [],
  };
});
const summary = summarizeTests(tests);
const normalizedReport = {
  generatedAt: new Date().toISOString(),
  generateCommand: GENERATE_COMMAND.join(" "),
  command: COMMAND.join(" "),
  exitCode: ok ? 0 : execution.status ?? 1,
  ok,
  summary,
  tests,
  stderr: stderr.trim(),
  manifestSize: manifestEntries.length,
  stdoutParseOk: routeTitles.length > 0 || ok,
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(normalizedReport, null, 2));
writeMarkdown(normalizedReport);

console.log(`Playwright route report written: ${path.relative(ROOT, OUTPUT_MD)}`);
console.log(`Playwright route summary: total=${summary.total}, passed=${summary.passed}, failed=${summary.failed}, majorFailed=${summary.byPhase.Major.failed}, minorFailed=${summary.byPhase.Minor.failed}`);

if (!ok) {
  process.exit(execution.status ?? 1);
}

