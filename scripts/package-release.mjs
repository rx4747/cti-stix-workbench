import {
  cp,
  mkdir,
  readFile,
  rm,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const releaseRoot = path.join(repositoryRoot, "dist", "release");

async function readJson(relativePath) {
  return JSON.parse(
    await readFile(path.join(repositoryRoot, relativePath), "utf8"),
  );
}

function releasePath(name) {
  const target = path.resolve(releaseRoot, name);
  if (path.dirname(target) !== releaseRoot) {
    throw new Error(`Unsafe release target: ${target}`);
  }
  return target;
}

function releaseDestination(root, relativePath) {
  const destination = path.resolve(root, relativePath);
  const relativeDestination = path.relative(root, destination);
  if (
    relativeDestination.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeDestination)
  ) {
    throw new Error(`Release destination escapes output: ${relativePath}`);
  }
  return destination;
}

async function resetReleaseDirectory(target) {
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
}

async function copyFromRepository(source, destination) {
  const sourcePath = path.resolve(repositoryRoot, source);
  const relativeSource = path.relative(repositoryRoot, sourcePath);
  if (
    relativeSource.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeSource)
  ) {
    throw new Error(`Release source escapes repository: ${source}`);
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(sourcePath, destination, {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
}

async function releaseMetadata() {
  const manifest = await readJson("manifest.json");
  const packageManifest = await readJson(
    "packages/cti-stix-workbench/manifest.json",
  );
  const packageJson = await readJson(
    "packages/cti-stix-workbench/package.json",
  );
  const versions = await readJson("versions.json");
  const packageVersions = await readJson(
    "packages/cti-stix-workbench/versions.json",
  );

  if (!/^\d+\.\d+\.\d+$/u.test(manifest.version)) {
    throw new Error(
      `Obsidian release versions must use x.y.z: ${manifest.version}`,
    );
  }
  if (
    JSON.stringify(manifest) !== JSON.stringify(packageManifest)
    || JSON.stringify(versions) !== JSON.stringify(packageVersions)
    || packageJson.version !== manifest.version
  ) {
    throw new Error("Root and package plugin metadata are out of sync.");
  }
  if (versions[manifest.version] !== manifest.minAppVersion) {
    throw new Error("versions.json does not cover the release version.");
  }
  return manifest;
}

export async function packagePluginRelease() {
  const manifest = await releaseMetadata();
  const target = releasePath(`cti-stix-workbench-${manifest.version}`);
  await resetReleaseDirectory(target);

  for (const filename of ["main.js", "manifest.json", "styles.css"]) {
    await copyFromRepository(
      `packages/cti-stix-workbench/${filename}`,
      path.join(target, filename),
    );
  }
  return target;
}

export async function packageVaultRelease() {
  const manifest = await releaseMetadata();
  const target = releasePath(
    `cti-investigation-vault-${manifest.version}`,
  );
  const files = await readJson("distribution/vault-template/files.json");
  await resetReleaseDirectory(target);

  for (const releaseFile of files.releaseFiles) {
    await copyFromRepository(
      releaseFile.source,
      releaseDestination(target, releaseFile.destination),
    );
  }

  for (const relativePath of [
    ...files.obsidianConfig,
    ...files.content,
  ]) {
    await copyFromRepository(
      relativePath,
      releaseDestination(target, relativePath),
    );
  }
  return target;
}

const requestedTarget = process.argv[2] ?? "all";
if (!["all", "plugin", "vault"].includes(requestedTarget)) {
  throw new Error("Usage: node scripts/package-release.mjs [plugin|vault]");
}

const outputs = [];
if (requestedTarget === "all" || requestedTarget === "plugin") {
  outputs.push(await packagePluginRelease());
}
if (requestedTarget === "all" || requestedTarget === "vault") {
  outputs.push(await packageVaultRelease());
}

for (const output of outputs) {
  console.log(`Packaged ${path.relative(repositoryRoot, output)}.`);
}
