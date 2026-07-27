# Canvas semantics

The workbench reads JSON Canvas file nodes that point to Markdown notes. Text,
link, group, image, and other node types remain visual context.

A directed edge has STIX meaning only when its label is exactly
`stix:<relationship-type>`, using a lowercase STIX relationship name. The edge
direction maps `fromNode` to `source_ref` and `toNode` to `target_ref`. Untyped,
invalid, or ambiguous edges never create hidden relationships.

Both endpoints must resolve to typed Markdown notes in the Canvas scope.
Identical Markdown and Canvas declarations share one persisted relationship
identity. Distinct explicitly authored Relationship notes remain distinct.

The **Read typed Canvas edges** setting can disable edge semantics while still
using Canvas file nodes as the export scope.

Format reference: [JSON Canvas 1.0](https://jsoncanvas.org/spec/1.0/).
