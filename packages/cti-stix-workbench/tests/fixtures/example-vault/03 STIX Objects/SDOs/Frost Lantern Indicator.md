---
stix_type: indicator
stix_id: indicator--33333333-3333-4333-8333-333333333333
spec_version: "2.1"
created_by_ref: "[[Fictional CTI Team]]"
created: "2026-07-26T09:20:00.000Z"
modified: "2026-07-26T09:20:00.000Z"
confidence: 70
labels:
  - fictional-example
indicator_types:
  - malicious-activity
name: "Frost Lantern Indicator"
pattern: "[(domain-name:value = 'signal-lantern.invalid') AND (ipv4-addr:value = '198.51.100.23')]"
pattern_type: stix
pattern_version: "2.1"
valid_from: "2026-07-26T09:20:00.000Z"
---

# Frost Lantern Indicator

## Summary

A fictional compound indicator joining a reserved domain and documentation-only
IPv4 address. It is safe test data and must not be treated as a real detection.

## Relationships

- stix:indicates [[Frost Lantern]]
- stix:based-on [[Signal Lantern Domain]]
- stix:based-on [[Reserved Address]]

## Analysis

- **Fact:** Both observable values are reserved for documentation.
- **Assessment:** The relationship to [[Frost Lantern]] demonstrates an analyst
  hypothesis, not real attribution.

## Sources

- [[Example Investigation]]
