#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readSafe(file) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function extractNumber(text, regex, fallback = 0) {
  const match = text.match(regex);
  return match ? Number(match[1]) : fallback;
}

const authMatrix = readSafe("AUDIT_AUTH_ROUTE_API_MATRIX.md");
const pageApi = readSafe("AUDIT_PAGE_API_REPORT.md");
const phase23 = readSafe("PHASE23_EXECUTION.md");
const runtimeRoleMatrixJsonText = readSafe("AUDIT_RUNTIME_ROLE_MATRIX.json");
const playwrightCriticalJsonText = readSafe("AUDIT_PLAYWRIGHT_CRITICAL.json");
const playwrightDomainJsonText = readSafe("AUDIT_PLAYWRIGHT_DOMAIN.json");
const playwrightBillingJsonText = readSafe("AUDIT_PLAYWRIGHT_BILLING.json");
const businessRulesJsonText = readSafe("AUDIT_BUSINESS_RULES.json");

const p0 = extractNumber(authMatrix, /- P0:\s*(\d+)/, 0);
const p1 = extractNumber(authMatrix, /- P1:\s*(\d+)/, 0);
const p2 = extractNumber(authMatrix, /- P2:\s*(\d+)/, 0);
const unresolved = extractNumber(pageApi, /API calls with unresolved backend base path:\s*(\d+)/, 0);
const duplicates = extractNumber(pageApi, /Duplicate route entries found:\s*(\d+)/, 0);
const overallPass = /- Overall:\s*PASS/.test(phase23);
let unverifiedCriticalRestrictions = 0;
let runtimeVerificationLoaded = false;
let playwrightCriticalPass = false;
let playwrightCriticalLoaded = false;
let playwrightDomainPass = false;
let playwrightDomainLoaded = false;
let playwrightBillingPass = false;
let playwrightBillingLoaded = false;
let businessRulesPass = false;
let businessRulesLoaded = false;
if (runtimeRoleMatrixJsonText) {
  try {
    const parsed = JSON.parse(runtimeRoleMatrixJsonText);
    if (typeof parsed?.verificationSummary?.unverifiedCritical === "number") {
      unverifiedCriticalRestrictions = parsed.verificationSummary.unverifiedCritical;
      runtimeVerificationLoaded = true;
    }
  } catch {
    runtimeVerificationLoaded = false;
  }
}
if (playwrightCriticalJsonText) {
  try {
    const parsed = JSON.parse(playwrightCriticalJsonText);
    playwrightCriticalPass = Boolean(parsed?.ok) && Number(parsed?.summary?.failed ?? 1) === 0;
    playwrightCriticalLoaded = true;
  } catch {
    playwrightCriticalLoaded = false;
  }
}
if (playwrightDomainJsonText) {
  try {
    const parsed = JSON.parse(playwrightDomainJsonText);
    playwrightDomainPass = Boolean(parsed?.ok) && Number(parsed?.summary?.failed ?? 1) === 0;
    playwrightDomainLoaded = true;
  } catch {
    playwrightDomainLoaded = false;
  }
}
if (playwrightBillingJsonText) {
  try {
    const parsed = JSON.parse(playwrightBillingJsonText);
    playwrightBillingPass = Boolean(parsed?.ok) && Number(parsed?.summary?.failed ?? 1) === 0;
    playwrightBillingLoaded = true;
  } catch {
    playwrightBillingLoaded = false;
  }
}
if (businessRulesJsonText) {
  try {
    const parsed = JSON.parse(businessRulesJsonText);
    businessRulesPass = Boolean(parsed?.ok) && Number(parsed?.summary?.failed ?? 1) === 0;
    businessRulesLoaded = true;
  } catch {
    businessRulesLoaded = false;
  }
}
const uatArtifacts = [
  "PAGE_LOGIC_MAP.md",
  "PAGE_BUSINESS_FLOW_DETAIL.md",
  "AUDIT_UAT_HANDOFF.md",
  "AUDIT_BUG_REPORT.md",
  "AUDIT_FINAL_SIGNOFF.md",
  "AUDIT_PLAYWRIGHT_CRITICAL.md",
  "AUDIT_PLAYWRIGHT_DOMAIN.md",
  "UAT_START_HERE.md",
];
const missingUatArtifacts = uatArtifacts.filter(
  (file) => !fs.existsSync(path.join(ROOT, file)),
);
const hasPageLogicMap = fs.existsSync(path.join(ROOT, "PAGE_LOGIC_MAP.md"));
const hasPageBusinessFlow = fs.existsSync(path.join(ROOT, "PAGE_BUSINESS_FLOW_DETAIL.md"));

