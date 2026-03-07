#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CLI_ARGS = process.argv.slice(2);

function hasFlag(flag) {
  return CLI_ARGS.includes(flag);
}

function getOptionValue(name, fallback = null) {
  const prefix = `${name}=`;
  const direct = CLI_ARGS.find((arg) => arg.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);

  const index = CLI_ARGS.findIndex((arg) => arg === name);
  if (index !== -1 && CLI_ARGS[index + 1]) return CLI_ARGS[index + 1];

  return fallback;
}

const DEPLOY_MODE = getOptionValue("--mode", "host");
const SKIP_AUDIT = hasFlag("--skip-audit") || hasFlag("--fast");
const RESET_DB = hasFlag("--reset-db");

const CONFIG = {
  targetRepo: "https://github.com/faiznutes/Warunginz.git",
  targetRepoSlug: "faiznutes/Warunginz",
  targetBranch: "main",
  remoteName: "warunginz-target",
  coolifyBaseUrl: process.env.COOLIFY_BASE_URL || "https://server.faiznute.site/api/v1",
  coolifyProjectName: "Warunginz",
  coolifyEnvironmentName: "production",
  coolifyAppName: "warunginz",
  sshHost: process.env.WARUNGINZ_SSH_HOST || "192.168.1.105",
  sshUser: process.env.WARUNGINZ_SSH_USER || "root",
  tunnelContainerName: "warunginz-quicktunnel",
  tunnelTargetUrl: "http://127.0.0.1:18081",
  remoteDeployRoot: "/root/warunginz-test",
  remoteArchivePath: "/root/warunginz-test.tgz",
  remoteEnvPath: "/root/warunginz-test.env",
  coolifyServerUuid: "nssog0408os4c80484w44wwg",
  coolifyDestinationUuid: "e4wks8k0c0oc84gg0k48gc8o",
};

const COPY_INCLUDE = [
  ".gitignore",
  ".dockerignore",
  "package.json",
  "package-lock.json",
  "Dockerfile.backend",
  "docker-compose.coolify.yml",
  ".env.coolify.example",
  "README.md",
  "PAGE_BUSINESS_FLOW_DETAIL.md",
  "PAGE_LOGIC_MAP.md",
  "AUDIT_REPORT.md",
  "AUDIT_FINAL_SIGNOFF.md",
  "AUDIT_HEALTH_STATUS.md",
  "RELEASE_READINESS.md",
  "AUDIT_PLAYWRIGHT_CRITICAL.md",
  "AUDIT_PLAYWRIGHT_DOMAIN.md",
  "UAT_START_HERE.md",
  "AUDIT_UAT_HANDOFF.md",
  "AUDIT_BUG_REPORT.md",
  "client",
  "nest",
  "nginx",
  "prisma",
  "scripts",
  "tests",
  "vitest.config.ts",
];

const COPY_EXCLUDE = [
  "client/node_modules",
  "client/dist",
  "client/playwright-report",
  "client/test-results",
  "node_modules",
  ".git",
  ".local",
  "dist",
  "coolify_",
  "AUDIT_PLAYWRIGHT_CRITICAL.json",
  "AUDIT_RUNTIME_",
];

function ensureEnv() {
  const required = ["WARUNGINZ_SSH_PASSWORD"];
  if (DEPLOY_MODE === "coolify") {
    required.push("COOLIFY_TOKEN");
  }
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }
}

function run(command, label, options = {}) {
  const result = spawnSync(command, {
    cwd: options.cwd || ROOT,
    shell: true,
    encoding: "utf8",
    env: { ...process.env, ...(options.env || {}) },
    stdio: options.capture === false ? "inherit" : "pipe",
  });

  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`${label} failed\n${output}`);
  }

  return `${result.stdout || ""}${result.stderr || ""}`.trim();
}

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function createAskPassScript(secret, prefix) {
  const dir = tempDir(prefix);
  const scriptPath = path.join(dir, "askpass.cmd");
  fs.writeFileSync(scriptPath, `@echo off\r\necho ${secret}\r\n`);
  return { dir, scriptPath };
}

function sshCommand(remoteCommand) {
  const askpass = createAskPassScript(process.env.WARUNGINZ_SSH_PASSWORD, "warunginz-ssh-");
  const env = {
    SSH_ASKPASS: askpass.scriptPath,
    SSH_ASKPASS_REQUIRE: "force",
    DISPLAY: "1",
  };
  try {
    return run(
      `ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no ${CONFIG.sshUser}@${CONFIG.sshHost} "${remoteCommand}"`,
      "SSH command",
      { env },
    );
  } finally {
    fs.rmSync(askpass.dir, { recursive: true, force: true });
  }
}

