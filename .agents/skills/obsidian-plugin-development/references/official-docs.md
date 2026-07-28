# Official Obsidian source map

Consult the relevant current page before changing Obsidian-facing behavior.
These are primary sources; repository rules may be stricter.

## API and lifecycle

- [Plugin class](https://docs.obsidian.md/Reference/TypeScript+API/Plugin)
- [Component lifecycle](https://docs.obsidian.md/Reference/TypeScript+API/Component)
- [Events](https://docs.obsidian.md/Plugins/Events)
- [Vault API](https://docs.obsidian.md/Reference/TypeScript+API/Vault)
- [FileManager API](https://docs.obsidian.md/Reference/TypeScript+API/FileManager)
- [SecretStorage API](https://docs.obsidian.md/Reference/TypeScript+API/SecretStorage)
- [`requestUrl`](https://docs.obsidian.md/Reference/TypeScript+API/requestUrl)

Use managed registration for cleanup. Prefer the Vault API over Adapter,
`Vault.process` for atomic background text changes, and
`FileManager.processFrontMatter` for frontmatter. Normalize user paths.

## UX and policy

- [Plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Submission requirements](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins)
- [Developer policies](https://docs.obsidian.md/Developer+policies)
- [CSS variables](https://docs.obsidian.md/Reference/CSS+variables/CSS+variables)

Use Obsidian primitives and variables, clean up resources, preserve privacy and
offline behavior, and disclose accounts, payments, network access, telemetry,
or access outside the vault. Node/Electron use requires desktop-only status.

## Release contract

- [Release with GitHub Actions](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)
- [Submit a plugin](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)
- [`versions.json`](https://docs.obsidian.md/Reference/Versions)
- [Plugin manifest](https://docs.obsidian.md/Reference/TypeScript+API/PluginManifest)

Use Semantic Versioning. The exact numeric annotated tag must match the
manifest version. Publish `main.js`, `manifest.json`, and optional
`styles.css` as release assets. Keep `versions.json` aligned with the minimum
compatible app version.
