# CTI STIX Workbench

This is the full open-source plugin repository for CTI STIX Workbench. It
contains the editable TypeScript source, tests, pinned STIX 2.1 validation
inputs, build tooling, CI workflow, and Obsidian plugin metadata.

## Vault template

Workflow templates, generated STIX note templates, analyst folders, example
notes, and Canvas files belong to the separate vault repository:
`cti-investigation-vault`.

## Development

Requirements: Node.js 22 or newer and npm.

```bash
npm ci
npm run verify:sources
npm test
npm run lint
npm run typecheck
npm run build
npm run smoke
npm run check:release
```

The GitHub Actions workflow runs the same commands for pushes and pull
requests. Validation and export use pinned local standards data and make no
runtime network requests.

## Release

Update `manifest.json`, `versions.json`, the package version, and the changelog
in one commit. Then create and push an annotated tag that exactly matches the
manifest version:

```bash
git tag -a 0.1.0 -m "0.1.0"
git push origin 0.1.0
```

The release workflow reruns every quality gate, verifies the version match,
builds the plugin, and creates a draft GitHub release containing only
`main.js`, `manifest.json`, and `styles.css`. Review its notes and assets before
publishing it.

## Install manually

Download `main.js`, `manifest.json`, and `styles.css` from the `0.1.0` GitHub
release. Put them in:

```text
<vault>/.obsidian/plugins/cti-stix-workbench/
```

Restart Obsidian and enable **CTI STIX Workbench** under Community plugins.
Obsidian 1.8.10 or newer is required.

## Use

1. Open a Markdown note containing a supported `stix_type` property.
2. Run **Edit STIX properties** to edit catalog-defined fields and nested STIX
   values.
3. Link STIX notes normally for navigation and Graph view.
4. Declare exportable relationships with list items such as
   `- stix:uses [[Target note]]`.
5. Run **Validate active STIX graph** to check the discovered objects without
   changing the vault.
6. Run **Export active STIX graph** to validate, persist missing identifiers,
   and create a STIX Bundle in the configured `Exports` folder.

The commands appear only for supported typed Markdown notes. The plugin defines
no default hotkeys. Settings control outgoing-link depth, Canvas relationships,
strict validation, formatting, and the vault-relative export folder.

## v0.1 scope

Version 0.1 provides catalog-driven STIX property editing plus validation and
export of an active Markdown STIX graph. It is a useful alpha and does not claim
fixture-backed deep conformance for every conditional rule in every STIX
family.

## License

Plugin software and tooling are licensed under Apache License 2.0. 
Vendored OASIS inputs retain their included license.
