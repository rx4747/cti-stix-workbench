# Spec: CTI Obsidian Vault and STIX 2.1 Workbench

Status: Approved for incremental implementation
Date: 2026-07-26

## Assumptions

1. The repository will be both a ready-to-open Obsidian vault and the source repository for one community plugin.
2. The first release targets individual analysts and small CTI teams; multi-user synchronization and a backend are out of scope.
3. Notes use Obsidian Properties/YAML plus wiki links. No community plugin such as Dataview or Templater is required.
4. Version 1.0 exports every normative STIX 2.1 object family, property, relationship, marking, and extension representable by the standard. Coverage is tracked in a committed compatibility matrix and contract fixtures.
5. The exporter supports active-note graphs, selected folders, whole-vault export, and Obsidian Canvas selections. Active-note graph export remains the first vertical slice, not the final scope.
6. Missing STIX Domain Object and Relationship Object identifiers are assigned once as UUIDv4 values and saved atomically. STIX 2.1 Cyber-observable Object identifiers use the deterministic UUIDv5 rules required by the specification.
7. All user-facing vault content, templates, documentation, and plugin UI are English-only for the first major release.
8. The project is sponsor-supported open source. The recommended licensing baseline remains Apache License 2.0 for software and CC BY 4.0 for content because GitHub Sponsors is explicitly oriented toward open-source work. Contributions use Developer Certificate of Origin sign-off; no CLA is required unless commercial dual licensing is introduced later.
   Commercial use is permitted free of charge; sponsorship is voluntary and is not a license fee.
9. Conformance targets the current STIX 2.1 Errata 01 latest stage. The 2019 public-review draft remains background material, not the implementation baseline.
10. Version 1.0 is export-only. Importing arbitrary Bundles remains deferred.
11. Custom Extension Definition schemas are registered from checksum-pinned files inside the vault. The installed plugin never fetches schemas from their declared URLs.

## Objective

Build a practical CTI knowledge base that combines:

- repeatable notes for intelligence requirements, investigations, reports, sources, and the complete STIX 2.1 object catalog;
- wiki links, backlinks, the local graph, and starter Canvases for visual analysis;
- a local-first Obsidian plugin that turns linked, typed notes and typed Canvas edges into STIX 2.1 Bundles;
- schema-driven templates, mappings, compatibility reports, and validation so analysts can see exactly what will be exported;
- open-source governance that is welcoming to contributors while retaining an explicit patent grant for plugin code.

The alpha succeeds when a user can clone the repository, open it as an Obsidian vault, create linked CTI notes from templates, inspect them in Graph/Canvas, run one command, and receive a deterministic STIX 2.1 Bundle without sending vault data to a network service. Version 1.0 additionally requires complete, fixture-backed STIX 2.1 export coverage.

## User workflow

1. Open the repository root as an Obsidian vault.
2. Create a common object from a human-friendly template, or use the schema-driven object creator for any STIX 2.1 type.
3. Link objects normally with `[[Wiki links]]`.
4. Declare exportable relationships with list items of the form:

   ```markdown
   - stix:uses [[Fictional Remote Access Tool]]
   - stix:targets [[Example Energy Organization]]
   ```

5. Use Graph view or a starter Canvas to investigate the connected notes. Canvas edges whose labels start with `stix:` are typed exportable relationships; unlabeled visual edges remain non-semantic.
6. Validate an active graph, Canvas, folder, or vault against STIX 2.1.
7. Export and review a timestamped bundle under `Exports/` with a companion diagnostic report.

## Vault information model

### Common properties

All exportable notes use these stable top-level properties:

```yaml
---
stix_type: threat-actor
stix_id:
created: 2026-07-26T10:00:00Z
modified: 2026-07-26T10:00:00Z
confidence: 50
labels:
  - fictional
aliases: []
object_marking_refs: []
---
```

