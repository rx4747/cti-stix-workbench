import workflowLibrary from "../../standards/analyst-workflows.json";

export interface AnalystWorkflowDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly introducedIn: string;
  readonly defaultFolder: string;
  readonly body: readonly string[];
}

export const analystWorkflowLibraryVersion = workflowLibrary.libraryVersion;
export const analystWorkflowDefinitions: readonly AnalystWorkflowDefinition[] =
  Object.freeze(workflowLibrary.workflows);

export interface RelatedWorkflowNote {
  readonly basename: string;
  readonly path: string;
}

function yamlScalar(value: unknown): string {
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value);
}

function wikiTarget(note: RelatedWorkflowNote): string {
  return note.path.toLowerCase().endsWith(".md") ? note.path.slice(0, -3) : note.path;
}

export function safeWorkflowTitle(value: string): string {
  return value
    .trim()
    .replaceAll(/[\\/:*?"<>|#^[\]]/gu, "-")
    .replaceAll(/\s+/gu, " ")
    .replaceAll(/-+/gu, "-")
    .replace(/^[-. ]+|[-. ]+$/gu, "")
    .slice(0, 120);
}

export function defaultWorkflowPath(
  workflow: AnalystWorkflowDefinition,
  title: string,
): string {
  const safeTitle = safeWorkflowTitle(title);
  if (safeTitle === "") throw new TypeError("An analyst workflow title is required.");
  return `${workflow.defaultFolder}/${safeTitle}.md`;
}

export function createAnalystWorkflowNote(
  workflow: AnalystWorkflowDefinition,
  title: string,
  now: Date,
  relatedNote?: RelatedWorkflowNote,
): string {
  const timestamp = now.toISOString();
  const reference =
    relatedNote === undefined ? undefined : `[[${wikiTarget(relatedNote)}]]`;
  const frontmatter: Readonly<Record<string, unknown>> = {
    stix_type: "note",
    stix_id: "",
    spec_version: "2.1",
    created_by_ref: "",
    labels: [workflow.id],
    created: timestamp,
    modified: timestamp,
    revoked: false,
    confidence: 50,
    lang: "en",
    object_marking_refs: [],
    abstract: workflow.description,
    authors: [],
    object_refs: reference === undefined ? [] : [reference],
    external_references: [],
    granular_markings: [],
    extensions: {},
  };
  const frontmatterLines = Object.entries(frontmatter).map(
    ([key, value]) => `${key}: ${yamlScalar(value)}`,
  );
  return [
    "---",
    ...frontmatterLines,
    "---",
    "",
    `# ${title.trim()}`,
    "",
    ...workflow.body,
    "",
    "## Related notes",
    "",
    reference === undefined ? "-" : `- ${reference}`,
    "",
    "## Relationships",
    "",
    "-",
    "",
  ].join("\n");
}
