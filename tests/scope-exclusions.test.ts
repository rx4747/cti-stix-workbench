import { describe, expect, it } from "vitest";

import {
  excludedScopeFolders,
  filterExcludedScopePaths,
} from "../src/scope-exclusions";

describe("broad-scope exclusions", () => {
  it("normalizes comma-separated folders", () => {
    expect(excludedScopeFolders("Templates, Drafts\\Internal/")).toEqual([
      "Templates",
      "Drafts/Internal",
    ]);
  });

  it("excludes only exact folder subtrees", () => {
    expect(
      filterExcludedScopePaths(
        [
          "Templates/Indicator.md",
          "Drafts/Internal/Actor.md",
          "Draftsmanship/Report.md",
          "03 STIX Objects/Indicator.md",
        ],
        "Templates, Drafts/Internal",
      ),
    ).toEqual(["Draftsmanship/Report.md", "03 STIX Objects/Indicator.md"]);
  });
});
