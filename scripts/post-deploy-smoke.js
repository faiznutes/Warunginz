#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

for (const envFile of [".env", ".env.local", "nest/.env"]) {
  try {
    require("dotenv").config({ path: path.resolve(__dirname, "..", envFile) });
  } catch {
    // ignore
  }
}

const BASE_URL = (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const SMOKE_EMAIL =
  process.env.SMOKE_LOGIN_EMAIL || "superadmin.audit@example.com";
const SMOKE_PASSWORD =
  process.env.SMOKE_LOGIN_PASSWORD || "Password123!";

const skipHttp = process.argv.includes("--skip-http");

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
  });
}

async function requestJson(url, options = {}, timeoutMs = 15000) {
  const response = await Promise.race([
    fetch(url, options),
    timeoutPromise(timeoutMs),
  ]);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, ok: response.ok, body };
}

async function run() {
  const checks = [];
  const frontendBaseUrl =
    FRONTEND_URL ||
    (BASE_URL.endsWith("/api") ? BASE_URL.replace(/\/api$/, "") : "");

  if (!skipHttp) {
    if (frontendBaseUrl) {
      checks.push({
        name: "Frontend landing page",
        run: () => requestJson(frontendBaseUrl),
        validate: (r) => r.status >= 200 && r.status < 400,
        required: true,
      });

      checks.push({
        name: "Public health proxy",
        run: () => requestJson(`${frontendBaseUrl}/health`),
        validate: (r) => r.ok,
        required: true,
      });

      checks.push({
        name: "Seeded super admin login",
        run: () =>
          requestJson(`${frontendBaseUrl}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: SMOKE_EMAIL,
              password: SMOKE_PASSWORD,
            }),
          }),
        validate: (r) => r.status >= 200 && r.status < 300,
        required: true,
      });
    }

    if (BASE_URL && !BASE_URL.endsWith("/api")) {
      checks.push({
        name: "Backend direct health",
        run: () => requestJson(`${BASE_URL}/health`),
        validate: (r) => r.ok,
        required: false,
      });
    }

    checks.push({
      name: "CORS preflight health",
      run: () =>
        requestJson(
          `${frontendBaseUrl || BASE_URL}/health`,
          {
            method: "OPTIONS",
            headers: {
              Origin: frontendBaseUrl || "http://localhost:5173",
              "Access-Control-Request-Method": "GET",
            },
          },
          10000,
        ),
      validate: (r) => r.status >= 200 && r.status < 500,
      required: false,
    });

    if (INTERNAL_API_KEY) {
      checks.push({
        name: "Internal health (with api key)",
        run: () =>
          requestJson(`${BASE_URL}/internal/health`, {
            headers: {
              "x-internal-api-key": INTERNAL_API_KEY,
            },
          }),
        validate: (r) => r.ok,
        required: false,
      });
    }
  }

  const results = [];
  for (const check of checks) {
    try {
      const response = await check.run();
      const pass = check.validate(response);
      results.push({ ...check, pass, response });
    } catch (error) {
      results.push({ ...check, pass: false, error: error.message });
    }
  }

  const requiredFailures = results.filter((r) => r.required && !r.pass);
  let browserSmoke = null;

  console.log("Post-deploy smoke result:");
  for (const r of results) {
    const status = r.pass ? "PASS" : "FAIL";
    const detail = r.error
      ? r.error
      : `status=${r.response?.status}${r.response?.body ? ` body=${JSON.stringify(r.response.body).slice(0, 120)}` : ""}`;
    console.log(`- [${status}] ${r.name} (${r.required ? "required" : "optional"}) -> ${detail}`);
  }

  if (results.length === 0) {
    console.log("- No HTTP checks executed (--skip-http mode)");
  }

  if (frontendBaseUrl) {
    const smokeEnv = {
      ...process.env,
      PLAYWRIGHT_SKIP_WEBSERVER: "1",
      PLAYWRIGHT_BASE_URL: frontendBaseUrl,
      PLAYWRIGHT_API_BASE_URL: `${frontendBaseUrl}/api`,
    };
    const execution = spawnSync('node "scripts/run-playwright-domain.js"', {
      cwd: path.resolve(__dirname, ".."),
      shell: true,
      encoding: "utf8",
      env: smokeEnv,
      maxBuffer: 1024 * 1024 * 50,
    });
    browserSmoke = {
      ok: execution.status === 0,
      output: `${execution.stdout || ""}${execution.stderr || ""}`.trim(),
    };

    console.log(
      `- [${browserSmoke.ok ? "PASS" : "FAIL"}] Playwright domain walkthrough (required) -> baseURL=${frontendBaseUrl}`,
    );
    if (!browserSmoke.ok && browserSmoke.output) {
      console.log(browserSmoke.output.slice(0, 4000));
    }
  } else {
    console.log("- [SKIP] Playwright domain walkthrough -> FRONTEND_URL tidak tersedia");
  }

  if (requiredFailures.length > 0 || (browserSmoke && !browserSmoke.ok)) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
