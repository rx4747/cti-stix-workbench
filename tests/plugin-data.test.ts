import { describe, expect, it } from "vitest";

import { parsePluginData, serializePluginData } from "../src/plugin-data";
import { DEFAULT_SETTINGS } from "../src/settings";

describe("plugin data boundary", () => {
  it("migrates legacy settings-only data without inventing identity state", () => {
    expect(
      parsePluginData({
        exportFolder: "Bundles",
        linkTraversalDepth: 2,
      }),
    ).toEqual({
      settings: {
        ...DEFAULT_SETTINGS,
        exportFolder: "Bundles",
        linkTraversalDepth: 2,
      },
      relationshipIdentities: {},
    });
  });

  it("accepts only valid persisted relationship identity records", () => {
    expect(
      parsePluginData({
        settings: { prettyPrint: false },
        relationshipIdentities: {
          valid: {
            id: "relationship--11111111-1111-4111-8111-111111111111",
            created: "2026-07-26T10:00:00.000Z",
          },
          missingCreated: {
            id: "relationship--22222222-2222-4222-8222-222222222222",
          },
          wrongType: "unsafe",
        },
      }),
    ).toEqual({
      settings: {
        ...DEFAULT_SETTINGS,
        prettyPrint: false,
      },
      relationshipIdentities: {
        valid: {
          id: "relationship--11111111-1111-4111-8111-111111111111",
          created: "2026-07-26T10:00:00.000Z",
        },
      },
    });
  });

  it("serializes defensive copies of settings and identity state", () => {
    const serialized = serializePluginData({
      settings: { ...DEFAULT_SETTINGS },
      relationshipIdentities: {
        key: {
          id: "relationship--11111111-1111-4111-8111-111111111111",
          created: "2026-07-26T10:00:00.000Z",
        },
      },
    });

    expect(serialized).toEqual({
      settings: DEFAULT_SETTINGS,
      relationshipIdentities: {
        key: {
          id: "relationship--11111111-1111-4111-8111-111111111111",
          created: "2026-07-26T10:00:00.000Z",
        },
      },
    });
    expect(serialized.settings).not.toBe(DEFAULT_SETTINGS);
  });
});
