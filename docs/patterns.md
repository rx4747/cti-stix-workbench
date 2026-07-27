# STIX indicator patterns

CTI STIX Workbench parses STIX 2.1 Indicator patterns locally with the pinned
OASIS grammar. No pattern or note content is sent to a service or written to the
console.

Use `pattern_type: stix` and place the pattern in the `pattern` property:

```yaml
pattern_type: stix
pattern: "[ipv4-addr:value = '198.51.100.10']"
```

The parser supports compound observations, quoted hash keys, list indexes and
wildcards, comparison operators, and the `WITHIN`, `REPEATS`, and `START`/`STOP`
qualifiers. Syntax diagnostics include a one-based line and column in validation
reports.

Pattern parsing proves syntax. It does not claim that an observable was seen or
that the assertion is analytically correct. Bundle validation still applies the
pinned STIX schemas and the workbench's cross-object checks.
