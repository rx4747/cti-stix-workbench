import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = path.join(root, "src");
const sourceFiles = (await readdir(sourceRoot, { recursive: true })).filter((name) =>
  name.endsWith(".ts"),
);
const forbidden = [
  /\bfetch\s*\(/u,
  /\bXMLHttpRequest\b/u,
  /\bWebSocket\b/u,
  /\bsendBeacon\b/u,
  /\.innerHTML\s*=/u,
  /\.outerHTML\s*=/u,
  /\.insertAdjacentHTML\s*\(/u,
];
for (const filename of sourceFiles) {
  const source = await readFile(path.join(sourceRoot, filename), "utf8");
  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern, `${filename} violates the runtime boundary`);
  }
}
const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
assert.equal(manifest.isDesktopOnly, true, "v1 must declare its desktop-only boundary");
console.log(`Runtime security boundary passed for ${sourceFiles.length} source files.`);
