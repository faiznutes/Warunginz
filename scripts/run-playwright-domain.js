#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CLIENT = path.join(ROOT, "client");
const OUTPUT_JSON = path.join(ROOT, "AUDIT_PLAYWRIGHT_DOMAIN.json");
const OUTPUT_MD = path.join(ROOT, "AUDIT_PLAYWRIGHT_DOMAIN.md");
const COMMAND =
  "npx playwright test tests/playwright/domain-walkthrough.spec.ts --workers=1 --reporter=json";

function extractJsonPayload(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function normalizeStatus(status) {
  if (!status) return "unknown";
  const normalized = String(status).toLowerCase();
  if (normalized === "expected") return "passed";
  if (normalized === "unexpected") return "failed";
  return normalized;
}

function lastResult(testEntry) {
  if (!Array.isArray(testEntry?.results) || testEntry.results.length === 0) {
    return null;
  }
  return testEntry.results[testEntry.results.length - 1];
}

function collectTests(raw, rolePattern) {
  const tests = [];

  function visitSuite(suite, parentTitles = []) {
    const suiteTitles = suite?.title ? [...parentTitles, suite.title] : parentTitles;

    for (const spec of suite?.specs || []) {
      const specTitles = spec?.title ? [...suiteTitles, spec.title] : [...suiteTitles];
      for (const testEntry of spec?.tests || []) {
        const result = lastResult(testEntry);
        const errorMessages = [];
        for (const run of testEntry?.results || []) {
          const message =
            run?.error?.message ||
            (Array.isArray(run?.errors) && run.errors[0]?.message) ||
            null;
          if (message) errorMessages.push(String(message).trim());
        }

        const title = specTitles.filter(Boolean).join(" > ");
        const roleMatch = title.match(rolePattern);
        tests.push({
          title,
          projectName: testEntry?.projectName || null,
          status: normalizeStatus(result?.status || (spec?.ok ? "passed" : "failed")),
          durationMs: typeof result?.duration === "number" ? result.duration : 0,
          role: roleMatch ? roleMatch[1] : null,
          errors: errorMessages,
        });
      }
    }

    for (const child of suite?.suites || []) {
      visitSuite(child, suiteTitles);
    }
  }

  for (const suite of raw?.suites || []) {
    visitSuite(suite, []);
  }

  return tests;
}

function summarizeTests(tests) {
  const summary = {
    total: tests.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    other: 0,
  };

  for (const test of tests) {
    if (test.status === "passed") summary.passed += 1;
    else if (test.status === "failed" || test.status === "timedout") summary.failed += 1;
    else if (test.status === "skipped") summary.skipped += 1;
    else if (test.status === "flaky") summary.flaky += 1;
    else summary.other += 1;
  }

  return summary;
}

function writeMarkdown(report) {
  const lines = [];
  lines.push("# AUDIT PLAYWRIGHT DOMAIN");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Command");
  lines.push("");
  lines.push(`- Command: \`${report.command}\``);
  lines.push(`- Working directory: \`client/\``);
  lines.push(`- Exit code: ${report.exitCode}`);
  lines.push(`- Overall: ${report.ok ? "PASS" : "FAIL"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total tests: ${report.summary.total}`);
  lines.push(`- Passed: ${report.summary.passed}`);
  lines.push(`- Failed: ${report.summary.failed}`);
  lines.push(`- Skipped: ${report.summary.skipped}`);
  lines.push(`- Flaky: ${report.summary.flaky}`);
  lines.push("");

  const roleRows = report.tests.filter((test) => test.role);
  if (roleRows.length > 0) {
    lines.push("## Per-Role Result");
    lines.push("");
    lines.push("| Role | Status | Test |");
    lines.push("|---|---|---|");
    for (const row of roleRows) {
      lines.push(`| ${row.role} | ${row.status.toUpperCase()} | ${row.title} |`);
    }
    lines.push("");
  }

  const failed = report.tests.filter((test) => test.status !== "passed");
  lines.push("## Failures");
  lines.push("");
  if (failed.length === 0) {
    lines.push("- None");
  } else {
    for (const test of failed) {
      lines.push(`### ${test.title}`);
      lines.push(`- Status: ${test.status}`);
      if (test.errors.length > 0) {
        lines.push("```text");
        lines.push(test.errors.join("\n\n").slice(0, 8000));
        lines.push("```");
      }
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

const execution = spawnSync(COMMAND, {
  cwd: CLIENT,
  shell: true,
  encoding: "utf8",
  env: process.env,
  maxBuffer: 1024 * 1024 * 50,
});

const rawJsonText = extractJsonPayload(execution.stdout || "");
let rawReport = null;

if (rawJsonText) {
  try {
    rawReport = JSON.parse(rawJsonText);
  } catch {
    rawReport = null;
  }
}

const tests = collectTests(
  rawReport || { suites: [] },
  /\bfor (SUPER_ADMIN|ADMIN_TENANT|SUPERVISOR|CASHIER|KITCHEN)\b/,
);
const summary = summarizeTests(tests);

const normalizedReport = {
  generatedAt: new Date().toISOString(),
  command: COMMAND,
  exitCode: execution.status ?? 1,
  ok: execution.status === 0,
  summary,
  stats: rawReport?.stats || null,
  tests,
  stderr: (execution.stderr || "").trim(),
  stdoutParseOk: Boolean(rawReport),
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(normalizedReport, null, 2));
writeMarkdown(normalizedReport);

console.log(`Playwright domain report written: ${path.relative(ROOT, OUTPUT_MD)}`);
console.log(
  `Playwright domain summary: total=${summary.total}, passed=${summary.passed}, failed=${summary.failed}, skipped=${summary.skipped}`,
);

if (!rawReport) {
  console.error("Failed to parse Playwright JSON output.");
  const preview = `${execution.stdout || ""}${execution.stderr || ""}`.slice(0, 8000);
  if (preview) console.error(preview);
  process.exit(execution.status ?? 1);
}

if (execution.status !== 0) {
  process.exit(execution.status ?? 1);
}
