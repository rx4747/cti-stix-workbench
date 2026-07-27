# Security and privacy review

## Boundaries reviewed

- Markdown frontmatter, wiki links, Canvas JSON, settings, and registry JSON are
  validated before use.
- Export paths are vault-relative; parent traversal and absolute paths are
  rejected by settings and creation controls.
- Validation does not mutate notes. Scoped cancellation occurs before identity
  persistence and Bundle creation.
- Existing STIX IDs are never replaced, and existing export files are never
  overwritten.
- UI content is inserted with Obsidian DOM helpers and `text`/`setText`; HTML
  insertion APIs are blocked by lint.
- The runtime contains no telemetry or remote-schema path.
- Pattern errors report line/column and do not log note bodies.

## Residual limitations

An Obsidian plugin has the same local file access granted to Obsidian. Markings
are metadata, not access controls. Users must secure and back up operational
vaults. Very large vaults may take time to validate; progress and cancellation
are provided, but v1.0 does not use worker threads.

No unresolved high-severity issue was identified by the repository-level
boundary review and automated dependency checks. Re-run these gates for every
release and after changes to parsing, paths, or DOM rendering.