function scpToRemote(localPath, remotePath) {
  const askpass = createAskPassScript(process.env.WARUNGINZ_SSH_PASSWORD, "warunginz-scp-");
  const env = {
    SSH_ASKPASS: askpass.scriptPath,
    SSH_ASKPASS_REQUIRE: "force",
    DISPLAY: "1",
  };
  try {
    return run(
      `scp -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no "${localPath}" ${CONFIG.sshUser}@${CONFIG.sshHost}:${remotePath}`,
      "SCP command",
      { env },
    );
  } finally {
    fs.rmSync(askpass.dir, { recursive: true, force: true });
  }
}

function gh(command, label) {
  const extraEnv = process.env.GH_TOKEN ? { GH_TOKEN: process.env.GH_TOKEN } : {};
  return run(command, label, { env: extraEnv });
}

function resolveGithubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  return gh("gh auth token", "Resolve GitHub token").trim();
}

function api(pathname, options = {}) {
  const url = `${CONFIG.coolifyBaseUrl}${pathname}`;
  const headers = {
    Authorization: `Bearer ${process.env.COOLIFY_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const result = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      "$ProgressPreference='SilentlyContinue';" +
        `Invoke-RestMethod -Method ${options.method || "Get"} -Uri '${url}' ` +
        `-Headers @{ Authorization='Bearer ${process.env.COOLIFY_TOKEN}'; Accept='application/json'; 'Content-Type'='application/json' } ` +
        `${options.body ? `-Body @'\n${JSON.stringify(options.body, null, 2)}\n'@ ` : ""}` +
        "| ConvertTo-Json -Depth 100",
    ],
    {
      cwd: ROOT,
      encoding: "utf8",
      env: process.env,
    },
  );

  if (result.status !== 0) {
    throw new Error(`Coolify API ${pathname} failed\n${(result.stderr || result.stdout || "").trim()}`);
  }

  const text = (result.stdout || "").trim();
  return text ? JSON.parse(text) : null;
}

function asArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function findProject(projects) {
  const target = CONFIG.coolifyProjectName.toLowerCase();
  const matches = projects.filter(
    (project) => String(project?.name || "").toLowerCase() === target,
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => (b?.id || 0) - (a?.id || 0))[0];
}

function ensureProject() {
  const projects = asArray(api("/projects"), ["projects"]);
  const existing = findProject(projects);
  if (existing) return existing;
  return api("/projects", {
    method: "Post",
    body: { name: CONFIG.coolifyProjectName, description: "Warunginz test deployment" },
  });
}

function ensureEnvironment(projectUuid) {
  try {
    return api(`/projects/${projectUuid}/${CONFIG.coolifyEnvironmentName}`);
  } catch {
    const created = api(`/projects/${projectUuid}/environments`, {
      method: "Post",
      body: { name: CONFIG.coolifyEnvironmentName },
    });
    return api(`/projects/${projectUuid}/${created.uuid}`);
  }
}

function listApplications() {
  return asArray(api("/applications"), ["applications"]);
}

function findApplication(apps) {
  const repoWithGit = CONFIG.targetRepoSlug.endsWith(".git")
    ? CONFIG.targetRepoSlug
    : `${CONFIG.targetRepoSlug}.git`;
  const repoVariants = new Set([
    CONFIG.targetRepoSlug.toLowerCase(),
    repoWithGit.toLowerCase(),
  ]);
  const targetName = CONFIG.coolifyAppName.toLowerCase();

  return (
    apps.find(
      (app) =>
        String(app?.name || "").toLowerCase() === targetName ||
        String(app?.resourceName || "").toLowerCase() === targetName ||
        repoVariants.has(String(app?.git_repository || "").toLowerCase()) ||
        repoVariants.has(String(app?.gitRepository || "").toLowerCase()),
    ) || null
  );
}

function readComposeRaw() {
  return fs.readFileSync(path.join(ROOT, "docker-compose.coolify.yml"), "utf8");
}

function ensureApplication(projectUuid, environmentUuid) {
  const apps = listApplications();
  const existing = findApplication(apps);
  if (existing) return existing;

  return api("/applications/public", {
    method: "Post",
    body: {
      project_uuid: projectUuid,
      server_uuid: CONFIG.coolifyServerUuid,
      environment_name: CONFIG.coolifyEnvironmentName,
      environment_uuid: environmentUuid,
      git_repository: CONFIG.targetRepoSlug,
      git_branch: CONFIG.targetBranch,
      build_pack: "dockercompose",
      ports_exposes: "80",
      destination_uuid: CONFIG.coolifyDestinationUuid,
      name: CONFIG.coolifyAppName,
      description: "Warunginz temporary Quick Tunnel deployment",
      domains: "",
      docker_compose_location: "/docker-compose.coolify.yml",
      docker_compose_custom_start_command: "",
      docker_compose_custom_build_command: "",
      autogenerate_domain: false,
      connect_to_docker_network: true,
      force_domain_override: true,
      instant_deploy: false,
      is_auto_deploy_enabled: false,
    },
  });
}

function bulkUpdateEnvs(appUuid, pairs) {
  return api(`/applications/${appUuid}/envs/bulk`, {
    method: "Patch",
    body: {
      data: pairs.map(([key, value]) => ({ key, value, is_literal: true, is_preview: false })),
    },
  });
}

function deployApplication(appUuid) {
  return api(`/deploy`, {
    method: "Post",
    body: { uuid: appUuid, force: true },
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTunnelUrl() {
  for (let i = 0; i < 30; i += 1) {
    const output = sshCommand(
      `docker logs ${CONFIG.tunnelContainerName} 2>&1 | tail -n 30`,
    );
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    if (match) return match[0];
    await sleep(2000);
  }
  throw new Error("Failed to capture Quick Tunnel URL from cloudflared logs.");
}

function copyPath(sourceRoot, relativePath, targetRoot) {
  const source = path.join(sourceRoot, relativePath);
  const target = path.join(targetRoot, relativePath);
  if (!fs.existsSync(source)) return;

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      const childRel = path.join(relativePath, entry);
      const childNorm = childRel.replace(/\\/g, "/");
      if (COPY_EXCLUDE.some((prefix) => childNorm.startsWith(prefix))) continue;
      copyPath(sourceRoot, childRel, targetRoot);
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function stageRepo() {
  const dir = tempDir("warunginz-stage-");
  for (const include of COPY_INCLUDE) {
    copyPath(ROOT, include, dir);
  }
  return dir;
}

function buildRuntimeSecrets() {
  return {
    POSTGRES_PASSWORD:
      process.env.WARUNGINZ_POSTGRES_PASSWORD || "warunginz-test-postgres",
    JWT_SECRET:
      process.env.WARUNGINZ_JWT_SECRET ||
      "warunginz-test-jwt-secret-1234567890",
    JWT_REFRESH_SECRET:
      process.env.WARUNGINZ_JWT_REFRESH_SECRET ||
      "warunginz-test-refresh-secret-1234567890",
  };
}

function buildRuntimeEnv(baseUrl, secrets) {
  return {
    POSTGRES_USER: "postgres",
    POSTGRES_DB: "warungin",
    POSTGRES_PASSWORD: secrets.POSTGRES_PASSWORD,
    JWT_SECRET: secrets.JWT_SECRET,
    JWT_REFRESH_SECRET: secrets.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: "7d",
    FRONTEND_URL: baseUrl,
    BACKEND_URL: `${baseUrl}/api`,
    CORS_ORIGIN: baseUrl,
  };
}

function writeEnvFile(envMap) {
  const envPath = path.join(tempDir("warunginz-env-"), ".env");
  const lines = Object.entries(envMap).map(([key, value]) => `${key}=${value ?? ""}`);
  fs.writeFileSync(envPath, `${lines.join("\n")}\n`);
  return envPath;
}

function getRemoteEnvValue(key) {
  try {
    return sshCommand(
      `[ -f ${CONFIG.remoteEnvPath} ] && grep '^${key}=' ${CONFIG.remoteEnvPath} | tail -n 1 | cut -d= -f2- || true`,
    ).trim();
  } catch {
    return "";
  }
}

function createStageArchive(stageDir) {
  const archivePath = path.join(os.tmpdir(), `warunginz-stage-${Date.now()}.tgz`);
  run(`tar -czf "${archivePath}" -C "${stageDir}" .`, "Create stage archive");
  return archivePath;
}

function uploadStageToHost(stageDir) {
  const archivePath = createStageArchive(stageDir);
  try {
    scpToRemote(archivePath, CONFIG.remoteArchivePath);
    sshCommand(
      `rm -rf ${CONFIG.remoteDeployRoot} && mkdir -p ${CONFIG.remoteDeployRoot} && tar -xzf ${CONFIG.remoteArchivePath} -C ${CONFIG.remoteDeployRoot} && mkdir -p ${CONFIG.remoteDeployRoot}/logs && find ${CONFIG.remoteDeployRoot}/scripts -type f -name "*.sh" -exec chmod +x {} \\; && rm -f ${CONFIG.remoteArchivePath}`,
    );
  } finally {
    fs.rmSync(archivePath, { force: true });
  }
}

function uploadEnvToHost(envMap) {
  const envPath = writeEnvFile(envMap);
  try {
    scpToRemote(envPath, CONFIG.remoteEnvPath);
    scpToRemote(envPath, `${CONFIG.remoteDeployRoot}/.env`);
  } finally {
    fs.rmSync(path.dirname(envPath), { recursive: true, force: true });
  }
}

function runRemoteCompose(args) {
  return sshCommand(
    `cd ${CONFIG.remoteDeployRoot} && docker compose -p warunginz-test -f docker-compose.coolify.yml ${args}`,
  );
}

function stopHostFallbackStack() {
  try {
    runRemoteCompose("down --remove-orphans");
  } catch {
    // Ignore if fallback stack is not present on the remote host.
  }
  sshCommand(`docker rm -f ${CONFIG.tunnelContainerName} >/dev/null 2>&1 || true`);
}

async function waitForRemoteOrigin() {
  for (let i = 0; i < 60; i += 1) {
    try {
      sshCommand(`wget --spider --quiet --tries=1 ${CONFIG.tunnelTargetUrl}`);
      return;
    } catch {
      await sleep(3000);
    }
  }
  throw new Error("Direct host deployment did not expose frontend on 127.0.0.1:18081 in time.");
}

async function waitForRemoteBackendHealthy() {
  for (let i = 0; i < 60; i += 1) {
    try {
      sshCommand(
        `docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' warunginz-test-backend-1 | grep healthy`,
      );
      return;
    } catch {
      await sleep(3000);
    }
  }
  throw new Error("Backend container did not become healthy in time.");
}

