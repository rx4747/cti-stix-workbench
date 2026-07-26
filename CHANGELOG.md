# Changelog

## Released

## 0.1.1 — 2026-07-26

### Fixed

- Validated untrusted Obsidian frontmatter before reading or writing STIX IDs
  and property-editor values.
- Preserved popout-window and mobile compatibility by using realm-local Web
  Crypto globals.
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
