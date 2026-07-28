# Settings reference

Open **Settings → Community plugins → CTI STIX Workbench**.

| Setting | Default | Effect |
| --- | --- | --- |
| **Export folder** | `Exports` | Vault-relative destination for validated Bundle JSON. Existing files are never overwritten. |
| **Import folder** | `STIX Imports` | Vault-relative parent folder for atomically imported Bundle notes. |
| **Link traversal depth** | `1` | Number of outgoing contextual-link hops followed from an active note, from 0 through 5. |
| **Include contextual linked objects** | On | Includes typed notes reached through ordinary links in active-graph validation, viewing, and export. It does not convert those links into Relationships. |
| **Read typed Canvas edges** | On | Converts directed Canvas edges labeled `stix:<relationship-type>` into authored Relationship Objects for Canvas operations. |
| **Validation mode** | Strict | Strict blocks unregistered custom content. Lenient permits syntactically valid unregistered custom objects and properties but still enforces standard schemas and naming rules. |
| **Pretty-print bundles** | On | Writes indented JSON for human review. Turning it off changes formatting, not Bundle semantics. |
| **Extension registry** | `STIX Extensions/registry.json` | Vault-relative path to the local allowlist for custom object types, properties, and Extension Definition IDs. |

All configured paths must stay inside the vault. Empty paths, absolute paths,
Windows drive paths, parent traversal, and empty path segments are rejected and
fall back to safe defaults.

Link traversal affects active-note operations only. Canvas, folder, and
whole-vault commands use their explicit scopes.

