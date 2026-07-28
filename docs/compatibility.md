# Compatibility and limitations

- STIX baseline: 2.1 Errata 01, validated with a pinned normative specification
  and pinned local OASIS validation aids.
- Obsidian baseline: 1.8.10 or newer.
- Platform: desktop only.
- Runtime network and telemetry: none.
- Supported scopes: active graph, active Canvas, recursive folder, whole vault.
- Import: local STIX 2.1 JSON Bundles become typed notes through an atomic,
  previewed write.
- Viewer inputs: local STIX Bundle JSON, individual objects, object arrays, and
  active typed Markdown graphs.
- Supported standard surface: 1 Bundle, 19 SDOs, 2 SROs, 18 SCOs, 3 Meta
  Objects, and 12 predefined SCO extensions.

The workbench implements STIX JSON producer and consumer workflows, including
multiple object versions, object and granular markings, standard and
registry-declared extensions, and Level 3 STIX pattern syntax validation. The
normative Errata text takes precedence where its language-marking rule is newer
than the upstream helper schema. That single local schema correction is covered
by a regression test. The evidence suite is tracked locally; the
project will publish a formal conformance claim only after the complete
normative requirement matrix receives an independent release review.

The Obsidian scorecard's three reported network calls are local `antlr4ng`
token-buffer operations named `fetch`, not HTTP requests. The runtime has no
network client and does not transmit vault data.

The following remain outside the supported boundary: TAXII transport, MISP or
OpenCTI synchronization, pattern evaluation against observations, remote
extension-schema fetching, collaborative/multi-user editing, and hosted
services. Mobile is outside the supported platform boundary.

Relationship recommendations are warnings because STIX permits custom
relationships. TLP 2.0 is documented as a handling profile layered on STIX
2.1, not silently substituted for the fixed STIX TLP definitions.

The OASIS visualization project has no distinct icon for every STIX 2.1-only
type. The viewer uses the upstream generic custom-object icon for those types.