async function waitForPublicUrl(url) {
  for (let i = 0; i < 30; i += 1) {
    const result = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        "$ProgressPreference='SilentlyContinue';" +
          `try { (Invoke-WebRequest -Uri '${url}' -UseBasicParsing -TimeoutSec 20).StatusCode | Out-String } catch { exit 1 }`,
      ],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: process.env,
      },
    );
    if (result.status === 0) return;
    await sleep(2000);
  }
  throw new Error(`Quick Tunnel URL did not become reachable in time: ${url}`);
}

async function deployDirectToHost(stageDir) {
  uploadStageToHost(stageDir);

  const secrets = buildRuntimeSecrets();
  const initialEnv = buildRuntimeEnv(CONFIG.tunnelTargetUrl, secrets);
  const existingPassword = getRemoteEnvValue("POSTGRES_PASSWORD");
  const shouldResetDb = RESET_DB || (existingPassword && existingPassword !== initialEnv.POSTGRES_PASSWORD);
  uploadEnvToHost(initialEnv);
  try {
    runRemoteCompose(
      shouldResetDb ? "down -v --remove-orphans" : "down --remove-orphans",
    );
  } catch {
    // First deploy may not have any existing stack yet.
  }
  runRemoteCompose("up -d --build postgres backend frontend");
  await waitForRemoteBackendHealthy();
  await waitForRemoteOrigin();

  sshCommand(`docker rm -f ${CONFIG.tunnelContainerName} >/dev/null 2>&1 || true`);
  sshCommand(
    `docker run -d --restart unless-stopped --name ${CONFIG.tunnelContainerName} --network host cloudflare/cloudflared:latest tunnel --no-autoupdate --url ${CONFIG.tunnelTargetUrl}`,
  );

  const tunnelUrl = await waitForTunnelUrl();
  const publicEnv = buildRuntimeEnv(tunnelUrl, secrets);
  uploadEnvToHost(publicEnv);
  runRemoteCompose("up -d backend");
  await waitForRemoteBackendHealthy();
  runRemoteCompose("up -d frontend");
  await waitForRemoteOrigin();
  await waitForPublicUrl(tunnelUrl);

  return tunnelUrl;
}

