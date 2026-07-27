import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function extractReleaseNotes({ changelog, version }) {
  assert.match(
    version,
    /^\d+\.\d+\.\d+$/u,
    "Release notes require a numeric x.y.z version.",
  );

  const lines = changelog.split(/\r?\n/u);
  const headingPrefix = `## ${version}`;
  const matchingHeadings = lines
    .map((line, index) => ({ index, line }))
    .filter(
      ({ line }) => line === headingPrefix || line.startsWith(`${headingPrefix} — `),
    );
  assert.equal(
    matchingHeadings.length,
    1,
    `CHANGELOG.md must contain exactly one ${headingPrefix} release section.`,
  );

  const start = matchingHeadings[0].index + 1;
  const nextHeadingOffset = lines
    .slice(start)
    .findIndex((line) => /^##\s+/u.test(line));
  const end = nextHeadingOffset === -1 ? lines.length : start + nextHeadingOffset;
  const notes = lines.slice(start, end).join("\n").trim();
  assert.notEqual(notes, "", `${headingPrefix} must contain non-empty release notes.`);
  return `${notes}\n`;
}

async function main() {
  const [version, outputPath] = process.argv.slice(2);
  assert.notEqual(
    version,
    undefined,
    "Usage: extract-release-notes <version> <output>.",
  );
  assert.notEqual(
    outputPath,
    undefined,
    "Usage: extract-release-notes <version> <output>.",
  );
  const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
  const changelog = await readFile(path.join(repositoryRoot, "CHANGELOG.md"), "utf8");
  await writeFile(
    path.resolve(outputPath),
    extractReleaseNotes({ changelog, version }),
    "utf8",
  );
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
