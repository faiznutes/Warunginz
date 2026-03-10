#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CLIENT_ROOT = path.join(ROOT, "client", "src");
const VIEWS_ROOT = path.join(CLIENT_ROOT, "views");
const ROUTER_FILES = [
  path.join(CLIENT_ROOT, "router", "index.ts"),
  path.join(CLIENT_ROOT, "router", "addon.routes.ts"),
];
const MODULES_ROOT = path.join(ROOT, "nest", "src", "modules");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function walkFiles(dir, matcher) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length) {
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

function normalizeImportToViewPath(importPath) {
  const withoutPrefix = importPath.replace(/^\.\.\//, "");
  return path.join(CLIENT_ROOT, withoutPrefix);
}

function extractRoutedViewFiles() {
  const files = new Set();
  for (const routerFile of ROUTER_FILES) {
    const content = readText(routerFile);
    const regex = /import\((['"])([^'"]*\.vue)\1\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const rawImport = match[2];
      if (!rawImport.includes("../views/")) continue;
      files.add(normalizeImportToViewPath(rawImport));
    }
  }
  return Array.from(files)
    .filter((p) => fs.existsSync(p))
    .sort();
}

function extractApiCallsFromVue(filePath) {
  const content = readText(filePath);
  const regex = /api\.(get|post|put|patch|delete)\(\s*(['"`])([^'"`]+)\2/g;
  const calls = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    calls.push({
      method: match[1].toUpperCase(),
      endpoint: match[3],
    });
  }
  return calls;
}

function extractControllerBases() {
  const controllerFiles = walkFiles(
    MODULES_ROOT,
    (p) => p.endsWith("controller.ts") || p.endsWith("controller.tsx"),
  );
  const baseMap = new Map();
  for (const filePath of controllerFiles) {
    const content = readText(filePath);
    const regex = /@Controller\((['"])([^'"]+)\1\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const base = match[2].replace(/^\/+/, "");
      if (!baseMap.has(base)) baseMap.set(base, []);
      baseMap.get(base).push(path.relative(ROOT, filePath));
    }
  }
  return baseMap;
}

function firstPathSegment(endpoint) {
  const clean = endpoint.replace(/^\/+/, "").split("?")[0];
  if (!clean) return "";
  return clean.split("/")[0];
}

function collectRouteDuplicates() {
  const duplicates = [];
  const seenName = new Map();
  const seenPath = new Map();

  for (const routerFile of ROUTER_FILES) {
    const content = readText(routerFile);
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const nameMatch = line.match(/name:\s*'([^']+)'/);
      if (nameMatch) {
        const key = nameMatch[1];
        if (seenName.has(key)) {
          duplicates.push({
            type: "name",
            value: key,
            first: seenName.get(key),
            second: `${path.relative(ROOT, routerFile)}:${i + 1}`,
          });
        } else {
          seenName.set(key, `${path.relative(ROOT, routerFile)}:${i + 1}`);
        }
      }

      const pathMatch = line.match(/path:\s*'([^']+)'/);
      if (pathMatch) {
        const key = pathMatch[1];
        if (seenPath.has(key)) {
          duplicates.push({
            type: "path",
            value: key,
            first: seenPath.get(key),
            second: `${path.relative(ROOT, routerFile)}:${i + 1}`,
          });
        } else {
          seenPath.set(key, `${path.relative(ROOT, routerFile)}:${i + 1}`);
        }
      }
    }
  }

  return duplicates;
}

function main() {
  const routedViews = extractRoutedViewFiles();
  const controllerBases = extractControllerBases();
  const knownBaseSegments = new Set(
    Array.from(controllerBases.keys()).map((base) => firstPathSegment(base)),
  );

  const rows = [];
  const unresolved = [];
  for (const viewPath of routedViews) {
    const rel = path.relative(ROOT, viewPath);
    const calls = extractApiCallsFromVue(viewPath);
    if (calls.length === 0) {
      rows.push({ page: rel, calls: [] });
      continue;
    }

    const enriched = calls.map((call) => {
      const base = firstPathSegment(call.endpoint);
      const exists = knownBaseSegments.has(base);
      if (!exists) {
        unresolved.push({
          page: rel,
          method: call.method,
          endpoint: call.endpoint,
        });
      }
      return { ...call, base, exists };
    });
    rows.push({ page: rel, calls: enriched });
  }

  const duplicates = collectRouteDuplicates();

  const reportLines = [];
  reportLines.push("# PAGE-API AUDIT REPORT");
  reportLines.push("");
  reportLines.push(`Generated: ${new Date().toISOString()}`);
  reportLines.push("");
  reportLines.push("## Coverage Summary");
  reportLines.push(`- Routed view files audited: ${rows.length}`);
  reportLines.push(
    `- View files with API calls: ${rows.filter((r) => r.calls.length > 0).length}`,
  );
  reportLines.push(
    `- View files without direct API calls: ${rows.filter((r) => r.calls.length === 0).length}`,
  );
  reportLines.push(
    `- API calls with unresolved backend base path: ${unresolved.length}`,
  );
  reportLines.push(`- Duplicate route entries found: ${duplicates.length}`);
  reportLines.push("");

  reportLines.push("## Routed Page -> API Mapping");
  reportLines.push("");
  for (const row of rows) {
    reportLines.push(`### ${row.page}`);
    if (row.calls.length === 0) {
      reportLines.push("- No direct `api.*` call in page file");
      reportLines.push("");
      continue;
    }
    for (const call of row.calls) {
      reportLines.push(
        `- ${call.method} ${call.endpoint} | base: ${call.base || "-"} | backend-base-exists: ${call.exists ? "yes" : "no"}`,
      );
    }
    reportLines.push("");
  }

  reportLines.push("## Potential Mismatches");
  reportLines.push("");
  if (unresolved.length === 0) {
    reportLines.push(
      "- No unresolved backend base path from direct page API calls",
    );
  } else {
    for (const item of unresolved) {
      reportLines.push(`- ${item.page} -> ${item.method} ${item.endpoint}`);
    }
  }
  reportLines.push("");

  reportLines.push("## Duplicate Route Entries");
  reportLines.push("");
  if (duplicates.length === 0) {
    reportLines.push("- No duplicate route path/name detected");
  } else {
    for (const dup of duplicates) {
      reportLines.push(
        `- duplicate ${dup.type} \`${dup.value}\`: ${dup.first} and ${dup.second}`,
      );
    }
  }
  reportLines.push("");

  const reportPath = path.join(ROOT, "AUDIT_PAGE_API_REPORT.md");
  fs.writeFileSync(reportPath, reportLines.join("\n"));
  console.log(`Report written: ${reportPath}`);
}

main();
