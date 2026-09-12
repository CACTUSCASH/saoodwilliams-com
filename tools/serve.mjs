import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
http
  .createServer(async (req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405);
        res.end();
        return;
      }
      const path = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (path.split("/").some((p) => p.startsWith("."))) {
        res.writeHead(404);
        res.end();
        return;
      }
      const filename = resolve(
        root,
        "." + path + (path.endsWith("/") ? "index.html" : ""),
      );
      if (!filename.startsWith(root.endsWith(sep) ? root : root + sep)) {
        res.writeHead(404);
        res.end();
        return;
      }
      const data = await readFile(filename);
      res.writeHead(200, {
        "Content-Type": types[extname(filename)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(Number(process.env.PORT || 4180), "127.0.0.1", () =>
    console.log(`Portfolio: http://127.0.0.1:${process.env.PORT || 4180}`),
  );
