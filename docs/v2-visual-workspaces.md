# V2 visual workspaces

Status: **unshipped design specification**.

This document defines the planned product and data contracts for the 2.0
program. It does not describe behavior available in the current v1 release.
Current commands, compatibility, Canvas behavior, and vault workflows remain
documented by the existing v1 guides until stable 2.0 ships.

## Product direction

Version 2.0 keeps ordinary Markdown STIX notes as the persisted, portable source
of truth. A visual workspace organizes and authors those notes for one
investigation; it is not a graph database or a replacement file format. An
analyst starts with a real mission, selects an official scenario, supplies the
first known facts, and receives a minimally complete set of notes whose
relationships can be rendered as a STIX graph.

The program has six goals:

1. Make a useful first investigation possible in an empty vault.
2. Organize cyber intelligence work around recognizable analyst scenarios.
3. Make note authoring visual without weakening explicit STIX semantics.
4. Keep every multi-file mutation previewed, collision-safe, and atomic.
5. Preserve a read-only expert path for existing v1 Markdown and local JSON.
6. Retire Canvas and generated-vault coupling at the stable v2 boundary.

V2 remains local-first. The installed 2.0 runtime performs no connector
traffic. TAXII, OpenCTI, and MISP are separate, later, opt-in roadmap releases.

## Scenario catalog

The built-in catalog contains exactly 36 official cyber-first scenarios.
Custom scenario definitions are not part of 2.0. Each scenario has a guided
intake, a minimally complete starting note set and derived graph, recommended
modules, and explicit expansion paths. Required anchors are facts the analyst
supplies; they are never fabricated defaults.

### Triage and intake

| # | Scenario | Initial analyst anchor |
| -: | --- | --- |
| 1 | General CTI investigation | Subject, question, and known source |
| 2 | Intelligence-report intake | Report title, producer or publisher, and source |
| 3 | IOC/observable triage | One or more observed values and observation context |
| 4 | Suspicious artifact/file triage | File or Artifact facts and provenance |
| 5 | Vulnerability/exploit triage | Vulnerability identifier or description and affected context |

### Investigate and respond

| # | Scenario | Initial analyst anchor |
| -: | --- | --- |
| 6 | Phishing | Message, sender, recipient, URL, domain, or attachment evidence |
| 7 | Business email compromise | Account or Identity, communication evidence, and incident context |
| 8 | Malware infection | Affected system, malware evidence, and observation time |
| 9 | Ransomware/extortion | Affected scope, observed behavior, and incident time |
| 10 | Credential compromise | Affected account or Identity and observed access evidence |
| 11 | Endpoint intrusion | Endpoint, observed activity, and investigation time range |
| 12 | Network intrusion/C2 | Network evidence, suspected infrastructure, and time range |
| 13 | Cloud/SaaS compromise | Tenant or service, affected Identity, and cloud evidence |
| 14 | Web/API attack | Application or API, observed request or behavior, and time range |
| 15 | Supply-chain compromise | Supplier or component, affected product, and supporting evidence |
| 16 | Data exfiltration | Affected data or system, observed transfer evidence, and time range |
| 17 | Insider threat | Relevant Identity or role, observed behavior, and handling constraints |
| 18 | OT/ICS compromise | Asset or process, observed activity, and operational context |
| 19 | DDoS/service disruption | Affected service, observed traffic or outage, and time range |
| 20 | Mobile compromise | Device or application, observed behavior, and supporting evidence |
| 21 | Destructive/wiper attack | Affected systems, destructive behavior, and incident time |

### Hunt and defend

| # | Scenario | Initial analyst anchor |
| -: | --- | --- |
| 22 | Threat hunting | Hunt hypothesis, data scope, and time range |
| 23 | ATT&CK/TTP assessment | Behavior or technique under assessment and supporting source |
| 24 | Detection engineering and coverage | Technique, behavior, or observable plus target data source |
| 25 | Mitigation/control planning | Threat behavior, affected asset or capability, and control objective |

### Track and attribute

| # | Scenario | Initial analyst anchor |
| -: | --- | --- |
| 26 | Actor/intrusion-set attribution | Suspected actor or cluster and attributed evidence |
| 27 | Campaign tracking | Campaign activity, time range, and supporting source |
| 28 | Malware/tool-family tracking | Malware or tool sample, name, behavior, or reference |
| 29 | Infrastructure/C2 mapping | Infrastructure observable and evidence linking its use |

### Exposure and abuse

| # | Scenario | Initial analyst anchor |
| -: | --- | --- |
| 30 | Brand/domain impersonation | Protected brand or Identity and suspicious domain or content |
| 31 | Leaked-credential exposure | Affected Identity or account scope and attributed exposure source |
| 32 | Exploitation-landscape assessment | Vulnerability or product scope and assessment question |

