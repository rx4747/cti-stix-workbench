# OASIS APT1 STIX 2.1 example

This directory contains the official OASIS APT1 threat-report Bundle as a
realistic example for CTI STIX Workbench.

Open `Generated Notes/Import Overview.md` to browse all 76 already-expanded,
linked objects immediately. Those notes are a reproducible snapshot generated
from `apt1.json`; the Bundle remains the authoritative source.

1. Browse `Generated Notes/Import Overview.md`, or open `apt1.json` in Obsidian
   and run **Open in STIX viewer**.
2. To create an editable copy elsewhere in the vault, run **Import STIX Bundle
   as notes** from `apt1.json`.
3. Review the preview: 76 objects, including 30 Relationship objects.
4. Confirm the import into `STIX Imports/apt1`.
5. Open `Import Overview.md`, then inspect the imported objects in the STIX
   viewer.
6. Run **Validate current folder as STIX** and **Export current folder as
   STIX** to verify the semantic round trip.

The example intentionally omits `created_by_ref`: STIX 2.1 defines that common
property as optional. Nested kill-chain phases and external references remain
available through **Edit STIX properties**.

Do not manually edit the committed generated snapshot in the template
repository. Regenerate it through the Workbench so nested fields, filenames,
references, and its integrity manifest stay synchronized with the Bundle. A
personal vault copy can be edited normally.

Source: OASIS Open `cti-stix2-json-schemas`,
`examples/threat-reports/apt1.json`, commit
`c4f8d589acf2bdb3783655c89e0ffb6e150006ae`.

Copyright (c) 2016 OASIS Open. Distributed under the BSD 3-Clause License. See
`LICENSE-OASIS-STIX.txt` in this directory.
