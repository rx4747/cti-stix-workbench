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
corepack pnpm test
corepack pnpm lint:marketplace
corepack pnpm typecheck
corepack pnpm build
corepack pnpm smoke
corepack pnpm check:release
```

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
