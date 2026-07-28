import { describe, expect, it } from "vitest";

import {
  friendlyStixReference,
  isValidRawStixReference,
  rawStixReferenceLabel,
  referenceTypeAllowed,
  stixReferenceLink,
  wikiLinkLabel,
  wikiLinkTarget,
} from "../src/ui/property-editor-state";

describe("property editor STIX references", () => {
  it("turns Markdown paths into Obsidian wiki links", () => {
    expect(stixReferenceLink("03 STIX Objects/SDOs/APT1.md")).toBe(
      "[[03 STIX Objects/SDOs/APT1|APT1]]",
    );
    expect(stixReferenceLink("SDOs/Completing the Mission - 0781fe704c94.md")).toBe(
      "[[SDOs/Completing the Mission - 0781fe704c94|Completing the Mission]]",
    );
    expect(
      stixReferenceLink(
        "SDOs/Appendix F SSL Certificate for serial number 0e97881c6ca137964203bc454224756c - b3b7035ed838.md",
      ),
    ).toBe(
      "[[SDOs/Appendix F SSL Certificate for serial number 0e97881c6ca137964203bc454224756c - b3b7035ed838|Appendix F SSL Certificate for serial number 0e97881c6ca1379…]]",
    );
    expect(stixReferenceLink("APT1")).toBe("[[APT1]]");
  });

  it("adds friendly aliases without changing reference targets", () => {
    expect(friendlyStixReference("[[SDOs/Appendix E MD5 hash]]")).toBe(
      "[[SDOs/Appendix E MD5 hash|Appendix E MD5 hash]]",
    );
    expect(friendlyStixReference("[[SDOs/APT1|APT1 report]]")).toBe(
      "[[SDOs/APT1|APT1 report]]",
    );
    expect(friendlyStixReference("indicator--031778a4")).toBe("indicator--031778a4");
  });

  it("filters typed notes when a reference has constrained targets", () => {
    expect(referenceTypeAllowed("identity", ["identity"])).toBe(true);
    expect(referenceTypeAllowed("malware", ["identity"])).toBe(false);
    expect(referenceTypeAllowed("malware", ["*"])).toBe(true);
  });

  it("extracts wiki targets and shortens raw identifiers for pills", () => {
    expect(wikiLinkTarget("[[03 STIX Objects/SDOs/APT1]]")).toBe(
      "03 STIX Objects/SDOs/APT1",
    );
    expect(wikiLinkTarget("[[APT1|Display name]]")).toBe("APT1");
    expect(wikiLinkLabel("[[APT1|Display name]]")).toBe("Display name");
    expect(wikiLinkLabel("[[APT1]]")).toBeUndefined();
    expect(wikiLinkLabel("[[APT1|   ]]")).toBeUndefined();
    expect(wikiLinkTarget("indicator--not-a-link")).toBeUndefined();
    expect(
      rawStixReferenceLabel("indicator--031778a4-057f-48e6-9db9-c8d72b81ccd5"),
    ).toBe("indicator · 031778a4…ccd5");
  });

  it("accepts only structurally valid raw STIX identifiers", () => {
    expect(
      isValidRawStixReference("indicator--031778a4-057f-48e6-9db9-c8d72b81ccd5"),
    ).toBe(true);
    expect(isValidRawStixReference("indicator--not-a-uuid")).toBe(false);
    expect(isValidRawStixReference("not-an-id")).toBe(false);
  });
});
