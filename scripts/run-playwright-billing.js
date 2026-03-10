#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { runCommand } = require('./utils/run-command');

const ROOT = path.resolve(__dirname, '..');
const CLIENT = path.join(ROOT, 'client');
const OUTPUT_JSON = path.join(ROOT, 'AUDIT_PLAYWRIGHT_BILLING.json');
const OUTPUT_MD = path.join(ROOT, 'AUDIT_PLAYWRIGHT_BILLING.md');
const COMMAND = [
  'npx',
  'playwright',
  'test',
  'tests/playwright/billing-lifecycle.spec.ts',
  '--workers=1',
  '--reporter=json',
];

function extractJsonPayload(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function normalizeStatus(status) {
  if (!status) return 'unknown';
  const normalized = String(status).toLowerCase();
  if (normalized === 'expected') return 'passed';
  if (normalized === 'unexpected') return 'failed';
  return normalized;
}

function lastResult(testEntry) {
  if (!Array.isArray(testEntry?.results) || testEntry.results.length === 0) {
    return null;
  }
  return testEntry.results[testEntry.results.length - 1];
}

function collectTests(raw) {
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

        tests.push({
          title: specTitles.filter(Boolean).join(' > '),
          projectName: testEntry?.projectName || null,
          status: normalizeStatus(result?.status || (spec?.ok ? 'passed' : 'failed')),
          durationMs: typeof result?.duration === 'number' ? result.duration : 0,
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
    if (test.status === 'passed') summary.passed += 1;
    else if (test.status === 'failed' || test.status === 'timedout') summary.failed += 1;
    else if (test.status === 'skipped') summary.skipped += 1;
    else if (test.status === 'flaky') summary.flaky += 1;
    else summary.other += 1;
  }

  return summary;
}

function writeMarkdown(report) {
  const lines = [];
  lines.push('# AUDIT PLAYWRIGHT BILLING');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Command');
  lines.push('');
  lines.push(`- Command: \`${report.command}\``);
  lines.push('- Working directory: `client/`');
  lines.push(`- Exit code: ${report.exitCode}`);
  lines.push(`- Overall: ${report.ok ? 'PASS' : 'FAIL'}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total tests: ${report.summary.total}`);
  lines.push(`- Passed: ${report.summary.passed}`);
  lines.push(`- Failed: ${report.summary.failed}`);
  lines.push(`- Skipped: ${report.summary.skipped}`);
  lines.push(`- Flaky: ${report.summary.flaky}`);
  lines.push('');
  lines.push('## Tests');
  lines.push('');
  for (const test of report.tests) {
    lines.push(`- ${test.status.toUpperCase()} | ${test.title}`);
  }
  lines.push('');
  lines.push('## Failures');
  lines.push('');
  const failed = report.tests.filter((test) => test.status !== 'passed');
  if (failed.length === 0) {
    lines.push('- None');
  } else {
    for (const test of failed) {
      lines.push(`### ${test.title}`);
      lines.push(`- Status: ${test.status}`);
      if (test.errors.length > 0) {
        lines.push('```text');
        lines.push(test.errors.join('\n\n').slice(0, 8000));
        lines.push('```');
      }
    }
  }

  if (report.stderr) {
    lines.push('');
    lines.push('## stderr');
    lines.push('');
    lines.push('```text');
    lines.push(report.stderr.slice(0, 8000));
    lines.push('```');
  }

  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`);
}

const env = {
  ...process.env,
  PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173',
  PLAYWRIGHT_API_BASE_URL: process.env.PLAYWRIGHT_API_BASE_URL || 'http://127.0.0.1:3000/api',
  PLAYWRIGHT_SKIP_WEBSERVER: process.env.PLAYWRIGHT_SKIP_WEBSERVER || '0',
};

const execution = runCommand(COMMAND, {
  cwd: CLIENT,
  env,
  maxBuffer: 1024 * 1024 * 50,
});

const rawJsonText = extractJsonPayload(execution.stdout || '');
let rawReport = null;
if (rawJsonText) {
  try {
    rawReport = JSON.parse(rawJsonText);
  } catch {
    rawReport = null;
  }
}

const tests = collectTests(rawReport || { suites: [] });
const summary = summarizeTests(tests);
const normalizedReport = {
  generatedAt: new Date().toISOString(),
  command: COMMAND.join(' '),
  exitCode: execution.status ?? 1,
  ok: execution.status === 0,
  summary,
  stats: rawReport?.stats || null,
  tests,
  stderr: (execution.stderr || '').trim(),
  stdoutParseOk: Boolean(rawReport),
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(normalizedReport, null, 2));
writeMarkdown(normalizedReport);

console.log(`Playwright billing report written: ${path.relative(ROOT, OUTPUT_MD)}`);
console.log(
  `Playwright billing summary: total=${summary.total}, passed=${summary.passed}, failed=${summary.failed}, skipped=${summary.skipped}`,
);

const failedTests = tests.filter((test) => test.status !== 'passed');
if (failedTests.length > 0) {
  const firstFailure = failedTests[0];
  const detail = (firstFailure.errors || []).join('\n\n').slice(0, 2000);
  if (detail) {
    console.error(detail);
  }
}

if (!rawReport) {
  console.error('Failed to parse Playwright JSON output.');
  const preview = `${execution.stdout || ''}${execution.stderr || ''}`.slice(0, 8000);
  if (preview) console.error(preview);
  process.exit(execution.status ?? 1);
}

if (execution.status !== 0) {
  process.exit(execution.status ?? 1);
}
