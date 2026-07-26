import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  lstat,
  readdir,
  readFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(repositoryRoot, "manifest.json"), "utf8"),
);
const releaseRoot = path.join(
  repositoryRoot,
  "dist",
  "release",
  `cti-stix-workbench-${manifest.version}`,
);

const entries = await readdir(releaseRoot, { withFileTypes: true });
const filenames = entries.map((entry) => entry.name).sort();
assert.deepEqual(filenames, ["main.js", "manifest.json", "styles.css"]);

for (const entry of entries) {
  const stats = await lstat(path.join(releaseRoot, entry.name));
  assert.equal(stats.isFile(), true, `${entry.name} must be a regular file`);
  assert.equal(
    stats.isSymbolicLink(),
    false,
    `${entry.name} must not be a symlink`,
  );
}

assert.deepEqual(
  JSON.parse(
    await readFile(path.join(releaseRoot, "manifest.json"), "utf8"),
  ),
  manifest,
);
const mainBundle = await readFile(path.join(releaseRoot, "main.js"));
assert.ok(mainBundle.byteLength > 0, "main.js must not be empty");
assert.doesNotMatch(
  mainBundle.toString("utf8", 0, 4_096),
  /sourceMappingURL/u,
  "release main.js must not contain an inline source map",
);

console.log(`Release check passed for ${manifest.id} ${manifest.version}.`);
for (const filename of filenames) {
  const bytes = await readFile(path.join(releaseRoot, filename));
  console.log(
    `${createHash("sha256").update(bytes).digest("hex")}  ${filename}`,
  );
}
