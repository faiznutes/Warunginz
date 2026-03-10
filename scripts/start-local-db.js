#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { runCommand } = require("./utils/run-command");

const ROOT = path.resolve(__dirname, "..");
const PGDATA = path.join(ROOT, ".local", "pgdata");
const PGLOG = path.join(ROOT, ".local", "postgres.log");
const DB_PORT = "5433";
const DB_NAME = "warungin";
const DATABASE_URL = `postgresql://postgres@localhost:${DB_PORT}/${DB_NAME}?schema=public`;

function run(command, options = {}) {
  const result = runCommand(command, {
    cwd: ROOT,
    env: options.env || process.env,
  });
  return result;
}

function must(command, label, options = {}) {
  const result = run(command, options);
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`${label} failed\n${output}`);
  }
}

function writeEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  const required = {
    NODE_ENV: "development",
    PORT: "3000",
    DATABASE_URL,
    JWT_SECRET: "local-dev-jwt-secret-please-change-1234567890",
    JWT_REFRESH_SECRET: "local-dev-jwt-refresh-secret-please-change-1234567890",
    JWT_EXPIRES_IN: "7d",
    FRONTEND_URL: "http://localhost:5173",
    BACKEND_URL: "http://localhost:3000",
    CORS_ORIGIN: "http://localhost:5173",
  };

  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  }

  const map = new Map();
  for (const line of lines) {
    const idx = line.indexOf("=");
    if (idx > 0) map.set(line.slice(0, idx), line);
  }
  for (const [k, v] of Object.entries(required)) {
    map.set(k, `${k}=${v}`);
  }
  const out = Array.from(map.values()).join("\n");
  fs.writeFileSync(envPath, `${out}\n`);
}

function isRunning() {
  const result = run(`pg_isready -h localhost -p ${DB_PORT}`);
  return result.status === 0;
}

function main() {
  fs.mkdirSync(path.join(ROOT, ".local"), { recursive: true });

  if (!fs.existsSync(PGDATA)) {
    must(`initdb -D "${PGDATA}" -A trust -U postgres`, "Postgres initdb");
  }

  if (!isRunning()) {
    must(
      `pg_ctl -D "${PGDATA}" -l "${PGLOG}" -o "-p ${DB_PORT}" start`,
      "Postgres start",
    );
  }

  const exists = run(
    `psql -h localhost -p ${DB_PORT} -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'"`,
  );
  const existsOutput = `${exists.stdout || ""}${exists.stderr || ""}`;
  if (!existsOutput.includes("1")) {
    const createDb = run(`createdb -h localhost -p ${DB_PORT} -U postgres ${DB_NAME}`);
    if (createDb.status !== 0) {
      const createDbOutput = `${createDb.stdout || ""}${createDb.stderr || ""}`.trim();
      if (!createDbOutput.includes("already exists")) {
        throw new Error(`Create database failed\n${createDbOutput}`);
      }
    }
  }

  writeEnvLocal();

  must("npx prisma db push", "Prisma db push", {
    env: { ...process.env, DATABASE_URL },
  });

  console.log("Local DB is ready.");
  console.log(`DATABASE_URL=${DATABASE_URL}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
