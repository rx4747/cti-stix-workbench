import { describe, expect, it } from "vitest";

import { validateBundleSchema } from "../src/core/bundle-validator";
import { mapGraphToBundle } from "../src/core/graph-mapper";
import type { NormalizedStixDraft } from "../src/core/types";

const CREATED = "2026-07-27T10:00:00.000Z";

function uuid4(index: number): string {
  return `10000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

function draft(
  type: string,
  index: number,
  properties: Readonly<Record<string, unknown>>,
  references: Readonly<Record<string, string>> = {},
): NormalizedStixDraft {
  const path = `Objects/${type}.md`;
  return {
    path,
    basename: type,
    stixType: type,
    stixId: `${type}--${uuid4(index)}`,
    properties: {
      type,
      id: `${type}--${uuid4(index)}`,
      spec_version: "2.1",
      created: CREATED,
      modified: CREATED,
      ...properties,
    },
    links: Object.entries(references).map(([label, targetPath]) => ({
      raw: label,
      targetPath,
    })),
    relationships: [],
  };
}

function sdoDrafts(): readonly NormalizedStixDraft[] {
  const identityPath = "Objects/identity.md";
  const objectReference = { Target: identityPath };
  const observablePath = "Objects/observable.md";
  return [
    draft("attack-pattern", 1, { name: "Fictional technique" }),
    draft("campaign", 2, { name: "Fictional campaign" }),
    draft("course-of-action", 3, { name: "Fictional mitigation" }),
    draft(
      "grouping",
      4,
      { context: "suspicious-activity", object_refs: ["[[Target]]"] },
      objectReference,
    ),
    draft("identity", 5, {
      identity_class: "organization",
      name: "Fictional analysis team",
    }),
    draft("incident", 6, { name: "Fictional incident" }),
    draft("indicator", 7, {
      name: "Reserved-address indicator",
      pattern: "[ipv4-addr:value = '198.51.100.42']",
      pattern_type: "stix",
      valid_from: CREATED,
    }),
    draft("infrastructure", 8, { name: "Fictional infrastructure" }),
    draft("intrusion-set", 9, { name: "Fictional intrusion set" }),
    draft("location", 10, { country: "US" }),
    draft("malware", 11, { is_family: false, name: "Fictional sample" }),
    draft("malware-analysis", 12, {
      analysis_engine_version: "1.0",
      product: "Fictional static analyzer",
      result: "unknown",
      version: "1.0",
    }),
    draft(
      "note",
      13,
      { content: "Fictional analyst note.", object_refs: ["[[Target]]"] },
      objectReference,
    ),
    draft(
      "observed-data",
      14,
      {
        first_observed: CREATED,
        last_observed: CREATED,
        number_observed: 1,
        object_refs: ["[[Observable]]"],
      },
      { Observable: observablePath },
    ),
    draft(
      "opinion",
      15,
      { object_refs: ["[[Target]]"], opinion: "strongly-agree" },
      objectReference,
    ),
    draft(
      "report",
      16,
      { name: "Fictional report", object_refs: ["[[Target]]"], published: CREATED },
      objectReference,
    ),
    draft("threat-actor", 17, { name: "Fictional actor" }),
    draft("tool", 18, { name: "Fictional tool" }),
    draft("vulnerability", 19, { name: "CVE-2099-0001" }),
    {
      path: observablePath,
      basename: "observable",
      stixType: "ipv4-addr",
      stixId: `ipv4-addr--${uuid4(20)}`,
      properties: {
        type: "ipv4-addr",
        id: `ipv4-addr--${uuid4(20)}`,
        spec_version: "2.1",
        value: "198.51.100.42",
      },
      links: [],
      relationships: [],
    },
  ];
}

describe("SDO conformance", () => {
  it("maps all 19 SDO types and validates them against pinned schemas", async () => {
    const drafts = sdoDrafts();
    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid4(900)}`,
      drafts,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.bundle.objects.filter((object) => object.type !== "ipv4-addr"),
    ).toHaveLength(19);
    expect(validateBundleSchema(result.bundle)).toEqual([]);
  });

  it("resolves representative SDO object references", async () => {
    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid4(901)}`,
      drafts: sdoDrafts(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const identityId = `identity--${uuid4(5)}`;
    for (const type of ["grouping", "note", "opinion", "report"]) {
      expect(
        result.bundle.objects.find((object) => object.type === type)?.object_refs,
      ).toEqual([identityId]);
    }
    expect(
      result.bundle.objects.find((object) => object.type === "observed-data")
        ?.object_refs,
    ).toEqual([`ipv4-addr--${uuid4(20)}`]);
  });
});
