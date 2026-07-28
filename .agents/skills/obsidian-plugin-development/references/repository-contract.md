# CTI STIX Workbench contract

Read the current repository files rather than treating this snapshot as a
substitute for them:

- `docs/architecture.md` defines pure core, boundary adapters, atomic import,
  validation-before-write, and the separate vault repository.
- `docs/compatibility.md` defines the shipped STIX, Obsidian, platform, network,
  and interoperability boundary.
- `docs/mapping.md` defines wiki-link, relationship, version, and ID semantics.
- `docs/canvas.md` defines the only Canvas content that becomes STIX.
- `standards/sources.json` pins standards and validation aids.
- `package.json` defines the project-pinned tools and complete verification
  graph.

## Stable invariants

- Markdown remains useful without the plugin.
- Runtime validation and ordinary authoring remain local.
- External data is untrusted and validated at adapters.
- Missing IDs are persisted only after successful validation during export.
- Existing files are not overwritten; multi-file imports are staged atomically.
- Only explicit Markdown `stix:` declarations or valid directed typed Canvas
  edges create Relationship objects.
- Folder scopes do not absorb linked objects outside the folder; persisted
  external IDs may be resolved without adding those objects to the Bundle.
- Generated catalog, templates, examples, coverage, and declarations are
  verified contracts, not hand-edited outputs.
- The official vault is a separate repository; `.obsidian` state is never
  synchronized.

## Data safety

Use fictional examples, reserved IP/domain ranges, or attributed public OASIS
fixtures. Never commit operational intelligence, credentials, PII, malware,
exploit payloads, private vault state, or generated user exports.
