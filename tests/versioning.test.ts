import { describe, expect, it } from "vitest";

import {
  createNewStixVersion,
  latestStixVersion,
  revokeStixObject,
  stixObjectVersionKey,
} from "../src/core/versioning";

const base = {
  type: "indicator",
  id: "indicator--11111111-1111-4111-8111-111111111111",
  spec_version: "2.1",
  created: "2026-07-01T10:00:00.000Z",
  modified: "2026-07-01T10:00:00.000Z",
  pattern: "[ipv4-addr:value = '198.51.100.1']",
  pattern_type: "stix",
  valid_from: "2026-07-01T10:00:00.000Z",
};

describe("STIX object versioning", () => {
  it("creates later versions with stable identity and creation time", () => {
    const next = createNewStixVersion(base, "2026-07-02T10:00:00.000Z", {
      confidence: 80,
    });

    expect(next).toMatchObject({
      id: base.id,
      created: base.created,
      modified: "2026-07-02T10:00:00.000Z",
      confidence: 80,
    });
    expect(
      createNewStixVersion(base, "2026-07-02T11:00:00.000Z", {
        created_by_ref: "identity--22222222-2222-4222-8222-222222222222",
      }),
    ).not.toHaveProperty("created_by_ref");
    expect(latestStixVersion([next, base])).toBe(next);
    expect(stixObjectVersionKey(next)).toContain("@2026-07-02");
  });

  it("rejects invalid version transitions and creates revoked versions", () => {
    expect(() => createNewStixVersion(base, base.modified)).toThrow("must be later");
    const revoked = revokeStixObject(base, "2026-07-03T10:00:00.000Z");
    expect(revoked.revoked).toBe(true);
    expect(() => createNewStixVersion(revoked, "2026-07-04T10:00:00.000Z")).toThrow(
      "revoked",
    );
    expect(() =>
      createNewStixVersion(
        { type: "ipv4-addr", id: "ipv4-addr--11111111-1111-4111-8111-111111111111" },
        "2026-07-04T10:00:00.000Z",
      ),
    ).toThrow("do not use STIX versioning");
    expect(() =>
      createNewStixVersion(
        {
          type: "marking-definition",
          id: "marking-definition--11111111-1111-4111-8111-111111111111",
          created: "2026-07-04T10:00:00.000Z",
        },
        "2026-07-04T11:00:00.000Z",
      ),
    ).toThrow("do not use STIX versioning");
  });
});
