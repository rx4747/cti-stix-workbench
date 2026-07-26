import { describe, expect, it } from "vitest";

import {
  DEFAULT_SETTINGS,
  parseWorkbenchSettings,
} from "../src/settings";

describe("parseWorkbenchSettings", () => {
  it("returns safe defaults for untrusted persisted data", () => {
    expect(parseWorkbenchSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseWorkbenchSettings("not an object")).toEqual(DEFAULT_SETTINGS);
  });

  it("accepts valid settings and rejects unsafe or unsupported values", () => {
    expect(
      parseWorkbenchSettings({
        exportFolder: "../outside",
        linkTraversalDepth: 3,
        includeContextualLinks: false,
        readTypedCanvasEdges: false,
        validationMode: "lenient",
        prettyPrint: false,
        extensionRegistryPath: "STIX Extensions/local.json",
        ignored: "value",
      }),
    ).toEqual({
      ...DEFAULT_SETTINGS,
      exportFolder: DEFAULT_SETTINGS.exportFolder,
      linkTraversalDepth: 3,
      includeContextualLinks: false,
      readTypedCanvasEdges: false,
      validationMode: "lenient",
      prettyPrint: false,
      extensionRegistryPath: "STIX Extensions/local.json",
    });
  });

  it("clamps traversal depth to the supported integer range", () => {
    expect(
      parseWorkbenchSettings({ linkTraversalDepth: 9 }).linkTraversalDepth,
    ).toBe(5);
    expect(
      parseWorkbenchSettings({ linkTraversalDepth: -4 }).linkTraversalDepth,
    ).toBe(0);
    expect(
      parseWorkbenchSettings({ linkTraversalDepth: 1.5 }).linkTraversalDepth,
    ).toBe(DEFAULT_SETTINGS.linkTraversalDepth);
  });
});
