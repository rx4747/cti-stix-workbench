import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  layoutStixViewerNodes,
  STIX_VIEWER_NODE_RADIUS,
  stixViewerEdgePath,
  wrapStixViewerLabel,
} from "../src/viewer/layout";
import { buildStixViewerModel } from "../src/viewer/model";

const apt1 = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("fixtures/oasis/apt1.json", import.meta.url)),
    "utf8",
  ),
) as unknown;

describe("STIX viewer layout", () => {
  it("wraps useful names and truncates only extreme graph labels", () => {
    expect(wrapStixViewerLabel("Initial Compromise")).toEqual(["Initial Compromise"]);
    const regular = "A reasonably long STIX object name for display";
    expect(wrapStixViewerLabel(regular).join(" ")).toBe(regular);
    const appendix =
      "Appendix F SSL Certificate for serial number 4c:0b:1d:19:74:86:a7:66:b4:1a:bf:40:27:21:76:28";
    const display = wrapStixViewerLabel(appendix).join(" ");
    expect(display).toContain("Appendix F SSL Certificate");
    expect(display.endsWith("…")).toBe(true);
    expect([...display].length).toBeLessThanOrEqual(56);
  });

  it("spreads the official APT1 graph across deterministic components", () => {
    const model = buildStixViewerModel(apt1);
    const positions = layoutStixViewerNodes(model);

    expect(positions).toHaveLength(model.nodes.length);
    expect(
      new Set([...positions.values()].map((point) => point.x)).size,
    ).toBeGreaterThan(20);
    expect(
      new Set([...positions.values()].map((point) => point.y)).size,
    ).toBeGreaterThan(20);
    expect(new Set([...positions.values()].map(({ x, y }) => `${x},${y}`)).size).toBe(
      model.nodes.length,
    );
    expect(layoutStixViewerNodes(model)).toEqual(positions);
    const values = [...positions.values()];
    const pairDistances = values.flatMap((left, index) =>
      values
        .slice(index + 1)
        .map((right) => Math.hypot(right.x - left.x, right.y - left.y)),
    );
    expect(Math.min(...pairDistances)).toBeGreaterThan(55);
  });

  it("draws a connection between node boundaries without visible text", () => {
    expect(stixViewerEdgePath({ x: 0, y: 0 }, { x: 200, y: 0 })).toBe(
      `M ${STIX_VIEWER_NODE_RADIUS * 2} ${STIX_VIEWER_NODE_RADIUS} L 200 ${STIX_VIEWER_NODE_RADIUS}`,
    );
  });
});
