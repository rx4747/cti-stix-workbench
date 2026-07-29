# Contributing

Thank you for improving CTI STIX Workbench. Keep changes focused, explain the
analyst-facing behavior, and use fictional or reserved test data only.

## Development checks

Use the Corepack-pinned package manager and run the same gates as CI:

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm format:check
corepack pnpm verify:sources
corepack pnpm check:generated
corepack pnpm check:docs
corepack pnpm check:security
corepack pnpm test
corepack pnpm lint:biome
corepack pnpm lint:marketplace
corepack pnpm typecheck
corepack pnpm build
corepack pnpm smoke
corepack pnpm audit --audit-level high
corepack pnpm check:release
```

Biome owns formatting, baseline linting, and staged-file checks. The separate
Marketplace lint command retains type-aware and Obsidian-specific rules that
Biome plugins cannot currently reproduce. Husky runs nano-staged at pre-commit
and commitlint at commit-msg. Before a push, Husky runs both linters,
typechecking, tests, a production build, and the bundle smoke test through
`corepack pnpm check:push`; generated, documentation, security, audit, and
release-package checks remain CI and pre-PR responsibilities.

Do not hand-edit generated catalog, coverage, or template outputs. Edit their
canonical sources and run `corepack pnpm generate`.

## Commits and DCO

Use Conventional Commit headers, for example `fix: validate Canvas edge
targets`. Every commit must include a Developer Certificate of Origin sign-off:

```text
Signed-off-by: Your Name <your-email@example.com>
```

Create it with `git commit -s`. By signing off, you certify the contribution
under the [Developer Certificate of Origin 1.1](https://developercertificate.org/).

## Sensitive-content boundary

Never contribute real operational CTI, customer or victim data, credentials,
personal data, malware binaries, exploit payloads, private indicators, or
restricted reports. Use `.invalid`, IANA documentation addresses, and clearly
fictional actors. Report vulnerabilities through GitHub private vulnerability
reporting, not a public issue.