### Produce and share

| # | Scenario | Initial analyst anchor |
| -: | --- | --- |
| 33 | Strategic/sector assessment | Sector or strategic question, audience, and source set |
| 34 | Intelligence requirements and collection planning | Requirement, stakeholder, and decision need |
| 35 | Finished intelligence reporting | Analytic question, audience, and reviewed source set |
| 36 | Partner sharing and consumer feedback | Sharing purpose, recipient Identity, and releasable scope |

Some anchors can be represented by more than one STIX type. The scenario
collects the real value and context before it selects or creates the
corresponding object. It does not create placeholder team rosters, fictional
actors, guessed infrastructure, synthetic observations, or invented evidence.

## Reusable scenario modules

Scenarios compose reusable modules instead of duplicating workflow logic.
A module can contribute object roles, required fields, compatible
relationships, workflow steps, inspector sections, visual layout guidance, and
review rules.

| Module | Planned responsibility |
| --- | --- |
| Timeline | Normalize event times and display ordered activity without inventing precision |
| Observed Data | Group reviewed observations and their SCO references |
| Indicators | Build type-correct patterns from analyst-supplied values |
| Sightings | Record reviewed Indicator or object sightings with observation context |
| ATT&CK | Map attributed public ATT&CK techniques and supporting behavior |
| Attribution | Separate claims, confidence, sources, and competing hypotheses |
| Detection | Connect behaviors, observables, data sources, and detection work |
| Mitigation | Connect threat behavior to reviewed mitigations or controls |
| Reporting | Assemble report membership, narrative, audience, and publication state |
| Markings | Apply object and granular markings with visible handling constraints |
| Review | Track analytic review, unresolved questions, and approval state |
| Retrospectives | Capture outcomes and lessons without rewriting source evidence |

Modules do not own independent copies of evidence. They describe roles and
views over scenario-owned or shared STIX notes.

## Planned contracts

The following contracts are conceptual and versioned. Exact serialized field
names may change during alpha, but the responsibilities and trust boundaries
are release requirements.

### `MissionDefinition`

A mission groups scenarios by analyst intent and controls how they are
presented during onboarding.

```ts
interface MissionDefinition {
  contractVersion: number;
  id: string;
  title: string;
  description: string;
  scenarioIds: string[];
  recommendedScenarioIds: string[];
}
```

The built-in missions are triage and intake, investigate and respond, hunt and
defend, track and attribute, exposure and abuse, and produce and share.
Mission selection narrows discovery only; it does not change STIX semantics.

### `ScenarioBlueprint`

A blueprint defines one official scenario and the minimum analyst input needed
to create it.

```ts
interface ScenarioBlueprint {
  contractVersion: number;
  id: string;
  missionId: string;
  title: string;
  outcome: string;
  anchorPrompts: AnchorPrompt[];
  rootGroupingRole: ObjectRole;
  objectRoles: ObjectRole[];
  relationshipRecipes: RelationshipRecipe[];
  moduleIds: string[];
  workflowIds: string[];
  reportRecipes: ReportRecipe[];
  sourceRequirements: SourceRequirement[];
  initialLayout: LayoutRecipe;
}
```

Blueprints reference the generated STIX catalog for type properties and valid
Relationship combinations. Optional roles can be skipped. A required role
must be satisfied by validated analyst input or an explicitly selected,
compatible existing Library object.

### `ScenarioModule`

A module supplies reusable scenario behavior while leaving input parsing and
mutation to their proper boundaries.

```ts
interface ScenarioModule {
  contractVersion: number;
  id: string;
  title: string;
  supportedScenarioIds: string[];
  objectRoles: ObjectRole[];
  relationshipRecipes: RelationshipRecipe[];
  inspectorSections: InspectorSection[];
  workflowSteps: WorkflowStep[];
  reviewRules: ReviewRule[];
  layoutHints: LayoutHint[];
}
```

Modules are pure definitions. They cannot enumerate the vault, write notes,
send network requests, or silently add evidence.

### `WorkspaceManifest`

Every v2 investigation has a portable manifest stored with its workspace. The
manifest indexes note membership and presentation; it stores no STIX object
content, does not replace the notes, and is not exported as STIX evidence.

```ts
interface WorkspaceManifest {
  contractVersion: number;
  workspaceId: string;
  scenarioId: string;
  rootGroupingPath: string;
  memberPaths: string[];
  ownedPaths: string[];
  libraryReferences: string[];
  workflowPaths: string[];
  reportPaths: string[];
  sourcePaths: string[];
  layout: WorkspaceLayout;
  moduleState: ModuleState[];
  revision: number;
}
```

`workspaceId` is local workspace metadata, not a STIX identifier. Paths are
normalized, vault-relative, and traversal-safe. The manifest records
membership separately from ownership so one workspace can reference promoted
Library intelligence without copying or deleting it.

