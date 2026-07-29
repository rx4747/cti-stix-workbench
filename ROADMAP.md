# Roadmap

The roadmap is a scenario-first plan for the next major Workbench release.
Shipped v1 behavior remains documented in the README, user guides, command
reference, and compatibility boundary. Everything below is planned and
unshipped.

The detailed 2.0 design is in
[v2 visual workspaces](docs/v2-visual-workspaces.md).

## 2.0 — Visual investigation workspaces

Status: planned, with alpha and beta previews before the stable 2.0 release.

Version 2.0 will rebuild the Workbench around visual, scenario-driven
investigations:

- empty-vault onboarding and guided creation of the first investigation;
- 36 official cyber-first scenarios spanning triage, incident response,
  hunting, attribution, exposure, and intelligence production;
- reusable modules for timelines, Observed Data, Indicators, Sightings,
  ATT&CK, attribution, detection, mitigation, reporting, markings, review, and
  retrospectives;
- separate read-only **STIX viewer** and editable **STIX visual builder** modes
  backed by one graph engine;
- a full type-aware property inspector, drag-and-drop object creation,
  dedicated Relationship-note edge creation, and reviewed bulk evidence flows;
  and
- portable persistent layouts, change previews, atomic rollback, and explicit
  duplicate decisions.

The v2 release will remove all Canvas functionality and generated Canvas
assets. It will also remove generated vault templates and vault
synchronization. The separate CTI Investigation Vault repository will be
archived only when stable v2 launches; it remains independent and supported
for the shipped v1 line until then.

Existing v1 notes and `.canvas` files will not be rewritten. V1 notes retain
expert viewing, validation, and export commands but cannot enter Builder mode.
Migration is an explicit Bundle export followed by import into a new v2 vault.
Existing `.canvas` files remain untouched and are ignored by v2.

See the
[scenario catalog and planned contracts](docs/v2-visual-workspaces.md) for the
complete unshipped design.

## 2.1 — Local quality and matching

Status: planned after stable 2.0.

- Audit confirmed scopes for broken references, conflicting versions,
  ID/type mismatches, duplicate relationships, and SCO identity collisions.
- Detect likely duplicate STIX objects and require reviewed resolution rather
  than automatic merging.
- Compare two local Bundles without modifying either source.
- Evaluate the supported STIX Indicator-pattern subset against local SCO and
  Observed Data notes.
- Create Sighting drafts only from analyst-reviewed matches.

## 2.2 — TAXII 2.1

Status: planned and opt-in.

- Introduce reviewed pull and push through shared collection, pagination,
  preview, cancellation, conflict, and receipt contracts.
- Require confirmation before inbound writes or outbound transmission; do not
  run scheduled or automatic synchronization.
- Use Obsidian network and SecretStorage APIs within the compatibility boundary
  published for the release.

## 2.3 — OpenCTI

Status: planned and opt-in.

- Add platform-specific collection discovery, imports, and exports on the
  shared connector contracts.
- Preview mappings and conflicts before any local write or outbound sharing.
- Record non-secret operation receipts without retaining credentials or
  transmitted intelligence.

## 2.4 — MISP

Status: planned and opt-in.

- Define explicit MISP attribute and object mappings.
- Show lossy or unsupported mappings before import or export.
- Keep synchronization reviewed, cancellable, and receipt-backed.

## Release gates

Every release must pass the checks appropriate to its actual change set.
Stable product releases also require generated-contract checks, unit and
integration tests, zero-warning marketplace lint, typecheck, production build
and smoke testing, clean-vault Obsidian QA, release-package verification, an
annotated numeric tag, provenance attestations, and exactly three release
assets.
