# Compatibility and limitations

- STIX baseline: 2.1 Errata 01, validated with pinned local OASIS schemas.
- Obsidian baseline: 1.8.10 or newer.
- Platform: desktop only for v1.0.
- Runtime network and telemetry: none.
- Supported scopes: active graph, active Canvas, recursive folder, whole vault.
- Supported standard surface: 19 SDOs, 2 SROs, 18 SCOs, 3 Meta Objects, and 12
  predefined SCO extensions.

The following are intentionally deferred until after v1.0: STIX/TAXII import,
MISP or OpenCTI synchronization, remote extension-schema fetching,
collaborative/multi-user editing, mobile acceptance, and hosted services.

Relationship recommendations are warnings because STIX permits custom
relationships. TLP 2.0 is documented as a handling profile layered on STIX
2.1, not silently substituted for the fixed STIX TLP definitions.
