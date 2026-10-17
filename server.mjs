import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const i = process.argv.indexOf("--port");
const port = Number(i > -1 ? process.argv[i + 1] : process.env.PORT || 8080);
const root = path.resolve("dist");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".webp": "image/webp", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent((req.url || "/").split("?")[0]));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = fs.existsSync(path.join(p, "index.html")) ? path.join(p, "index.html") : path.join(root, "index.html");
  res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(port, "0.0.0.0", () => console.log("listening on " + port));
