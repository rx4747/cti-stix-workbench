# Repository agent instructions

These instructions apply to every file and task in this repository.

## Mandatory skill

Before investigating, planning, editing, reviewing, testing, or documenting any
repository change, read and follow
`.agents/skills/obsidian-plugin-development/SKILL.md` completely. Load the
skill's referenced documents when their routing rules apply. If a required
official source is unavailable, stop before changing Obsidian-facing behavior
and report the missing source.

## Non-negotiable boundaries

- Preserve the pure STIX core and Obsidian adapter/UI separation described in
  `docs/architecture.md`.
- Treat all vault, JSON, Canvas, settings, and network input as untrusted.
- Prefer Obsidian APIs over direct filesystem, Electron, browser-storage, or
  hand-written frontmatter operations.
- Keep user paths normalized, vault-relative, and traversal-safe.
- Never enumerate the whole vault, transmit data, overwrite a file, persist an
  identity, or mutate a note without the command's documented scope and user
  intent.
- Keep runtime behavior offline unless the compatibility contract for the
  target release explicitly permits an opt-in connector.
- Never store credentials in plugin data, settings, logs, notices, Markdown,
  Canvas, exports, fixtures, screenshots, or Git history.
- Keep plugin source and the separate CTI Investigation Vault repository
  independent. Only the existing reviewable generator workflow may propose
  generated vault assets.

## Delivery contract

- Use Corepack with the `packageManager` version; do not change pnpm versions
  incidentally.
- Preserve Conventional Commits and keep body lines at 100 characters or less.
- Use fictional, attributed public, or standards-reserved test intelligence.
- Update the changelog, user documentation, compatibility boundary, tests, and
  generated contracts when behavior changes.
- Before handoff, run the checks selected by the mandatory skill. Release work
  must also pass `corepack pnpm check:release` and contain only `main.js`,
  `manifest.json`, and `styles.css` as release assets.
