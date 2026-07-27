# Release checklist

1. Move reviewed notes from `Unreleased` into the exact numeric version section.
2. Run `pnpm check` and `pnpm check:release` from a clean checkout.
3. Merge the version PR created by **Prepare release**.
4. Dispatch **Release Obsidian plugin** from the default branch.
5. Confirm the annotated numeric tag points to the intended commit.
6. Confirm the draft has release notes and exactly `main.js`, `manifest.json`,
   and `styles.css`.
7. Download the assets and verify every GitHub attestation.
8. Install those three assets in a clean desktop vault and run the fictional
   graph and Canvas exports.
9. Publish the reviewed draft manually, then refresh the Obsidian submission.

Do not publish when generated coverage is stale, a capability is not verified,
or the version differs across the tag, manifest, package, versions map, and
changelog.
