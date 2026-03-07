#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VIEWS_DIR = path.join(ROOT, "client", "src", "views");

function walkFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.name.endsWith(".vue")) out.push(fullPath);
    }
  }
  return out;
}

function extractHandlers(template) {
  const handlers = new Set();
  const regex = /@[\w:-]+\s*=\s*"([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(|\")/g;
  let match;
  while ((match = regex.exec(template)) !== null) {
    handlers.add(match[1]);
  }
  return handlers;
}

function handlerDefined(script, handler) {
  const patterns = [
    new RegExp(`\\bfunction\\s+${handler}\\b`),
    new RegExp(`\\bconst\\s+${handler}\\s*=`),
    new RegExp(`\\blet\\s+${handler}\\s*=`),
    new RegExp(`\\b${handler}\\s*:\\s*function\\b`),
    new RegExp(`\\b${handler}\\s*\\(`),
    new RegExp(`\\b${handler}\\b`),
  ];
  return patterns.some((p) => p.test(script));
}

const files = walkFiles(VIEWS_DIR);
const missing = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  if (!templateMatch) continue;
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const script = scriptMatch ? scriptMatch[1] : "";

  const handlers = extractHandlers(templateMatch[1]);
  for (const handler of handlers) {
    if (!handlerDefined(script, handler)) {
      missing.push({ file: path.relative(ROOT, filePath), handler });
    }
  }
}

if (missing.length > 0) {
  console.error(
    `Event audit failed: ${missing.length} potential missing handlers`,
  );
  for (const issue of missing.slice(0, 30)) {
    console.error(`- ${issue.file}: ${issue.handler}`);
  }
  process.exit(1);
}

console.log(
  `Event audit passed: ${files.length} Vue files scanned, no missing handlers`,
);
