import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  type Diagnostic,
} from "../../core/diagnostics";
import type { RelationshipDeclaration } from "../../core/types";

export interface CanvasParseResult {
  readonly notePaths: readonly string[];
  readonly relationships: readonly RelationshipDeclaration[];
  readonly diagnostics: readonly Diagnostic[];
}

interface CanvasFileNode {
  readonly id: string;
  readonly file: string;
}

const RELATIONSHIP_NOTE_FIELD = "ctiStixRelationshipNote";

const RELATIONSHIP_TYPE = /^[a-z][a-z0-9-]*$/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function canvasDiagnostic(canvasPath: string, message: string): Diagnostic {
  return createDiagnostic({
    authority: "input",
    code: DIAGNOSTIC_CODES.canvasInvalid,
    severity: "error",
    message,
    notePath: canvasPath,
  });
}

function parseDocument(input: string, canvasPath: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Invalid JSON.";
    throw new SyntaxError(`Could not parse ${canvasPath}: ${detail}`, {
      cause: error,
    });
  }
}

export function parseCanvas(
  input: string,
  canvasPath: string,
  readTypedEdges = true,
): CanvasParseResult {
  let document: unknown;
  try {
    document = parseDocument(input, canvasPath);
  } catch (error) {
    return {
      notePaths: [],
      relationships: [],
      diagnostics: [
        canvasDiagnostic(
          canvasPath,
          error instanceof Error ? error.message : "Could not parse Canvas JSON.",
        ),
      ],
    };
  }
  if (
    !isRecord(document) ||
    !Array.isArray(document.nodes) ||
    !Array.isArray(document.edges)
  ) {
    return {
      notePaths: [],
      relationships: [],
      diagnostics: [
        canvasDiagnostic(canvasPath, "A Canvas requires nodes and edges arrays."),
      ],
    };
  }

  const diagnostics: Diagnostic[] = [];
  const filesByNodeId = new Map<string, CanvasFileNode>();
  const notePaths = new Set<string>();
  for (const [index, node] of document.nodes.entries()) {
    if (!isRecord(node) || node.type !== "file") continue;
    if (typeof node.id !== "string" || typeof node.file !== "string") {
      diagnostics.push(
        canvasDiagnostic(
          canvasPath,
          `Canvas file node ${index + 1} requires string id and file values.`,
        ),
      );
      continue;
    }
    if (filesByNodeId.has(node.id)) {
      diagnostics.push(
        canvasDiagnostic(canvasPath, `Canvas node id "${node.id}" is duplicated.`),
      );
      continue;
    }
    if (!node.file.toLowerCase().endsWith(".md")) continue;
    const fileNode = { id: node.id, file: node.file };
    filesByNodeId.set(node.id, fileNode);
    notePaths.add(node.file);
  }

  const relationships: RelationshipDeclaration[] = [];
  for (const [index, edge] of document.edges.entries()) {
    if (!isRecord(edge)) continue;
    const relationshipNote = edge[RELATIONSHIP_NOTE_FIELD];
    if (relationshipNote !== undefined) {
      if (
        typeof relationshipNote !== "string" ||
        !relationshipNote.toLowerCase().endsWith(".md")
      ) {
        diagnostics.push(
          canvasDiagnostic(
            canvasPath,
            `Canvas edge ${index + 1} has an invalid ${RELATIONSHIP_NOTE_FIELD} value.`,
          ),
        );
      } else {
        notePaths.add(relationshipNote);
      }
    }
    if (!readTypedEdges || typeof edge.label !== "string") continue;
    const label = edge.label.trim();
    if (!label.startsWith("stix:")) continue;
    const relationshipType = label.slice("stix:".length).trim();
    if (!RELATIONSHIP_TYPE.test(relationshipType)) {
      diagnostics.push(
        canvasDiagnostic(
          canvasPath,
          `Canvas edge ${index + 1} has an invalid STIX relationship label "${label}".`,
        ),
      );
      continue;
    }
    const source =
      typeof edge.fromNode === "string" ? filesByNodeId.get(edge.fromNode) : undefined;
    const target =
      typeof edge.toNode === "string" ? filesByNodeId.get(edge.toNode) : undefined;
    if (source === undefined || target === undefined) {
      diagnostics.push(
        canvasDiagnostic(
          canvasPath,
          `Canvas edge ${index + 1} must connect two Markdown file nodes.`,
        ),
      );
      continue;
    }
    if (typeof relationshipNote === "string") continue;
    relationships.push({
      sourceNotePath: source.file,
      relationshipType,
      targetLink: target.file,
      targetNotePath: target.file,
    });
  }

  return {
    notePaths: Object.freeze([...notePaths].sort()),
    relationships: Object.freeze(relationships),
    diagnostics: Object.freeze(diagnostics),
  };
}
