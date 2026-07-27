import { describe, expect, it } from "vitest";

import { parseMarkdownNote } from "../src/adapters/markdown/parser";
import { validateBundleSchema } from "../src/core/bundle-validator";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";
import { parseExtensionRegistry } from "../src/core/extension-registry";
import { mapGraphToBundle } from "../src/core/graph-mapper";

const CUSTOM_ID = "x-fictional-object--40000000-0000-4000-8000-000000000001";
const EXTENSION_ID = "extension-definition--40000000-0000-4000-8000-000000000002";
const CREATED = "2026-07-27T10:00:00.000Z";

function registry() {
  return parseExtensionRegistry(
    JSON.stringify({
      version: 1,
      object_types: ["x-fictional-object"],
      properties: ["x_fictional_score"],
      extension_definitions: [EXTENSION_ID],
    }),
  );
}

describe("custom STIX content", () => {
  it("validates the local extension registry contract", () => {
    expect(registry().objectTypes.has("x-fictional-object")).toBe(true);
    expect(() =>
      parseExtensionRegistry(
        JSON.stringify({ version: 1, object_types: ["Bad Type"] }),
      ),
    ).toThrow("object_types contains invalid value");
    expect(() => parseExtensionRegistry("not JSON")).toThrow("not valid JSON");
  });

  it("round-trips a registered custom object and property exactly", async () => {
    const parsed = parseMarkdownNote({
      path: "Objects/Fictional custom object.md",
      basename: "Fictional custom object",
      frontmatter: {
        stix_type: "x-fictional-object",
        stix_id: CUSTOM_ID,
        spec_version: "2.1",
        created: CREATED,
        modified: CREATED,
        name: "Fictional object",
        x_fictional_score: 7,
      },
      markdown: "",
      links: [],
    });

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.draft).toBeDefined();
    if (parsed.draft === undefined) return;
    const mapped = await mapGraphToBundle({
      bundleId: "bundle--40000000-0000-4000-8000-000000000003",
      drafts: [parsed.draft],
    });
    expect(mapped.ok).toBe(true);
    if (!mapped.ok) return;
    expect(mapped.bundle.objects[0]).toEqual({
      type: "x-fictional-object",
      id: CUSTOM_ID,
      spec_version: "2.1",
      created: CREATED,
      modified: CREATED,
      name: "Fictional object",
      x_fictional_score: 7,
    });
    expect(
      validateBundleSchema(mapped.bundle, new Map(), "strict", registry()),
    ).toEqual([]);
  });

  it("requires strict-mode registration but permits syntactically valid lenient content", async () => {
    const parsed = parseMarkdownNote({
      path: "Objects/Fictional custom object.md",
      basename: "Fictional custom object",
      frontmatter: {
        stix_type: "x-fictional-object",
        stix_id: CUSTOM_ID,
        x_fictional_score: 7,
      },
      markdown: "",
      links: [],
    });
    if (parsed.draft === undefined) throw new Error("Missing custom draft.");
    const mapped = await mapGraphToBundle({ drafts: [parsed.draft] });
    if (!mapped.ok) throw new Error("Could not map custom draft.");

    expect(validateBundleSchema(mapped.bundle, new Map(), "strict")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: DIAGNOSTIC_CODES.extensionInvalid }),
      ]),
    );
    expect(validateBundleSchema(mapped.bundle, new Map(), "lenient")).toEqual([]);
  });

  it("accepts Extension Definition keyed payloads and rejects invented extension names", () => {
    const base = {
      type: "indicator",
      id: "indicator--40000000-0000-4000-8000-000000000004",
      spec_version: "2.1",
      created: CREATED,
      modified: CREATED,
      pattern: "[ipv4-addr:value = '198.51.100.40']",
      pattern_type: "stix",
      valid_from: CREATED,
    } as const;
    const extensionDefinition = {
      type: "extension-definition",
      id: EXTENSION_ID,
      spec_version: "2.1",
      created: CREATED,
      modified: CREATED,
      name: "Fictional property extension",
      schema: "https://example.invalid/extension.json",
      version: "1.0.0",
      extension_types: ["property-extension"],
    } as const;
    const valid = {
      type: "bundle" as const,
      id: "bundle--40000000-0000-4000-8000-000000000005" as const,
      objects: [
        {
          ...base,
          extensions: {
            [EXTENSION_ID]: { extension_type: "property-extension", score: 7 },
          },
        },
        extensionDefinition,
      ],
    };
    expect(validateBundleSchema(valid, new Map(), "strict", registry())).toEqual([]);

    const invalid = {
      ...valid,
      objects: [
        {
          ...base,
          extensions: {
            "fictional-ext": { extension_type: "property-extension", score: 7 },
          },
        },
      ],
    };
    expect(validateBundleSchema(invalid, new Map(), "strict", registry())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: DIAGNOSTIC_CODES.extensionInvalid }),
      ]),
    );
  });
});
