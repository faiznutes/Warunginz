#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const {
  runCommand,
  tokenize,
  resolveExecutable,
  quoteForCmd,
} = require("./utils/run-command");

const ROOT = path.resolve(__dirname, "..");
const CLIENT = path.join(ROOT, "client");
const LOCAL_DIR = path.join(ROOT, ".local");
const PID_FILE = path.join(LOCAL_DIR, "uat-processes.json");
const BACKEND_LOG = path.join(LOCAL_DIR, "uat-backend.log");
const FRONTEND_LOG = path.join(LOCAL_DIR, "uat-frontend.log");
const BACKEND_URL = "http://127.0.0.1:3000/health";
const FRONTEND_URL = "http://127.0.0.1:4173";
const ACCOUNTS = [
  ["SUPER_ADMIN", "superadmin.audit@example.com", "Password123!"],
  ["ADMIN_TENANT", "admin.audit@example.com", "Password123!"],
  ["SUPERVISOR", "supervisor.audit@example.com", "Password123!"],
  ["CASHIER", "cashier.audit@example.com", "Password123!"],
  ["KITCHEN", "kitchen.audit@example.com", "Password123!"],
];

function run(command, label, cwd = ROOT) {
  const result = runCommand(command, {
    cwd,
    env: process.env,
    maxBuffer: 1024 * 1024 * 20,
  });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`${label} failed\n${output}`);
  }
}

function isPidRunning(pid) {
  if (!pid || typeof pid !== "number") return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function readPidFile() {
  if (!fs.existsSync(PID_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(PID_FILE, "utf8"));
  } catch {
    return null;
  }
}

function writePidFile(payload) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(PID_FILE, `${JSON.stringify(payload, null, 2)}\n`);
}

function startDetached(command, cwd) {
  const parts = Array.isArray(command) ? command.slice() : tokenize(command);
  if (parts.length === 0) {
    throw new Error("Cannot start an empty detached command.");
  }

  const [executable, ...args] = parts;
  const resolvedExecutable = resolveExecutable(executable);
  const isCmdExecutable =
    process.platform === "win32" && resolvedExecutable.toLowerCase().endsWith(".cmd");

  const child = isCmdExecutable
    ? spawn(
        process.env.ComSpec || "cmd.exe",
        [
          "/d",
          "/s",
          "/c",
          [resolvedExecutable, ...args].map(quoteForCmd).join(" "),
        ],
        {
          cwd,
          detached: true,
          stdio: "ignore",
          env: process.env,
          windowsHide: true,
        },
      )
    : spawn(resolvedExecutable, args, {
        cwd,
        detached: true,
        stdio: "ignore",
        env: process.env,
        windowsHide: true,
      });

  child.unref();
  return child.pid;
}

function printReadySummary() {
  console.log("Warungin UAT environment is ready.");
  console.log(`- Frontend: ${FRONTEND_URL}`);
  console.log(`- Backend health: ${BACKEND_URL}`);
  console.log("- Login accounts:");
  for (const [role, email, password] of ACCOUNTS) {
    console.log(`  - ${role}: ${email} / ${password}`);
  }
  console.log("- Guide:");
  console.log("  - AUDIT_UAT_HANDOFF.md");
  console.log("  - AUDIT_BUG_REPORT.md");
  console.log("  - UAT_START_HERE.md");
}

async function main() {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  const existing = readPidFile();
  const backendRunning =
    (existing?.backendPid && isPidRunning(existing.backendPid)) ||
    (await waitForUrl(BACKEND_URL, 2000));
  const frontendRunning =
    (existing?.frontendPid && isPidRunning(existing.frontendPid)) ||
    (await waitForUrl(FRONTEND_URL, 2000));

  if (backendRunning && frontendRunning) {
    printReadySummary();
    return;
  }

  run(["node", "scripts/start-local-db.js"], "Local DB startup");
  run(["node", "scripts/seed-role-readiness.js"], "Role readiness seed");

  const backendPid = backendRunning
    ? existing?.backendPid || null
    : startDetached(["node", "-r", "dotenv/config", "nest/dist/main.js", "dotenv_config_path=.env.local"], ROOT);
  const frontendPid = frontendRunning
    ? existing?.frontendPid || null
    : startDetached(["node", "scripts/serve-client-dist.js", "--port", "4173"], ROOT);

  const backendReady = await waitForUrl(BACKEND_URL, 120000);
  const frontendReady = await waitForUrl(FRONTEND_URL, 120000);

  writePidFile({
    generatedAt: new Date().toISOString(),
    backendPid,
    frontendPid,
    backendUrl: BACKEND_URL,
    frontendUrl: FRONTEND_URL,
    backendLog: path.relative(ROOT, BACKEND_LOG),
    frontendLog: path.relative(ROOT, FRONTEND_LOG),
  });

  if (!backendReady || !frontendReady) {
    throw new Error(
      `UAT servers did not become ready. backendReady=${backendReady}, frontendReady=${frontendReady}`,
    );
  }

  printReadySummary();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});


