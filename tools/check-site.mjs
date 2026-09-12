import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const files = [
  "index.html",
  "app.js",
  "projects.js",
  "sculpture.js",
  "styles.css",
];
async function walk(dir) {
  for (const name of await readdir(resolve(root, dir))) {
    const path = dir + "/" + name;
    const info = await stat(resolve(root, path));
    if (info.isDirectory()) await walk(path);
    else if (/\.(html|js|css)$/.test(name)) files.push(path);
  }
}
await walk("labs");
let checked = 0;
for (const file of files) {
  const source = await readFile(resolve(root, file), "utf8");
  const refs = [
    ...source.matchAll(/(?:src|href)=["']([^"']+)["']/g),
    ...source.matchAll(/(?:from\s+|import\s*\()["'](\.[^"']+)["']/g),
  ].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|data:|#|\$)/.test(ref) || ref.includes("${"))
      continue;
    let path = ref.split(/[?#]/)[0];
    if (!path) continue;
    if (path.endsWith("/")) path += "index.html";
    try {
      await stat(resolve(dirname(resolve(root, file)), path));
      checked++;
    } catch {
      throw Error(`Missing local reference: ${file} -> ${ref}`);
    }
  }
}
console.log(
  `Static site ready: ${files.length} source files, ${checked} local references checked.`,
);
