# User guide

## Install and prepare

Install the plugin through Obsidian's community-plugin flow or copy the three
files from a GitHub release into `.obsidian/plugins/cti-stix-workbench/`. Enable
the plugin, then optionally download the separate
[CTI Investigation Vault](https://github.com/rx4747/cti-investigation-vault).

The plugin does not require the template vault. It never uploads or replaces a
vault.

## Import the official OASIS APT1 example

1. Open `Examples/OASIS APT1/apt1.json` from the vault template.
2. Run **Import STIX Bundle as notes** and review the 76-object type summary.
3. Confirm the destination. The import is atomic: an existing destination or
   any write failure leaves no partial investigation.
4. Open the generated `Import Overview.md` and then **Open in STIX viewer**.
5. Inspect an Indicator's nested kill-chain phase and external references with
   **Edit STIX properties**. Add absent optional properties through **Add
   property**; `created_by_ref` is not required.
6. Validate and export the imported folder. The Bundle ID and JSON formatting
   may change, while object IDs, properties, nested values, and Relationships
   remain semantically equivalent.

The example is OASIS Open's published APT1 corpus and is retained with its BSD
3-Clause attribution. It is public historical sample data, not project-authored
intelligence.

## Create and edit objects

Run **Create STIX object**, search by the human title or STIX type, confirm the
note title/path, and review the generated required fields. Run **Edit STIX
properties** for catalog-driven scalar, reference, list, dictionary, marking,
and predefined-extension controls. Cancelling either modal creates no file and
saves no changes. Once an object has an ID, `id`, `created`, and
`created_by_ref` are immutable in the editor. Saving a real change advances
`modified`; SCOs remain non-versioned. Only use the version and revocation
commands for objects whose creator you are authorized to represent. Otherwise,
create a new object with a new ID and cite the source object.

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