- `stix_type` is required and maps to the STIX `type` property.
- `stix_id` is managed by the exporter and maps to the STIX `id` property.
- `spec_version` is always `"2.1"` in exported objects where the standard requires it; authors do not need to repeat it in every note.
- `created` and `modified` are ISO 8601 timestamps. Existing values are preserved.
- `confidence` must be an integer from 0 through 100 when present.
- Every standard STIX property uses its exact snake_case name in YAML frontmatter, including nested dictionaries and lists of dictionaries.
- Shipped analyst workflow templates use real STIX types and do not require a parallel local schema. If future local-only workflow fields are needed, they use the reserved `cti_*` prefix and are never exported. Deliberate STIX custom properties retain the standard `x_*` prefix.
- Obsidian stores nested YAML properties but its native Properties widget cannot display or edit them. The plugin's schema-driven editor handles those values through the atomic frontmatter API so analysts have one property form and one canonical record.
- The `Edit STIX properties` command is available only for active notes with a supported `stix_type`; it renders catalog-defined nested children and predefined extensions without requiring another community plugin.
- The note title becomes the STIX `name` for named object types.
- The content under `## Summary` becomes `description`.
- For Note objects, the content under `## Content` becomes `content`.
- For Opinion objects, the content under `## Explanation` becomes `explanation`. Opinion represents agreement or disagreement with referenced STIX Objects; confidence rationale uses Note plus the common `confidence` property.

### Relationship syntax

The explicit `stix:<relationship-type>` prefix is the contract between Markdown and the exporter. It preserves a normal wiki link for Obsidian's graph while avoiding accidental STIX edges from contextual links.

Each declared edge produces a STIX Relationship Object with:

- `relationship_type` from the text after `stix:`;
- `source_ref` from the containing note;
- `target_ref` from the linked note;
- UUIDv4 identity and STIX 2.1 common properties.

The exporter rejects an unresolved target or a linked target without a supported `stix_type`. It warns, rather than guesses, when a relationship is not in the plugin's supported source/type matrix.

### Template shape

Templates combine a complete STIX frontmatter record with guided analyst sections. A generated Indicator template resembles:

````markdown
---
stix_type: indicator
stix_id:
created:
modified:
confidence: 50
labels: []
object_marking_refs: []
pattern: "[ipv4-addr:value = '203.0.113.10']"
pattern_type: stix
pattern_version: "2.1"
valid_from:
valid_until:
kill_chain_phases: []
# kill_chain_phases item fields:
#   kill_chain_name:
#   phase_name:
external_references: []
# external_references item fields:
#   source_name:
#   external_id:
#   description:
#   url:
#   hashes: {}
granular_markings: []
extensions: {}
---
# {{title}}

> [!summary] Assessment
> State what this indicator represents and why it matters.

## Summary

## Relationships

- stix:indicates [[Threat or Malware Note]]

## Analysis

## Sources
````

Required fields are uncommented; optional fields remain present with empty values only when seeing them helps the analyst. Threat Actor and Investigation templates emphasize prose and links. Cyber-observable templates emphasize exact values, hashes, parent/child references, and extensions. All generated templates include guidance callouts that are ignored during export.

### Full compatibility target

- STIX 2.1: all 19 Domain Objects, both Relationship Objects, all 18 Cyber-observable Object types and their defined extensions, Language Content, Marking Definition, Extension Definition, custom properties/extensions, and Bundle output.
- Extension Definition overlays: `new-sdo`, `new-sco`, `new-sro`, `property-extension`, and `toplevel-property-extension`, validated from an explicitly registered local schema.
- Common and complex property types: identifiers, timestamps, hashes, external references, kill-chain phases, granular markings, vocabularies, binary/hex values, dictionaries, references, and reference lists.
- STIX patterning: STIX 2.1 parsing and diagnostics for Indicator patterns. Pattern evaluation against telemetry is out of scope.
- A generated template and at least one positive/negative fixture exist for every supported type and extension.

Templates for intelligence requirements, investigations, sources, and collection plans remain first-class vault notes but are skipped during export unless they declare a supported `stix_type`.

The curated workflow templates declare supported STIX types. Requirements,
collection plans, source/evidence references, confidence rationale, and export
reviews use Note; investigations use Grouping; intelligence reports use Report.
Technical evidence is represented by Observed Data, Artifact, and the applicable
SCOs rather than by an invented generic Evidence object.

### Canvas boundary

Starter Obsidian Canvases may contain file nodes, text annotations, groups, colors, and visual edges. An edge is exportable only when both endpoints are file nodes resolving to STIX notes, the direction is unambiguous, and its label has the form `stix:<relationship-type>`. All other Canvas edges remain visual. Obsidian stores `.canvas` files using the JSON Canvas 1.0 format; that is an implementation detail, not a separate user-facing tool.

## Plugin contract

### Commands

- `Edit STIX properties`
  - Presents common, type-specific, extension, marking, and custom fields without requiring nested YAML editing.

