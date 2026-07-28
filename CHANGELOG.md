# Changelog

## Unreleased

## Released

## 1.2.0 — 2026-07-28

### Added

- Added atomic local Bundle import with a type-count preview, typed notes,
  internal wiki links, an import overview, and semantic round-trip coverage
  against the official 76-object OASIS APT1 example.
- Added STIX object version identities, latest-version reference resolution,
  commands for creating and revoking versions, and cross-version validation.
- Added an evidence-gated STIX 2.1 producer, consumer, markings, extensions,
  versioning, and Level 3 pattern-syntax conformance profile.
- Added a reviewable monthly contributor-wall refresh that excludes bots and
  privacy-denied profiles.

### Changed

- Changed generated templates and the property editor to expose required and
  present properties by default, with an explicit add-property workflow for
  optional and nested fields.
- Preserved valid external STIX references with warnings instead of rejecting
  them solely because their targets are outside the exported Bundle.
- Updated vault synchronization to propose the attributed OASIS APT1 Bundle,
  license, import walkthrough, and 76 pre-expanded browseable notes with a
  checksum manifest, while continuing to exclude `.obsidian` state.
- Added opt-in Platinum, Gold, and Silver sponsor recognition to the project
  README without exposing private sponsors.

### Fixed

- Matched Errata 01 granular-marking semantics by accepting exactly one of
  `lang` or `marking_ref`, rejecting circular self-markings, and enforcing the
  four fixed STIX TLP definitions.
- Advanced `modified` automatically when editing versioned objects, preserved
  immutable creator metadata, and prevented non-versioned Marking Definitions
  and SCOs from entering the version workflow.
- Added the OASIS validator's known-hash and duplicate-qualifier checks to the
  Level 3 STIX pattern parser.

## 1.1.0 — 2026-07-28

### Added

- Added a read-only interactive STIX viewer for local Bundle JSON, individual
  objects, object arrays, and connected Markdown note graphs, with pan, zoom,
  node arrangement, filtering, property inspection, and note navigation.
- Added locally bundled OASIS STIX visualization icons with explicit coverage
  fallbacks and the complete BSD 3-Clause attribution in source and release
  output.

### Changed

- Kept the viewer and plugin explicitly desktop-only while supporting narrow
  desktop split panes and popout windows.

## 1.0.1 — 2026-07-27

### Fixed

- Added Obsidian funding metadata so the plugin details page can link directly
  to GitHub Sponsors.

## 1.0.0 — 2026-07-27

### Added

- Added catalog-driven creation and editing for every standard STIX 2.1 object
  type and predefined SCO extension, with generated analyst-ready vault
  templates kept in a separate public template repository.
- Added active-note, Canvas, folder, and whole-vault scopes for graph
  validation and deterministic Bundle export, including progress, cancellation,
  confirmation, and collision-safe output handling.
- Added Canvas parsing, semantic relationship and marking validation, STIX
  pattern conformance checks, and an actionable validation report UI.
- Added generated catalog, conformance-evidence, documentation-link, runtime
  boundary, large-vault, and release-package verification gates.
- Added automated pull requests that synchronize only the safe generated
  template tree to the public CTI Investigation Vault repository.

### Fixed

- Prevented cancelled scoped exports from persisting object identities or
  writing a Bundle after cancellation was requested.
- Required granular marking selectors to resolve owned STIX properties instead
  of accepting inherited JavaScript properties.
- Preserved nested predefined-extension field guidance in generated templates
  and removed excess generated whitespace.

### Changed

- Declared the plugin desktop-only because full-vault and Canvas workflows use
  desktop Obsidian capabilities.
- Expanded CI and release checks to verify generated coverage, documentation,
  runtime boundaries, dependency audit results, production builds, and exact
  three-file release packages before a draft release can be reviewed.
- Reworked the public documentation around the analyst workflow, local-first
  data handling, support, funding, contribution, and licensing boundaries.

## 0.1.3 — 2026-07-27

### Fixed

- Flattened the plugin package into Obsidian's conventional repository-root
  layout so Marketplace source scanners resolve the implementation, metadata,
  build configuration, tests, and real type dependencies without workspace
  indirection.
- Added a zero-warning, type-aware Obsidian Marketplace lint gate while
  preserving the committed declaration contracts for generated STIX schema and
  pattern modules.
