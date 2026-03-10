#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const https = require("https");
const { runCommand } = require("./utils/run-command");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_JSON = path.join(ROOT, "AUDIT_LIVE_UAT.json");
const OUTPUT_MD = path.join(ROOT, "AUDIT_LIVE_UAT.md");

function getOptionValue(name, fallback = null) {
  const args = process.argv.slice(2);
  const prefix = `${name}=`;
  const direct = args.find((arg) => arg.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);

  const index = args.findIndex((arg) => arg === name);
  if (index !== -1 && args[index + 1]) return args[index + 1];

  return fallback;
}

const includeRoutes = process.argv.includes("--with-routes");
const routesOnly = process.argv.includes("--routes-only");
const baseUrl = (
  getOptionValue("--url") ||
  process.env.PUBLIC_BASE_URL ||
  process.env.FRONTEND_URL ||
  ""
).replace(/\/$/, "");
const apiBaseUrl = (
  getOptionValue("--api-url") ||
  process.env.BACKEND_URL ||
  (baseUrl ? `${baseUrl}/api` : "")
).replace(/\/$/, "");

const ROLE_EMAILS = {
  SUPER_ADMIN: process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL || "superadmin.audit@example.com",
  ADMIN_TENANT: process.env.PLAYWRIGHT_ADMIN_TENANT_EMAIL || "admin.audit@example.com",
  SUPERVISOR: process.env.PLAYWRIGHT_SUPERVISOR_EMAIL || "supervisor.audit@example.com",
  CASHIER: process.env.PLAYWRIGHT_CASHIER_EMAIL || "cashier.audit@example.com",
  KITCHEN: process.env.PLAYWRIGHT_KITCHEN_EMAIL || "kitchen.audit@example.com",
};
const ROLE_PASSWORD = process.env.PLAYWRIGHT_ROLE_PASSWORD || "Password123!";
const AUTH_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const AUTH_CACHE_HOST_KEY = (() => {
  try {
    return new URL(baseUrl).host.replace(/[^a-z0-9.-]/gi, "_");
  } catch {
    return "default";
  }
})();
const TEMP_AUTH_CACHE = path.join(
  os.tmpdir(),
  `warungin-live-uat-auth-${AUTH_CACHE_HOST_KEY}.json`,
);

if (!baseUrl) {
  console.error("Missing live base URL. Use --url=https://... or set PUBLIC_BASE_URL.");
  process.exit(1);
}

const sharedEnv = {
  ...process.env,
  PUBLIC_BASE_URL: baseUrl,
  FRONTEND_URL: baseUrl,
  BACKEND_URL: apiBaseUrl,
  PLAYWRIGHT_SKIP_WEBSERVER: "1",
  PLAYWRIGHT_BASE_URL: baseUrl,
  PLAYWRIGHT_API_BASE_URL: apiBaseUrl,
  PLAYWRIGHT_AUTH_CACHE_PATH: TEMP_AUTH_CACHE,
};

function requestJson(method, targetUrl, data) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const payload = data == null ? null : JSON.stringify(data);
    const options = {
      method,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: `${parsed.pathname}${parsed.search}`,
      headers: {
        Accept: "application/json",
        ...(payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : {}),
      },
    };

    const transport = parsed.protocol === "https:" ? https : http;
    const req = transport.request(options, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        let json = null;
        try {
          json = body ? JSON.parse(body) : null;
        } catch {
          json = null;
        }
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body,
          json,
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error(`Request timeout for ${targetUrl}`));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function seedSharedAuthCache() {
  if (fs.existsSync(TEMP_AUTH_CACHE)) {
    try {
      const stats = fs.statSync(TEMP_AUTH_CACHE);
      const ageMs = Date.now() - stats.mtimeMs;
      const cached = JSON.parse(fs.readFileSync(TEMP_AUTH_CACHE, "utf8"));
      const hasAllRoles = Object.keys(ROLE_EMAILS).every((role) => cached && cached[role]);
      if (ageMs < AUTH_CACHE_TTL_MS && hasAllRoles) {
        console.log(`- [PASS] Reusing shared auth cache from ${TEMP_AUTH_CACHE}`);
        return;
      }
    } catch {}
  }

  const roleEntries = Object.entries(ROLE_EMAILS);
  const payloads = {};

  for (const [role, email] of roleEntries) {
    let response = null;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      response = await requestJson("POST", `${apiBaseUrl}/auth/login`, {
        email,
        password: ROLE_PASSWORD,
      });

      const retryable =
        response.statusCode === 429 && attempt < 4;
      if (!retryable) {
        break;
      }

      const waitMs = 10000 * attempt;
      console.log(
        `- [RETRY] Seeding shared auth cache for ${role} hit auth rate limit. Waiting ${waitMs / 1000}s before retry ${attempt + 1}/4...`,
      );
      sleep(waitMs);
    }

    if (response.statusCode < 200 || response.statusCode >= 300 || !response.json) {
      const preview = String(response.body || "").slice(0, 500);
      throw new Error(
        `Failed to seed shared auth cache for ${role}. status=${response.statusCode} body=${preview}`,
      );
    }

    payloads[role] = response.json;
  }

  fs.writeFileSync(TEMP_AUTH_CACHE, JSON.stringify(payloads, null, 2));
  console.log(`- [PASS] Shared auth cache refreshed at ${TEMP_AUTH_CACHE}`);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isRetryableAuthThrottle(output) {
  const normalized = String(output || "").toLowerCase();
  return (
    normalized.includes("status=429") ||
    normalized.includes("too many login attempts") ||
    normalized.includes("rate limit")
  );
}

