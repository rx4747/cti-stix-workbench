---
stix_type: grouping
stix_id: grouping--44444444-4444-4444-8444-444444444444
spec_version: "2.1"
created_by_ref: "[[Fictional CTI Team]]"
created: "2026-07-26T09:00:00.000Z"
modified: "2026-07-26T09:00:00.000Z"
confidence: 70
name: "Example Investigation"
context: suspicious-activity
object_refs:
  - "[[Fictional CTI Team]]"
  - "[[Frost Lantern]]"
  - "[[Frost Lantern Indicator]]"
  - "[[Signal Lantern Domain]]"
  - "[[Reserved Address]]"
---

# Example Investigation

> [!warning] Fictional training data
> Every entity and assertion in this investigation is fictional. The domain uses
> the reserved `.invalid` top-level domain and the address is from TEST-NET-2.

## Summary

The fictional Frost Lantern activity cluster is used to demonstrate a complete
local STIX workflow. A fabricated indicator combines
[[Signal Lantern Domain]] with [[Reserved Address]] and points to the fictional
[[Frost Lantern]] actor hypothesis. No claim in this note describes real
infrastructure or activity.

## Intelligence question

How can an analyst move from a small set of fictional observables to an
explicitly scoped, reviewable STIX Bundle?

## Facts

- `signal-lantern.invalid` is reserved for examples and cannot identify a
  production domain.
- `198.51.100.23` belongs to the IANA TEST-NET-2 documentation range.

## Analysis

- **Assessment:** The linked notes demonstrate association and export mechanics
  only.
- **Confidence:** High that the example is safe training content; no confidence
  is assigned to any real-world threat judgment.
- **Assumption:** Analysts will replace the fictional notes with locally
  authorized evidence in their own vault.

## Graph and Canvas

Open local Graph view to inspect backlinks among the linked STIX notes. Open
[[Example Investigation.canvas]] for the curated visual layout.

## Sources

- STIX 2.1 pinned sources are documented in [[docs/sources]].
- Reserved values are explained in each observable note.

## Relationships

The exportable relationships are declared on
[[Frost Lantern Indicator]]. Ordinary links in this investigation provide
context and graph navigation only.