- Made release validation reject prefixed, prerelease, mismatched, duplicate,
  or metadata-inconsistent versions and require non-empty matching changelog
  notes.

### Changed

- Added a default-branch release dispatch that creates and pushes an annotated
  numeric tag, builds the release in the same run, attests all three plugin
  assets with GitHub provenance, and creates a notes-backed draft for manual
  review before publication.
- Switched development and CI to a Corepack-pinned pnpm toolchain and added
  weekly Dependabot updates for JavaScript dependencies and GitHub Actions.
- Split the clean analyst vault into its own downloadable template repository,
  removed the obsolete in-repository design notes, and refreshed the public
  project documentation and funding links.

## 0.1.2 — 2026-07-26

### Fixed

- Exposed Obsidian, TypeScript, ESLint, and parser type dependencies at the
  public repository root so automated source review can resolve the plugin's
  workspace sources.
- Added reproducible declaration-only contracts for generated STIX schema and
  pattern modules while keeping generated runtime code out of source control.

### Changed

- Made lint inspect committed source directly instead of generating validation
  runtime files first, so clean-checkout type-resolution failures cannot be
  hidden by the local build.

## 0.1.1 — 2026-07-26

### Fixed

- Validated untrusted Obsidian frontmatter before reading or writing STIX IDs
  and property-editor values.
- Preserved popout-window compatibility by using realm-local Web Crypto globals.
- Prevented nested values from appearing as meaningless `[object Object]`
  scalar text.
- Replaced deprecated and version-incompatible property-editor UI APIs while
  retaining Obsidian 1.8.10 support.

### Changed

- Added searchable declarative setting definitions for Obsidian 1.13 and kept
  the imperative settings tab as a compatibility fallback.
- Added Obsidian's official ESLint review rules to the committed release gates.

## 0.1.0 — 2026-07-26

### Added

- Pinned STIX 2.1 Errata 01 source and offline validation toolchain.
- Fixture-gated compatibility contract covering all standard object families.
- Obsidian plugin scaffold with local-first settings and development install.
- Typed catalog with all 55 tracked object and predefined-extension rows.
- Complete generated templates for every authorable standard object and all 12
  predefined SCO extensions.
- STIX-backed analyst workflow templates and explicit association guidance.
- Safe Markdown parsing for flat and nested STIX frontmatter, mapped prose, and
  explicit typed relationships.
- Active-note STIX property editor with recursive object-list fields and
  predefined-extension controls.
- Browser-safe UUIDv4 services and catalog-driven RFC 8785/UUIDv5 identity
  rules for all 18 STIX Cyber-observable Object types.
- Catalog-wide graph mapper and deterministic Bundle assembly across all 42
  standalone standard object types, nested references, and typed relationships.
- Active-note graph validation and export commands with offline Bundle schema
  validation, atomic ID persistence, and collision-safe Vault writes.
- A fully fictional Frost Lantern investigation with linked Grouping, Identity,
  Threat Actor, Indicator, reserved domain/address notes, starter Canvas, and a
  schema-valid golden Bundle.
- Reproducible, allowlisted plugin and vault-template release packaging.
- Public setup, repository-split, contribution, security, and path-specific
  licensing documentation.
- A Git-ready vault-template root with linked analyst documentation and safe
  ignores for local Obsidian state and generated Bundles.

### Changed

- Consolidated flat and nested STIX values into one canonical frontmatter
  record; the plugin editor will handle values unsupported by Obsidian's native
  Properties widget.
- Layered Bundle validation now dispatches all 42 standard object types to their
  pinned per-type schemas because the upstream aggregate Bundle schema omits
  several valid STIX 2.1 Errata 01 types.
- Promoted plugin metadata to the Obsidian-compatible `0.1.0` release version.
- Corrected `minAppVersion` to the tested Obsidian app version `1.8.10` and
  restored the legacy-compatible settings-tab display contract.
- Treated blank YAML `stix_id` values as missing during atomic ID persistence.
- Prevented the property editor from materializing untouched optional fields as
  invalid empty strings or empty nested values.
- Clarified that the public plugin/source repository and copyable vault-template
  repository are independent distributions; the v0.1 plugin never overwrites a
  vault with bundled content.