const checks = [
  {
    name: "HTTP shell smoke",
    command: 'node "scripts/post-deploy-smoke.js" --skip-playwright',
    required: true,
    retries: 0,
  },
];

if (routesOnly) {
  checks.push({
    name: "Playwright all-routes suite",
    command: 'node "scripts/run-playwright-all-routes.js"',
    required: true,
    retries: 1,
  });
} else {
  checks.push(
    {
      name: "Playwright billing lifecycle",
      command: 'node "scripts/run-playwright-billing.js"',
      required: true,
      retries: 2,
    },
    {
      name: "Playwright domain walkthrough",
      command: 'node "scripts/run-playwright-domain.js"',
      required: true,
      retries: 1,
    },
    {
      name: "Playwright critical role suite",
      command: 'node "scripts/run-playwright-critical.js"',
      required: true,
      retries: 1,
    },
  );
}

if (includeRoutes && !routesOnly) {
  checks.push({
    name: "Playwright all-routes suite",
    command: 'node "scripts/run-playwright-all-routes.js"',
    required: false,
    retries: 1,
  });
}

function summarize(results) {
  return {
    total: results.length,
    passed: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    requiredFailed: results.filter((result) => result.required && !result.ok).length,
  };
}

function writeMarkdown(report) {
  const lines = [];
  lines.push("# AUDIT LIVE UAT");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`- Base URL: ${report.baseUrl}`);
  lines.push(`- API Base URL: ${report.apiBaseUrl}`);
  lines.push(`- Overall: ${report.ok ? "PASS" : "FAIL"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total checks: ${report.summary.total}`);
  lines.push(`- Passed: ${report.summary.passed}`);
  lines.push(`- Failed: ${report.summary.failed}`);
  lines.push(`- Required failed: ${report.summary.requiredFailed}`);
  lines.push("");
  lines.push("## Checks");
  lines.push("");
  lines.push("| Check | Required | Status |");
  lines.push("|---|---|---|");
  for (const result of report.results) {
    lines.push(`| ${result.name} | ${result.required ? "yes" : "no"} | ${result.ok ? "PASS" : "FAIL"} |`);
  }

  const failed = report.results.filter((result) => !result.ok);
  lines.push("");
  lines.push("## Failures");
  lines.push("");
  if (failed.length === 0) {
    lines.push("- None");
  } else {
    for (const result of failed) {
      lines.push(`### ${result.name}`);
      lines.push(`- Required: ${result.required ? "yes" : "no"}`);
      lines.push("```text");
      lines.push((result.output || "").slice(0, 8000));
      lines.push("```");
    }
  }

  fs.writeFileSync(OUTPUT_MD, `${lines.join("\n")}\n`);
}

async function main() {
  const results = [];
  await seedSharedAuthCache();

  for (const check of checks) {
    let attempt = 0;
    let execution = null;
    let output = "";
    let ok = false;
    const maxAttempts = (check.retries || 0) + 1;

    for (attempt = 1; attempt <= maxAttempts; attempt += 1) {
      execution = runCommand(check.command, {
        cwd: ROOT,
        env: sharedEnv,
        maxBuffer: 1024 * 1024 * 100,
      });

      output = `${execution.stdout || ""}${execution.stderr || ""}`.trim();
      ok = execution.status === 0;
      if (ok) {
        break;
      }

      const retryable = attempt < maxAttempts && isRetryableAuthThrottle(output);
      if (!retryable) {
        break;
      }

      const waitMs = 15000 * attempt;
      console.log(`- [RETRY] ${check.name} throttled by auth rate limit. Waiting ${waitMs / 1000}s before retry ${attempt + 1}/${maxAttempts}...`);
      sleep(waitMs);
    }

    results.push({
      ...check,
      ok,
      attempts: attempt,
      exitCode: execution?.status ?? 1,
      output,
    });

    console.log(`- [${ok ? "PASS" : "FAIL"}] ${check.name}${attempt > 1 ? ` (attempt ${attempt}/${maxAttempts})` : ""}`);
    if (!ok && output) {
      console.log(output.slice(0, 4000));
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    apiBaseUrl,
    ok: results.every((result) => !result.required || result.ok),
    summary: summarize(results),
    results,
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(report, null, 2));
  writeMarkdown(report);
  console.log(`Live UAT report written: ${path.relative(ROOT, OUTPUT_MD)}`);

  if (!report.ok) {
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(String(error?.message || error));
    process.exit(1);
  });
