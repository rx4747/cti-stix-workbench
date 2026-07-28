---
name: obsidian-plugin-development
description: Build, change, review, test, document, or release CTI STIX Workbench safely against current official Obsidian plugin guidance and repository contracts. Use for every task in this repository, including pure STIX core work, Obsidian APIs and UI, vault or Canvas operations, settings, manifests, releases, documentation, automation, and tests.
---

# Obsidian Plugin Development

Use official Obsidian guidance and the Workbench's stricter local-first
contracts before making changes. Load references only when their routing rules
apply.

## Start every task

1. Read `AGENTS.md`, the relevant source and tests, and
   `references/repository-contract.md`.
2. Classify the task as core STIX, Obsidian-facing, release/manifest, or
   connector/network work. More than one class may apply.
3. For Obsidian-facing or release/manifest work, read
   `references/official-docs.md` and refresh the linked official page when the
   decision depends on current API or policy behavior.
4. Trace the actual command, adapter, pure-core, and UI path before editing.
5. State the intended scope and preserve unrelated worktree changes.

## Implement safely

- Keep external input as `unknown` until a boundary parser validates it.
- Keep mapping, validation, comparison, planning, and connector protocols pure
  and dependency-injected. Put Vault, Workspace, Modal, ItemView, SecretStorage,
  and HTTP behavior in Obsidian adapters or UI modules.
- Edit the active document through `Editor` when appropriate; use
  `FileManager.processFrontMatter` for frontmatter and `Vault.process` for
  atomic background text changes. Prefer `Vault` over `Adapter`.
- Register events, DOM handlers, intervals, views, and cleanup through Obsidian
  lifecycle helpers. Do not leave callbacks alive after unload.
- Normalize every user-defined path and reject absolute paths, parent traversal,
  empty segments, and paths outside the vault.
- Use Obsidian components and CSS variables. Preserve keyboard operation,
  focus, theme compatibility, narrow desktop panes, and popout windows.
- Make broad discovery explicit, cancellable, and progress-aware. Never turn a
  targeted command into silent whole-vault enumeration.
- Preview multi-file writes, plan collision-safe paths first, write through a
  staging boundary, and commit atomically. Never overwrite existing user data.
- Keep validation read-only. Persist generated IDs only after the complete
  scope validates and immediately before a successful export.
- Preserve STIX IDs, versions, markings, references, and explicit relationship
  semantics. Ordinary wiki links never silently become Relationships.

## Network and secrets

- Treat offline operation as an invariant unless the target release's published
  compatibility contract explicitly enables an opt-in connector.
- Use Obsidian `requestUrl` for approved connector traffic and HTTPS endpoints
  by default. Never use hidden requests, telemetry, or background sync.
- Store passwords and bearer tokens only in Obsidian `SecretStorage`. Store
  non-secret endpoints, selections, and receipts in versioned plugin data.
- Require a preview and confirmation before inbound writes or outbound sharing.
- Update README and listing disclosures whenever network behavior changes.

## Verify proportionally

- Pure core change: run focused Vitest files, typecheck, and marketplace lint.
- Obsidian adapter/UI change: add fake-host or pure-state coverage, run the full
  check and smoke bundle, then test the actual command in a disposable vault.
- Generated-source change: regenerate intentionally and run
  `corepack pnpm check:generated` plus the relevant contract tests.
- Documentation-only change: run `corepack pnpm check:docs` and formatting.
- Release/manifest change: run `corepack pnpm check` and
  `corepack pnpm check:release`; verify numeric annotated tags, changelog notes,
  attestations, and exactly three assets.
- Network/connector change: additionally test authentication failures,
  redaction, cancellation, pagination, malformed input, conflict previews, and
  the runtime security boundary.

Always use the project-pinned command form: `corepack pnpm ...`.

## Finish the task

1. Confirm tests exercise downstream behavior rather than only successful API
   calls.
2. Update documentation and `CHANGELOG.md` without claiming unimplemented
   roadmap items.
3. Inspect `git diff --check`, generated output, and staged scope.
4. Report what changed, what was verified, and any remaining manual QA.

Do not reproduce official documentation in comments or local docs. Link to the
authoritative source and record only the repository-specific decision.
