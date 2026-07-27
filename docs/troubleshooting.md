# Troubleshooting

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

## Export creates another filename

This is intentional. The workbench never overwrites an existing Bundle and
adds a numeric suffix when timestamps collide.

## A note cannot be exported

Run validation and use the report's **Open** button. Codes, object paths,
fields, and source locations identify the failing input without logging the
note body.
