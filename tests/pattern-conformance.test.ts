import { describe, expect, it, vi } from "vitest";

import { parseStixPattern } from "../src/validation/pattern-validator";

describe("STIX pattern conformance", () => {
  it.each([
    "[ipv4-addr:value = '198.51.100.10']",
    "[file:hashes.'SHA-256' = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']",
    "[file:name MATCHES '^Final_Report.*[.]exe$']",
    "[network-traffic:dst_port = 443 AND network-traffic:protocols[*] = 'tcp']",
    "([ipv4-addr:value = '198.51.100.10'] OR [domain-name:value = 'example.invalid'])",
    "[file:size > 1024] WITHIN 300 SECONDS",
    "[ipv4-addr:value = '198.51.100.10'] REPEATS 5 TIMES",
    "[ipv4-addr:value = '198.51.100.10'] START t'2026-07-27T10:00:00Z' STOP t'2026-07-27T11:00:00Z'",
  ])("accepts a standard pattern example: %s", (pattern) => {
    expect(parseStixPattern(pattern)).toEqual([]);
  });

  it("returns line and column diagnostics without logging pattern content", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const diagnostics = parseStixPattern(
      "[ipv4-addr:value = '198.51.100.10'] AND\n[file:size = ]",
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ line: 2, column: expect.any(Number) }),
      ]),
    );
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    log.mockRestore();
    error.mockRestore();
  });

  it("matches the OASIS validator checks for known hashes and duplicate qualifiers", () => {
    expect(parseStixPattern("[file:hashes.'SHA-256' = 'abcd']")).toEqual([
      expect.objectContaining({ message: expect.stringContaining("SHA-256 hash") }),
    ]);
    expect(
      parseStixPattern("[file:size = 1] WITHIN 5 SECONDS WITHIN 10 SECONDS"),
    ).toEqual([
      expect.objectContaining({
        message: expect.stringContaining("Duplicate qualifier"),
      }),
    ]);
    expect(
      parseStixPattern("[file:hashes.'SHA-256' IN ('abcd', 'ef01')]").map(
        (item) => item.message,
      ),
    ).toEqual([
      expect.stringContaining("SHA-256 hash"),
      expect.stringContaining("SHA-256 hash"),
    ]);
    expect(parseStixPattern("[file:hashes.MD5 LIKE 'xyz%']")).toEqual([
      expect.objectContaining({ message: expect.stringContaining("MD5 hash") }),
    ]);
    expect(parseStixPattern("[file:hashes.MD5 MATCHES 'not-a-hash']")).toEqual([
      expect.objectContaining({ message: expect.stringContaining("MD5 hash") }),
    ]);
    expect(
      parseStixPattern("[file:size = 1]\nWITHIN 5 SECONDS WITHIN 10 SECONDS"),
    ).toEqual([expect.objectContaining({ line: 2, column: expect.any(Number) })]);
  });
});
