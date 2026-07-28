import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8"));
}

const catalog = await readJson("standards/catalog/stix-2.1.json");
const evidence = await readJson("standards/conformance-evidence.json");

assert.equal(catalog.catalogVersion, 1);
assert.equal(catalog.standard, "STIX 2.1");
assert.equal(catalog.definitions.length, 55);
assert.equal(new Set(catalog.definitions.map((item) => item.type)).size, 55);

const generatedCatalog = `// GENERATED FILE. Do not edit directly.\nimport type { StixCatalogData } from "./types";\n\nexport const STIX_2_1_CATALOG_DATA = ${JSON.stringify(catalog, null, 2)} as const satisfies StixCatalogData;\n`;

function capability(value) {
  const [status, ...details] = value;
  if (!evidence.capability_states.includes(status)) {
    throw new Error(`Unsupported conformance status: ${status}`);
  }
  const fileEvidence = details.filter(
    (item) => typeof item === "string" && !item.includes(" "),
  );
  return {
    status,
    evidence: fileEvidence,
    ...(details.length > 0 && fileEvidence.length === 0
      ? { rationale: details.join(" ") }
      : {}),
  };
}

const coverageRows = catalog.definitions.map((definition) => {
  const defaults = evidence.defaults[definition.family];
  const overrides = evidence.overrides[definition.type] ?? {};
  if (defaults === undefined) {
    throw new Error(`Missing evidence defaults for ${definition.family}.`);
  }
  const capabilities = Object.fromEntries(
    ["template", "authoring", "validation", "mapping", "fixture"].map((key) => [
      key,
      capability(overrides[key] ?? defaults[key]),
    ]),
  );
  return {
    id: definition.type,
    title: definition.title,
    family: definition.family,
    spec_section: definition.citation.section,
    spec_url: definition.citation.url,
    capabilities,
  };
});

const coverage = `${JSON.stringify(
  {
    contract_version: 2,
    standard: "STIX 2.1 Errata 01",
    generated_from: [
      "standards/catalog/stix-2.1.json",
      "standards/conformance-evidence.json",
    ],
    rows: coverageRows,
  },
  null,
  2,
)}\n`;

function yamlScalar(field, definition) {
  if (field.name === "type") return undefined;
  if (field.name === "id") return undefined;
  if (field.name === "spec_version") return '"2.1"';
  if (field.name === "name") return '"{{title}}"';
  if (field.name === "pattern" && definition.type === "indicator") {
    return "\"[ipv4-addr:value = '203.0.113.10']\"";
  }
  if (field.name === "pattern_type" && definition.type === "indicator") {
    return "stix";
  }
  if (field.name === "relationship_type" && definition.type === "relationship") {
    return "related-to";
  }
  if (field.dataType.startsWith("array<")) return "[]";
  if (field.dataType === "object") return "{}";
  return "";
}

function nestedComment(field, indent = "#   ") {
  if (field.children === undefined || field.children.length === 0) return [];
  return [
    `# ${field.name} nested fields:`,
    ...field.children.flatMap((child) => [
      `${indent}${child.name}:${
        child.dataType.startsWith("array<")
          ? " []"
          : child.dataType === "object"
            ? " {}"
            : ""
      }`,
    ]),
  ];
}

function optionalFieldComments(definition, prefix = "# Optional properties") {
  const optional = definition.fields
    .filter(
      (field) =>
        !field.required &&
        !["content", "description", "explanation"].includes(field.name),
    )
    .map((field) => field.name);
  return optional.length === 0 ? [] : [`${prefix}: ${optional.join(", ")}`];
}

function templateBody(definition) {
  const mapped = new Map([
    ["description", "Summary"],
    ["content", "Content"],
    ["explanation", "Explanation"],
  ]);
  const sections = definition.fields
    .flatMap((field) => (mapped.has(field.name) ? [mapped.get(field.name)] : []))
    .map((heading) => `## ${heading}`);
  return [
    ...sections,
    "## Relationships\n\n-",
    "## Analysis\n\nSeparate observed facts, interpretation, assumptions, confidence rationale, and sources.",
    "## Sources\n\n-",
  ].join("\n\n");
}

