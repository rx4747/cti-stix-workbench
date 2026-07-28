# Troubleshooting

## A command does not appear

Commands are context-sensitive. Open the required file first: a typed Markdown
note for property, active-graph, and version commands; a `.canvas` file for
Canvas commands; or a `.json` file for Bundle import. Version commands also
require a supported non-revoked object with an ID and `modified` timestamp.
See the [command reference](commands.md).

## A property is missing from the editor

Only required and already-present properties are shown initially. Use **Add
property** for an absent optional field. `description`, Note `content`, and
Opinion `explanation` are edited in their mapped Markdown sections. See the
[property-editor guide](property-editor.md).

## A reference is unresolved

Ensure the target is a typed Markdown note inside the selected scope. Folder
and Canvas export do not follow references to notes outside that scope.

## A custom property is blocked

Use lowercase `x_` naming and add the property to the configured local
extension registry. See [custom content](extensions.md). Lenient mode permits
unregistered valid custom content but does not bypass malformed names or
standard schemas.

## A Canvas edge is ignored

Confirm both endpoints are Markdown file nodes, the edge is directed, its label
uses lowercase `stix:`, and **Read typed Canvas edges** is enabled.

## Bundle import did not create a Canvas

This is expected. Import creates one typed Markdown note per STIX object and an
`Import Overview.md`; it does not create or auto-layout a Canvas. Create a
Canvas in Obsidian, drag imported notes onto it as file nodes, and label directed
relationship edges with values such as `stix:uses`. See
[Canvas semantics](canvas.md).

## Export creates another filename

This is intentional. The workbench never overwrites an existing Bundle and
adds a numeric suffix when timestamps collide.

## A note cannot be exported

Run validation and use the report's **Open** button. Codes, object paths,
fields, and source locations identify the failing input without logging the
note body.
