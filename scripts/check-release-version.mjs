import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export function validateReleaseVersion({ tag, manifest, versions }) {
  assert.match(
    tag,
    /^\d+\.\d+\.\d+$/u,
    "Release tag must be a semantic version without a v prefix.",
  );
  assert.equal(
    tag,
    manifest.version,
    `Release tag ${tag} does not match manifest version ${manifest.version}.`,
  );
  assert.equal(
    versions[tag],
    manifest.minAppVersion,
    `versions.json does not map ${tag} to ${manifest.minAppVersion}.`,
  );
  assert.equal(
    typeof manifest.id,
    "string",
    "manifest.json must define a plugin id.",
  );

  return {
    pluginId: manifest.id,
    version: tag,
  };
}

async function main() {
  const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
  const tag = process.env.RELEASE_TAG;
  assert.notEqual(tag, undefined, "RELEASE_TAG must be set.");
  const [manifest, versions] = await Promise.all(
    ["manifest.json", "versions.json"].map(async (filename) =>
      JSON.parse(
        await readFile(path.join(repositoryRoot, filename), "utf8"),
      )
    ),
  );
  const release = validateReleaseVersion({ tag, manifest, versions });
  console.log(
    `Validated release ${release.pluginId} ${release.version}.`,
  );
}

if (
  process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
