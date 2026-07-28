# Property editor

The property editor is the main structured-authoring interface. Open a typed
Markdown note and run **Edit STIX properties**. The editor reads the pinned
STIX 2.1 catalog and presents controls appropriate to that object type; it does
not guess a schema from the current values.

## What appears in the editor

Required properties and optional properties already present in frontmatter are
shown immediately. An absent optional property is not written as an empty
placeholder. Use **Add property** to add it deliberately, or **Remove
property** to remove an optional property and its value.

Three prose properties remain in Markdown instead of a small form control:

| STIX property | Markdown section |
| --- | --- |
| `description` | `## Summary` |
| Note `content` | `## Content` |
| Opinion `explanation` | `## Explanation` |

Edit those sections in the normal Obsidian editor. The property modal leaves
them unchanged.

## Field controls

| Property shape | Editor control | How to enter it |
| --- | --- | --- |
| String, timestamp, integer, or number | Single-line input | Enter the scalar value. Numeric values are converted when valid; validation reports malformed values. |
| Closed STIX vocabulary | Dropdown | Choose a permitted value. An existing invalid value remains visible and marked invalid so it is not silently replaced. |
| Boolean | Three-state dropdown | Choose **True**, **False**, or **Not set**. |
| Primitive list | Multiline input | Enter one value per line. |
| STIX reference | Compact pill and typed-note picker | Choose a compatible typed note by name. The pill shows its title and STIX type; raw IDs can be added for external objects. |
| STIX reference list | Removable pills and typed-note picker | Add compatible typed notes without copying IDs or reading full vault paths. |
| Nested object list | Repeatable cards | Choose **Add item**, complete its child fields, and add or remove cards as needed. |
| Structured object | Nested field group | Complete the child controls. Empty optional children are removed on save. |
| Dictionary without catalog children | JSON text area | Enter one JSON object. Invalid JSON blocks saving and remains local to the modal. |
| `extensions` | Extension cards | Add a compatible predefined extension from the dropdown. Existing custom or Extension Definition payloads use a JSON object editor. |

Empty optional strings, lists, objects, and nested values are cleaned before
writing. Required fields remain present even when incomplete so the note stays
an honest draft and validation can explain what is missing.

Conditional requirements remain conditional in the editor. For example, a
granular marking requires `selectors` plus exactly one of `lang` or
`marking_ref`; a Marking Definition requires the deprecated `definition_type`
and `definition` pair only when it does not use the extension mechanism.

## References and nested values

Reference properties accept either a raw STIX identifier or an Obsidian link:

```yaml
created_by_ref: "[[Analyst Team]]"
object_marking_refs:
  - "[[TLP Green]]"
```

Use **Choose STIX note** or **Add STIX note** to search typed notes by title,
STIX type, or path. Where the specification limits a reference target, the
picker applies the catalog restriction—for example, `created_by_ref` offers
Identity notes and `object_marking_refs` offers Marking Definitions.
Selected references appear as compact title-and-type pills. The full
vault-relative link remains in frontmatter for unambiguous resolution but is
available only as the pill tooltip, not as editor clutter.

During mapping, links resolve to the referenced typed note's STIX ID. A link
must resolve inside the selected export scope. A valid raw ID may point outside
the Bundle and produces a warning because its type and target cannot be checked
locally.

For an Indicator, add **Kill chain phases** and use **Add item** for each
phase. Each card exposes `kill_chain_name` and `phase_name`. Add **External
references** the same way; each card exposes fields such as `source_name`,
`external_id`, `description`, `url`, and `hashes`. The editor exports only the
nested values that are actually populated.

## Predefined and custom extensions

When the active type supports predefined SCO extensions, add the `extensions`
property and choose a compatible extension. For example, a File may add
`archive-ext`, `ntfs-ext`, `pdf-ext`, `raster-image-ext`, or
`windows-pebinary-ext`; Network Traffic and Process expose their own compatible
extension families.

The predefined extension card uses catalog-driven nested controls. A custom
extension key or an Extension Definition ID is preserved as JSON. In strict
validation mode, custom content must be declared in the local
[extension registry](extensions.md).

## Identity, timestamps, and versions

- `stix_type`, `stix_id`, `created`, and `modified` are read-only in the modal.
- A new note may have an empty `stix_id`; the first successful export assigns
  and persists the correct identifier.
- Authored SDOs, SROs, and SMOs receive UUIDv4 identifiers. SCOs use the STIX
  deterministic UUIDv5 algorithm when their ID-contributing properties can be
  resolved; generated Relationship identities are also stable across exports.
- Once an object has a stable ID, `created_by_ref` is immutable in the modal.
- Saving a real change to a versioned object advances `modified`
  monotonically. Saving without a change does not alter it.
- Editing a note in place represents the current version. To retain both old
  and new versions in the same investigation, first run **Create new STIX
  object version**, then edit the newly opened copy.
- **Revoke STIX object in a new version** creates a separate copy with
  `revoked: true`; it does not destroy the prior version.
- SCOs and Marking Definitions do not use these version commands.

Only create or revoke a new version when you are authorized to represent the
object creator. Otherwise create a new object with a new ID and cite the source
object.

## Saving, cancelling, and validation

**Save properties** updates only the catalog fields controlled by the modal.
Unknown frontmatter keys and Markdown prose are preserved. **Cancel** closes
the modal without writing. Invalid dictionary JSON blocks saving.

Saving is not a substitute for validation. After editing, run the validation
command for the scope you intend to export. Validation enforces required
values, timestamps, vocabularies, reference shapes, nested constraints,
markings, Indicator patterns, extensions, and cross-object semantics.

## Worked Indicator example

1. Run **Create STIX object**, choose **Indicator**, and choose a note title and
   vault-relative path.
2. Add a meaningful `name` and edit `## Summary` for the description.
3. Open **Edit STIX properties** and set `pattern_type` to `stix`.
4. Enter a pattern such as `[domain-name:value = 'example.invalid']`.
5. Add `indicator_types` and enter one vocabulary value per line.
6. Add `kill_chain_phases`, choose **Add item**, and complete both child
   fields.
7. Add `external_references`, choose **Add item**, and provide at least
   `source_name` plus the appropriate URL or external ID.
8. Save, connect the Indicator with an explicit relationship, then run
   **Validate active STIX graph**.
9. Review the graph with **Open in STIX viewer** and export only after the
   validation report is acceptable.
