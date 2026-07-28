# User guide

## Install and prepare

Install the plugin through Obsidian's community-plugin flow or copy the three
files from a GitHub release into `.obsidian/plugins/cti-stix-workbench/`. Enable
the plugin, then optionally download the separate
[CTI Investigation Vault](https://github.com/rx4747/cti-investigation-vault).

The plugin does not require the template vault. It never uploads or replaces a
vault.

## Complete the fictional investigation tutorial

1. Open the vault template and locate `Example Investigation.md`.
2. Open the linked Identity, Threat Actor, Indicator, Domain Name, and IPv4
   Address notes. The domain uses `.invalid`; the address uses an IANA
   documentation range.
3. Run **Validate active STIX graph** from the Indicator. The report shows the
   object count and any diagnostics without changing notes.
4. Run **Open in STIX viewer** to inspect the same connected objects and their
   references with the OASIS STIX icon set. Select a node to inspect it and use
   **Open source note** to return to Markdown.
5. Review the `## Relationships` entries. Only list items such as
   `stix:indicates [[Frost Lantern]]` produce Relationship Objects.
6. Run **Export active STIX graph**. Missing IDs are persisted once and the
   validated Bundle is written under `Exports/`.
7. Run the export again. A collision-safe filename is created and existing IDs
   remain stable.
8. Open `Example Investigation.canvas`, then run **Validate active STIX
   canvas**. Directed `stix:` edges have the same meaning as explicit Markdown
   relationships; duplicates are collapsed by their source, type, and target.

## Create and edit objects

Run **Create STIX object**, search by the human title or STIX type, confirm the
note title/path, and review the generated required fields. Run **Edit STIX
properties** for catalog-driven scalar, reference, list, dictionary, marking,
and predefined-extension controls. Cancelling either modal creates no file and
saves no changes.

## Choose an export scope

- Active graph follows explicit relationships and optionally contextual links
  to the configured depth.
- Active Canvas includes resolvable Markdown file nodes and typed edges.
- Current folder recursively discovers Markdown notes and skips untyped notes.
- Whole vault requires confirmation, shows progress, and can be cancelled
  before identities or a Bundle are written.

Always review the validation report and exported JSON before sharing it.

See the [STIX viewer guide](viewer.md) for JSON inputs, graph controls,
unresolved-reference behavior, icon coverage, and privacy boundaries.
