#!/usr/bin/env node
/* ============================================================
   Zero-dependency static file server for local preview.
   Node is on PATH with the same name on macOS, Windows and Linux,
   so this replaces `python -m http.server` (which breaks on Macs
   where the command is `python3`, not `python`). No npm install,
   no dependencies — Node built-ins only.

   Usage (run from the repo root):
     node tools/serve.js [port] [rootDir]
       port     default 8097
       rootDir  default "." (the repo root). Pass ".." to simulate
                GitHub-Pages subpath hosting at /Stats-Site-V1/.

   Behavior mirrors `python -m http.server`: a directory request
   serves its index.html, and a directory without a trailing slash
   301-redirects to add one (so lessons' ../../ relative links
   resolve exactly as they do on GitHub Pages).
   ============================================================ */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = parseInt(process.argv[2], 10) || 8097;
const root = path.resolve(process.cwd(), process.argv[3] || ".");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json"
};

function send(res, code, body, type) {
  res.writeHead(code, { "Content-Type": type || "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(body);
}

http.createServer(function (req, res) {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split("?")[0]); }
  catch (e) { return send(res, 400, "Bad request"); }

  let filePath = path.join(root, urlPath);
  // block path traversal outside the served root
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return send(res, 403, "Forbidden");

  fs.stat(filePath, function (err, st) {
    if (!err && st.isDirectory()) {
      if (!urlPath.endsWith("/")) {                       // add trailing slash → relative links resolve
        res.writeHead(301, { Location: urlPath + "/" });
        return res.end();
      }
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath, function (e, buf) {
      if (e) return send(res, 404, "<h1>404 Not Found</h1><p>" + urlPath + "</p>");
      send(res, 200, buf, TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    });
  });
}).listen(port, function () {
  console.log("serving " + root + " at http://localhost:" + port + "/");
});