function pushToTargetRepo(stageDir) {
  const gitToken = resolveGithubToken();
  const targetPushUrl = CONFIG.targetRepo.replace(
    "https://github.com/",
    `https://x-access-token:${gitToken}@github.com/`,
  );
  gh("gh auth setup-git", "GitHub auth setup");
  run(`git init`, "Stage git init", { cwd: stageDir });
  run(`git checkout -b ${CONFIG.targetBranch}`, "Stage branch create", { cwd: stageDir });
  run(`git config user.name "faiznutes"`, "Stage git user.name", { cwd: stageDir });
  run(`git config user.email "faiznutes@users.noreply.github.com"`, "Stage git user.email", { cwd: stageDir });
  run(`git add .`, "Stage git add", { cwd: stageDir });
  run(`git commit -m "Deploy Warunginz test stack for Coolify quick tunnel"`, "Stage git commit", { cwd: stageDir });
  run(`git remote add origin ${targetPushUrl}`, "Stage git remote add", { cwd: stageDir });
  run(`git push --force -u origin ${CONFIG.targetBranch}`, "Push target repo", { cwd: stageDir });
}

async function main() {
  ensureEnv();
  const summary = {
    deployMode: DEPLOY_MODE,
    auditMode: SKIP_AUDIT ? "skipped" : "strict",
    preflightAudit: "pending",
    githubPush: "pending",
    coolifyProject: "pending",
    coolifyApplication: "pending",
    directHostDeploy: "pending",
    quickTunnelUrl: null,
    blockers: [],
  };

  if (SKIP_AUDIT) {
    summary.preflightAudit = "skipped";
  } else {
    run("npm run audit:strict", "Preflight audit", { capture: false });
    summary.preflightAudit = "passed";
  }

  const stageDir = stageRepo();
  try {
    pushToTargetRepo(stageDir);
    summary.githubPush = "passed";
  } catch (error) {
    summary.githubPush = "blocked";
    summary.blockers.push(
      `GitHub push blocked: ${String(error.message || error).split("\n").slice(0, 2).join(" | ")}`,
    );
  }

  if (DEPLOY_MODE === "coolify") {
    let coolifyApp = null;
    try {
      const project = ensureProject();
      ensureEnvironment(project.uuid);
      summary.coolifyProject = "passed";
      try {
        coolifyApp = ensureApplication(project.uuid, CONFIG.coolifyEnvironmentName);
        summary.coolifyApplication = "passed";
      } catch (error) {
        summary.coolifyApplication = "blocked";
        summary.blockers.push(
          `Coolify app provisioning blocked: ${String(error.message || error).split("\n").slice(0, 2).join(" | ")}`,
        );
      }
    } catch (error) {
      summary.coolifyProject = "blocked";
      summary.coolifyApplication = "blocked";
      summary.blockers.push(
        `Coolify project provisioning blocked: ${String(error.message || error).split("\n").slice(0, 2).join(" | ")}`,
      );
    }

    if (!(summary.githubPush === "passed" && summary.coolifyApplication === "passed" && coolifyApp)) {
      throw new Error("Coolify mode selected but application provisioning/deploy could not proceed.");
    }

    const secrets = buildRuntimeSecrets();
    const initialEnv = buildRuntimeEnv(CONFIG.tunnelTargetUrl, secrets);
    stopHostFallbackStack();
    bulkUpdateEnvs(coolifyApp.uuid, Object.entries(initialEnv));
    deployApplication(coolifyApp.uuid);
    sshCommand(
      `docker run -d --restart unless-stopped --name ${CONFIG.tunnelContainerName} --network host cloudflare/cloudflared:latest tunnel --no-autoupdate --url ${CONFIG.tunnelTargetUrl}`,
    );
    const tunnelUrl = await waitForTunnelUrl();
    bulkUpdateEnvs(coolifyApp.uuid, Object.entries(buildRuntimeEnv(tunnelUrl, secrets)));
    deployApplication(coolifyApp.uuid);
    await waitForPublicUrl(tunnelUrl);
    summary.quickTunnelUrl = tunnelUrl;
    summary.directHostDeploy = "skipped";
  } else {
    summary.coolifyProject = "skipped";
    summary.coolifyApplication = "skipped";
    const tunnelUrl = await deployDirectToHost(stageDir);
    summary.quickTunnelUrl = tunnelUrl;
    summary.directHostDeploy = "passed";
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
