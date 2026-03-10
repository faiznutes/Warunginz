#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PID_FILE = path.join(ROOT, ".local", "uat-processes.json");
const KEEP_DB = process.argv.includes("--keep-db");

function killPid(pid) {
  if (!pid || typeof pid !== "number") return;

  if (process.platform === "win32") {
    spawnSync(`taskkill /PID ${pid} /T /F`, {
      cwd: ROOT,
      shell: true,
      encoding: "utf8",
    });
    return;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // ignore
    }
  }
}

function main() {
  if (fs.existsSync(PID_FILE)) {
    try {
      const payload = JSON.parse(fs.readFileSync(PID_FILE, "utf8"));
      killPid(payload.backendPid);
      killPid(payload.frontendPid);
    } catch {
      // ignore malformed pid file
    }
    fs.unlinkSync(PID_FILE);
  }

  if (!KEEP_DB) {
    spawnSync("npm run localdb:stop", {
      cwd: ROOT,
      shell: true,
      encoding: "utf8",
      stdio: "inherit",
    });
  }

  console.log(`Warungin UAT environment stopped${KEEP_DB ? " (database kept running)" : ""}.`);
}

main();
