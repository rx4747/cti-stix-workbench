# Architecture

The plugin is a local pipeline:

```text
Obsidian Markdown or Canvas
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
`main.js`; view construction performs no vault scan or runtime network request.

Validation is read-only. Export first validates the complete scope, then
persists generated IDs and relationship identities, and finally creates a new
Bundle file. Existing export files are never overwritten.
