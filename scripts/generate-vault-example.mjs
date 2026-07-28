import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { stringify } from "yaml";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = path.join(repositoryRoot, "tests/fixtures/oasis/apt1.json");
const outputBase = path.join(repositoryRoot, "generated/vault-example");
const outputRoot = path.join(outputBase, "Generated Notes");
const canvasFilename = "APT1 Investigation.canvas";
const contractPath = path.join(repositoryRoot, "standards/vault-example-manifest.json");

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function loadGenerators() {
  const result = await build({
    bundle: true,
    stdin: {
      contents: `
        import { generateCanvasDocument } from ${JSON.stringify(path.join(repositoryRoot, "src/canvas/generator.ts"))};
        import { planBundleImport } from ${JSON.stringify(path.join(repositoryRoot, "src/import/bundle-import.ts"))};
        import { buildStixViewerModel } from ${JSON.stringify(path.join(repositoryRoot, "src/viewer/model.ts"))};
        export function generateVaultExample(bundle) {
          const plan = planBundleImport(bundle);
          const prefix = "Examples/OASIS APT1/Generated Notes/";
          const notePathById = new Map(plan.notes.map((note) => [note.object.id, prefix + note.relativePath]));
          const canvas = generateCanvasDocument(buildStixViewerModel(bundle, notePathById));
          return { plan, canvas };
        }
      `,
      resolveDir: repositoryRoot,
      sourcefile: "vault-example-generator.ts",
    },
    format: "esm",
    platform: "node",
    target: "node22",
    write: false,
  });
  const output = result.outputFiles?.[0]?.text;
  assert.ok(output !== undefined, "Could not bundle the vault example generators.");
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
  const { generateVaultExample } = await loadGenerators();
  const { plan, canvas } = generateVaultExample(bundle);
  const canvasContent = `${JSON.stringify(canvas, null, 2)}\n`;
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
    canvas: {
      file: canvasFilename,
      sha256: digest(canvasContent),
      node_count: canvas.nodes.length,
      edge_count: canvas.edges.length,
    },
    files,
  };
  return { artifacts, canvasContent, manifest };
}

async function writeArtifacts(artifacts, canvasContent, manifest) {
  const generatedRoot = path.join(repositoryRoot, "generated");
  assert.ok(
    outputRoot.startsWith(`${generatedRoot}${path.sep}`),
    "Generated example output must stay inside generated/.",
  );
  await rm(outputBase, { recursive: true, force: true });
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
  await writeFile(path.join(outputBase, canvasFilename), canvasContent, "utf8");
}

const { artifacts, canvasContent, manifest } = await createArtifacts();
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
  await writeArtifacts(artifacts, canvasContent, manifest);
  console.log(
    `Generated ${artifacts.size} notes and ${canvasFilename} under ${path.relative(repositoryRoot, outputBase)}.`,
  );
} else {
  throw new TypeError(
    "Usage: node scripts/generate-vault-example.mjs [--check|--update-contract]",
  );
}
