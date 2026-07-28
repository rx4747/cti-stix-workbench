import type { StixObject } from "../core/types";

export type StixViewerEdgeKind = "reference" | "relationship";

export interface StixViewerNode {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly object?: StixObject;
  readonly placeholder: boolean;
  readonly notePath?: string;
}

export interface StixViewerEdge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly label: string;
  readonly kind: StixViewerEdgeKind;
  readonly field?: string;
  readonly object?: StixObject;
  readonly notePath?: string;
}

export interface StixViewerModel {
  readonly nodes: readonly StixViewerNode[];
  readonly edges: readonly StixViewerEdge[];
  readonly objectCount: number;
  readonly placeholderCount: number;
}

export class StixViewerModelError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "StixViewerModelError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireString(
  object: Readonly<Record<string, unknown>>,
  field: "id" | "type",
  index: number,
): string {
  const value = object[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new StixViewerModelError(
      `STIX object ${index + 1} requires a non-empty string ${field}.`,
    );
  }
  return value.trim();
}

function normalizeObjects(input: unknown): readonly StixObject[] {
  let candidates: readonly unknown[];
  if (Array.isArray(input)) {
    candidates = input;
  } else if (isRecord(input) && input.type === "bundle") {
    if (!Array.isArray(input.objects)) {
      throw new StixViewerModelError("A STIX Bundle requires an objects array.");
    }
    candidates = input.objects;
  } else if (isRecord(input)) {
    candidates = [input];
  } else {
    throw new StixViewerModelError(
      "Expected a STIX Bundle, a STIX object, or an array of STIX objects.",
    );
  }

  const objects: StixObject[] = [];
  const ids = new Set<string>();
  for (const [index, candidate] of candidates.entries()) {
    if (!isRecord(candidate)) {
      throw new StixViewerModelError(`STIX object ${index + 1} must be a dictionary.`);
    }
    const type = requireString(candidate, "type", index);
    const id = requireString(candidate, "id", index);
    if (ids.has(id)) {
      throw new StixViewerModelError(`STIX object ID ${id} is duplicated.`);
    }
    ids.add(id);
    objects.push(Object.freeze({ ...candidate, type, id }));
  }
  return Object.freeze(objects);
}

function humanize(value: string): string {
  return value
    .replaceAll(/[-_]+/gu, " ")
    .replaceAll(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function nodeLabel(object: StixObject): string {
  for (const field of ["name", "value", "subject"] as const) {
    const value = object[field];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return humanize(object.type);
}

function typeFromId(id: string): string {
  const separator = id.indexOf("--");
  return separator > 0 ? id.slice(0, separator) : "unresolved-reference";
}

function referenceValues(value: unknown): readonly string[] {
  if (typeof value === "string" && value.trim() !== "") return [value.trim()];
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    typeof item === "string" && item.trim() !== "" ? [item.trim()] : [],
  );
}

function isReferenceField(field: string, value: unknown): boolean {
  return (
    (field.endsWith("_ref") && typeof value === "string") ||
    (field.endsWith("_refs") && Array.isArray(value))
  );
}

function edgeKey(edge: StixViewerEdge): string {
  if (edge.kind === "relationship") return `${edge.kind}\u0000${edge.id}`;
  return `${edge.sourceId}\u0000${edge.targetId}\u0000${edge.field ?? edge.label}`;
}

function relationshipEdge(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
): StixViewerEdge | undefined {
  if (object.type !== "relationship") return undefined;
  const source = object.source_ref;
  const target = object.target_ref;
  if (
    typeof source !== "string" ||
    source.trim() === "" ||
    typeof target !== "string" ||
    target.trim() === ""
  ) {
    return undefined;
  }
  const relationshipType = object.relationship_type;
  const label =
    typeof relationshipType === "string" && relationshipType.trim() !== ""
      ? relationshipType.trim()
      : "related-to";
  return Object.freeze({
    id: object.id,
    sourceId: source.trim(),
    targetId: target.trim(),
    label,
    kind: "relationship",
    object,
    ...(notePathById.get(object.id) === undefined
      ? {}
      : { notePath: notePathById.get(object.id) }),
  });
}

export function buildStixViewerModel(
  input: unknown,
  notePathById: ReadonlyMap<string, string> = new Map(),
): StixViewerModel {
  const objects = normalizeObjects(input);
  const nodesById = new Map<string, StixViewerNode>();
  const edges: StixViewerEdge[] = [];
  const edgeKeys = new Set<string>();

  for (const object of objects) {
    if (object.type !== "relationship") {
      nodesById.set(
        object.id,
        Object.freeze({
          id: object.id,
          type: object.type,
          label: nodeLabel(object),
          object,
          placeholder: false,
          ...(notePathById.get(object.id) === undefined
            ? {}
            : { notePath: notePathById.get(object.id) }),
        }),
      );
    }
  }

  const addPlaceholder = (id: string): void => {
    if (nodesById.has(id)) return;
    nodesById.set(
      id,
      Object.freeze({
        id,
        type: typeFromId(id),
        label: humanize(typeFromId(id)),
        placeholder: true,
        ...(notePathById.get(id) === undefined
          ? {}
          : { notePath: notePathById.get(id) }),
      }),
    );
  };

  const addEdge = (edge: StixViewerEdge): void => {
    const key = edgeKey(edge);
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    addPlaceholder(edge.sourceId);
    addPlaceholder(edge.targetId);
    edges.push(Object.freeze(edge));
  };

  for (const object of objects) {
    const relationship = relationshipEdge(object, notePathById);
    if (relationship !== undefined) {
      addEdge(relationship);
      continue;
    }
    if (object.type === "relationship") {
      throw new StixViewerModelError(
        `Relationship ${object.id} requires string source_ref and target_ref values.`,
      );
    }
    for (const [field, value] of Object.entries(object)) {
      if (!isReferenceField(field, value)) continue;
      for (const [index, targetId] of referenceValues(value).entries()) {
        addEdge({
          id: `${object.id}:${field}:${index}:${targetId}`,
          sourceId: object.id,
          targetId,
          label: humanize(field.replace(/_refs?$/u, "")),
          kind: "reference",
          field,
        });
      }
    }
  }

  const nodes = [...nodesById.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  edges.sort((left, right) => left.id.localeCompare(right.id));
  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    objectCount: objects.length,
    placeholderCount: nodes.filter((node) => node.placeholder).length,
  });
}

export function parseStixViewerJson(
  source: string,
  notePathById?: ReadonlyMap<string, string>,
): StixViewerModel {
  let value: unknown;
  try {
    value = JSON.parse(source) as unknown;
  } catch (error) {
    throw new StixViewerModelError("The selected file is not valid JSON.", {
      cause: error,
    });
  }
  return buildStixViewerModel(value, notePathById);
}
