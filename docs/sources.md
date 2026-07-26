# Standards sources

`standards/sources.json` records every standards or framework input used to
generate, validate, or test the plugin. The STIX prose is normative. JSON
Schemas and reference implementations are validation aids and do not override
normative STIX requirements.

Run the offline manifest check during normal development:

```bash
npm run verify:sources
```

Maintainers may explicitly compare all upstream bytes with their committed
SHA-256 pins:

```bash
npm run verify:sources:remote
```

Remote verification is never performed by the installed plugin. Updating a pin
requires reviewing the upstream change, updating affected fixtures and catalog
entries, and recording the compatibility impact.
