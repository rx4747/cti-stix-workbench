import { describe, expect, it } from "vitest";

import {
  friendlyStixReference,
  rawStixReferenceLabel,
  referenceTypeAllowed,
  stixReferenceLink,
  wikiLinkTarget,
} from "../src/ui/property-editor-state";

describe("property editor STIX references", () => {
  it("turns Markdown paths into Obsidian wiki links", () => {
    expect(stixReferenceLink("03 STIX Objects/SDOs/APT1.md")).toBe(
      "[[03 STIX Objects/SDOs/APT1|APT1]]",
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
    expect(wikiLinkTarget("indicator--not-a-link")).toBeUndefined();
    expect(
      rawStixReferenceLabel("indicator--031778a4-057f-48e6-9db9-c8d72b81ccd5"),
    ).toBe("indicator · 031778a4…ccd5");
  });
});