- `Export active STIX graph`
  - Available only when a supported typed Markdown note is active.
  - Traverses outgoing wiki links up to the configured depth.
  - Includes supported typed notes and explicit relationship objects between included notes.
  - Validates before writing a bundle.
  - Assigns and persists missing UUIDv4 identifiers using Obsidian's atomic frontmatter API.
  - Writes `Exports/stix-bundle-<UTC timestamp>.json` through the Vault API and adds a numeric suffix instead of overwriting a collision.

- `Validate active STIX graph`
  - Performs the same discovery and mapping without modifying notes or writing output.
  - Reports errors and warnings with note paths.

These commands define no default hotkeys.

- `STIX exporter: Validate/export active Canvas`
  - Reads file nodes and explicitly typed directed edges from the active Obsidian Canvas.

- `STIX exporter: Validate/export folder`
  - Includes STIX notes under a chosen vault folder and references among them.

- `STIX exporter: Validate/export vault`
  - Includes all typed STIX notes and typed relationships in the vault, subject to explicit confirmation.

### Settings

- Export folder, default `Exports`.
- Link traversal depth, default `1`, allowed range `0` to `5`.
- Include contextual linked objects, default `true` for graph export.
- Read typed Canvas edges, default `true`.
- Validation mode, default `strict`.
- Pretty-print JSON, default `true`.
- Local extension registry path, default `STIX Extensions/registry.json`.

User-defined paths are normalized with Obsidian's `normalizePath()` before use.

### Module boundary

```ts
export interface NoteRecord {
  path: string;
  basename: string;
  frontmatter: Record<string, unknown>;
  markdown: string;
  links: ResolvedLink[];
}

export type ExportResult =
  | { ok: true; bundle: StixBundle; warnings: Diagnostic[] }
  | { ok: false; errors: Diagnostic[]; warnings: Diagnostic[] };

export interface StixExporter {
  buildBundle(input: ExportInput): ExportResult;
}

export interface StixSchemaCatalog {
  getObjectType(type: string): ObjectTypeDefinition | undefined;
  listObjectTypes(): ObjectTypeDefinition[];
  validate(object: unknown): Diagnostic[];
}
```

The pure exporter accepts already-resolved note records and has no Obsidian dependency. The plugin adapter owns vault discovery, link resolution, atomic metadata writes, notices, settings, and output files. This keeps STIX mapping testable without an Obsidian runtime.

### Error semantics

Diagnostics use one shape:

```ts
export interface Diagnostic {
  severity: "error" | "warning";
  code: string;
  message: string;
  path?: string;
  field?: string;
}
```

An error prevents output. A warning is included in the result but does not prevent output. Internal stack traces and note contents are never logged in normal operation.

## Tech stack

- Obsidian app minimum `1.8.10`, proven by the isolated v0.1 smoke walkthrough.
- Obsidian TypeScript API package `1.13.1` for compilation; this npm package
  version is not the app's `minAppVersion`.
- TypeScript `6.0.3`
- esbuild `0.28.1`
- Vitest `4.1.10`
- ESLint `10.8.0`
- Node.js 22 or newer for repository development; emitted plugin code must
  remain compatible with Obsidian's supported desktop and mobile runtimes
- No runtime network calls and no runtime dependencies in the MVP

Exact versions are locked in `package-lock.json`.

## Commands

From `packages/cti-stix-workbench/`:

```bash
npm install
npm run dev
npm run test
npm run lint
npm run typecheck
npm run build
```

The production build emits `main.js`. `npm run install:dev` builds and copies
`main.js`, `manifest.json`, and `styles.css` to
`.obsidian/plugins/cti-stix-workbench/` for local vault testing. Generated
`main.js`, test coverage, and `node_modules/` are not committed.

## Project structure

```text
00 Home/                       Vault entry points and maps of content
01 Intelligence Requirements/ PIRs and questions
02 Investigations/             Investigation workspaces
03 STIX Objects/               STIX-oriented notes grouped by type
04 Reports/                    Finished and draft intelligence products
05 Sources/                    Source and collection notes
Canvases/                      Starter investigation and campaign canvases
Templates/                     Core Templates plugin templates
Exports/                       Generated bundles, ignored except for README
.obsidian/                     Shareable, minimal Obsidian configuration
packages/cti-stix-workbench/   Plugin source, tests, and build configuration
docs/                          Mapping, architecture, and contributor docs
tasks/                         Approved implementation plan and task list
```

