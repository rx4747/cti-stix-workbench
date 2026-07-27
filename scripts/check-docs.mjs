import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const markdownFiles = (await readdir(root, { recursive: true }))
  .filter((name) => name.endsWith(".md"))
  .filter(
    (name) =>
      !name.startsWith("node_modules/") &&
      !name.startsWith("standards/vendor/") &&
      !name.startsWith("generated/"),
  );
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/gu;
let checked = 0;
for (const filename of markdownFiles) {
  const source = await readFile(path.join(root, filename), "utf8");
  for (const match of source.matchAll(linkPattern)) {
    const target = match[1]?.trim();
    if (
      target === undefined ||
      target.startsWith("#") ||
      /^[a-z][a-z0-9+.-]*:/iu.test(target)
    ) {
      continue;
    }
    const decoded = decodeURIComponent(target.split("#", 1)[0]);
    assert.notEqual(decoded, "", `${filename} contains an empty local link.`);
    await access(path.resolve(path.dirname(path.join(root, filename)), decoded));
    checked += 1;
  }
}
console.log(`Documentation links are valid: ${checked} local target(s) checked.`);