function templateFor(definition, extension) {
  const frontmatter = [`stix_type: ${definition.type}`, "stix_id:"];
  for (const field of definition.fields) {
    if (!field.required && !(field.name === "extensions" && extension !== undefined)) {
      continue;
    }
    const value = yamlScalar(field, definition);
    if (value === undefined) continue;
    if (field.name === "extensions" && extension !== undefined) {
      frontmatter.push("extensions:", `  ${extension.type}:`);
      for (const child of extension.fields.filter((candidate) => candidate.required)) {
        const childValue = yamlScalar(child, extension);
        frontmatter.push(
          `    ${child.name}:${childValue === "" ? "" : ` ${childValue}`}`,
        );
        frontmatter.push(...nestedComment(child).map((line) => `    ${line}`));
      }
      frontmatter.push(
        ...optionalFieldComments(
          extension,
          `# Optional ${extension.type} properties`,
        ).map((line) => `  ${line}`),
      );
      continue;
    }
    frontmatter.push(`${field.name}:${value === "" ? "" : ` ${value}`}`);
    frontmatter.push(...nestedComment(field));
  }
  frontmatter.push(...optionalFieldComments(definition));
  const required = definition.fields
    .filter((field) => field.required)
    .map((field) => `\`${field.name}\``);
  return `---\n${frontmatter.join("\n")}\n---\n\n<!-- Generated by CTI STIX Workbench. Edit the catalog generator, not this file. -->\n\n# {{title}}\n\n> [!info] ${definition.title}\n> ${definition.citation.section}. Required properties: ${required.length === 0 ? "none beyond common properties" : required.join(", ")}.\n> Reference fields accept wiki links to typed STIX notes and export as their \`stix_id\` values.\n\n${templateBody(definition)}\n`;
}

const folders = {
  sdo: "SDOs",
  sro: "SROs",
  sco: "SCOs",
  smo: "Meta Objects",
};
const titleByType = new Map(catalog.definitions.map((item) => [item.type, item.title]));
const templates = new Map();
for (const definition of catalog.definitions) {
  const folder = folders[definition.family];
  if (folder !== undefined) {
    templates.set(`${folder}/${definition.title}.md`, templateFor(definition));
  }
}
for (const extension of catalog.definitions.filter(
  (item) => item.family === "predefined-extension",
)) {
  const parent = catalog.definitions.find(
    (item) => item.type === extension.extensionOf,
  );
  if (parent === undefined) throw new Error(`Missing parent for ${extension.type}.`);
  templates.set(
    `SCO Extensions/${titleByType.get(parent.type)} - ${extension.title}.md`,
    templateFor(parent, extension),
  );
}
assert.equal(templates.size, 54);

const templateFiles = [...templates.entries()].map(([relativePath, content]) => ({
  path: `Templates/STIX 2.1/${relativePath}`,
  sha256: createHash("sha256").update(content).digest("hex"),
}));
const templateManifest = `${JSON.stringify(
  {
    manifest_version: 1,
    catalog_version: catalog.catalogVersion,
    standard: `${catalog.standard} ${catalog.conformanceBaseline}`,
    files: templateFiles,
  },
  null,
  2,
)}\n`;

function coverageMarkdown() {
  const rows = coverageRows.map((row) => {
    const statuses = ["template", "authoring", "validation", "mapping", "fixture"]
      .map((key) => row.capabilities[key].status)
      .join(" | ");
    return `| ${row.title} | ${row.family} | ${statuses} |`;
  });
  return `# STIX 2.1 Compatibility\n\nGenerated from the pinned catalog and conformance evidence. Only \`verified\` capabilities are release-green.\n\n| Type | Family | Template | Authoring | Validation | Mapping | Fixture |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`;
}

const committedOutputs = new Map([
  ["src/catalog/stix-2.1.generated.ts", generatedCatalog],
  ["standards/stix-2.1-coverage.json", coverage],
  ["standards/vault-template-manifest.json", templateManifest],
  ["docs/stix-2.1-coverage.md", coverageMarkdown()],
]);

async function assertCurrent(relativePath, expected) {
  let actual;
  try {
    actual = await readFile(path.join(repositoryRoot, relativePath), "utf8");
  } catch {
    throw new Error(`${relativePath} is missing; run pnpm generate.`);
  }
  if (actual !== expected) {
    throw new Error(`${relativePath} is stale; run pnpm generate.`);
  }
}

if (checkOnly) {
  for (const [relativePath, content] of committedOutputs) {
    await assertCurrent(relativePath, content);
  }
  console.log(`Verified generated catalog, coverage, and ${templates.size} templates.`);
} else {
  for (const [relativePath, content] of committedOutputs) {
    const target = path.join(repositoryRoot, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
  }
  const outputRoot = path.join(
    repositoryRoot,
    "generated/vault-template/Templates/STIX 2.1",
  );
  await rm(outputRoot, { recursive: true, force: true });
  for (const [relativePath, content] of templates) {
    const target = path.join(outputRoot, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
  }
  await writeFile(
    path.join(repositoryRoot, "generated/vault-template/.generated-manifest.json"),
    templateManifest,
    "utf8",
  );
  console.log(`Generated catalog, coverage, and ${templates.size} templates.`);
}
