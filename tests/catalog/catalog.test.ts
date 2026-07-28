import { describe, expect, it } from "vitest";

import { stixCatalog } from "../../src/catalog/stix-2.1";

describe("STIX 2.1 catalog", () => {
  it("enumerates the complete fixture-gated coverage surface", () => {
    const definitions = stixCatalog.listObjectTypes();

    expect(definitions).toHaveLength(55);
    expect(
      definitions.filter((definition) => definition.family === "sdo"),
    ).toHaveLength(19);
    expect(
      definitions.filter((definition) => definition.family === "predefined-extension"),
    ).toHaveLength(12);
  });

  it("exposes required, optional, vocabulary, and citation evidence", () => {
    const identity = stixCatalog.getObjectType("identity");
    expect(identity).toBeDefined();
    expect(identity?.fields.find((field) => field.name === "name")?.required).toBe(
      true,
    );
    expect(identity?.fields.find((field) => field.name === "roles")?.required).toBe(
      false,
    );
    expect(
      identity?.fields.find((field) => field.name === "identity_class")?.vocabulary
        ?.values,
    ).toContain("organization");
    expect(
      identity?.fields.find((field) => field.name === "spec_version")?.vocabulary
        ?.values,
    ).toEqual(["2.1"]);
    expect(identity?.citation.section).toBe("STIX 2.1 Errata 01 §4.5");
  });

  it("classifies single and list reference properties", () => {
    const relationship = stixCatalog.getObjectType("relationship");
    const report = stixCatalog.getObjectType("report");

    expect(
      relationship?.fields.find((field) => field.name === "source_ref")?.reference
        ?.cardinality,
    ).toBe("one");
    expect(
      report?.fields.find((field) => field.name === "object_refs")?.reference
        ?.cardinality,
    ).toBe("many");
  });

  it("matches normative meta-object requirements and applicability", () => {
    const language = stixCatalog.getObjectType("language-content");
    const marking = stixCatalog.getObjectType("marking-definition");
    const extension = stixCatalog.getObjectType("extension-definition");

    expect(language?.fields.some((field) => field.name === "lang")).toBe(false);
    expect(
      marking?.fields.find((field) => field.name === "definition_type")?.required,
    ).toBe(false);
    expect(marking?.fields.find((field) => field.name === "definition")?.required).toBe(
      false,
    );
    expect(
      extension?.fields.find((field) => field.name === "created_by_ref")?.required,
    ).toBe(true);
    for (const notApplicable of ["confidence", "lang", "extensions"]) {
      expect(
        extension?.fields.some((field) => field.name === notApplicable),
        notApplicable,
      ).toBe(false);
    }
  });

  it("requires source names and constrains common embedded references", () => {
    for (const definition of stixCatalog.listObjectTypes()) {
      const externalReferences = definition.fields.find(
        (field) => field.name === "external_references",
      );
      if (externalReferences !== undefined) {
        expect(
          externalReferences.children?.find((field) => field.name === "source_name")
            ?.required,
          definition.type,
        ).toBe(true);
      }
      const creator = definition.fields.find(
        (field) => field.name === "created_by_ref",
      );
      if (creator !== undefined) {
        expect(creator.reference?.targetTypes, definition.type).toEqual(["identity"]);
      }
      const markings = definition.fields.find(
        (field) => field.name === "object_marking_refs",
      );
      if (markings !== undefined) {
        expect(markings.reference?.targetTypes, definition.type).toEqual([
          "marking-definition",
        ]);
      }
      const granularMarking = definition.fields.find(
        (field) => field.name === "granular_markings",
      );
      if (granularMarking !== undefined) {
        const markingReference = granularMarking.children?.find(
          (field) => field.name === "marking_ref",
        );
        expect(markingReference?.required, definition.type).toBe(false);
        expect(markingReference?.reference?.targetTypes, definition.type).toEqual([
          "marking-definition",
        ]);
      }
    }
  });

  it("records the normative ID-contributing properties for every SCO", () => {
    const actual = Object.fromEntries(
      stixCatalog
        .listObjectTypes()
        .filter((definition) => definition.family === "sco")
        .map((definition) => [definition.type, definition.idContributingProperties]),
    );

    expect(actual).toEqual({
      artifact: ["hashes", "payload_bin"],
      "autonomous-system": ["number"],
      directory: ["path"],
      "domain-name": ["value"],
      "email-addr": ["value"],
      "email-message": ["from_ref", "subject", "body"],
      file: ["hashes", "name", "extensions", "parent_directory_ref"],
      "ipv4-addr": ["value"],
      "ipv6-addr": ["value"],
      "mac-addr": ["value"],
      mutex: ["name"],
      "network-traffic": [
        "start",
        "end",
        "src_ref",
        "dst_ref",
        "src_port",
        "dst_port",
        "protocols",
        "extensions",
      ],
      process: [],
      software: ["name", "cpe", "swid", "vendor", "version"],
      url: ["value"],
      "user-account": ["account_type", "user_id", "account_login"],
      "windows-registry-key": ["key", "values"],
      "x509-certificate": ["hashes", "serial_number"],
    });
  });

  it("extracts predefined extension fields from their parent schemas", () => {
    const http = stixCatalog.getObjectType("http-request-ext");
    const ntfs = stixCatalog.getObjectType("ntfs-ext");

    expect(http?.extensionOf).toBe("network-traffic");
    expect(
      http?.fields.find((field) => field.name === "request_method")?.required,
    ).toBe(true);
    expect(
      ntfs?.fields
        .find((field) => field.name === "alternate_data_streams")
        ?.children?.map((field) => field.name),
    ).toEqual(["name", "hashes", "size"]);
  });

  it("returns immutable standard definitions", () => {
    const definitions = stixCatalog.listObjectTypes();
    expect(Object.isFrozen(definitions)).toBe(true);
    expect(Object.isFrozen(definitions[0])).toBe(true);
  });
});
