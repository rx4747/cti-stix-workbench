import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS, parseWorkbenchSettings } from "../src/settings";
import {
  createWorkbenchSettingDefinitions,
  validateVaultPath,
} from "../src/settings-definitions";

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
    expect(parseWorkbenchSettings({ linkTraversalDepth: 9 }).linkTraversalDepth).toBe(
      5,
    );
    expect(parseWorkbenchSettings({ linkTraversalDepth: -4 }).linkTraversalDepth).toBe(
      0,
    );
    expect(parseWorkbenchSettings({ linkTraversalDepth: 1.5 }).linkTraversalDepth).toBe(
      DEFAULT_SETTINGS.linkTraversalDepth,
    );
  });
});

describe("workbench setting definitions", () => {
  it("exposes every persisted setting to Obsidian settings search", () => {
    const definitions = createWorkbenchSettingDefinitions();
    const keys = definitions.flatMap((definition) =>
      "control" in definition && definition.control !== undefined
        ? [definition.control.key]
        : [],
    );

    expect(keys).toEqual([
      "exportFolder",
      "linkTraversalDepth",
      "includeContextualLinks",
      "readTypedCanvasEdges",
      "validationMode",
      "prettyPrint",
      "extensionRegistryPath",
    ]);
  });

  it("rejects paths outside the vault and accepts normalized local paths", () => {
    expect(validateVaultPath("../outside")).toContain("inside the vault");
    expect(validateVaultPath("/absolute")).toContain("inside the vault");
    expect(validateVaultPath("Exports/Bundles")).toBeUndefined();
    expect(validateVaultPath(" Exports\\Bundles ")).toBeUndefined();
  });
});
