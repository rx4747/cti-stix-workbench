import { describe, expect, it, vi } from "vitest";

import {
  createIdentifierService,
  validateStixIdentifier,
} from "../src/core/identifiers";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";

describe("STIX UUIDv4 identifier service", () => {
  it("preserves a valid existing identifier without consuming randomness", () => {
    const randomUUID = vi.fn(
      () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    );
    const service = createIdentifierService({
      now: () => new Date("2026-07-26T10:00:00.000Z"),
      randomUUID,
    });

    const result = service.ensureUuid4(
      "indicator",
      "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
    );

    expect(result).toEqual({
      ok: true,
      id: "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
    });
    expect(randomUUID).not.toHaveBeenCalled();
  });

  it("generates deterministic test IDs and millisecond timestamps from injected dependencies", () => {
    const service = createIdentifierService({
      now: () => new Date("2026-07-26T10:00:00.123Z"),
      randomUUID: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });

    expect(service.ensureUuid4("relationship")).toEqual({
      ok: true,
      id: "relationship--aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
    expect(service.now()).toBe("2026-07-26T10:00:00.123Z");
  });

  it("rejects type mismatches and malformed identifiers", () => {
    expect(
      validateStixIdentifier(
        "indicator",
        "malware--e2e1a340-4415-4ba8-9671-f7343fbf0836",
      ),
    ).toEqual({
      ok: false,
      diagnostic: expect.objectContaining({
        code: DIAGNOSTIC_CODES.stixIdTypeMismatch,
        field: "id",
      }),
    });
    expect(validateStixIdentifier("indicator", "indicator--not-a-uuid"))
      .toEqual({
        ok: false,
        diagnostic: expect.objectContaining({
          code: DIAGNOSTIC_CODES.stixIdInvalid,
          field: "id",
        }),
      });
    expect(
      validateStixIdentifier(
        "indicator",
        "indicator--aaaaaaaa-aaaa-8aaa-8aaa-aaaaaaaaaaaa",
      ),
    ).toEqual({
      ok: false,
      diagnostic: expect.objectContaining({
        code: DIAGNOSTIC_CODES.stixIdInvalid,
        field: "id",
      }),
    });
  });

  it("rejects a random source that does not return UUIDv4", () => {
    const service = createIdentifierService({
      now: () => new Date("2026-07-26T10:00:00.000Z"),
      randomUUID: () => "aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa",
    });

    expect(service.ensureUuid4("indicator")).toEqual({
      ok: false,
      diagnostic: expect.objectContaining({
        code: DIAGNOSTIC_CODES.stixIdInvalid,
      }),
    });
  });
});
