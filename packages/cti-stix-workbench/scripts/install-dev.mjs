import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const repositoryRoot = path.resolve(packageRoot, "../..");
const destination = path.join(
  repositoryRoot,
  ".obsidian/plugins/cti-stix-workbench",
);

await mkdir(destination, { recursive: true });
await Promise.all(
  ["main.js", "manifest.json", "styles.css"].map((filename) =>
    copyFile(
      path.join(packageRoot, filename),
      path.join(destination, filename),
    ),
  ),
);

console.log(`Installed development plugin at ${destination}.`);
