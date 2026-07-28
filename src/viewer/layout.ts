import type { StixViewerModel } from "./model";

export interface StixViewerPoint {
  x: number;
  y: number;
}

export const STIX_VIEWER_NODE_SIZE = 64;
export const STIX_VIEWER_NODE_RADIUS = STIX_VIEWER_NODE_SIZE / 2;
export const STIX_VIEWER_NODE_LABEL_WIDTH = 168;

const LAYOUT_MARGIN = 72;
const COMPONENT_GAP = 144;
const RING_SPACING = 230;
const LABEL_LINE_HEIGHT = 14;

export function wrapStixViewerLabel(value: string, limit = 26): readonly string[] {
  const maximumCharacters = 56;
  const characters = [...value.trim()];
  const displayValue =
    characters.length <= maximumCharacters
      ? characters.join("")
      : `${characters.slice(0, maximumCharacters - 1).join("")}…`;
  const words = displayValue.split(/\s+/u);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const chunks = word.match(new RegExp(`.{1,${limit}}`, "gu")) ?? [word];
    for (const chunk of chunks) {
      const candidate = line === "" ? chunk : `${line} ${chunk}`;
      if ([...candidate].length <= limit) {
        line = candidate;
      } else {
        if (line !== "") lines.push(line);
        line = chunk;
      }
    }
  }
  if (line !== "") lines.push(line);
  return lines.length === 0 ? [value] : lines;
}

