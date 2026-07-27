import { describe, expect, it } from "vitest";

import { validateBundleSchema } from "../src/core/bundle-validator";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";
import { mapGraphToBundle } from "../src/core/graph-mapper";
import type { NormalizedStixDraft, StixBundle } from "../src/core/types";

const CREATED = "2026-07-27T10:00:00.000Z";

function uuid4(index: number): string {
  return `20000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

function commonDraft(
  type: string,
  index: number,
  properties: Readonly<Record<string, unknown>>,
  references: Readonly<Record<string, string>> = {},
): NormalizedStixDraft {
  const id = `${type}--${uuid4(index)}`;
  return {
    path: `Objects/${type}.md`,
    basename: type,
    stixType: type,
    stixId: id,
    properties: {
      type,
      id,
      spec_version: "2.1",
      created: CREATED,
      modified: CREATED,
      ...properties,
    },
    links: Object.entries(references).map(([raw, targetPath]) => ({ raw, targetPath })),
    relationships: [],
  };
}

function conformanceDrafts(): readonly NormalizedStixDraft[] {
  const identityPath = "Objects/identity.md";
  const indicatorPath = "Objects/indicator.md";
  const observablePath = "Objects/ipv4-addr.md";
  const observedDataPath = "Objects/observed-data.md";
  const markingPath = "Objects/marking-definition.md";
  const indicator = commonDraft(
    "indicator",
    2,
    {
      description: "Fictional indicator.",
      granular_markings: [
        { marking_ref: "[[Statement marking]]", selectors: ["description"] },
      ],
      object_marking_refs: ["[[Statement marking]]"],
      pattern: "[ipv4-addr:value = '198.51.100.55']",
      pattern_type: "stix",
      valid_from: CREATED,
    },
    { "Statement marking": markingPath },
  );
  return [
    commonDraft("identity", 1, {
      identity_class: "organization",
      name: "Fictional observer",
    }),
    indicator,
    {
      path: observablePath,
      basename: "ipv4-addr",
      stixType: "ipv4-addr",
      stixId: `ipv4-addr--${uuid4(3)}`,
      properties: {
        type: "ipv4-addr",
        id: `ipv4-addr--${uuid4(3)}`,
        spec_version: "2.1",
        value: "198.51.100.55",
      },
      links: [],
      relationships: [],
    },
    commonDraft(
      "observed-data",
      4,
      {
        first_observed: CREATED,
        last_observed: CREATED,
        number_observed: 1,
        object_refs: ["[[Observable]]"],
      },
      { Observable: observablePath },
    ),
    commonDraft(
      "relationship",
      5,
      {
        relationship_type: "related-to",
        source_ref: "[[Observer]]",
        target_ref: "[[Indicator]]",
      },
      { Observer: identityPath, Indicator: indicatorPath },
    ),
    commonDraft(
      "sighting",
      6,
      {
        count: 1,
        observed_data_refs: ["[[Observed data]]"],
        sighting_of_ref: "[[Indicator]]",
        where_sighted_refs: ["[[Observer]]"],
      },
      {
        Indicator: indicatorPath,
        Observer: identityPath,
        "Observed data": observedDataPath,
      },
    ),
    commonDraft(
      "language-content",
      7,
      {
        contents: { sr: { description: "Fiktivni indikator." } },
        object_ref: "[[Indicator]]",
        object_modified: CREATED,
      },
      { Indicator: indicatorPath },
    ),
    {
      path: markingPath,
      basename: "marking-definition",
      stixType: "marking-definition",
      stixId: `marking-definition--${uuid4(8)}`,
      properties: {
        type: "marking-definition",
        id: `marking-definition--${uuid4(8)}`,
        spec_version: "2.1",
        created: CREATED,
        definition_type: "statement",
        definition: { statement: "Fictional handling statement." },
      },
      links: [],
      relationships: [],
    },
    commonDraft("extension-definition", 9, {
      extension_types: ["property-extension"],
      name: "Fictional score",
      schema: "https://example.invalid/fake-extension-schema.json",
      version: "1.0.0",
    }),
  ];
}

describe("SRO and Meta Object conformance", () => {
  it("maps and schema-validates Relationships, Sightings, and all Meta Objects", async () => {
    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid4(900)}`,
      drafts: conformanceDrafts(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(validateBundleSchema(result.bundle)).toEqual([]);
    expect(result.bundle.objects.map((object) => object.type)).toEqual(
      expect.arrayContaining([
        "relationship",
        "sighting",
        "language-content",
        "marking-definition",
        "extension-definition",
      ]),
    );
  });

  it("does not collapse an explicitly authored Relationship into a generated one", async () => {
    const drafts = conformanceDrafts();
    const identity = drafts.find((item) => item.stixType === "identity");
    if (identity === undefined) throw new Error("Missing Identity fixture.");
    const result = await mapGraphToBundle(
      {
        bundleId: `bundle--${uuid4(901)}`,
        drafts,
        relationships: [
          {
            sourceNotePath: "Objects/identity.md",
            relationshipType: "related-to",
            targetLink: "Objects/indicator.md",
            targetNotePath: "Objects/indicator.md",
          },
        ],
      },
      { randomUUID: () => uuid4(999), now: () => new Date(CREATED) },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.bundle.objects.filter((object) => object.type === "relationship"),
    ).toHaveLength(2);
  });

  it("rejects cross-object Sighting and granular-marking target mismatches", () => {
    const bundle: StixBundle = {
      type: "bundle",
      id: `bundle--${uuid4(902)}`,
      objects: [
        {
          type: "identity",
          id: `identity--${uuid4(20)}`,
          spec_version: "2.1",
          created: CREATED,
          modified: CREATED,
          name: "Fictional identity",
          identity_class: "organization",
        },
        {
          type: "sighting",
          id: `sighting--${uuid4(21)}`,
          spec_version: "2.1",
          created: CREATED,
          modified: CREATED,
          sighting_of_ref: `identity--${uuid4(20)}`,
          observed_data_refs: [`identity--${uuid4(20)}`],
          where_sighted_refs: [`sighting--${uuid4(21)}`],
          granular_markings: [
            {
              marking_ref: `identity--${uuid4(20)}`,
              selectors: ["sighting_of_ref"],
            },
          ],
        },
      ],
    };

    const diagnostics = validateBundleSchema(bundle);
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: DIAGNOSTIC_CODES.referenceUnresolved }),
      ]),
    );
    expect(
      diagnostics.filter((item) => item.code === DIAGNOSTIC_CODES.referenceUnresolved),
    ).toHaveLength(3);
  });
});
