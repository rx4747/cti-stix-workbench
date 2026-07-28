import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = path.join(repositoryRoot, "standards/analyst-workflows.json");
const manifestPath = path.join(
  repositoryRoot,
  "standards/analyst-workflow-manifest.json",
);
const check = process.argv.includes("--check");

function validateLibrary(value) {
  assert.equal(value.schemaVersion, 1, "Unsupported analyst workflow schema.");
  assert.match(value.libraryVersion, /^\d+\.\d+\.\d+$/u);
  assert.ok(Array.isArray(value.workflows));
  const ids = new Set();
  const titles = new Set();
  for (const workflow of value.workflows) {
    assert.match(workflow.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
    assert.ok(!ids.has(workflow.id), `Duplicate workflow id: ${workflow.id}`);
    assert.ok(
      !titles.has(workflow.title),
      `Duplicate workflow title: ${workflow.title}`,
    );
    ids.add(workflow.id);
    titles.add(workflow.title);
    assert.equal(typeof workflow.title, "string");
    assert.equal(typeof workflow.description, "string");
    assert.match(workflow.introducedIn, /^\d+\.\d+\.\d+$/u);
    assert.ok(["02 Investigations", "04 Reports"].includes(workflow.defaultFolder));
    assert.ok(Array.isArray(workflow.body));
    assert.ok(workflow.body.length > 0);
    assert.ok(workflow.body.every((line) => typeof line === "string"));
  }
}

function frontmatter(workflow) {
  return [
    "---",
    "stix_type: note",
    "stix_id:",
    'spec_version: "2.1"',
    "created_by_ref:",
    "labels:",
    `  - ${workflow.id}`,
    "created:",
    "modified:",
    "revoked:",
    "confidence: 50",
    "lang: en",
    `abstract: ${JSON.stringify(workflow.description)}`,
    "# Required Note property: uncomment and add at least one typed STIX note.",
    "# object_refs:",
    '#   - "[[Typed STIX object]]"',
    "---",
  ];
}

export function renderVaultTemplate(workflow) {
  return [
    ...frontmatter(workflow),
    "",
    "# {{title}}",
    "",
    ...workflow.body,
    "",
    "## Related notes",
    "",
    "-",
    "",
    "## Relationships",
    "",
    "-",
    "",
  ].join("\n");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function writeOrCheck(filename, content) {
  if (check) {
    assert.equal(
      await readFile(filename, "utf8"),
      content,
      `${path.relative(repositoryRoot, filename)} is stale.`,
    );
    return;
  }
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, content, "utf8");
}

const library = JSON.parse(await readFile(sourcePath, "utf8"));
validateLibrary(library);
const files = {};
for (const workflow of library.workflows) {
  const relativePath = `Templates/CTI Workflows/${workflow.title}.md`;
  const content = renderVaultTemplate(workflow);
  files[relativePath] = sha256(content);
  await writeOrCheck(
    path.join(repositoryRoot, "generated/analyst-workflows", relativePath),
    content,
  );
}
await writeOrCheck(
  manifestPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      libraryVersion: library.libraryVersion,
      workflowCount: library.workflows.length,
      files,
    },
    null,
    2,
  )}\n`,
);