## Code style

- Strict TypeScript; avoid `any` at vault and frontmatter boundaries.
- Validate unknown input once at the boundary, then use typed internal values.
- Use descriptive domain names (`relationshipType`, not `rel`).
- Keep STIX mapping pure and Obsidian access in adapter modules.
- UI strings use sentence case.

```ts
export function parseConfidence(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 100) {
    throw new MappingError("INVALID_CONFIDENCE", "confidence must be an integer from 0 to 100");
  }
  return value as number;
}
```

## Testing strategy

- Unit tests: frontmatter validation, Summary extraction, relationship parsing, type mapping, stable diagnostics, bundle assembly, duplicate suppression, and timestamps.
- Contract fixtures: representative notes and their exact STIX object shapes.
- Adapter tests: link traversal and file-output decisions with small fakes for Obsidian boundaries.
- Build verification: typecheck, lint, test, and production esbuild output.
- Manual Obsidian smoke test: enable the locally built plugin in this vault, validate a sample graph, export it, and inspect the resulting bundle.

Tests are written before each behavior. The pure mapping layer receives most coverage because it carries the interoperability risk.

## Licensing and contributions

### Confirmed licenses

- `packages/cti-stix-workbench/**`: Apache License 2.0. It is permissive and includes an express patent license and patent-termination terms, which are useful for a public plugin with outside contributors.
- Vault notes, templates, and Canvases: Creative Commons Attribution 4.0 International. It is designed for reusable documentation/content and requires attribution while allowing modification and commercial reuse.
- Repository metadata and files that combine both categories state the
  applicable path-specific grants in `README.md`, `LICENSE`, and
  `LICENSE-VAULT`. SPDX identifiers are used where practical.

This is the confirmed open-source licensing model. The project is funded through voluntary sponsorships rather than commercial-use restrictions or feature paywalls.

Forbidding commercial use is possible through a source-available license such as PolyForm Noncommercial 1.0.0 for code and CC BY-NC 4.0 for content. That restriction is a legal condition, not something the plugin can reliably track without invasive telemetry. It would also mean the project is not open source under the Open Source Definition, whose field-of-endeavor rule does not permit restricting business use. Because GitHub Sponsors describes its program as support for open-source contributors, the project will use the permissive model unless the maintainer explicitly chooses the source-available tradeoff before the first release.

### Contribution policy

`CONTRIBUTING.md` will include:

- setup and all required verification commands;
- issue-first guidance for large changes and security reporting instructions;
- coding, templates, STIX mapping, and test expectations;
- Conventional Commit guidance;
- a required `Signed-off-by` line under Developer Certificate of Origin 1.1;
- a statement that contributions are licensed under the license applicable to the contributed path;
- a prohibition on submitting confidential intelligence, personal data, malware samples, credentials, or third-party content without redistribution rights.

## Sustainability and GitHub Sponsors

The project is free and open source; sponsorship funds maintenance, compatibility work, documentation, triage, and releases rather than unlocking basic exporter capabilities.

### Repository integration

- Add `.github/FUNDING.yml` with the maintainer's GitHub Sponsors username after the profile is approved.
- Add a concise sponsor section to README and a detailed `SPONSORS.md` explaining what funding sustains.
- Publish a public roadmap and sponsor acknowledgements with opt-in names/logos.
- Use GitHub Discussions or issues for public roadmap input. Sponsorship never buys vulnerability embargo bypasses, hidden standards behavior, or control over the license.

### Suggested tiers

- One-time: $10 “Signal boost”, $50 “Research fuel”, and $250 “Release sponsor”.
- $3/month “Supporter”: sponsor badge and release updates.
- $10/month “Analyst”: monthly roadmap digest and opt-in name listing.
- $25/month “Builder”: opt-in profile/logo listing and sponsor polls on already-approved roadmap priorities.
- $100/month “Team”: organization logo and a quarterly group roadmap call; cap the tier to protect maintainer time.
- $500/month “Sustaining organization”: prominent opt-in logo and one scheduled quarterly feedback session; no exclusive features or ownership rights.

GitHub currently permits up to ten one-time and ten monthly tiers. Serbia is listed as a supported payout region, subject to GitHub, banking, identity, and tax onboarding. Tier prices and benefits are proposals and must be confirmed in the GitHub Sponsors dashboard.

### Sustainability metrics

