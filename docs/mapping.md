# Mapping rules

The generated [compatibility matrix](stix-2.1-coverage.md) links every type to
its normative STIX 2.1 Errata 01 section. The rules below cover behavior that is
not obvious from a field table.

- `stix_type` and `stix_id` are the note-facing aliases for STIX `type` and
  `id`. Conflicting aliases are errors.
- `## Summary`, `## Content`, and `## Explanation` map only to the object types
  that define `description`, Note `content`, or Opinion `explanation`.
- Reference fields accept `[[wiki links]]`; the mapper resolves them to IDs only
  when the target typed note is inside the export scope.
- Only `stix:<type> [[target]]` relationship declarations and typed Canvas edges
  create Relationship Objects. Ordinary links are contextual.
- SCO identifiers use the normative contributing properties and canonical JSON
  to produce UUIDv5 values. A UUIDv4 fallback is reported when contributing
  references cannot be resolved before assignment.
- Standard relationship tables are recommendations, not a closed vocabulary.
  Strict mode reports a warning for an unusual but valid relationship.
- Standard schemas remain authoritative for required fields, ranges,
  vocabularies, hashes, nested extension constraints, and reference shapes.

Source: [STIX 2.1 Errata 01](https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html).
