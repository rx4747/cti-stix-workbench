import { layoutStixViewerNodes } from "../viewer/layout";
import type { StixViewerEdge, StixViewerModel } from "../viewer/model";

const NODE_WIDTH = 300;
const NODE_HEIGHT = 180;
const LAYOUT_SCALE = 6;

export interface GeneratedCanvasFileNode {
  readonly id: string;
  readonly type: "file";
  readonly file: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface GeneratedCanvasEdge {
  readonly id: string;
  readonly fromNode: string;
  readonly fromSide: "bottom" | "left" | "right" | "top";
  readonly toNode: string;
  readonly toSide: "bottom" | "left" | "right" | "top";
  readonly label: string;
  readonly ctiStixRelationshipNote?: string;
}

export interface GeneratedCanvasDocument {
  readonly nodes: readonly GeneratedCanvasFileNode[];
  readonly edges: readonly GeneratedCanvasEdge[];
}

export function nextAvailableCanvasPath(
  title: string,
  exists: (path: string) => boolean,
  folder = "Canvases",
): string {
  const safeTitle =
    title
      .trim()
      .replaceAll(/[\\/:*?"<>|]/gu, "-")
      .replaceAll(/\s+/gu, " ") || "STIX graph";
  const base = `${folder}/${safeTitle} STIX`;
  let candidate = `${base}.canvas`;
  let suffix = 2;
  while (exists(candidate)) {
    candidate = `${base}-${suffix}.canvas`;
    suffix += 1;
  }
  return candidate;
}

function stableId(prefix: string, value: string): string {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return `${prefix}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function uniqueStableId(prefix: string, value: string, usedIds: Set<string>): string {
  const base = stableId(prefix, value);
  let candidate = base;
  let suffix = 2;
  while (usedIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

function relationshipLabel(edge: StixViewerEdge): string {
  const value = edge.object?.relationship_type;
  return `stix:${
    typeof value === "string" && value.trim() !== ""
      ? value.trim()
      : edge.label.trim().replaceAll(" ", "-")
  }`;
}

function edgeSides(
  source: GeneratedCanvasFileNode,
  target: GeneratedCanvasFileNode,
): Pick<GeneratedCanvasEdge, "fromSide" | "toSide"> {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0
      ? { fromSide: "right", toSide: "left" }
      : { fromSide: "left", toSide: "right" };
  }
  return deltaY >= 0
    ? { fromSide: "bottom", toSide: "top" }
    : { fromSide: "top", toSide: "bottom" };
}

export function generateCanvasDocument(
  model: StixViewerModel,
): GeneratedCanvasDocument {
  const positions = layoutStixViewerNodes(model);
  const usedNodeIds = new Set<string>();
  const nodeByKey = new Map<string, GeneratedCanvasFileNode>();
  const nodes = model.nodes.flatMap((node) => {
    if (node.placeholder || node.notePath === undefined) return [];
    const point = positions.get(node.key);
    if (point === undefined) return [];
    const generated = Object.freeze({
      id: uniqueStableId("node", node.notePath, usedNodeIds),
      type: "file" as const,
      file: node.notePath,
      x: Math.round(point.x * LAYOUT_SCALE),
      y: Math.round(point.y * LAYOUT_SCALE),
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
    nodeByKey.set(node.key, generated);
    return [generated];
  });
  const usedEdgeIds = new Set<string>();
  const edges = model.edges.flatMap((edge) => {
    if (edge.kind !== "relationship") return [];
    const source = nodeByKey.get(edge.sourceKey);
    const target = nodeByKey.get(edge.targetKey);
    if (source === undefined || target === undefined) return [];
    return [
      Object.freeze({
        id: uniqueStableId("edge", edge.key, usedEdgeIds),
        fromNode: source.id,
        ...edgeSides(source, target),
        toNode: target.id,
        label: relationshipLabel(edge),
        ...(edge.notePath === undefined
          ? {}
          : { ctiStixRelationshipNote: edge.notePath }),
      }),
    ];
  });
  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
  });
}