- Track releases shipped, issues closed, compatibility coverage, sponsor retention, documentation completion, and community contributors.
- Use GitHub's public repository and release metrics. Do not add plugin telemetry merely to measure adoption.
- Publish a quarterly maintenance note describing completed work and the next funding goals.

## Security and privacy boundaries

- Always local: no telemetry, remote validation, or network export in v0.1.
- Runtime schema validation, STIX pattern parsing, graph discovery, Canvas parsing, and Bundle writing operate entirely on local vault data. Network access is limited to explicit maintainer actions that update pinned development sources.
- Treat Markdown, frontmatter, link text, and settings as untrusted input.
- Never render note content with `innerHTML` or equivalent APIs.
- Never execute patterns, observables, attachments, or embedded code.
- Never include unlinked notes or attachments implicitly.
- Never overwrite an existing export; add a timestamp and fail on an unexpected collision.
- Never log full note bodies or STIX bundles by default.

## Always / ask first / never

### Always

- Preserve normal Obsidian wiki links and keep notes readable without the plugin.
- Validate before writing a bundle.
- Use Obsidian's Plugin, Vault, MetadataCache, FileManager, and path APIs rather than undocumented globals or raw filesystem APIs.
- Add tests for every mapping and validation behavior.
- Cite the STIX 2.1 section implemented by non-obvious mappings.

### Ask first

- Add runtime dependencies or network access.
- Export Canvas edges, attachments, or a whole vault.
- Add TAXII, MISP, OpenCTI, or external enrichment integrations.
- Change the frontmatter or relationship contract after release.
- Change licensing, contribution certification, or privacy boundaries.

### Never

- Commit real sensitive CTI data, credentials, malware binaries, or customer-identifying content.
- Silently coerce invalid STIX values or invent relationship semantics.
- Use an active production vault as a plugin development test vault.
- claim full STIX 2.1 conformance without validation against authoritative schemas and interoperability fixtures.

## Success criteria

- The repository root opens as a functional Obsidian vault with Graph, Canvas, and Templates core plugins configured.
- At least one starter Canvas and one fictional linked example investigation demonstrate graph use.
- Generated templates and fixtures cover every STIX 2.1 object type and defined extension; curated templates cover common analyst workflows.
- The plugin builds to a loadable `main.js` and registers its commands without
  default hotkeys.
- Validation finds unsupported types, missing required fields, invalid confidence, unresolved relationship targets, and malformed relationship syntax.
- Active graph, Canvas, folder, and whole-vault exports create STIX 2.1 Bundles with correct IDs/references, no duplicate objects, and no network activity.
- The compatibility matrix shows fixture-backed coverage for all 19 SDOs, 2 SROs, 18 SCOs, 3 Meta Objects, defined extensions, custom properties/extensions, patterns, markings, and Bundles.
- Missing IDs are persisted once; a second export reuses them.
- Unit tests, lint, typecheck, and production build pass.
- README, mapping guide, `LICENSE`, `LICENSE-VAULT`, `SECURITY`,
  `CODE_OF_CONDUCT`, and `CONTRIBUTING` documentation are present.

## Deferred scope

- STIX pattern evaluation against telemetry or event data
- TAXII transport, signing, encryption, and remote platforms
- Importing arbitrary STIX bundles back into notes
- Whole-vault scheduled/background export
- Collaborative conflict resolution

## Open questions requiring approval

1. Which GitHub username or organization should own the Sponsors profile and appear in `.github/FUNDING.yml`?
2. What public project name should replace the working name “CTI STIX Workbench” before community-plugin submission?

## Authoritative sources

- Obsidian, “Build a plugin”: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
- Obsidian, “Plugin guidelines”: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- Obsidian official sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- OASIS, “STIX Version 2.1 Errata 01”: https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html
- OASIS, “STIX Version 2.1 CSD/PRD 01” (historical): https://docs.oasis-open.org/cti/stix/v2.1/csprd01/stix-v2.1-csprd01.html
- JSON Canvas 1.0: https://jsoncanvas.org/spec/1.0/
- Obsidian, “Properties”: https://help.obsidian.md/properties
- Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/
- PolyForm Noncommercial License 1.0.0: https://polyformproject.org/licenses/noncommercial/1.0.0/
- Open Source Definition, clause 6: https://opensource.org/osd
- Developer Certificate of Origin 1.1: https://developercertificate.org/
- GitHub, “About GitHub Sponsors”: https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors
- GitHub, “Displaying a sponsor button in your repository”: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository
