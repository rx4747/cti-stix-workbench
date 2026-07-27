import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateReleaseVersion } from "./check-release-version.mjs";

const bumpIndexes = Object.freeze({
  major: 0,
  minor: 1,
  patch: 2,
});

export function incrementVersion(version, bump) {
  assert.match(version, /^\d+\.\d+\.\d+$/u, "Current version must use x.y.z.");
  assert.ok(
    Object.hasOwn(bumpIndexes, bump),
    "Version bump must be patch, minor, or major.",
  );
  const parts = version.split(".").map(Number);
  const bumpIndex = bumpIndexes[bump];
  parts[bumpIndex] += 1;
  for (let index = bumpIndex + 1; index < parts.length; index += 1) {
    parts[index] = 0;
  }
  return parts.join(".");
}

export function promoteUnreleasedNotes({ changelog, date, version }) {
  assert.match(date, /^\d{4}-\d{2}-\d{2}$/u, "Release date must use YYYY-MM-DD.");
  const lines = changelog.split(/\r?\n/u);
  const unreleasedIndexes = lines
    .map((line, index) => (line === "## Unreleased" ? index : -1))
    .filter((index) => index !== -1);
  const releasedIndexes = lines
    .map((line, index) => (line === "## Released" ? index : -1))
    .filter((index) => index !== -1);
  assert.equal(
    unreleasedIndexes.length,
    1,
    "CHANGELOG.md must contain one ## Unreleased section.",
  );
  assert.equal(
    releasedIndexes.length,
    1,
    "CHANGELOG.md must contain one ## Released section.",
  );

  const unreleasedIndex = unreleasedIndexes[0];
  const releasedIndex = releasedIndexes[0];
  assert.ok(
    unreleasedIndex < releasedIndex,
    "## Unreleased must appear before ## Released.",
  );
  const notes = lines
    .slice(unreleasedIndex + 1, releasedIndex)
    .join("\n")
    .trim();
  assert.notEqual(notes, "", "## Unreleased must contain non-empty release notes.");

  const beforeUnreleased = lines.slice(0, unreleasedIndex);
  const releasedHistory = lines.slice(releasedIndex + 1);
  while (releasedHistory[0] === "") releasedHistory.shift();
  return [
    ...beforeUnreleased,
    "## Unreleased",
    "",
    "## Released",
    "",
    `## ${version} — ${date}`,
    "",
    notes,
    "",
    ...releasedHistory,
  ]
    .join("\n")
    .replace(/\n*$/u, "\n");
}

export function prepareRelease({
  bump,
  changelog,
  date,
  manifest,
  packageJson,
  versions,
}) {
  validateReleaseVersion({
    tag: manifest.version,
    manifest,
    packageJson,
    versions,
  });
  const version = incrementVersion(manifest.version, bump);
  assert.equal(
    versions[version],
    undefined,
    `versions.json already contains ${version}.`,
  );
  return {
    changelog: promoteUnreleasedNotes({ changelog, date, version }),
    manifest: { ...manifest, version },
    packageJson: { ...packageJson, version },
    version,
    versions: {
      ...versions,
      [version]: manifest.minAppVersion,
    },
  };
}

async function readJson(repositoryRoot, filename) {
  return JSON.parse(await readFile(path.join(repositoryRoot, filename), "utf8"));
}

async function main() {
  const [bump, date = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
  assert.notEqual(
    bump,
    undefined,
    "Usage: pnpm release:bump -- <patch|minor|major> [YYYY-MM-DD].",
  );
  const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
  const [changelog, manifest, packageJson, versions] = await Promise.all([
    readFile(path.join(repositoryRoot, "CHANGELOG.md"), "utf8"),
    readJson(repositoryRoot, "manifest.json"),
    readJson(repositoryRoot, "package.json"),
    readJson(repositoryRoot, "versions.json"),
  ]);
  const release = prepareRelease({
    bump,
    changelog,
    date,
    manifest,
    packageJson,
    versions,
  });
  await Promise.all([
    writeFile(path.join(repositoryRoot, "CHANGELOG.md"), release.changelog, "utf8"),
    writeFile(
      path.join(repositoryRoot, "manifest.json"),
      `${JSON.stringify(release.manifest, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(repositoryRoot, "package.json"),
      `${JSON.stringify(release.packageJson, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(repositoryRoot, "versions.json"),
      `${JSON.stringify(release.versions, null, 2)}\n`,
      "utf8",
    ),
  ]);
  console.log(release.version);
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
