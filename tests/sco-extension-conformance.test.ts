import { describe, expect, it } from "vitest";

import { validateBundleSchema } from "../src/core/bundle-validator";
import { mapGraphToBundle } from "../src/core/graph-mapper";
import type { NormalizedStixDraft } from "../src/core/types";

function uuid(index: number): string {
  return `30000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

function sco(
  type: string,
  index: number,
  properties: Readonly<Record<string, unknown>>,
  options: {
    readonly path?: string;
    readonly references?: Readonly<Record<string, string>>;
  } = {},
): NormalizedStixDraft {
  const id = `${type}--${uuid(index)}`;
  const path = options.path ?? `Objects/${type}.md`;
  return {
    path,
    basename: path.split("/").at(-1)?.replace(/\.md$/u, "") ?? type,
    stixType: type,
    stixId: id,
    properties: { type, id, spec_version: "2.1", ...properties },
    links: Object.entries(options.references ?? {}).map(([raw, targetPath]) => ({
      raw,
      targetPath,
    })),
    relationships: [],
  };
}

function baseScoDrafts(): readonly NormalizedStixDraft[] {
  return [
    sco("artifact", 1, { payload_bin: "RmljdGlvbmFsIGRhdGE=" }),
    sco("autonomous-system", 2, { name: "Documentation AS", number: 64512 }),
    sco("directory", 3, { path: "/opt/fictional" }),
    sco("domain-name", 4, { value: "example.invalid" }),
    sco("email-addr", 5, { value: "analyst@example.invalid" }),
    sco("email-message", 6, {
      body: "Fictional message.",
      is_multipart: false,
      subject: "Fictional subject",
    }),
    sco("file", 7, {
      hashes: { "SHA-256": "a".repeat(64) },
      name: "fictional.bin",
    }),
    sco("ipv4-addr", 8, { value: "198.51.100.80" }),
    sco("ipv6-addr", 9, { value: "2001:db8::80" }),
    sco("mac-addr", 10, { value: "00:00:5e:00:53:80" }),
    sco("mutex", 11, { name: "FictionalMutex" }),
    sco(
      "network-traffic",
      12,
      { protocols: ["ipv4", "tcp"], src_ref: "[[Source]]" },
      { references: { Source: "Objects/ipv4-addr.md" } },
    ),
    sco("process", 13, { pid: 4242 }),
    sco("software", 14, { name: "Fictional software", version: "1.0" }),
    sco("url", 15, { value: "https://example.invalid/path" }),
    sco("user-account", 16, {
      account_login: "fictional-user",
      account_type: "unix",
    }),
    sco("windows-registry-key", 17, {
      key: "HKEY_LOCAL_MACHINE\\Software\\Fictional",
    }),
    sco("x509-certificate", 18, { serial_number: "01" }),
  ];
}

function extensionDrafts(): readonly NormalizedStixDraft[] {
  const artifactPath = "Extensions/archive-target.md";
  const networkSourcePath = "Extensions/network-source.md";
  return [
    sco(
      "artifact",
      100,
      { payload_bin: "RmljdGlvbmFsIGFyY2hpdmU=" },
      { path: artifactPath },
    ),
    sco(
      "file",
      101,
      {
        extensions: {
          "archive-ext": {
            comment: "Fictional archive",
            contains_refs: ["[[Target]]"],
          },
        },
        name: "fictional.zip",
      },
      { path: "Extensions/archive.md", references: { Target: artifactPath } },
    ),
    sco(
      "file",
      102,
      {
        extensions: {
          "ntfs-ext": {
            alternate_data_streams: [{ name: "fictional", size: 1 }],
          },
        },
        name: "fictional-ntfs.bin",
      },
      { path: "Extensions/ntfs.md" },
    ),
    sco(
      "file",
      103,
      { extensions: { "pdf-ext": { version: "1.7" } }, name: "fictional.pdf" },
      { path: "Extensions/pdf.md" },
    ),
    sco(
      "file",
      104,
      {
        extensions: { "raster-image-ext": { image_height: 1, image_width: 1 } },
        name: "fictional.png",
      },
      { path: "Extensions/raster.md" },
    ),
    sco(
      "file",
      105,
      {
        extensions: {
          "windows-pebinary-ext": { imphash: "a".repeat(32), pe_type: "exe" },
        },
        name: "fictional.exe",
      },
      { path: "Extensions/pe.md" },
    ),
    sco(
      "network-traffic",
      106,
      {
        extensions: {
          "http-request-ext": {
            request_header: { Host: ["example.invalid"] },
            request_method: "GET",
            request_value: "/",
          },
        },
        protocols: ["tcp", "http"],
        src_ref: "[[Source]]",
      },
      { path: "Extensions/http.md", references: { Source: networkSourcePath } },
    ),
    sco(
      "network-traffic",
      107,
      {
        extensions: { "icmp-ext": { icmp_code_hex: "00", icmp_type_hex: "08" } },
        protocols: ["icmp"],
        src_ref: "[[Source]]",
      },
      { path: "Extensions/icmp.md", references: { Source: networkSourcePath } },
    ),
    sco(
      "network-traffic",
      108,
      {
        extensions: { "socket-ext": { address_family: "AF_INET" } },
        protocols: ["tcp"],
        src_ref: "[[Source]]",
      },
      { path: "Extensions/socket.md", references: { Source: networkSourcePath } },
    ),
    sco(
      "network-traffic",
      109,
      {
        extensions: { "tcp-ext": { src_flags_hex: "02" } },
        protocols: ["tcp"],
        src_ref: "[[Source]]",
      },
      { path: "Extensions/tcp.md", references: { Source: networkSourcePath } },
    ),
    sco(
      "process",
      110,
      { extensions: { "windows-process-ext": { window_title: "Fictional" } }, pid: 1 },
      { path: "Extensions/windows-process.md" },
    ),
    sco(
      "process",
      111,
      {
        extensions: {
          "windows-service-ext": {
            service_name: "FictionalService",
            service_status: "SERVICE_RUNNING",
          },
        },
        pid: 2,
      },
      { path: "Extensions/windows-service.md" },
    ),
    sco(
      "user-account",
      112,
      {
        account_login: "fictional",
        account_type: "unix",
        extensions: { "unix-account-ext": { gid: 1000, shell: "/bin/sh" } },
      },
      { path: "Extensions/unix-account.md" },
    ),
    sco("ipv4-addr", 113, { value: "198.51.100.113" }, { path: networkSourcePath }),
  ];
}

describe("SCO and predefined-extension conformance", () => {
  it("maps and schema-validates all 18 SCO types", async () => {
    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid(900)}`,
      drafts: baseScoDrafts(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.objects).toHaveLength(18);
    expect(validateBundleSchema(result.bundle)).toEqual([]);
  });

  it("maps and schema-validates all 12 predefined SCO extensions", async () => {
    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid(901)}`,
      drafts: extensionDrafts(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(validateBundleSchema(result.bundle)).toEqual([]);
    const extensionNames = result.bundle.objects.flatMap((object) =>
      object.extensions !== null &&
      typeof object.extensions === "object" &&
      !Array.isArray(object.extensions)
        ? Object.keys(object.extensions)
        : [],
    );
    expect(new Set(extensionNames)).toEqual(
      new Set([
        "archive-ext",
        "ntfs-ext",
        "pdf-ext",
        "raster-image-ext",
        "windows-pebinary-ext",
        "http-request-ext",
        "icmp-ext",
        "socket-ext",
        "tcp-ext",
        "windows-process-ext",
        "windows-service-ext",
        "unix-account-ext",
      ]),
    );
  });
});
