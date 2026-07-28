# STIX viewer

The STIX viewer turns a local Bundle, individual STIX object, object array, or
connected set of typed Markdown notes into an interactive graph. It is a
read-only view: opening, filtering, arranging, and inspecting the graph never
persists IDs or changes source files.

The viewer is supported on Obsidian desktop only. Its responsive layout is for
desktop split panes and popout windows, not mobile clients.

## Open a graph

- In the file explorer, right-click a `.json` file containing a STIX Bundle,
  object, or object array and choose **Open in STIX viewer**. Obsidian does not
  provide a built-in editor for arbitrary JSON files.
- Open a typed STIX Markdown note and run the same command. The viewer follows
  the active-graph traversal settings used by validation and export.
- You can also right-click a typed note in the file explorer and choose
  **Open in STIX viewer**, or use the ribbon button while a typed note is active.

The view is restored with the workspace. Source changes refresh an open view;
file event listeners are registered only after Obsidian finishes loading.

## Read and arrange the graph

STIX Relationship Objects render as labeled solid arrows. Other top-level
`*_ref` and `*_refs` properties render as dashed reference arrows. A referenced
object missing from the selected input appears as a dashed unresolved node, so
the viewer does not hide incomplete context.

- Drag a node to rearrange it.
- Drag the background to pan and use the mouse wheel or toolbar buttons to zoom.
- Use **Fit graph to view** to restore an overview.
- Filter by object name, type, or ID.
- Select a node or edge to inspect its properties.
- For note-backed nodes, choose **Open source note** or double-click the node.

Nodes use the OASIS STIX visualization icons. That upstream icon family began
with STIX 2.0 and later added many STIX 2.1 object types. OASIS does not provide
a distinct icon for every 2.1-only type, so `extension-definition`, custom
objects, and unknown types use its generic custom-object icon. The exact
upstream commit and BSD 3-Clause notice are recorded in
[`LICENSES/STIX-VISUALIZATION.md`](../LICENSES/STIX-VISUALIZATION.md).

## Input and privacy boundaries

JSON is parsed locally and must contain unique objects with non-empty `type`
and `id` strings. Markdown graphs must be structurally mappable; schema
validation remains a separate explicit command. The viewer does not fetch
icons, schemas, or graph data from the network, and it never sends vault paths
or object content off-device.
