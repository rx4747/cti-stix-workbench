# Custom content and extension registry

Standard STIX properties and predefined SCO extensions need no configuration.
Custom object types, custom properties, and Extension Definition payloads are
preserved, but strict validation requires an explicit local allowlist.

Create the registry at the vault-relative path configured in plugin settings
(the default is `STIX Extensions/registry.json`):

```json
{
  "version": 1,
  "object_types": ["x-example-object"],
  "properties": ["x_example_score"],
  "extension_definitions": [
    "extension-definition--00000000-0000-4000-8000-000000000001"
  ]
}
```

Names are lowercase and use STIX custom-content conventions. Extension payload
keys must be a predefined extension name or an Extension Definition identifier
that is included in the Bundle or registry. An invented standard-looking name
is rejected rather than treated as a predefined extension.

Lenient mode permits syntactically valid unregistered custom objects and
properties for exploratory work. It does not bypass invalid names, malformed
extension keys, the pinned schemas for standard objects, or reference checks.
