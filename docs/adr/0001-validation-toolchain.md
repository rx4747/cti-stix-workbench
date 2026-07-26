# ADR 0001: Offline validation toolchain

- Status: Accepted
- Date: 2026-07-26
- Scope: STIX 2.1 JSON Schema and pattern syntax validation

## Context

The installed plugin must validate entirely inside Obsidian on desktop and
mobile. It cannot depend on Python, Node.js-only APIs, runtime code generation,
remote schema resolution, or network access. The OASIS JSON Schemas are useful
validation aids, while the normative STIX 2.1 prose remains authoritative.

STIX patterns also require a complete grammar. A handwritten subset would make
validity depend on which syntax the plugin happened to implement.

## Decision

Build standalone JSON Schema validators with Ajv 8.20 and `ajv-formats` at
development time. Load all 57 schemas from the checksum-pinned OASIS source set,
resolve references during the build, and emit ordinary JavaScript validation
functions. The installed plugin will not include Ajv's compiler or load schemas
dynamically.

Compile one validator for each of the 42 standalone STIX object schemas. Validate
the Bundle envelope separately, then dispatch each contained object by its
declared `type`. The pinned OASIS Bundle schema's internal type list omits valid
Errata 01 objects including Grouping, Incident, Location, Note, Opinion, and
Extension Definition even though their individual schemas are present. Per-type
dispatch preserves the validation aid without allowing that stale aggregate
list to override normative STIX 2.1.

Generate a TypeScript lexer and parser from the checksum-pinned OASIS
`STIXPattern.g4` grammar with `antlr-ng`, use the `antlr4ng` browser runtime, and
bundle the generated parser into the plugin. Convert lexer and parser errors
into stable diagnostics that retain one-based line and zero-based column
positions.

Use esbuild's browser platform and ES2022 target. A build failure caused by a
Node-only import is therefore a hard gate. Validation modules do not call
`fetch`, resolve remote references, or access the filesystem at runtime.

The schemas contain patterns that are not valid under JavaScript Unicode regular
expression mode, so the build deliberately sets Ajv's `unicodeRegExp` option to
false. The standalone artifact supplies browser-safe URI, email, and
international-hostname format functions explicitly, avoiding CommonJS and
Node-only helper lookups in Ajv's generated ESM.

## Measurements

On 2026-07-26, the representative spike compiled:

- 57 pinned OASIS JSON Schemas;
- Bundle-envelope, all 42 object-schema, and Indicator standalone entry points;
- the complete OASIS STIX 2.1 pattern lexer and parser; and
- browser-targeted validation wrappers.

The minified, uncompressed ESM artifact was 869,015 bytes. This is an acceptable
correctness baseline for the alpha, not a permanent performance budget.
Production work should measure the complete plugin, avoid duplicate runtime
copies, and consider lazy loading the validation view if Obsidian startup
performance regresses.

Desktop execution is covered by the automated spike. Actual Obsidian mobile
loading remains a checkpoint smoke test; this ADR approves the browser-compatible
architecture, not an unperformed device test.

The successful spike is no longer a separate source tree. Its maintained
implementation now lives in
`packages/cti-stix-workbench/src/validation/`, and
`packages/cti-stix-workbench/scripts/build-validation.mjs` produces the
ignored generated runtime used by tests and the plugin build.

## Consequences

- Validation is reproducible and requires no network access.
- Installed code contains no runtime schema compiler or dynamic evaluation.
- Adopting new authoritative sources requires updating pins, regenerating code,
  and reviewing fixture changes.
- JSON Schema success alone is never described as full STIX conformance.
- Normative constraints absent from the schemas require explicit catalog-aware
  validators and fixtures.

## Rejected alternatives

- Runtime Ajv compilation: adds startup cost and dynamic code generation, and is
  unsuitable for a restrictive mobile runtime.
- Remote schema loading: violates local-first operation and makes validation
  non-reproducible.
- Python `stix2-validator`: useful as an external cross-check, but unavailable
  inside Obsidian and therefore not the product validator.
- Handwritten pattern parser or regular expressions: would provide incomplete
  syntax coverage and weak source locations.
- Shipping only the JSON Schemas: would miss normative prose constraints and
  full STIX pattern syntax.
