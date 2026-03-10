#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const statusPath = path.join(ROOT, "AUDIT_HEALTH_STATUS.md");
const phase23Path = path.join(ROOT, "PHASE23_EXECUTION.md");
const runtimeMatrixJsonPath = path.join(ROOT, "AUDIT_RUNTIME_ROLE_MATRIX.json");
const playwrightCriticalJsonPath = path.join(ROOT, "AUDIT_PLAYWRIGHT_CRITICAL.json");
const playwrightDomainJsonPath = path.join(ROOT, "AUDIT_PLAYWRIGHT_DOMAIN.json");
const businessRulesJsonPath = path.join(ROOT, "AUDIT_BUSINESS_RULES.json");
const requiredArtifacts = [
  "PAGE_LOGIC_MAP.md",
  "PAGE_BUSINESS_FLOW_DETAIL.md",
  "AUDIT_UAT_HANDOFF.md",
  "AUDIT_BUG_REPORT.md",
  "AUDIT_FINAL_SIGNOFF.md",
  "AUDIT_PLAYWRIGHT_CRITICAL.md",
  "AUDIT_PLAYWRIGHT_DOMAIN.md",
  "AUDIT_BUSINESS_RULES.md",
  "UAT_START_HERE.md",
];

function read(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

const status = read(statusPath);
const phase23 = read(phase23Path);
const runtimeMatrixJson = readJson(runtimeMatrixJsonPath);
const playwrightCriticalJson = readJson(playwrightCriticalJsonPath);
const playwrightDomainJson = readJson(playwrightDomainJsonPath);
const businessRulesJson = readJson(businessRulesJsonPath);

const isGo = /- Status:\s*GO/.test(status);
const isPhasePass = /- Overall:\s*PASS/.test(phase23);
const unverifiedCriticalRestrictions =
  runtimeMatrixJson?.verificationSummary?.unverifiedCritical ?? null;
const hasRuntimeVerification =
  typeof unverifiedCriticalRestrictions === "number";
const hasUnverifiedCritical = hasRuntimeVerification
  ? unverifiedCriticalRestrictions > 0
  : true;
const playwrightCriticalPass =
  Boolean(playwrightCriticalJson?.ok) &&
  Number(playwrightCriticalJson?.summary?.failed ?? 1) === 0;
const playwrightDomainPass =
  Boolean(playwrightDomainJson?.ok) && Number(playwrightDomainJson?.summary?.failed ?? 1) === 0;
const businessRulesPass =
  Boolean(businessRulesJson?.ok) && Number(businessRulesJson?.summary?.failed ?? 1) === 0;
const missingArtifacts = requiredArtifacts.filter(
  (file) => !fs.existsSync(path.join(ROOT, file)),
);

if (
  !isGo ||
  !isPhasePass ||
  hasUnverifiedCritical ||
  !playwrightCriticalPass ||
  !playwrightDomainPass ||
  !businessRulesPass ||
  missingArtifacts.length > 0
) {
  console.error("Audit gate: FAIL");
  console.error(`- GO status: ${isGo ? "yes" : "no"}`);
  console.error(`- Phase23 PASS: ${isPhasePass ? "yes" : "no"}`);
  console.error(
    `- Runtime restriction verification loaded: ${hasRuntimeVerification ? "yes" : "no"}`,
  );
  console.error(
    `- Unverified critical expected-deny restrictions: ${
      hasRuntimeVerification ? unverifiedCriticalRestrictions : "unknown"
    }`,
  );
  console.error(
    `- Playwright critical PASS: ${playwrightCriticalPass ? "yes" : "no"}`,
  );
  console.error(
    `- Playwright domain PASS: ${playwrightDomainPass ? "yes" : "no"}`,
  );
  console.error(
    `- Business rules PASS: ${businessRulesPass ? "yes" : "no"}`,
  );
  console.error(
    `- Missing UAT artifacts: ${missingArtifacts.length > 0 ? missingArtifacts.join(", ") : "none"}`,
  );
  process.exit(1);
}

console.log("Audit gate: PASS");
