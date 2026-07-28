import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { stringify } from "yaml";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = path.join(repositoryRoot, "tests/fixtures/oasis/apt1.json");
const outputRoot = path.join(repositoryRoot, "generated/vault-example/Generated Notes");
const contractPath = path.join(repositoryRoot, "standards/vault-example-manifest.json");

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function loadPlanner() {
  const result = await build({
    bundle: true,
    entryPoints: [path.join(repositoryRoot, "src/import/bundle-import.ts")],
    format: "esm",
    platform: "node",
    target: "node22",
    write: false,
  });
  const output = result.outputFiles?.[0]?.text;
  assert.ok(output !== undefined, "Could not bundle the Bundle import planner.");
  return import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
}

function noteContent(frontmatter, body) {
  return `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n\n${withFinalNewline(body)}`;
}

function withFinalNewline(value) {
  return `${value.replace(/\n+$/u, "")}\n`;
}

async function createArtifacts() {
  const source = await readFile(sourcePath, "utf8");
  const bundle = JSON.parse(source);
  const { planBundleImport } = await loadPlanner();
  const plan = planBundleImport(bundle);
  const artifacts = new Map();
  artifacts.set(plan.overviewPath, withFinalNewline(plan.overviewBody));
  for (const note of plan.notes) {
    artifacts.set(note.relativePath, noteContent(note.frontmatter, note.markdownBody));
  }
  const files = Object.fromEntries(
    [...artifacts]
      .map(([filename, content]) => [filename, digest(content)])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  const relationshipCount = bundle.objects.filter(
    (object) => object.type === "relationship",
  ).length;
  const manifest = {
    contract_version: 1,
    generator: "CTI STIX Workbench Bundle import planner",
    source: "tests/fixtures/oasis/apt1.json",
    source_sha256: digest(source),
    object_count: plan.objectCount,
    relationship_count: relationshipCount,
    files,
  };
  return { artifacts, manifest };
}

async function writeArtifacts(artifacts, manifest) {
  const generatedRoot = path.join(repositoryRoot, "generated");
  assert.ok(
    outputRoot.startsWith(`${generatedRoot}${path.sep}`),
    "Generated example output must stay inside generated/.",
  );
  await rm(outputRoot, { recursive: true, force: true });
  for (const [filename, content] of artifacts) {
    const outputPath = path.join(outputRoot, filename);
    assert.ok(outputPath.startsWith(`${outputRoot}${path.sep}`));
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content, "utf8");
  }
  await writeFile(
    path.join(outputRoot, ".generated-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

const { artifacts, manifest } = await createArtifacts();
const mode = process.argv[2];
if (mode === "--check") {
  const expected = JSON.parse(await readFile(contractPath, "utf8"));
  assert.deepEqual(manifest, expected, "Generated APT1 note contract is stale.");
  console.log(
    `Verified ${manifest.object_count} generated APT1 notes and ${manifest.relationship_count} relationships.`,
  );
} else if (mode === "--update-contract") {
  await writeFile(contractPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Updated ${path.relative(repositoryRoot, contractPath)}.`);
} else if (mode === undefined) {
  await writeArtifacts(artifacts, manifest);
  console.log(
    `Generated ${artifacts.size} files under ${path.relative(repositoryRoot, outputRoot)}.`,
  );
} else {
  throw new TypeError(
    "Usage: node scripts/generate-vault-example.mjs [--check|--update-contract]",
  );
}
