# Command reference

Open the Obsidian Command palette with `Ctrl/Cmd+P`, type the command name, and
press Enter. Commands that require a particular active file appear only when
that file is open. **Open in STIX viewer** is also available from the ribbon and
from the file menu for supported files.

## Authoring and import

| Command | Available when | What it does |
| --- | --- | --- |
| **Create STIX object** | Always | Searches all authorable STIX 2.1 SDO, SRO, SCO, and Meta Object types, then creates a typed Markdown note at a vault-relative path. Required properties are added as draft values. |
| **Edit STIX properties** | A supported typed Markdown note is active | Opens the catalog-driven property editor for the note. It does not edit Bundles or standalone predefined-extension templates. |
| **Import STIX bundle as notes** | A local `.json` file is active | Parses and validates a STIX 2.1 Bundle, previews its type counts and destination, then atomically creates linked notes and an import overview. |
| **Create new STIX object version** | An eligible, non-revoked versioned object with an ID and `modified` value is active | Copies the note, retains `id`, `created`, and `created_by_ref`, advances `modified`, and opens the new timestamped note. The original version remains. |
| **Revoke STIX object in a new version** | The same conditions as the new-version command | Creates a new timestamped version with `revoked: true`. The original version remains. |

SCOs are not versioned in STIX 2.1. Marking Definitions also do not use the
normal version lifecycle. The version commands therefore do not appear for
those objects or for an already revoked version.

## View

| Command | Available when | What it does |
| --- | --- | --- |
| **Open in STIX viewer** | A typed Markdown note or local STIX `.json` file is active | Opens a read-only, icon-led graph. Markdown uses the active-graph traversal settings; JSON may contain a Bundle, one object, or an object array. |

The viewer does not validate or modify its input. See the [viewer guide](viewer.md)
for its controls, relationship display, references, and side panel.

## Validate and export

| Command | Scope | Notes |
| --- | --- | --- |
| **Validate active STIX graph** | The active typed note plus explicit relationships and optionally contextual links | Read-only. Uses link depth and contextual-link settings. |
| **Export active STIX graph** | The same active graph | Validates first, persists missing IDs only after validation succeeds, then writes a new Bundle. |
| **Validate active STIX canvas** | Markdown file nodes in the active Canvas | Typed directed Canvas edges may become Relationships. |
| **Export active STIX canvas** | The same Canvas scope | Validates before writing. Untyped visual Canvas content remains context only. |
| **Validate current folder as STIX** | All typed Markdown notes below the active file's folder | Recurses through subfolders and reports skipped untyped notes. |
| **Export current folder as STIX** | The same recursive folder scope | Does not follow links to pull files from outside the folder. |
| **Validate whole vault as STIX** | Every typed Markdown note in the vault | Shows progress and supports cancellation. Untyped notes are skipped. |
| **Export whole vault as STIX** | Every typed Markdown note in the vault | Requires confirmation, shows progress, and can be cancelled before IDs or a Bundle are written. |

Validation reports separate blocking errors from warnings. Use an error's
**Open** action to return to its source note. Export never overwrites an
existing file; timestamp collisions receive a numeric suffix.

## How scope and relationships work

- An explicit Markdown declaration such as `- stix:uses [[Target]]` creates a
  STIX Relationship Object.
- A directed Canvas edge labeled `stix:uses` maps its source file node to
  `source_ref` and its destination file node to `target_ref`.
- An ordinary `[[wiki link]]` is contextual. It is followed only for the active
  graph when **Include contextual linked objects** is enabled, and it never
  silently becomes a STIX Relationship.
- Folder and whole-vault scopes discover files by location; they do not expand
  past the selected location through contextual links.
- Valid raw STIX IDs may refer outside the selected Bundle. They are retained
  with a warning when their targets cannot be inspected locally.

See [Canvas semantics](canvas.md) and [mapping rules](mapping.md) for the exact
conversion contract.

