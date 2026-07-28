# Roadmap

The roadmap preserves the Workbench's local-first trust boundary while making
authoring, review, and eventual interoperability more capable. Shipped behavior
is documented elsewhere; roadmap entries are plans, not compatibility claims.

## 1.6.0 — Scenario workspaces and evidence growth

Status: planned. The existing fixed workspace packs will be replaced by a
data-driven scenario engine. The selectable blueprints will cover:

- general CTI investigation, incident response, phishing, malware,
  ransomware, vulnerability exploitation, credential compromise, cloud or
  SaaS compromise, supply-chain compromise, data exfiltration, and insider
  threat;
- brand or domain impersonation, IOC and observable triage, Indicator
  lifecycle and Sightings, threat hunting, and infrastructure or C2 mapping;
  and
- actor or intrusion-set attribution, campaign tracking, ATT&CK technique
  assessment, detection and mitigation planning, and strategic reporting.

Each blueprint will declare required and optional STIX object roles,
catalog-valid relationship recipes, relevant analyst workflow Notes,
type-aware prompts and defaults, Canvas layout hints, and additions available
after creation. Required evidence will come from reviewed analyst input;
optional roles may be skipped and no fictional evidence will be generated.

**Create investigation workspace** will become a staged, file-previewed wizard
for a fresh scenario. It will collect the object roster, per-object properties,
explicit relationships, workflow selection, and destination. Producer and
marking references will remain independent optional fields on compatible
objects. Initial Canvas creation will be opt-in and unchecked.

**Add to current investigation** is planned for reviewed single-object and
bulk growth: Indicators, SCOs, Observed Data, Sightings, workflow Notes,
Reports, existing vault objects, Report membership, and explicit
relationships. Bulk Indicator input will create type-correct patterns and
support an optional shared collection event. Duplicate Indicators and SCOs
will require an explicit reuse, skip, or create-separate decision.

Relationship authoring will remain UUID-free. The existing relationship
builder starts from an active source note, offers catalog-compatible targets
and types, and writes an explicit declaration such as
`stix:indicates [[Target|Target]]`. The new investigation flows will reuse the
same catalog and declaration contract, preferring workspace targets before a
vault-wide picker. Validated export will materialize declarations as STIX
Relationship Objects.

Every multi-file addition will preview creates and edits, use collision-safe
paths, recheck edited sources, avoid overwrites, and compensate if a later
write fails. A versioned HTML comment in the root Grouping will carry portable
workspace metadata without entering exported STIX.

## 1.6.1 — Additional origins and additive Canvas sync

Status: planned. Workspace creation will add four more origins:

- link an active typed STIX note in place without copying its identity;
- import a local Bundle unchanged beneath a new wrapper Grouping;
- adopt an existing folder after unambiguous root-Grouping detection; and
- create a structural fork that reuses scenario and workflow choices while
  generating new identities and copying no evidence.

**Sync active investigation Canvas** will match file nodes by normalized note
path and typed edges by source, relationship type, and target. It will preview
only missing nodes and edges, then add them without deleting, moving, or
restyling existing coordinates, groups, text cards, colors, manual edges, or
analyst annotations.

Representative QA and showcase coverage will include Incident Response,
Phishing, Indicator and Sighting work, and the existing attributed APT1 import.
The remaining scenarios will stay plugin-generated instead of adding 21 large
example workspaces to the repository.

Release verification will cover minimal and fully selected scenario forms,
all creation origins, invalid and ambiguous input, collisions and rollback,
bulk and repeated Indicator flows, duplicate handling, Report membership,
relationship validity, optional producer and marking behavior, and
non-destructive Canvas synchronization. The normal generated-contract,
documentation, security, unit, lint, typecheck, build, smoke, clean-vault
Obsidian, and release-package gates will still apply.

## 1.7 — Local quality control

- Audit folders or the confirmed whole vault for broken typed references,
  conflicting versions, ID/type mismatches, duplicate relationships, and SCO
  identity collisions.
- Compare two local Bundles without modifying either source.
- Navigate to findings without automatic merging or repair.

## 1.8 — Indicator matching and Sightings

- Evaluate a documented STIX Indicator-pattern subset against local SCO and
  Observed Data notes.
- Never report uncertain matches for unsupported expressions.
- Create reviewed Sighting drafts from confirmed local matches.

## 1.9 — Offline interoperability foundation

- Introduce pure collection, pagination, preview, cancellation, and receipt
  contracts shared by future connectors.
- Exercise ingestion and conflict handling with a local Bundle inbox.
- Keep the installed runtime network-free.

## 2.0 — Opt-in TAXII 2.1

- Discover API roots and collections, pull paginated objects with previews,
  and explicitly push a reviewed Bundle.
- Require confirmation before inbound writes or outbound transmission; do not
  run scheduled or automatic synchronization.
- Support HTTP Basic and bearer-token authentication, with credentials stored
  only in Obsidian SecretStorage.
- Use HTTPS and Obsidian `requestUrl`, raise the minimum Obsidian version to the
  first supported SecretStorage release, and disclose network behavior on every
  public plugin surface.

MISP and OpenCTI adapters may follow after the TAXII connector establishes a
stable, reviewable interoperability contract.

## Release gates

Every minor release requires generated-contract checks, unit and integration
tests, zero-warning marketplace lint, typecheck, production build and smoke
test, clean-vault Obsidian QA, release-package verification, an annotated
numeric tag, provenance attestations, and exactly three release assets.
