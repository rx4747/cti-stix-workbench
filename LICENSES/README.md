# License map

- Plugin source, tests, scripts, and documentation in this repository:
  [Apache License 2.0](../LICENSE).
- Vendored OASIS STIX schemas and grammar: their upstream notices under
  [`standards/vendor/stix-2.1`](../standards/vendor/stix-2.1/).
- Bundled OASIS STIX visualization icons: the BSD 3-Clause notice in
  [`STIX-VISUALIZATION.md`](STIX-VISUALIZATION.md). The complete notice is also
  embedded in the generated `main.js` release asset.
- The separately published CTI Investigation Vault and its generated analyst
  templates: the license declared by that repository. They are not bundled in
  the plugin release.

The three-file plugin release contains only `main.js`, `manifest.json`, and
`styles.css`. Plugin code is Apache-2.0; the icon data embedded in `main.js`
retains the OASIS BSD 3-Clause notice described above.
