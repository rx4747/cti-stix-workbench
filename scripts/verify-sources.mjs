import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const SOURCE_ROLES = new Set([
  "normative-specification",
  "validation-aid",
  "reference-implementation",
  "format-specification",
  "framework-api",
]);

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new TypeError("source manifest must be an object");
  }
  if (manifest.manifest_version !== 1) {
    throw new TypeError("manifest_version must be 1");
  }
  if (manifest.standard !== "STIX 2.1") {
    throw new TypeError("standard must be STIX 2.1");
  }
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
    throw new TypeError("sources must be a non-empty array");
  }

  const identifiers = new Set();
  for (const source of manifest.sources) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      throw new TypeError("each source must be an object");
    }
    assertNonEmptyString(source.id, "source.id");
    if (identifiers.has(source.id)) {
      throw new TypeError(`duplicate source id: ${source.id}`);
    }
    identifiers.add(source.id);

    if (!SOURCE_ROLES.has(source.role)) {
      throw new TypeError(`invalid source role for ${source.id}`);
    }
    assertNonEmptyString(source.version, `${source.id}.version`);
    assertNonEmptyString(source.url, `${source.id}.url`);
    if (!URL.canParse(source.url)) {
      throw new TypeError(`invalid source URL for ${source.id}`);
    }
    assertNonEmptyString(source.license?.name, `${source.id}.license.name`);
    assertNonEmptyString(source.license?.url, `${source.id}.license.url`);
    if (source.pin?.kind !== "sha256") {
      throw new TypeError(`unsupported pin kind for ${source.id}`);
    }
    if (
      typeof source.pin.value !== "string" ||
      !/^[a-f0-9]{64}$/u.test(source.pin.value)
    ) {
      throw new TypeError(`invalid SHA-256 pin for ${source.id}`);
    }
  }
}

export async function verifyRemoteSource(source, fetchImplementation = fetch) {
  const response = await fetchImplementation(source.url, {
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`unable to fetch ${source.id}: HTTP ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== source.pin.value) {
    throw new Error(
      `checksum mismatch for ${source.id}: expected ${source.pin.value}, received ${digest}`,
    );
  }
}

export async function readManifest(path) {
  const manifest = JSON.parse(await readFile(path, "utf8"));
  validateManifest(manifest);
  return manifest;
}

async function main() {
  const [, , manifestPath, mode] = process.argv;
  if (!manifestPath) {
    throw new Error("usage: node scripts/verify-sources.mjs <manifest> [--remote]");
  }
  const manifest = await readManifest(manifestPath);
  if (mode === "--remote") {
    await Promise.all(manifest.sources.map((source) => verifyRemoteSource(source)));
    console.log(`Verified ${manifest.sources.length} remote source checksums.`);
    return;
  }
  if (mode !== undefined) {
    throw new Error(`unknown option: ${mode}`);
  }
  console.log(`Validated ${manifest.sources.length} pinned source records offline.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
