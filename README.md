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

## v0.1 scope

Version 0.1 provides catalog-driven STIX property editing plus validation and
export of an active Markdown STIX graph. It is a useful alpha and does not claim
fixture-backed deep conformance for every conditional rule in every STIX
family.

## License

Plugin software and tooling are licensed under Apache License 2.0. 
Vendored OASIS inputs retain their included license.
