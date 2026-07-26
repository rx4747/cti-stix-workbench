# CTI STIX Workbench

This package contains the local-first Obsidian community plugin for authoring,
validating, investigating, and exporting STIX 2.1 intelligence.

Version 0.1 provides a complete generated authoring catalog and active-note
graph workflow. It is a useful alpha, not a claim that every conditional rule
for every STIX family already has positive and negative conformance fixtures.
See the repository coverage matrix for exact evidence.

## Install a release manually

Create `.obsidian/plugins/cti-stix-workbench/` in your vault and copy the
release's `main.js`, `manifest.json`, and `styles.css` into it. Restart Obsidian,
enable community plugins, and enable **CTI STIX Workbench**.

Obsidian 1.8.10 or newer is required. The repository compiles against the
separately versioned `obsidian` npm API package pinned in `package.json`.

## Use

1. Open a Markdown note with a supported `stix_type`.
2. Run `Edit STIX properties` for catalog-defined fields and nested values.
3. Link STIX notes normally for navigation.
4. Add exportable relationships with list items such as
   `- stix:uses [[Target note]]`.
5. Run `Validate active STIX graph`.
6. Run `Export active STIX graph`.

Validation does not modify notes. Export persists missing identities once and
writes a collision-safe Bundle under the configured export directory.

## Development

Run these commands from this package:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run check:generated
```

`npm run smoke` builds and loads the production bundle against a minimal
Obsidian API stub. `npm run install:dev` copies `main.js`, `manifest.json`, and
`styles.css` into the repository vault's ignored development-plugin directory.

The installed plugin has no runtime dependencies or network calls. Validation,
authoring, and export use locally bundled, pinned standards data and do not
transmit vault content.

## Commands

- `Edit STIX properties` opens the catalog-driven editor for a supported typed
  Markdown note.
- `Validate active STIX graph` discovers outgoing linked STIX notes to the
  configured depth and validates the resulting Bundle without changing the
  vault.
- `Export active STIX graph` performs the same validation, persists missing IDs
  once, and creates a collision-safe timestamped JSON file in the configured
  export folder.

The commands are shown only for supported typed Markdown notes and define no
default hotkeys.

## License

Plugin software is licensed under Apache License 2.0. Vault content and
templates are distributed separately under Creative Commons Attribution 4.0
International.