export function layoutStixViewerNodes(
  model: StixViewerModel,
): Map<string, StixViewerPoint> {
  const nodeByKey = new Map(model.nodes.map((node) => [node.key, node]));
  const adjacency = new Map(model.nodes.map((node) => [node.key, new Set<string>()]));
  for (const edge of model.edges) {
    if (edge.kind !== "relationship") continue;
    adjacency.get(edge.sourceKey)?.add(edge.targetKey);
    adjacency.get(edge.targetKey)?.add(edge.sourceKey);
  }

  const remaining = new Set(nodeByKey.keys());
  const components: string[][] = [];
  while (remaining.size > 0) {
    const first = [...remaining].sort()[0];
    if (first === undefined) break;
    const queue = [first];
    const component: string[] = [];
    remaining.delete(first);
    while (queue.length > 0) {
      const key = queue.shift();
      if (key === undefined) continue;
      component.push(key);
      for (const neighbor of [...(adjacency.get(key) ?? [])].sort()) {
        if (!remaining.delete(neighbor)) continue;
        queue.push(neighbor);
      }
    }
    components.push(component);
  }

  const layouts = components.map((component) => {
    const root = [...component].sort((left, right) => {
      const degreeDifference =
        (adjacency.get(right)?.size ?? 0) - (adjacency.get(left)?.size ?? 0);
      return degreeDifference !== 0 ? degreeDifference : left.localeCompare(right);
    })[0];
    const depth = new Map<string, number>();
    const children = new Map(component.map((key) => [key, [] as string[]]));
    if (root !== undefined) {
      const queue = [root];
      depth.set(root, 0);
      while (queue.length > 0) {
        const key = queue.shift();
        if (key === undefined) continue;
        const nextDepth = (depth.get(key) ?? 0) + 1;
        for (const neighbor of [...(adjacency.get(key) ?? [])].sort()) {
          if (depth.has(neighbor)) continue;
          depth.set(neighbor, nextDepth);
          children.get(key)?.push(neighbor);
          queue.push(neighbor);
        }
      }
    }

    const weight = new Map<string, number>();
    const subtreeWeight = (key: string): number => {
      const branches = children.get(key) ?? [];
      const value = Math.max(
        1,
        branches.reduce((sum, child) => sum + subtreeWeight(child), 0),
      );
      weight.set(key, value);
      return value;
    };
    if (root !== undefined) subtreeWeight(root);

    const local = new Map<string, StixViewerPoint>();
    if (root !== undefined) {
      local.set(root, { x: 0, y: 0 });
      const placeChildren = (
        key: string,
        startAngle: number,
        endAngle: number,
      ): void => {
        const branches = children.get(key) ?? [];
        const total = branches.reduce(
          (sum, child) => sum + (weight.get(child) ?? 1),
          0,
        );
        let cursor = startAngle;
        for (const child of branches) {
          const share =
            ((weight.get(child) ?? 1) / Math.max(1, total)) * (endAngle - startAngle);
          const angle = cursor + share / 2;
          const radius = (depth.get(child) ?? 1) * RING_SPACING;
          local.set(child, {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          });
          placeChildren(child, cursor, cursor + share);
          cursor += share;
        }
      };
      placeChildren(root, -Math.PI / 2, Math.PI * 1.5);
    }

    const labelOverflow = (STIX_VIEWER_NODE_LABEL_WIDTH - STIX_VIEWER_NODE_SIZE) / 2;
    const nodeHeight = (key: string): number => {
      const label = nodeByKey.get(key)?.label ?? "";
      return (
        STIX_VIEWER_NODE_SIZE +
        32 +
        wrapStixViewerLabel(label).length * LABEL_LINE_HEIGHT
      );
    };
    const minimumX = Math.min(
      ...component.map((key) => (local.get(key)?.x ?? 0) - labelOverflow),
    );
    const minimumY = Math.min(...component.map((key) => local.get(key)?.y ?? 0));
    const maximumX = Math.max(
      ...component.map(
        (key) => (local.get(key)?.x ?? 0) + STIX_VIEWER_NODE_SIZE + labelOverflow,
      ),
    );
    const maximumY = Math.max(
      ...component.map((key) => (local.get(key)?.y ?? 0) + nodeHeight(key)),
    );
    return {
      component,
      local,
      minimumX,
      minimumY,
      width: maximumX - minimumX,
      height: maximumY - minimumY,
    };
  });
  layouts.sort((left, right) => {
    const sizeDifference = right.component.length - left.component.length;
    return sizeDifference !== 0
      ? sizeDifference
      : (left.component[0] ?? "").localeCompare(right.component[0] ?? "");
  });

  const totalArea = layouts.reduce(
    (sum, layout) =>
      sum + (layout.width + COMPONENT_GAP) * (layout.height + COMPONENT_GAP),
    0,
  );
  const targetWidth = Math.max(1_300, Math.sqrt(totalArea) * 1.45);
  const positions = new Map<string, StixViewerPoint>();
  let cursorX = LAYOUT_MARGIN;
  let cursorY = LAYOUT_MARGIN;
  let rowHeight = 0;
  for (const layout of layouts) {
    if (cursorX > LAYOUT_MARGIN && cursorX + layout.width > targetWidth) {
      cursorX = LAYOUT_MARGIN;
      cursorY += rowHeight + COMPONENT_GAP;
      rowHeight = 0;
    }
    for (const key of layout.component) {
      const point = layout.local.get(key);
      if (point === undefined) continue;
      positions.set(key, {
        x: cursorX + point.x - layout.minimumX,
        y: cursorY + point.y - layout.minimumY,
      });
    }
    cursorX += layout.width + COMPONENT_GAP;
    rowHeight = Math.max(rowHeight, layout.height);
  }
  return positions;
}

export function stixViewerEdgePath(
  source: StixViewerPoint,
  target: StixViewerPoint,
): string {
  const sourceCenter = {
    x: source.x + STIX_VIEWER_NODE_RADIUS,
    y: source.y + STIX_VIEWER_NODE_RADIUS,
  };
  const targetCenter = {
    x: target.x + STIX_VIEWER_NODE_RADIUS,
    y: target.y + STIX_VIEWER_NODE_RADIUS,
  };
  const deltaX = targetCenter.x - sourceCenter.x;
  const deltaY = targetCenter.y - sourceCenter.y;
  const distance = Math.max(1, Math.hypot(deltaX, deltaY));
  const unitX = deltaX / distance;
  const unitY = deltaY / distance;
  return `M ${sourceCenter.x + unitX * STIX_VIEWER_NODE_RADIUS} ${sourceCenter.y + unitY * STIX_VIEWER_NODE_RADIUS} L ${targetCenter.x - unitX * STIX_VIEWER_NODE_RADIUS} ${targetCenter.y - unitY * STIX_VIEWER_NODE_RADIUS}`;
}