Layout data includes stable node positions, collapsed groups, viewport hints,
and visual preferences needed to reopen the same view. It never becomes the
source of STIX content or changes the meaning of notes and Relationships.

### `WorkspaceChangePlan`

Every Builder mutation produces a complete, reviewable note-and-layout plan
before it touches the vault.

```ts
interface WorkspaceChangePlan {
  contractVersion: number;
  workspaceId: string;
  baseRevision: number;
  reason: string;
  creates: PlannedCreate[];
  updates: PlannedUpdate[];
  membershipChanges: PlannedMembershipChange[];
  layoutChanges: PlannedLayoutChange[];
  duplicateDecisions: DuplicateDecision[];
  collisions: PlannedCollision[];
  validation: PlannedValidationResult;
  rollback: RollbackPlan;
}
```

The adapter rechecks the manifest revision, source hashes, selected
references, destinations, and collisions immediately before commit. It stages
all creates and edits, commits them as one transaction, and compensates fully
if any later operation fails. Existing files are never overwritten.

Plans distinguish:

- creating or updating a STIX note;
- adding or removing workspace membership;
- referencing or promoting a Library object;
- changing only visual layout; and
- moving a note to trash through a separate, explicit confirmation.

## Empty-vault onboarding

V2 onboarding applies only to a user-confirmed empty-vault setup. It previews a
small Markdown-first structure and does not touch `.obsidian`:

```text
Home.md
Inbox/
Investigations/
Library/
Imports/
Exports/
```

- `Home.md` explains the local structure and links to the first investigation.
- `Inbox/` receives analyst-selected material awaiting review.
- `Investigations/` contains independent visual workspaces.
- `Library/` contains shared Identities, markings, and explicitly promoted
  intelligence.
- `Imports/` is the reviewed entry point for local Bundles.
- `Exports/` receives collision-safe validated Bundle exports.

The structure is proposed through a `WorkspaceChangePlan`. Onboarding stops on
unexpected files or collisions and never overwrites, relocates, or adopts
them. It does not create settings, CSS snippets, community-plugin state,
workspaces, hotkeys, or any other `.obsidian` content.

After the structure preview, onboarding asks the analyst to:

1. select a mission and scenario;
2. enter the scenario's real anchor values and provenance;
3. select any compatible existing Library objects;
4. choose optional modules and handling markings;
5. review the minimally complete note set, derived graph, destinations, and
   relationships; and
6. confirm the atomic creation plan.

The result includes one root Grouping Markdown note, the minimum supported
scenario object notes, explicit Relationship notes where required, the
portable manifest, and links from `Home.md`. It does not invent evidence or
fill optional roles with placeholders.

## Workspace ownership

Each investigation workspace contains:

- one root Grouping Markdown note that defines the investigation scope;
- one portable `WorkspaceManifest`;
- scenario-owned STIX Markdown notes and dedicated Relationship notes;
- selected analyst workflow notes;
- Reports or report drafts; and
- local source notes or references required to support analytic claims.

Shared Identities, markings, and intelligence promoted by the analyst live in
`Library/`. Referencing a Library object adds workspace membership but does not
transfer ownership. Removing a member from the visual graph changes membership
only. Moving any underlying note to trash is a separate action with its own
impact preview and confirmation.

STIX identities continue to be generated and persisted only after the complete
export scope validates and immediately before a successful validated export.
The workspace manifest's local identifier and paths do not become STIX
identities.

## Notes, one graph engine, and two modes

The viewer and Builder share a pure graph model, layout primitives, renderer,
selection state, and navigation behavior. The graph model is derived from
validated Markdown notes selected for the current scope. It is not persisted as
a second copy of STIX content. The modes have different capabilities and trust
boundaries.

### STIX viewer

Viewer mode is read-only. It can render:

- the note membership declared by a v2 workspace;
- a selected note, folder, or all supported STIX Markdown notes in an explicit,
  user-confirmed scope through the expert mapping path; and
- selected local STIX JSON through the bounded JSON parser.

Viewer parses the chosen notes into a derived graph without modifying them.
Loading all supported notes is an explicit, cancellable, progress-aware action;
opening Viewer never silently enumerates the whole vault.

Viewing raw JSON never makes it editable. An analyst must import the JSON
Bundle into a new v2 workspace, review its conflict and path plan, and complete
the atomic import before Builder mode becomes available.

### STIX visual builder

Builder mode is available only for a valid v2 workspace manifest. Planned
capabilities include:

- drag a compatible STIX type or scenario role onto the graph to propose a new
  Markdown note;
- complete required note properties in a full type-aware inspector;
- edit supported common and type-specific note properties;
- add references through filtered, compatible object selection;
- draw a catalog-valid edge that creates a dedicated Relationship note;
- add reviewed objects through bulk evidence flows;
- preview Report and Grouping membership changes;
- persist visual layout without changing STIX meaning; and
- inspect the exact file and membership plan before confirming changes.

