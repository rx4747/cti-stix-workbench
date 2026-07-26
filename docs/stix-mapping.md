# STIX mapping and associations

The analyst works through Obsidian notes, Graph view, and Canvas. The plugin
exports only explicit STIX semantics from those workflows.

## From workflow to STIX

| Analyst activity | Primary STIX representation |
|---|---|
| Define a requirement or collection plan | Note |
| Run an investigation | Grouping |
| Record a source claim or evidence rationale | Note plus External References |
| Record telemetry or an observation window | Observed Data plus SCOs |
| Preserve file or payload evidence | Artifact and/or File |
| Assess confidence in referenced intelligence | Note with `confidence` and `object_refs` |
| Agree or disagree with existing STIX content | Opinion |
| Publish findings | Report |

STIX has no generic Evidence object. Use the object that describes what was
actually observed, then apply Note, markings, references, and relationships for
provenance and analysis.

## Note and property mapping

- `stix_type` maps to STIX `type`.
- `stix_id` maps to STIX `id`.
- All other standard properties retain their exact STIX snake_case names.
- A named object's title supplies `name` when no explicit value is present.
- `## Summary` supplies `description`.
- `## Content` supplies Note `content`.
- `## Explanation` supplies Opinion `explanation`.
- Nested dictionaries and complex lists remain under their standard property
  names in YAML frontmatter and are edited through the Workbench form.
- Empty optional values are omitted rather than exported as empty properties.

## Object identifiers

- Existing identifiers are preserved only when their object-type prefix matches
  the note's `stix_type` and their UUID is structurally valid.
- The workbench creates UUIDv4 identifiers for SDOs, SROs, Meta Objects, and
  Bundles. Randomness and time are injectable so export tests are repeatable.
- All 18 SCO types carry their exact ID-contributing-property list in the
  generated catalog. Present contributing values are encoded as RFC 8785
  canonical JSON and hashed in the reserved STIX UUIDv5 namespace.
- Artifact, File, and X.509 Certificate identity selects one hash using the
  specification's ordered preference. Process always uses UUIDv4. Any other SCO
  whose optional contributing properties are all absent also falls back to
  UUIDv4.
- Complete identifier coverage does not imply complete mapping/validation
  coverage for every SCO; those object fixtures still turn green in Milestone 3.

The implementation follows the
[STIX 2.1 Errata 01 object ID rules](https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html#object-ids-and-references).

## Embedded references

Reference properties accept Obsidian wiki links:

```yaml
created_by_ref: "[[Example Analysis Team]]"
object_refs:
  - "[[Fictional Investigation Grouping]]"
  - "[[203.0.113.10]]"
object_marking_refs:
  - "[[TLP Amber Marking]]"
```

On export, each link must resolve to one typed note. Its `stix_id` becomes the
reference value. Unresolved, untyped, ambiguous, or type-incompatible targets
produce diagnostics rather than guessed output.

## Relationship associations

An explicit Relationship Object note uses standard properties:

```yaml
stix_type: relationship
relationship_type: uses
source_ref: "[[Fictional Threat Actor]]"
target_ref: "[[Fictional Tool]]"
```

For fast authoring, a typed Markdown list item creates equivalent relationship
shorthand:

```markdown
- stix:uses [[Fictional Tool]]
```

The containing note is the source. The linked note is the target. Ordinary wiki
links remain navigational and are never inferred as STIX relationships.

In Canvas, an edge is exportable only when it:

1. is directed;
2. connects two resolvable file nodes containing typed STIX notes; and
3. has an explicit label such as `stix:uses`.

Unlabelled, bidirectional, group, text, and unresolved edges remain visual only.

## Graph and Bundle mapping

One catalog-driven mapper handles all 19 SDOs, both SROs, all 18 SCOs, and all
three Meta Objects. Bundle and predefined-extension catalog entries are not
standalone graph nodes; Bundles are assembled by the exporter and predefined
extensions remain nested under their parent SCO's `extensions` property.

The mapper:

- resolves standard reference fields recursively, including reference fields
  inside predefined extensions;
- accepts explicit relationship declarations from Markdown and Canvas through
  the same contract and collapses equivalent declarations;
- maps deliberate `x_*` and registered extension content without an alpha-type
  allowlist;
- deduplicates identical objects by STIX ID and blocks conflicting content that
  reuses an ID; and
- returns every generated note or shorthand-relationship identity so the
  Obsidian adapter can persist it atomically before writing a Bundle.

Objects are ordered by STIX ID for reproducible output. New Bundle IDs and
previously unseen persisted identities are the only injected-random values.

## Fast analyst path

1. Create an Investigation workflow note, represented as Grouping.
2. Add the relevant actors, indicators, malware, infrastructure, identities,
   observations, artifacts, and SCOs from complete STIX templates.
3. Populate `object_refs`, typed Markdown relationships, or directed typed
   Canvas edges.
4. Create supporting Note objects for evidence, sources, assumptions, and
   confidence rationale.
5. Create a Report referencing the reviewed objects.
6. Validate the active graph or Canvas.
7. Resolve blocking diagnostics and export the Bundle.

Generated templates expose every catalog field. The schema-driven editor will
present the same fields with searchable controls and reference pickers so normal
work does not require hand-editing YAML.
