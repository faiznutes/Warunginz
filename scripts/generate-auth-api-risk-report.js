#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { findBestEndpoint } = require("./lib/endpoint-match");

const ROOT = path.resolve(__dirname, "..");
const ROUTER_FILES = [
  path.join(ROOT, "client", "src", "router", "index.ts"),
  path.join(ROOT, "client", "src", "router", "addon.routes.ts"),
];
const MODULES_ROOT = path.join(ROOT, "nest", "src", "modules");
const VIEWS_ROOT = path.join(ROOT, "client", "src", "views");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function walkFiles(dir, matcher) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (matcher(fullPath)) {
        out.push(fullPath);
      }
    }
  }
  return out;
}

function normalizeImportPath(importPath) {
  return path
    .join(ROOT, "client", "src", importPath.replace(/^\.\.\//, ""))
    .replace(/\\/g, "/");
}

function parseRolesFromBlock(lines, startIndex) {
  const firstLine = lines[startIndex] || "";
  if (!firstLine.includes("roles:")) return null;

  let block = firstLine;
  let cursor = startIndex + 1;
  while (!block.includes("]") && cursor < lines.length && cursor <= startIndex + 12) {
    block += lines[cursor];
    cursor += 1;
  }

  const match = block.match(/roles:\s*\[([^\]]+)\]/s);
  if (!match) return null;

  return match[1]
    .split(",")
    .map((x) => x.trim().replace(/['"]/g, ""))
    .filter(Boolean);
}

function parseRouterViewMeta() {
  const results = new Map();

  for (const filePath of ROUTER_FILES) {
    const content = readText(filePath);
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const importMatch = line.match(
        /import\((['"])(\.{2}\/views\/[^'"]+\.vue)\1\)/,
      );
      if (!importMatch) continue;

      const importPath = importMatch[2];
      const absView = normalizeImportPath(importPath);

      let routePath = "";
      let routeName = "";
      let roles = [];
      let requiresAuth = false;

      for (let j = i; j >= Math.max(0, i - 30); j -= 1) {
        const probe = lines[j];
        if (!routePath) {
          const pathMatch = probe.match(/path:\s*(['"])([^'"]+)\1/);
          if (pathMatch) routePath = pathMatch[2];
        }
        if (!routeName) {
          const nameMatch = probe.match(/name:\s*(['"])([^'"]+)\1/);
          if (nameMatch) routeName = nameMatch[2];
        }
        if (routePath && routeName) break;
      }

      let nearestRoles = null;
      let nearestRolesDistance = Number.MAX_SAFE_INTEGER;
      for (
        let j = Math.max(0, i - 6);
        j <= Math.min(lines.length - 1, i + 6);
        j += 1
      ) {
        const probe = lines[j];
        if (probe.includes("requiresAuth: true")) requiresAuth = true;
        const parsedRoles = parseRolesFromBlock(lines, j);
        if (!parsedRoles || parsedRoles.length === 0) continue;
        const distance = Math.abs(j - i);
        if (distance < nearestRolesDistance) {
          nearestRolesDistance = distance;
          nearestRoles = parsedRoles;
        }
      }
      if (nearestRoles && nearestRoles.length > 0) {
        roles = nearestRoles;
        requiresAuth = true;
      }

      if (!results.has(absView)) results.set(absView, []);
      results.get(absView).push({
        source: path.relative(ROOT, filePath),
        routePath,
        routeName,
        roles,
        requiresAuth,
        line: i + 1,
      });
    }
  }

  return results;
}

function parseControllerEndpoints() {
  const files = walkFiles(MODULES_ROOT, (p) => p.endsWith("controller.ts"));
  const endpoints = [];

  for (const filePath of files) {
    const rel = path.relative(ROOT, filePath);
    const lines = readText(filePath).split(/\r?\n/);

    let classBase = "";
    let classRoles = [];
    let classPublic = false;
    let classGuards = [];

    let decoratorBuffer = [];
    let methodDecos = [];
    let pendingHttp = null;

    function parseRolesFromLine(text) {
      const m = text.match(/@Roles\(([^)]+)\)/);
      if (!m) return [];
      return m[1]
        .split(",")
        .map((x) => x.trim().replace(/['"]/g, ""))
        .filter(Boolean);
    }

    function parseGuardsFromLine(text) {
      const m = text.match(/@UseGuards\(([^)]+)\)/);
      if (!m) return [];
      return m[1]
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();

      if (line.startsWith("@")) {
        decoratorBuffer.push(line);
        methodDecos.push(line);

        const httpMatch = line.match(
          /^@(Get|Post|Put|Patch|Delete)\(([^)]*)\)/,
        );
        if (httpMatch) {
          const method = httpMatch[1].toUpperCase();
          const rawPath = httpMatch[2].trim();
          const childPath = rawPath ? rawPath.replace(/^['"]|['"]$/g, "") : "";
          pendingHttp = { method, childPath, line: i + 1 };
        }
        continue;
      }

      const classMatch = line.match(/^export class\s+\w+/);
      if (classMatch) {
        classBase = "";
        classRoles = [];
        classPublic = false;
        classGuards = [];

        for (const deco of decoratorBuffer) {
          const ctl = deco.match(/@Controller\((['"])([^'"]+)\1\)/);
          if (ctl) classBase = ctl[2].replace(/^\/+/, "");
          if (deco.includes("@Public()")) classPublic = true;
          const roles = parseRolesFromLine(deco);
          if (roles.length > 0) classRoles = roles;
          const guards = parseGuardsFromLine(deco);
          if (guards.length > 0) classGuards = guards;
        }
        decoratorBuffer = [];
        methodDecos = [];
        pendingHttp = null;
        continue;
      }

      if (!pendingHttp) continue;
      const isMethodSignature =
        /^(public\s+|private\s+|protected\s+)?(async\s+)?[A-Za-z0-9_]+\s*\(/.test(
          line,
        );
      if (!isMethodSignature) continue;

      let methodPublic = classPublic;
      let methodRoles = [...classRoles];
      let methodGuards = [...classGuards];

      for (const deco of methodDecos) {
        if (deco.includes("@Public()")) methodPublic = true;
        const roles = parseRolesFromLine(deco);
        if (roles.length > 0) methodRoles = roles;
        const guards = parseGuardsFromLine(deco);
        if (guards.length > 0) methodGuards = guards;
      }

      const fullPath = [classBase, pendingHttp.childPath]
        .filter(Boolean)
        .join("/")
        .replace(/\/+/g, "/");

      endpoints.push({
        file: rel,
        line: pendingHttp.line,
        method: pendingHttp.method,
        path: `/${fullPath}`,
        isPublic: methodPublic,
        roles: methodRoles,
        guards: methodGuards,
      });

      methodDecos = [];
      decoratorBuffer = [];
      pendingHttp = null;
    }
  }

  return endpoints;
}

function parseViewApiCalls() {
  const files = walkFiles(VIEWS_ROOT, (p) => p.endsWith(".vue"));
  const map = new Map();
  for (const filePath of files) {
    const rel = path.relative(ROOT, filePath);
    const content = readText(filePath);
    const regex = /api\.(get|post|put|patch|delete)\(\s*(["'`])([^"'`]+)\2/g;
    let match;
    const calls = [];
    while ((match = regex.exec(content)) !== null) {
      calls.push({ method: match[1].toUpperCase(), endpoint: match[3] });
    }
    if (calls.length > 0) map.set(filePath.replace(/\\/g, "/"), { rel, calls });
  }
  return map;
}

function intersect(a, b) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

function isRuntimeGuardedPublicCall(pagePath, endpoint) {
  const normalizedPage = pagePath.replace(/\\/g, "/");
  if (
    normalizedPage.endsWith("client/src/views/auth/Login.vue") &&
    endpoint.startsWith("/outlets")
  ) {
    return true;
  }
  if (
    normalizedPage.endsWith("client/src/views/payment/PaymentCallback.vue") &&
    endpoint.startsWith("/payment/status/")
  ) {
    return true;
  }
  if (
    normalizedPage.endsWith("client/src/views/marketing/Pricing.vue") &&
    endpoint.startsWith("/addons/available")
  ) {
    return true;
  }
  return false;
}

function generate() {
  const publicRouteNames = new Set([
    "home",
    "demo",
    "contact",
    "terms",
    "pricing",
    "help",
    "help-article",
    "help-category",
    "forgot-password",
    "contact-success",
    "login",
    "payment-success",
    "payment-error",
    "payment-pending",
    "unauthorized",
    "not-found",
  ]);

  const routeMeta = parseRouterViewMeta();
  const endpoints = parseControllerEndpoints();
  const callsByView = parseViewApiCalls();

  const routedViews = Array.from(routeMeta.keys()).sort();
  const rows = [];
  const risks = [];

  for (const view of routedViews) {
    const routeEntries = routeMeta.get(view) || [];
    const callEntry = callsByView.get(view);
    const calls = callEntry ? callEntry.calls : [];

    for (const call of calls) {
      const candidate = findBestEndpoint(endpoints, call.method, call.endpoint);

      for (const route of routeEntries) {
        const routeIsPublic = publicRouteNames.has(route.routeName);
        const backendRoles = candidate ? candidate.roles : [];

        if (!candidate) {
          risks.push({
            severity: "P0",
            kind: "unmapped-endpoint",
            page: path.relative(ROOT, view),
            route: route.routePath || "(unknown)",
            api: `${call.method} ${call.endpoint}`,
            detail: "No backend endpoint match found for page API call.",
          });
          continue;
        }

        if (routeIsPublic && !candidate.isPublic) {
          if (
            isRuntimeGuardedPublicCall(path.relative(ROOT, view), call.endpoint)
          ) {
            continue;
          }
          risks.push({
            severity: "P0",
            kind: "public-route-protected-api",
            page: path.relative(ROOT, view),
            route: route.routePath || "(unknown)",
            api: `${call.method} ${call.endpoint}`,
            backend: `${candidate.method} ${candidate.path}`,
            evidence: `${candidate.file}:${candidate.line}`,
            detail: "Public route calls endpoint that is not @Public.",
          });
        }

        if (route.roles.length > 0 && backendRoles.length > 0) {
          const overlap = intersect(route.roles, backendRoles);
          if (overlap.length === 0) {
            risks.push({
              severity: "P1",
              kind: "role-mismatch",
              page: path.relative(ROOT, view),
              route: route.routePath || "(unknown)",
              api: `${call.method} ${call.endpoint}`,
              backend: `${candidate.method} ${candidate.path}`,
              evidence: `${candidate.file}:${candidate.line}`,
              detail: `Frontend roles [${route.roles.join(", ")}] do not overlap backend roles [${backendRoles.join(", ")}].`,
            });
          }
        }

        if (
          route.roles.length > 0 &&
          backendRoles.length === 0 &&
          !candidate.isPublic
        ) {
          risks.push({
            severity: "P2",
            kind: "backend-role-not-explicit",
            page: path.relative(ROOT, view),
            route: route.routePath || "(unknown)",
            api: `${call.method} ${call.endpoint}`,
            backend: `${candidate.method} ${candidate.path}`,
            evidence: `${candidate.file}:${candidate.line}`,
            detail:
              "Frontend restricts roles but backend endpoint has no explicit @Roles.",
          });
        }

        rows.push({
          page: path.relative(ROOT, view),
          routePath: route.routePath || "(unknown)",
          routeName: route.routeName || "(unknown)",
          routeRoles: route.roles,
          routeRequiresAuth: route.requiresAuth,
          apiMethod: call.method,
          apiEndpoint: call.endpoint,
          backendMatch: candidate
            ? `${candidate.method} ${candidate.path}`
            : "(none)",
          backendPublic: candidate ? candidate.isPublic : false,
          backendRoles,
          backendRef: candidate ? `${candidate.file}:${candidate.line}` : "-",
        });
      }
    }
  }

  const report = [];
  report.push("# AUTH ROUTE API RISK REPORT");
  report.push("");
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push("");
  report.push("## Summary");
  report.push(`- Routed pages analyzed: ${routedViews.length}`);
  report.push(`- Route/Page/API matrix rows: ${rows.length}`);
  report.push(`- Risks found: ${risks.length}`);
  report.push(`- P0: ${risks.filter((r) => r.severity === "P0").length}`);
  report.push(`- P1: ${risks.filter((r) => r.severity === "P1").length}`);
  report.push(`- P2: ${risks.filter((r) => r.severity === "P2").length}`);
  report.push("");

  report.push("## Risks");
  report.push("");
  if (risks.length === 0) {
    report.push("- No risks detected by static matcher");
  } else {
    for (const risk of risks) {
      report.push(
        `- [${risk.severity}] ${risk.kind} | page: ${risk.page} | route: ${risk.route} | api: ${risk.api}${risk.backend ? ` | backend: ${risk.backend}` : ""}${risk.evidence ? ` | evidence: ${risk.evidence}` : ""} | ${risk.detail}`,
      );
    }
  }
  report.push("");

  report.push("## Matrix Sample (first 80 rows)");
  report.push("");
  report.push(
    "| Page | Route | Route Roles | API | Backend | Public | Backend Roles | Ref |",
  );
  report.push("|---|---|---|---|---|---|---|---|");
  for (const row of rows.slice(0, 80)) {
    report.push(
      `| ${row.page} | ${row.routePath} | ${row.routeRoles.join(", ") || "-"} | ${row.apiMethod} ${row.apiEndpoint} | ${row.backendMatch} | ${row.backendPublic ? "yes" : "no"} | ${row.backendRoles.join(", ") || "-"} | ${row.backendRef} |`,
    );
  }

  const outPath = path.join(ROOT, "AUDIT_AUTH_ROUTE_API_MATRIX.md");
  fs.writeFileSync(outPath, report.join("\n"));
  console.log(`Report written: ${outPath}`);
}

generate();
