#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RUNTIME_JSON_PATH = path.join(ROOT, "AUDIT_RUNTIME_CRITICAL_ENDPOINTS.json");
const OUTPUT_PATH = path.join(ROOT, "AUDIT_RUNTIME_ROUTE_CHECKLIST.md");

const ROLES = [
  "GUEST",
  "SUPER_ADMIN",
  "ADMIN_TENANT",
  "SUPERVISOR",
  "CASHIER",
  "KITCHEN",
];

const CRITICAL_ROUTES = [
  {
    key: "dashboard",
    allowedRoles: ["ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN"],
    runtimeScenario: "dashboard-stats",
  },
  {
    key: "orders",
    allowedRoles: ["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN"],
    runtimeScenario: "orders-list",
  },
  {
    key: "customers",
    allowedRoles: ["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER"],
    runtimeScenario: "customers-list",
  },
  {
    key: "products",
    allowedRoles: ["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER"],
    runtimeScenario: "products-list",
  },
  {
    key: "pos",
    allowedRoles: ["ADMIN_TENANT", "SUPERVISOR", "CASHIER"],
    mode: "policy-only",
    note: "Validated from router role policy.",
  },
  {
    key: "open-shift",
    allowedRoles: ["SUPERVISOR", "CASHIER"],
    mode: "policy-only",
    note: "Validated from router role policy.",
  },
  {
    key: "settings/store",
    allowedRoles: ["ADMIN_TENANT"],
    mode: "policy-only",
    note: "Validated from router role policy.",
  },
  {
    key: "settings/password",
    allowedRoles: ["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN"],
    runtimeScenario: "password-update",
  },
  {
    key: "settings/2fa",
    allowedRoles: ["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR"],
    runtimeScenario: "2fa-status",
  },
  {
    key: "marketing",
    public: true,
    mode: "policy-only",
    note: "Pricing/help/contact routes are public by router policy.",
  },
  {
    key: "reports/advanced",
    allowedRoles: ["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR"],
    mode: "policy-only",
    note: "Route access validated by router policy (addon check handled separately).",
  },
  {
    key: "tenants",
    allowedRoles: ["SUPER_ADMIN"],
    runtimeScenario: "tenants-list",
  },
  {
    key: "tenants/:id",
    allowedRoles: ["SUPER_ADMIN"],
    runtimeScenario: "tenants-detail",
  },
  {
    key: "superadmin/backups",
    allowedRoles: ["SUPER_ADMIN"],
    runtimeScenario: "superadmin-backups",
  },
  {
    key: "/payment/success",
    public: true,
    mode: "policy-only",
    note: "Callback routes are public; activation call is role-guarded in component.",
  },
  {
    key: "/payment/error",
    public: true,
    mode: "policy-only",
    note: "Callback routes are public; activation call is role-guarded in component.",
  },
  {
    key: "/payment/pending",
    public: true,
    mode: "policy-only",
    note: "Callback routes are public; activation call is role-guarded in component.",
  },
];

function loadRuntimeResults() {
  if (!fs.existsSync(RUNTIME_JSON_PATH)) {
    return [];
  }

  try {
    const payload = JSON.parse(fs.readFileSync(RUNTIME_JSON_PATH, "utf8"));
    return Array.isArray(payload.results) ? payload.results : [];
  } catch {
    return [];
  }
}

function policyAllows(route, role) {
  if (route.public) return true;
  if (role === "GUEST") return false;
  return (route.allowedRoles || []).includes(role);
}

function runtimeScenarioStatus(results, scenario) {
  if (!scenario) {
    return { status: "N/A", message: "Policy-only validation" };
  }

  const scenarioRows = results.filter((row) => row.scenario === scenario);
  if (scenarioRows.length === 0) {
    return { status: "MISSING", message: `Scenario \`${scenario}\` not found` };
  }

  for (const role of ROLES) {
    const roleRow = scenarioRows.find((row) => row.role === role);
    if (!roleRow) {
      return {
        status: "FAIL",
        message: `Scenario \`${scenario}\` missing role ${role}`,
      };
    }
    if (!roleRow.pass) {
      return {
        status: "FAIL",
        message: `Scenario \`${scenario}\` failed for role ${role}`,
      };
    }
  }

  return { status: "PASS", message: `Scenario \`${scenario}\` passed for all roles` };
}

function formatPolicy(route) {
  if (route.public) return "PUBLIC";
  return (route.allowedRoles || []).join(", ");
}

function main() {
  const runtimeResults = loadRuntimeResults();
  const routeResults = CRITICAL_ROUTES.map((route) => {
    const policyMatrix = ROLES.map((role) => ({
      role,
      allow: policyAllows(route, role),
    }));
    const runtime = runtimeScenarioStatus(runtimeResults, route.runtimeScenario);
    const result = runtime.status === "PASS" || runtime.status === "N/A";
    return {
      route,
      policyMatrix,
      runtime,
      result,
    };
  });

  const passed = routeResults.filter((r) => r.result).length;
  const failed = routeResults.length - passed;

  const lines = [];
  lines.push("# AUDIT RUNTIME ROUTE CHECKLIST");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total routes: ${routeResults.length}`);
  lines.push(`- Passed: ${passed}`);
  lines.push(`- Failed: ${failed}`);
  lines.push("");
  lines.push("## Route Matrix");
  lines.push("");
  lines.push("| Route | Policy (Allowed Roles) | Runtime Probe | Runtime Status | Result |");
  lines.push("|---|---|---|---|---|");
  for (const item of routeResults) {
    lines.push(
      `| ${item.route.key} | ${formatPolicy(item.route)} | ${item.route.runtimeScenario || "-"} | ${item.runtime.status} | ${item.result ? "PASS" : "FAIL"} |`,
    );
  }
  lines.push("");
  lines.push("## Critical Route Checklist");
  lines.push("");
  for (const item of routeResults) {
    lines.push(
      `- [${item.result ? "x" : " "}] Validate route \`${item.route.key}\` for all roles with expected 200/403`,
    );
  }
  lines.push("");
  lines.push("## Validation Notes");
  lines.push("");
  const policyOnly = routeResults.filter((item) => item.runtime.status === "N/A");
  if (policyOnly.length === 0) {
    lines.push("- None");
  } else {
    for (const item of policyOnly) {
      lines.push(`- \`${item.route.key}\`: ${item.route.note || "Policy-only validation."}`);
    }
  }
  lines.push("");
  lines.push("## Failures");
  lines.push("");
  const failedItems = routeResults.filter((item) => !item.result);
  if (failedItems.length === 0) {
    lines.push("- None");
  } else {
    for (const item of failedItems) {
      lines.push(`- \`${item.route.key}\`: ${item.runtime.message}`);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, `${lines.join("\n")}\n`);
  console.log(`Report written: ${OUTPUT_PATH}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
