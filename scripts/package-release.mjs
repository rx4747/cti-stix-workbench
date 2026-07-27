import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const releaseRoot = path.join(repositoryRoot, "dist", "release");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8"));
}

function releasePath(name) {
  const target = path.resolve(releaseRoot, name);
  if (path.dirname(target) !== releaseRoot) {
    throw new Error(`Unsafe release target: ${target}`);
  }
  return target;
}

async function resetReleaseDirectory(target) {
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
}

async function copyFromRepository(source, destination) {
  const sourcePath = path.resolve(repositoryRoot, source);
  const relativeSource = path.relative(repositoryRoot, sourcePath);
  if (relativeSource.startsWith(`..${path.sep}`) || path.isAbsolute(relativeSource)) {
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
  const packageJson = await readJson("package.json");
  const versions = await readJson("versions.json");

  if (!/^\d+\.\d+\.\d+$/u.test(manifest.version)) {
    throw new Error(`Obsidian release versions must use x.y.z: ${manifest.version}`);
  }
  if (packageJson.version !== manifest.version) {
    throw new Error("package.json and manifest.json versions are out of sync.");
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
    await copyFromRepository(filename, path.join(target, filename));
  }
  return target;
}

const requestedTarget = process.argv[2] ?? "plugin";
if (requestedTarget !== "plugin") {
  throw new Error("Usage: node scripts/package-release.mjs [plugin]");
}

const output = await packagePluginRelease();
console.log(`Packaged ${path.relative(repositoryRoot, output)}.`);
