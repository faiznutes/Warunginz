#!/usr/bin/env node

const path = require("path");
const { runCommand } = require("./utils/run-command");

const ROOT = path.resolve(__dirname, "..");
const PGDATA = path.join(ROOT, ".local", "pgdata");

function run(command) {
  return runCommand(command, {
    cwd: ROOT,
  });
}

if (!require("fs").existsSync(PGDATA)) {
  console.log("Local DB data directory not found, nothing to stop.");
  process.exit(0);
}

const result = run(`pg_ctl -D "${PGDATA}" -m fast stop`);
if (result.status !== 0) {
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  if (output.includes("no server running")) {
    console.log("Local DB is already stopped.");
    process.exit(0);
  }
  console.error(output.trim());
  process.exit(1);
}

console.log("Local DB stopped.");
