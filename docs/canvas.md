# Canvas semantics

Canvas is an optional, user-authored visual scope. The workbench reads JSON
Canvas file nodes that point to typed Markdown notes; it does not generate or
auto-layout `.canvas` files. Text, link, group, image, and other node types
remain visual context.

## Build a Canvas scope

1. Create a Canvas with Obsidian's normal **Create new canvas** action.
2. Drag the STIX notes you want to validate or export onto it as file nodes.
3. Draw directed edges from each source object to its target object.
4. Label only the edges that should become STIX Relationships.
5. Run **Validate active STIX canvas** and resolve blocking diagnostics.
6. Run **Export active STIX canvas** to create a Bundle from that scope.

Only resolvable Markdown file nodes enter the export scope. A note can come
from manual authoring, an analyst workflow, or Bundle import; its origin does
not change Canvas behavior.

## Give edges STIX meaning

A directed edge has STIX meaning only when its label is exactly
`stix:<relationship-type>`, using a lowercase STIX relationship name. The edge
direction maps `fromNode` to `source_ref` and `toNode` to `target_ref`. Untyped,
invalid, or ambiguous edges never create hidden relationships.

Both endpoints must resolve to typed Markdown notes in the Canvas scope.
Identical Markdown and Canvas declarations share one persisted relationship
identity. Distinct explicitly authored Relationship notes remain distinct.

The **Read typed Canvas edges** setting can disable edge semantics while still
using Canvas file nodes as the export scope.

## Understand what Canvas does not do

- **Import STIX Bundle as notes** creates typed notes and an import overview,
  not a Canvas.
- The STIX viewer has its own read-only, temporary graph layout. Moving nodes
  there does not create or edit a Canvas.
- Canvas positions, colors, groups, text cards, and untyped edges are not STIX
  properties and do not enter an exported Bundle.
- Validation and export read the active Canvas; they do not rearrange it.

Format reference: [JSON Canvas 1.0](https://jsoncanvas.org/spec/1.0/).
