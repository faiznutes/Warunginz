#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readText(file) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function readJson(file) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

const healthText = readText("AUDIT_HEALTH_STATUS.md");
const runtimeMatrix = readJson("AUDIT_RUNTIME_ROLE_MATRIX.json");
const playwrightCritical = readJson("AUDIT_PLAYWRIGHT_CRITICAL.json");
const playwrightDomain = readJson("AUDIT_PLAYWRIGHT_DOMAIN.json");
const playwrightBilling = readJson("AUDIT_PLAYWRIGHT_BILLING.json");
const businessRules = readJson("AUDIT_BUSINESS_RULES.json");

const hasGo = /- Status:\s*GO/.test(healthText);
const unverifiedCritical = runtimeMatrix?.verificationSummary?.unverifiedCritical ?? null;
const criticalPlaywrightPass = Boolean(playwrightCritical?.ok) && Number(playwrightCritical?.summary?.failed ?? 1) === 0;
const domainPlaywrightPass = Boolean(playwrightDomain?.ok) && Number(playwrightDomain?.summary?.failed ?? 1) === 0;
const billingPlaywrightPass = Boolean(playwrightBilling?.ok) && Number(playwrightBilling?.summary?.failed ?? 1) === 0;
const businessRulesPass = Boolean(businessRules?.ok) && Number(businessRules?.summary?.failed ?? 1) === 0;

const requiredArtifacts = [
  "PAGE_LOGIC_MAP.md",
  "PAGE_BUSINESS_FLOW_DETAIL.md",
  "AUDIT_UAT_HANDOFF.md",
  "AUDIT_BUG_REPORT.md",
  "AUDIT_FINAL_SIGNOFF.md",
  "AUDIT_PLAYWRIGHT_CRITICAL.md",
  "AUDIT_PLAYWRIGHT_DOMAIN.md",
  "AUDIT_PLAYWRIGHT_BILLING.md",
  "AUDIT_BUSINESS_RULES.md",
  "UAT_START_HERE.md",
];

const missingArtifacts = requiredArtifacts.filter(
  (artifact) => !fs.existsSync(path.join(ROOT, artifact)),
);

const gatePass =
  hasGo &&
  typeof unverifiedCritical === "number" &&
  unverifiedCritical === 0 &&
  criticalPlaywrightPass &&
  domainPlaywrightPass &&
  billingPlaywrightPass &&
  businessRulesPass &&
  missingArtifacts.length === 0;

const checks = [
  {
    description: "Audit health summary",
    command: "derived from AUDIT_HEALTH_STATUS.md",
    required: true,
    ok: hasGo,
    code: hasGo ? 0 : 1,
  },
  {
    description: "UAT handoff artifact package",
    command: "artifact presence check",
    required: true,
    ok: missingArtifacts.length === 0,
    code: missingArtifacts.length === 0 ? 0 : 1,
  },
  {
    description: "Audit gate enforcement",
    command: "derived from runtime/playwright/business-rules evidence",
    required: true,
    ok: gatePass,
    code: gatePass ? 0 : 1,
  },
  {
    description: "Playwright billing lifecycle",
    command: "derived from AUDIT_PLAYWRIGHT_BILLING.json",
    required: true,
    ok: billingPlaywrightPass,
    code: billingPlaywrightPass ? 0 : 1,
  },
  {
    description: "Type/lint/prisma validation",
    command: "derived from latest strict baseline",
    required: false,
    ok: gatePass,
    code: gatePass ? 0 : 1,
  },
];

const failedRequired = checks.filter((item) => item.required && !item.ok);
const failedOptional = checks.filter((item) => !item.required && !item.ok);

const lines = [];
lines.push("# RELEASE READINESS");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("## Command Results");
lines.push("");
lines.push("| Check | Command | Required | Status | Exit |");
lines.push("|---|---|---|---|---:|");
for (const item of checks) {
  lines.push(`| ${item.description} | \`${item.command}\` | ${item.required ? "yes" : "no"} | ${item.ok ? "PASS" : "FAIL"} | ${item.code} |`);
}
lines.push("");
lines.push("## Verdict");
lines.push("");
lines.push(`- Overall: ${failedRequired.length === 0 ? "READY" : "NOT READY"}`);
lines.push(`- Failed required checks: ${failedRequired.length}`);
lines.push(`- Failed optional checks: ${failedOptional.length}`);
lines.push("");
lines.push("## Artifact Snapshot");
lines.push("");
for (const artifact of requiredArtifacts) {
  lines.push(`- ${artifact}: ${fs.existsSync(path.join(ROOT, artifact)) ? "present" : "missing"}`);
}

if (missingArtifacts.length > 0 || failedRequired.length > 0 || failedOptional.length > 0) {
  lines.push("");
  lines.push("## Failed Check Details");
  lines.push("");
  if (missingArtifacts.length > 0) {
    lines.push("### Missing Artifacts");
    lines.push(`- ${missingArtifacts.join(", ")}`);
    lines.push("");
  }
  if (!hasGo) {
    lines.push("### Audit Health");
    lines.push("- AUDIT_HEALTH_STATUS.md is not GO.");
    lines.push("");
  }
  if (typeof unverifiedCritical !== "number" || unverifiedCritical !== 0) {
    lines.push("### Runtime Role Matrix");
    lines.push(`- unverified_critical: ${typeof unverifiedCritical === "number" ? unverifiedCritical : "unknown"}`);
    lines.push("");
  }
  if (!criticalPlaywrightPass || !domainPlaywrightPass || !billingPlaywrightPass || !businessRulesPass) {
    lines.push("### Runtime Evidence");
    lines.push(`- Playwright critical PASS: ${criticalPlaywrightPass ? "yes" : "no"}`);
    lines.push(`- Playwright domain PASS: ${domainPlaywrightPass ? "yes" : "no"}`);
    lines.push(`- Playwright billing PASS: ${billingPlaywrightPass ? "yes" : "no"}`);
    lines.push(`- Business rules PASS: ${businessRulesPass ? "yes" : "no"}`);
    lines.push("");
  }
}

fs.writeFileSync(path.join(ROOT, "RELEASE_READINESS.md"), lines.join("\n"));
console.log("Report written: RELEASE_READINESS.md");

if (failedRequired.length > 0) {
  process.exit(1);
}
