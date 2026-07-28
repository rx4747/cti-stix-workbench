# Analyst workflow library

Run **Create analyst workflow** to search the complete library. Each workflow
creates a STIX Note draft with analyst prompts, safe vault-relative placement,
and a link to the active Markdown note when one is open. The separate
[CTI Investigation Vault](https://github.com/rx4747/cti-investigation-vault)
contains the same files as reusable Obsidian templates.

| Introduced | Workflow | Default folder | Primary purpose |
| --- | --- | --- | --- |
| 1.3.0 | Intake and Triage | `02 Investigations` | Request, scope, urgency, handling, evidence, and disposition. |
| 1.3.0 | IOC and Observable Triage | `02 Investigations` | Normalization, provenance, validity, false positives, and disposition. |
| 1.3.0 | Pivot and Enrichment Log | `02 Investigations` | Queries, results, provenance, limitations, new leads, and dead ends. |
| 1.3.0 | Analytic Timeline | `02 Investigations` | Observed, reported, and inferred event ordering with uncertainty. |
| 1.3.0 | Hypothesis Matrix | `02 Investigations` | Competing explanations, diagnostic evidence, bias checks, and collection. |
| 1.3.0 | Peer Review | `04 Reports` | Sourcing, logic, alternatives, confidence, markings, and release decision. |
| 1.4.0 | Indicator Lifecycle Review | `02 Investigations` | Candidate, active, inactive, expired, and revoked Indicator decisions. |
| 1.4.0 | Sighting Assessment | `02 Investigations` | Where, when, how, and how often an Indicator or observable was seen. |
| 1.4.0 | ATT&CK Mapping Review | `02 Investigations` | Evidence-led technique mappings, alternatives, and defensive relevance. |
| 1.4.0 | Malware Triage | `02 Investigations` | Hashes, capabilities, infrastructure, family assessment, and limitations. |
| 1.4.0 | Actor and Campaign Assessment | `02 Investigations` | Attribution, motivations, capabilities, targeting, alternatives, and confidence. |
| 1.5.0 | Intelligence Gap Tracker | `02 Investigations` | Questions, collection tasks, priority, ownership, and closure evidence. |
| 1.5.0 | Dissemination Review | `04 Reports` | Audience, redaction, handling, licensing, authorization, and channels. |
| 1.5.0 | Consumer Feedback | `04 Reports` | Usefulness, decision impact, unmet needs, corrections, and follow-up. |
| 1.5.0 | Investigation Retrospective | `02 Investigations` | Outcomes, missed pivots, gaps, coordination, and reusable lessons. |

## STIX behavior

Every generated workflow is a STIX 2.1 Note draft. It maps the Markdown under
`## Content` to the Note's required `content` property. Complete required
frontmatter, use `object_refs` for typed STIX objects discussed by the
workflow, and validate before export.

An active typed STIX note is added to `object_refs` and **Related notes**.
An active ordinary Markdown note is added only to **Related notes** because it
cannot be a valid STIX object reference. The command never edits the source
note and never creates implied Relationships.

The catalog and generated template manifest are versioned with the plugin.
Each manifest records the SHA-256 digest of all 15 corresponding vault
templates so synchronization is reviewable and drift is detected.
