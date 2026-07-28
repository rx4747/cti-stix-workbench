# User guide

CTI STIX Workbench turns typed Markdown notes, explicit relationships, Canvas
files, folders, and local STIX JSON into validated STIX 2.1 workflows. It runs
locally in Obsidian desktop and does not require the template vault.

Use this guide for the complete workflow. Keep the [command
reference](commands.md), [property-editor guide](property-editor.md), and
[settings reference](settings.md) nearby for exact behavior.

## Install and prepare

Install the plugin through Obsidian's community-plugin flow or copy the three
files from a GitHub release into `.obsidian/plugins/cti-stix-workbench/`. Enable
the plugin, then optionally download the separate
[CTI Investigation Vault](https://github.com/rx4747/cti-investigation-vault).

The plugin does not require the template vault. It never uploads or replaces a
vault.

Before authoring, review the plugin settings:

1. Choose vault-relative import and export folders.
2. Choose whether active-note operations should follow ordinary contextual
   links and how many hops they may traverse.
3. Keep typed Canvas edges enabled if you want directed `stix:` Canvas edges to
   become Relationships.
4. Keep strict validation unless you deliberately use locally registered
   custom STIX content.

## Create an object

1. Run **Create STIX object**.
2. Search by the human title or STIX type, such as `Indicator` or
   `threat-actor`.
3. Choose the note title and a vault-relative Markdown path.
4. Open **Edit STIX properties** and complete the required fields.
5. Use **Add property** only for optional properties you intend to populate.
6. For reference fields, choose a typed STIX note by name; the plugin writes
   the wiki link and resolves its STIX ID during validation and export.
7. Edit `## Summary`, `## Content`, or `## Explanation` in normal Markdown
   when the selected object type maps prose to one of those sections.

New notes begin as honest drafts. An empty `stix_id` is normal: the first
successful export assigns and persists the correct identifier. See the
[property-editor guide](property-editor.md) for every control, nested lists,
references, extensions, identity rules, timestamps, and a worked Indicator.

## Create an analyst workflow

1. Open the investigation, report, or typed STIX note that should provide
   context.
2. Run **Create analyst workflow** and search the 15 workflow names.
3. Review the suggested title and path. Most workflows use `02 Investigations`;
   Peer Review and Dissemination Review use `04 Reports`.
4. Complete the generated prompts, add source and object links, and use the
   property editor for STIX Note properties.

When an active Markdown note is open, the new note links it in **Related
notes**. If the active note is typed STIX, the same link is also placed in
`object_refs`. Ordinary Markdown notes remain contextual and are never
misrepresented as STIX object references. See the
[complete workflow library](analyst-workflows.md).

## Connect objects

Ordinary wiki links provide analyst context. To author a STIX Relationship,
add a list item to the source note using an explicit relationship type:

```markdown
- stix:uses [[Target note]]
```

The source note becomes `source_ref`, the linked target becomes `target_ref`,
and `uses` becomes `relationship_type`. The plugin generates and persists the
Relationship UUID automatically. A directed Canvas edge works the same way
when its label is `stix:uses`. Untyped links and unlabeled Canvas edges do not
create hidden STIX semantics.

## Validate, inspect, and export

1. Run the validation command that matches the intended sharing scope: active
   graph, active Canvas, current folder, or whole vault.
2. Open each blocking error from the validation report and correct its source.
   Review warnings rather than assuming they are harmless.
3. Run **Open in STIX viewer** to inspect the object and relationship model.
   References are hidden by default to keep dense graphs readable.
4. Run the matching export command.
5. Review the new JSON Bundle under the configured export folder before
   distributing it.

Validation is read-only. Export validates again, then persists missing object
and relationship identities, and finally creates a collision-safe Bundle file.
It never overwrites an existing export.

## Import the official OASIS STIX 2.1 APT1 example

1. Open `Examples/OASIS APT1/apt1.json` from the vault template.
2. Run **Import STIX Bundle as notes** and review the 76-object type summary.
3. Confirm the destination. The import is atomic: an existing destination or
   any write failure leaves no partial investigation.
4. Open the generated `Import Overview.md` and then **Open in STIX viewer**.
5. Inspect an Indicator's nested kill-chain phase and external references with
   **Edit STIX properties**. Add absent optional properties through **Add
   property**; `created_by_ref` is optional for ordinary SDOs such as these
   imported objects.
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
`modified`; SCOs remain non-versioned.

To retain historical and current versions together, run **Create new STIX
object version** before editing the new copy. **Revoke STIX object in a new
version** also preserves the prior version. Only use either command for objects
whose creator you are authorized to represent. Otherwise, create a new object
with a new ID and cite the source object.

## Choose an export scope

- Active graph follows explicit relationships and optionally contextual links
  to the configured depth.
- Active Canvas includes resolvable Markdown file nodes and typed edges.
- Current folder recursively discovers Markdown notes and skips untyped notes.
- Whole vault requires confirmation, shows progress, and can be cancelled
  before identities or a Bundle are written.

Always review the validation report and exported JSON before sharing it.

## Find every command

The plugin registers commands for creating analyst workflows, creating and
editing objects, importing Bundles, versioning and revocation, viewing, and
four validation/export scopes.
See the [complete command reference](commands.md) for availability conditions,
side effects, and scope rules.

See also the [STIX viewer guide](viewer.md) for JSON inputs, graph controls,
unresolved-reference behavior, icon coverage, and privacy boundaries, and
[troubleshooting](troubleshooting.md) when a command or object is unavailable.
