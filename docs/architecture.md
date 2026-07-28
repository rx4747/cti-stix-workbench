# Architecture

The plugin is a local pipeline:

```text
Local STIX JSON, Obsidian Markdown, or Canvas
  -> schema validation and atomic note import when JSON is selected
  -> boundary parsing and link resolution
  -> normalized drafts
  -> identity and relationship mapping
  -> pinned schema, grammar, and semantic validation
  -> collision-safe Bundle write through the Vault API
```

The canonical catalog lives in `standards/catalog/stix-2.1.json`. Generation
produces the TypeScript catalog, compatibility matrix, and vault-template
manifest. `pnpm check:generated` rejects drift.

OASIS schemas and the pattern grammar are checksum-pinned. Build-time tooling
compiles them into an offline runtime; the installed plugin performs no schema
download. Obsidian-specific code stays in adapters and UI modules, while
mapping and validation remain testable as pure TypeScript.

The STIX viewer reuses the read-only active-graph mapping pipeline for Markdown
and a small boundary parser for local JSON. A lazily opened Obsidian `ItemView`
renders the resulting pure graph model as SVG. Icon data is bundled into
`main.js`; view construction performs no whole-vault scan or runtime network
request.

Validation is read-only. Export first validates the complete scope, then
persists generated IDs and relationship identities, and finally creates a new
Bundle file. Existing export files are never overwritten.

Bundle import plans all paths before writing, creates notes under a private
staging folder, and renames that folder into place only after every file is
complete. Object versions use `(id, modified)` identity; references select the
latest available version while historical versions remain in the Bundle and
viewer model.

## Repository boundary

This repository contains the plugin, its build inputs, and test fixtures. The
official APT1 JSON under `tests/fixtures/oasis/` is canonical conformance input,
not a bundled Obsidian vault. The downloadable analyst workspace lives in the
separate CTI Investigation Vault repository, which owns its own documentation,
attribution, and vault structure. Automation may propose generated templates,
the canonical JSON fixture, and its reproducible note snapshot to that
repository; it never synchronizes `.obsidian` state.
