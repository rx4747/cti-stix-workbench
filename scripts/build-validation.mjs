import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import Ajv2020 from "ajv/dist/2020.js";
import { _ } from "ajv/dist/compile/codegen/index.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import addFormats from "ajv-formats";
import addDraft2019Formats from "ajv-formats-draft2019";
import { build } from "esbuild";

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const vendorRoot = path.join(repositoryRoot, "standards/vendor/stix-2.1");
const validationRoot = path.join(repositoryRoot, "src/validation");
const generatedRoot = path.join(validationRoot, "generated");
const schemaOutput = path.join(generatedRoot, "schema-validators.mjs");
const schemaDeclarationOutput = path.join(generatedRoot, "schema-validators.d.mts");
const schemaMapOutput = path.join(generatedRoot, "schema-validator-map.mjs");
const schemaMapDeclarationOutput = path.join(
  generatedRoot,
  "schema-validator-map.d.mts",
);
const antlrOutput = path.join(generatedRoot, "antlr");
const antlrLexerDeclarationOutput = path.join(antlrOutput, "STIXPatternLexer.d.ts");
const antlrParserDeclarationOutput = path.join(antlrOutput, "STIXPatternParser.d.ts");
const runtimeOutputRoot = path.join(repositoryRoot, "generated");
const runtimeOutput = path.join(runtimeOutputRoot, "validation-runtime.mjs");

async function collectJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsonFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

await rm(generatedRoot, { recursive: true, force: true });
await mkdir(generatedRoot, { recursive: true });
await mkdir(runtimeOutputRoot, { recursive: true });

const schemaFiles = await collectJsonFiles(path.join(vendorRoot, "schemas"));
const schemaEntries = await Promise.all(
  schemaFiles.map(async (schemaPath) => ({
    path: schemaPath,
    schema: JSON.parse(await readFile(schemaPath, "utf8")),
  })),
);
const schemas = schemaEntries.map((entry) => entry.schema);

const ajv = new Ajv2020({
  allErrors: true,
  code: {
    esm: true,
    formats: _`standaloneFormats`,
    source: true,
  },
  schemas,
  strict: false,
  unicodeRegExp: false,
});
addFormats(ajv);
addDraft2019Formats(ajv);

const bundleSchemaId =
  "http://raw.githubusercontent.com/oasis-open/cti-stix2-json-schemas/stix2.1/schemas/common/bundle.json";
const commonObjectSchemas = new Set([
  "extension-definition.json",
  "language-content.json",
  "marking-definition.json",
]);
const objectSchemaEntries = schemaEntries
  .filter((entry) => {
    const relativePath = path.relative(path.join(vendorRoot, "schemas"), entry.path);
    const family = relativePath.split(path.sep)[0];
    return (
      family === "observables" ||
      family === "sdos" ||
      family === "sros" ||
      (family === "common" && commonObjectSchemas.has(path.basename(relativePath)))
    );
  })
  .map((entry) => ({
    type: entry.schema.title,
    schemaId: entry.schema.$id,
    exportName: `validate${entry.schema.title
      .split("-")
      .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
      .join("")}Schema`,
  }))
  .sort((left, right) => left.type.localeCompare(right.type));
if (objectSchemaEntries.length !== 42) {
  throw new Error(
    `Expected 42 standalone STIX object schemas, found ${objectSchemaEntries.length}.`,
  );
}
const validatorExports = Object.fromEntries([
  ["validateBundleSchema", bundleSchemaId],
  ...objectSchemaEntries.map((entry) => [entry.exportName, entry.schemaId]),
]);
const generatedValidatorModule = standaloneCode(ajv, validatorExports);
const ucs2RuntimeExpression = 'require("ajv/dist/runtime/ucs2length").default';
if (!generatedValidatorModule.includes(ucs2RuntimeExpression)) {
  throw new Error("Ajv standalone Unicode runtime signature changed.");
}
const validatorModule =
  'import standaloneFormats from "../standalone-formats.mjs";\n' +
  "const stixUcs2Length = (value) => [...value].length;\n" +
  generatedValidatorModule.replaceAll(ucs2RuntimeExpression, "stixUcs2Length");
if (validatorModule.includes("require(")) {
  throw new Error("Generated ESM validators still contain CommonJS imports.");
}
await writeFile(schemaOutput, validatorModule, "utf8");
await writeFile(
  schemaDeclarationOutput,
  `interface SchemaError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
}

interface Validator {
  (value: unknown): boolean;
  errors?: SchemaError[] | null;
}

export const validateBundleSchema: Validator;
${objectSchemaEntries
  .map((entry) => `export const ${entry.exportName}: Validator;`)
  .join("\n")}
`,
  "utf8",
);
await writeFile(
  schemaMapOutput,
  `import {
${objectSchemaEntries.map((entry) => `  ${entry.exportName},`).join("\n")}
} from "./schema-validators.mjs";

export const objectSchemaValidators = Object.freeze({
${objectSchemaEntries
  .map((entry) => `  ${JSON.stringify(entry.type)}: ${entry.exportName},`)
  .join("\n")}
});
`,
  "utf8",
);
await writeFile(
  schemaMapDeclarationOutput,
  `interface SchemaError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
}

interface Validator {
  (value: unknown): boolean;
  errors?: SchemaError[] | null;
}

export const objectSchemaValidators: Readonly<Record<string, Validator>>;
`,
  "utf8",
);

await execFileAsync(
  process.execPath,
  [
    path.join(repositoryRoot, "node_modules/antlr-ng/dist/cli/runner.js"),
    "-Dlanguage=TypeScript",
    "--exact-output-dir",
    "-o",
    antlrOutput,
    path.join(vendorRoot, "pattern_grammar/STIXPattern.g4"),
  ],
  { cwd: repositoryRoot },
);
await writeFile(
  antlrLexerDeclarationOutput,
  `import { Lexer, type CharStream } from "antlr4ng";

export declare class STIXPatternLexer extends Lexer {
  constructor(input: CharStream);
}
`,
  "utf8",
);
await writeFile(
  antlrParserDeclarationOutput,
  `import {
  Parser,
  type ParserRuleContext,
  type TokenStream,
} from "antlr4ng";

export declare class STIXPatternParser extends Parser {
  constructor(input: TokenStream);
  pattern(): ParserRuleContext;
}
`,
  "utf8",
);

const buildResult = await build({
  bundle: true,
  entryPoints: [path.join(validationRoot, "runtime-entry.ts")],
  format: "esm",
  logLevel: "warning",
  minify: true,
  outfile: runtimeOutput,
  platform: "browser",
  target: "es2022",
  metafile: true,
});

const output = Object.values(buildResult.metafile.outputs).find(
  (entry) => entry.entryPoint,
);
console.log(
  `Built offline validation runtime: ${schemaFiles.length} schemas, ${output?.bytes ?? 0} bytes.`,
);