Builder actions collect every required field before producing a plan. Drawing
an edge never creates a hidden wiki-link interpretation: it creates a
dedicated Relationship note with explicit source, target, and relationship
type. Ordinary links remain ordinary links.

Confirmation atomically creates or updates the planned Markdown notes and then
refreshes the derived graph. Builder never stores STIX objects only in a visual
graph, manifest, browser storage, or another opaque workspace database.

The property inspector displays validation errors, marking implications,
reference compatibility, provenance, and fields that will receive generated
values only at export. Unsupported or raw properties remain visible through
the expert view rather than being silently discarded.

## Bulk evidence and duplicate handling

Bulk flows cover common repeated evidence without bypassing review:

- SCO and observable intake;
- type-correct Indicator pattern creation;
- Observed Data grouping;
- reviewed Sighting creation;
- Report or Grouping membership; and
- repeated compatible Relationships.

The preview groups exact duplicates, likely semantic duplicates, existing
Library matches, path collisions, and new objects. For each item, the analyst
chooses reuse, add membership, skip, or create separately when the type permits
it. No automatic merge rewrites existing intelligence.

The final plan records every duplicate decision. Validation and collision
checks run again at commit time. A partial write rolls back the entire plan and
leaves the previous workspace revision usable.

## V1 transition and Canvas retirement

V2 does not mutate an existing v1 vault in place.

- Existing v1 notes retain expert viewing, validation, and export commands.
- Existing v1 notes cannot enter Builder mode.
- The supported migration path is to export a validated Bundle from v1 and
  import it into a newly onboarded v2 vault.
- Existing `.canvas` files remain untouched but are completely ignored by v2.
- No Canvas parser, Canvas command, Canvas generation, Canvas synchronization,
  or generated Canvas asset ships in stable v2.
- Generated vault templates and vault synchronization do not ship in stable
  v2.

The plugin and CTI Investigation Vault repositories remain independent during
alpha and beta. The separate vault repository is archived only when stable v2
launches and the replacement onboarding, migration documentation, and release
artifacts are available.

The shipped v1 documentation is not rewritten in advance. Removal notes,
compatibility changes, command updates, migration guidance, generated-contract
changes, and repository archival instructions land with the implementation
release that changes those behaviors.

## Preview program

The 2.0 program ships through explicit prerelease stages:

### Alpha

- prove empty-vault onboarding and transactional workspace creation;
- validate the shared graph engine and viewer/Builder separation;
- exercise representative scenarios from every mission;
- test Relationship-note creation, the inspector, layout persistence, and
  rollback; and
- establish the migration path with disposable copies of v1 fixtures.

Alpha vaults are disposable. Contract and manifest migrations are not promised
until the beta boundary is published.

### Beta

- enable all 36 built-in scenarios and all reusable modules;
- complete bulk evidence and duplicate-resolution flows;
- validate accessibility, keyboard operation, themes, narrow panes, and
  popout windows;
- test performance and cancellation on documented large local workspaces;
- complete removal of Canvas and generated-vault behavior from the v2 build;
  and
- freeze versioned manifest and change-plan compatibility for stable 2.0.

### Stable 2.0

- pass clean-vault onboarding and migration acceptance tests;
- publish accurate compatibility, command, and user documentation;
- ship no Canvas or generated-vault assets;
- preserve offline runtime behavior and atomic write guarantees; and
- archive the separate CTI Investigation Vault repository only after the v2
  release and migration materials are public.

## Later releases

The scenario engine and workspace transaction boundary become the foundation
for later roadmap work:

- **2.1 — Local quality and matching:** scoped reference audits, duplicate
  detection, Bundle comparison, supported Indicator evaluation, and reviewed
  Sighting creation.
- **2.2 — TAXII 2.1:** opt-in reviewed pull and push through shared connector
  contracts.
- **2.3 — OpenCTI:** platform-specific collections, imports, exports, conflict
  previews, and receipts.
- **2.4 — MISP:** explicit attribute and object mapping, loss warnings, and
  reviewed synchronization.

Connectors remain opt-in and use the compatibility release's approved Obsidian
network and SecretStorage APIs. They must preview inbound writes and outbound
sharing, support cancellation and pagination, redact secrets, and retain only
non-secret receipts.

## Non-goals for 2.0

- Custom or third-party scenario definitions.
- Background, scheduled, or automatic synchronization.
- Network connectors of any kind.
- Automatic merging, repair, or deletion of analyst notes.
- Editing arbitrary local STIX JSON in place.
- In-place conversion of v1 vaults or Canvas files.
- Invented evidence, placeholder actors, or generated team rosters.
