<div align="center">

# CTI STIX Workbench

**A local-first Obsidian plugin for turning connected investigation notes into valid STIX 2.1 Bundles.**

[![Release](https://img.shields.io/github/v/release/rx4747/cti-stix-workbench?display_name=tag&sort=semver)](https://github.com/rx4747/cti-stix-workbench/releases/latest)
[![CI](https://github.com/rx4747/cti-stix-workbench/actions/workflows/ci.yml/badge.svg)](https://github.com/rx4747/cti-stix-workbench/actions/workflows/ci.yml)
[![Obsidian](https://img.shields.io/badge/Obsidian-1.8.10%2B-7c3aed)](https://obsidian.md)
[![License](https://img.shields.io/github/license/rx4747/cti-stix-workbench)](LICENSE)

[Obsidian community page](https://community.obsidian.md/plugins/cti-stix-workbench) · [Download the plugin](https://github.com/rx4747/cti-stix-workbench/releases/latest) · [Get the vault template](https://github.com/rx4747/cti-investigation-vault) · [Report a problem](https://github.com/rx4747/cti-stix-workbench/issues) · [Sponsor the project](https://github.com/sponsors/rx4747)

</div>

CTI STIX Workbench keeps the analyst workflow in Obsidian. You write normal
Markdown, connect evidence with wiki links and Canvas, edit structured STIX
properties when you need them, and export a reviewable Bundle without sending
your vault to a hosted service.

## What it does

- Provides catalog-driven property editing for standard STIX 2.1 objects.
- Validates an active note and its connected graph against pinned local schemas.
- Visualizes STIX JSON or connected notes as an interactive, icon-based graph.
- Gives explicit, readable diagnostics instead of silently changing bad data.
- Persists missing STIX identifiers safely and keeps them stable across exports.
- Exports collision-safe JSON Bundles to a vault-relative folder.
- Runs offline on Obsidian desktop without runtime network calls or telemetry.

## Plugin or vault template?

| Project | Use it for |
| --- | --- |
| **CTI STIX Workbench** (this repository) | Editing, validation, graph traversal, and Bundle export. |
| [**CTI Investigation Vault**](https://github.com/rx4747/cti-investigation-vault) | A clean starting structure with analyst workflows, all STIX templates, and fictional examples. |

They are independent. The plugin never creates, replaces, or uploads your vault.

## Install

Open the [CTI STIX Workbench community page](https://community.obsidian.md/plugins/cti-stix-workbench)
for the current Obsidian listing and installation status.

For a manual installation, download `main.js`, `manifest.json`, and `styles.css` from the
[latest release](https://github.com/rx4747/cti-stix-workbench/releases/latest),
then place them in:

```text
<your-vault>/.obsidian/plugins/cti-stix-workbench/
```

Restart Obsidian, open **Settings → Community plugins**, and enable
**CTI STIX Workbench**. Obsidian 1.8.10 or newer is required.

## A five-minute first run

1. Run **Create STIX object** and search for one of the 42 standalone types.
2. Run **Edit STIX properties** to fill in catalog-defined fields.
3. Link related STIX notes with ordinary `[[wiki links]]`.
4. Add an exportable relationship as a list item, for example:

   ```markdown
   - stix:uses [[Target note]]
   ```

5. Run **Validate active STIX graph** and review any diagnostics.
6. Run **Open in STIX viewer** to inspect and arrange the local graph.
7. Run **Export active STIX graph** to write a STIX Bundle to `Exports/`.

Ordinary links remain useful context and appear in Graph view. They become STIX
Relationships only when you use the explicit `stix:<relationship-type>` form.

Canvas, folder, and whole-vault commands are also available. Canvas semantics
come only from directed file-node edges labeled `stix:<relationship-type>`.
Whole-vault export always requires confirmation and can be cancelled before any
Bundle is written.

## Documentation

- [User guide and fictional tutorial](docs/user-guide.md)
- [Mapping rules](docs/mapping.md)
- [Canvas semantics](docs/canvas.md)
- [STIX viewer](docs/viewer.md)
- [Patterns](docs/patterns.md)
- [Markings](docs/markings.md)
- [Custom content](docs/extensions.md)
- [Compatibility and limitations](docs/compatibility.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Architecture](docs/architecture.md)

## Privacy and safety

Validation and export happen on your device. The installed plugin does not call
remote APIs, load schemas from the internet, or transmit vault contents.

Keep operational vaults private. Do not commit credentials, customer data,
restricted intelligence, malware samples, exploit payloads, or personal data to
a public repository.

CTI STIX Workbench is a desktop-only Obsidian plugin. Mobile installations are
not supported.

## Development

Requirements: Node.js 22.22.1 or newer and Corepack.

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm format:check
corepack pnpm verify:sources
corepack pnpm test
corepack pnpm lint:marketplace
corepack pnpm typecheck
corepack pnpm build
corepack pnpm smoke
corepack pnpm check:release
```

Corepack pins pnpm for reproducible installs. Biome handles fast formatting and
baseline checks, while the Obsidian ESLint rules remain the type-aware
Marketplace gate. Husky and nano-staged check changed files before a commit;
commitlint keeps commit messages in the Conventional Commits format.

The validation toolchain uses checksum-pinned OASIS STIX 2.1 sources under
`standards/`. Generated runtime files stay out of Git; small declaration files
remain committed so source review and type-aware linting work from a clean clone.

## Releases

Maintainers add release notes under `## Unreleased` in `CHANGELOG.md`, then run
the **Prepare release** workflow to choose a patch, minor, or major increment.
That workflow opens a reviewable version PR. After it is merged, the
**Release Obsidian plugin** workflow creates an annotated tag, verifies the
project, attests the three release files, and opens a draft release for manual
review.

## Support the project

If this saves you time, you can support ongoing maintenance through
[GitHub Sponsors](https://github.com/sponsors/rx4747). Bug reports, careful
testing, and focused pull requests are equally welcome.

## License

The plugin and its tooling are available under the [Apache License 2.0](LICENSE).
Vendored standards retain their original license notices.
