# Markings and handling profiles

CTI STIX Workbench supports STIX 2.1 Statement and TLP Marking Definition
objects, whole-object `object_marking_refs`, and granular markings. A granular
selector must identify a property present on the exported object, and every
marking reference must resolve to a Marking Definition inside the Bundle.

STIX 2.1 defines fixed TLP 1.0 Marking Definition identifiers. TLP 2.0 is not a
replacement built into the STIX 2.1 specification. If an organization applies
TLP 2.0, it is an explicit local handling profile layered on top of STIX 2.1;
the workbench does not silently rewrite one TLP generation into another.

For organization-specific handling text, use a Statement marking:

```yaml
stix_type: marking-definition
spec_version: "2.1"
created: "2026-07-27T10:00:00.000Z"
definition_type: statement
definition:
  statement: "Share only under the documented handling agreement."
```

Markings describe handling. They are not access controls, encryption, or a
substitute for keeping an operational vault private.
