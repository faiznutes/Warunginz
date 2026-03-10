#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "client", "dist");
const args = process.argv.slice(2);
const portArgIndex = args.findIndex((arg) => arg === "--port");
const port = Number(process.env.CLIENT_DIST_PORT || (portArgIndex >= 0 ? args[portArgIndex + 1] : "4173"));
const host = process.env.CLIENT_DIST_HOST || "127.0.0.1";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(statusCode, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

function resolveRequestPath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split("?")[0]).replace(/\\/g, "/");
  const normalized = safePath === "/" ? "/index.html" : safePath;
  const absolute = path.join(DIST, normalized);
  if (!absolute.startsWith(DIST)) {
    return null;
  }
  return absolute;
}

const server = http.createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method || "GET")) {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  const resolvedPath = resolveRequestPath(req.url || "/");
  if (!resolvedPath) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  const hasExtension = path.extname(resolvedPath).length > 0;
  let filePath = resolvedPath;

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    if (req.method === "HEAD") {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end();
      return;
    }
    sendFile(res, filePath);
    return;
  }

  if (hasExtension) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  const fallback = path.join(DIST, "index.html");
  if (!fs.existsSync(fallback)) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Built client not found");
    return;
  }

  if (req.method === "HEAD") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end();
    return;
  }

  sendFile(res, fallback);
});

server.listen(port, host, () => {
  console.log(`Client dist server running at http://${host}:${port}`);
});
