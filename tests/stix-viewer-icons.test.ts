import { describe, expect, it } from "vitest";

import { stixIconDataUrl } from "../src/viewer/icons";

describe("STIX viewer icons", () => {
  it("uses the custom-object fallback for inherited property names", () => {
    const fallback = stixIconDataUrl("extension-definition");

    expect(stixIconDataUrl("constructor")).toBe(fallback);
    expect(stixIconDataUrl("toString")).toBe(fallback);
    expect(stixIconDataUrl("__proto__")).toBe(fallback);
  });
});