const lines = [];
lines.push("# AUDIT HEALTH STATUS");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("## Snapshot");
lines.push("");
lines.push(`- Phase 2-3 overall: ${overallPass ? "PASS" : "NOT PASS"}`);
lines.push(`- Auth mismatch: P0=${p0}, P1=${p1}, P2=${p2}`);
lines.push(`- Route/API unresolved mapping: ${unresolved}`);
lines.push(`- Duplicate route entries: ${duplicates}`);
lines.push(
  `- Playwright critical multi-role: ${
    playwrightCriticalLoaded ? (playwrightCriticalPass ? "PASS" : "FAIL") : "unknown"
  }`,
);
lines.push(
  `- Playwright domain walkthrough: ${
    playwrightDomainLoaded ? (playwrightDomainPass ? "PASS" : "FAIL") : "unknown"
  }`,
);
lines.push(
  `- Playwright billing lifecycle: ${
    playwrightBillingLoaded ? (playwrightBillingPass ? "PASS" : "FAIL") : "unknown"
  }`,
);
lines.push(
  `- Business rules audit: ${
    businessRulesLoaded ? (businessRulesPass ? "PASS" : "FAIL") : "unknown"
  }`,
);
lines.push(
  `- Unverified critical expected-deny restrictions: ${
    runtimeVerificationLoaded ? unverifiedCriticalRestrictions : "unknown"
  }`,
);
lines.push(`- UAT handoff artifacts missing: ${missingUatArtifacts.length}`);
lines.push(`- Page logic map present: ${hasPageLogicMap ? "yes" : "no"}`);
lines.push(`- Page business flow detail present: ${hasPageBusinessFlow ? "yes" : "no"}`);
lines.push("");
lines.push("## Gate Decision");
lines.push("");

if (
  overallPass &&
  p0 === 0 &&
  p1 === 0 &&
  p2 === 0 &&
  unresolved === 0 &&
  duplicates === 0 &&
  playwrightCriticalLoaded &&
  playwrightCriticalPass &&
  playwrightDomainLoaded &&
  playwrightDomainPass &&
  playwrightBillingLoaded &&
  playwrightBillingPass &&
  businessRulesLoaded &&
  businessRulesPass &&
  runtimeVerificationLoaded &&
  unverifiedCriticalRestrictions === 0 &&
  hasPageLogicMap &&
  hasPageBusinessFlow &&
  missingUatArtifacts.length === 0
) {
  lines.push("- Status: GO (no blocker detected in current audit scope)");
} else {
  lines.push("- Status: HOLD (review generated audit reports before release)");
}

lines.push("");
lines.push("## Evidence Files");
lines.push("");
lines.push("- `PHASE23_EXECUTION.md`");
lines.push("- `AUDIT_AUTH_ROUTE_API_MATRIX.md`");
lines.push("- `AUDIT_PAGE_API_REPORT.md`");
lines.push("- `AUDIT_RUNTIME_ROLE_MATRIX.md`");
lines.push("- `AUDIT_PLAYWRIGHT_CRITICAL.md`");
lines.push("- `AUDIT_PLAYWRIGHT_DOMAIN.md`");
lines.push("- `AUDIT_PLAYWRIGHT_BILLING.md`");
lines.push("- `AUDIT_BUSINESS_RULES.md`");
lines.push("- `PAGE_LOGIC_MAP.md`");
lines.push("- `PAGE_BUSINESS_FLOW_DETAIL.md`");
lines.push("- `AUDIT_UAT_HANDOFF.md`");

fs.writeFileSync(path.join(ROOT, "AUDIT_HEALTH_STATUS.md"), lines.join("\n"));
console.log("Report written: AUDIT_HEALTH_STATUS.md");
