import { describe, expect, it } from "vitest";

import {
  canonicalizeJson,
  createDeterministicScoId,
} from "../src/core/sco-id";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";

const completeScoExamples = {
  artifact: {
    hashes: { "SHA-256": "a".repeat(64) },
    payload_bin: "ZXhhbXBsZQ==",
  },
  "autonomous-system": { number: 64512 },
  directory: { path: "/opt/example" },
  "domain-name": { value: "example.com" },
  "email-addr": { value: "analyst@example.com" },
  "email-message": {
    body: "Fictional message",
    from_ref: "email-addr--89f52ea8-d6ef-51e9-8fce-6a29236436ed",
    subject: "Example subject",
  },
  file: {
    extensions: { "archive-ext": { contains_refs: [] } },
    hashes: { "SHA-256": "b".repeat(64) },
    name: "example.bin",
    parent_directory_ref:
      "directory--b62644b5-8413-5f9f-9bb2-9c4d2bc24155",
  },
  "ipv4-addr": { value: "203.0.113.10" },
  "ipv6-addr": { value: "2001:db8::1" },
  "mac-addr": { value: "00:00:5e:00:53:af" },
  mutex: { name: "FictionalMutex" },
  "network-traffic": {
    dst_port: 443,
    dst_ref: "ipv4-addr--28bb3599-77cd-5a82-a950-b5bc3caf07c4",
    end: "2026-07-26T10:05:00.000Z",
    extensions: { "tcp-ext": { dst_flags_hex: "02" } },
    protocols: ["ipv4", "tcp"],
    src_port: 49152,
    src_ref: "ipv4-addr--9cf4a8ec-7640-5f40-a006-79942896168b",
    start: "2026-07-26T10:00:00.000Z",
  },
  software: {
    cpe: "cpe:2.3:a:example:fictional:1.0:*:*:*:*:*:*:*",
    name: "Fictional Software",
    swid: "fictional-software-1",
    vendor: "Example",
    version: "1.0",
  },
  url: { value: "https://example.com/path" },
  "user-account": {
    account_login: "fictional-user",
    account_type: "unix",
    user_id: "1001",
  },
  "windows-registry-key": {
    key: "HKEY_LOCAL_MACHINE\\\\Software\\\\Fictional",
    values: [
      { data: "example", data_type: "REG_SZ", name: "ExampleValue" },
    ],
  },
  "x509-certificate": {
    hashes: { "SHA-256": "c".repeat(64) },
    serial_number: "01",
  },
} as const;

describe("deterministic SCO identifiers", () => {
  it("matches the Errata 01 IPv4 example vector", async () => {
    const result = await createDeterministicScoId("ipv4-addr", {
      value: "198.51.100.3",
    });

    expect(result).toEqual({
      ok: true,
      id: "ipv4-addr--28bb3599-77cd-5a82-a950-b5bc3caf07c4",
    });
  });

  it("matches the Errata 01 Domain Name example vector", async () => {
    const result = await createDeterministicScoId("domain-name", {
      value: "example.com",
    });

    expect(result).toEqual({
      ok: true,
      id: "domain-name--bedb4899-d24b-5401-bc86-8f6b4cc18ec7",
    });
  });

  it("canonicalizes object keys while preserving array order", () => {
    expect(
      canonicalizeJson({
        z: [2, 1],
        a: {
          y: true,
          x: "value",
        },
      }),
    ).toBe('{"a":{"x":"value","y":true},"z":[2,1]}');
  });

  it("returns the same ID for the same contributing properties", async () => {
    const first = await createDeterministicScoId("ipv4-addr", {
      value: "203.0.113.10",
    });
    const second = await createDeterministicScoId("ipv4-addr", {
      value: "203.0.113.10",
    });

    expect(first).toEqual(second);
  });

  it("creates stable UUIDv5 identifiers for every contributing-property SCO", async () => {
    for (const [type, properties] of Object.entries(completeScoExamples)) {
      const first = await createDeterministicScoId(type, properties);
      const second = await createDeterministicScoId(type, properties);

      expect(first).toEqual(second);
      expect(first).toEqual({
        ok: true,
        id: expect.stringMatching(
          new RegExp(
            `^${type}--[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}`
            + "-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
            "u",
          ),
        ),
      });
    }
  });

  it("uses injected UUIDv4 fallback for every SCO with no contributing values", async () => {
    const fallbackTypes = [
      "artifact",
      "email-message",
      "file",
      "process",
      "user-account",
      "windows-registry-key",
      "x509-certificate",
    ];

    for (const type of fallbackTypes) {
      expect(
        await createDeterministicScoId(type, {}, {
          randomUUID: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        }),
      ).toEqual({
        ok: true,
        id: `${type}--aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`,
      });
    }
  });

  it("selects one preferred hash for hash-contributing SCOs", async () => {
    const preferredOnly = await createDeterministicScoId("file", {
      hashes: { MD5: "d41d8cd98f00b204e9800998ecf8427e" },
    });
    const severalHashes = await createDeterministicScoId("file", {
      hashes: {
        MD5: "d41d8cd98f00b204e9800998ecf8427e",
        "SHA-1": "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        "SHA-256": "e3b0c44298fc1c149afbf4c8996fb924",
      },
    });

    expect(severalHashes).toEqual(preferredOnly);
  });

  it("ignores properties that do not contribute to SCO identity", async () => {
    const minimal = await createDeterministicScoId("domain-name", {
      value: "example.com",
    });
    const withReference = await createDeterministicScoId("domain-name", {
      resolves_to_refs: [
        "ipv4-addr--28bb3599-77cd-5a82-a950-b5bc3caf07c4",
      ],
      value: "example.com",
    });

    expect(withReference).toEqual(minimal);
  });

  it("rejects lone Unicode surrogates from canonical JSON", () => {
    expect(() => canonicalizeJson({ value: "\ud800" })).toThrow(
      "lone Unicode surrogate",
    );
  });

  it("blocks missing contributing properties", async () => {
    const result = await createDeterministicScoId("ipv4-addr", {});

    expect(result).toEqual({
      ok: false,
      diagnostic: expect.objectContaining({
        code: DIAGNOSTIC_CODES.fieldRequired,
        field: "value",
      }),
    });
  });
});
