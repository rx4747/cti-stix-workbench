import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const destination = path.join(repositoryRoot, ".obsidian/plugins/cti-stix-workbench");

await mkdir(destination, { recursive: true });
await Promise.all(
  ["main.js", "manifest.json", "styles.css"].map((filename) =>
    copyFile(path.join(repositoryRoot, filename), path.join(destination, filename)),
  ),
);

console.log(`Installed development plugin at ${destination}.`);
