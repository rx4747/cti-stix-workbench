import { describe, expect, it } from "vitest";
import {
  incrementVersion,
  prepareRelease,
  promoteUnreleasedNotes,
} from "../scripts/bump-release-version.mjs";
import {
  assertTagAvailable,
  validateReleaseVersion,
} from "../scripts/check-release-version.mjs";
import { extractReleaseNotes } from "../scripts/extract-release-notes.mjs";

const manifest = {
  id: "cti-stix-workbench",
  minAppVersion: "1.8.10",
  version: "0.1.3",
};
const packageJson = {
  name: "cti-stix-workbench",
  version: "0.1.3",
};
const versions = { "0.1.3": "1.8.10" };

describe("release metadata contract", () => {
  it("accepts matching stable numeric metadata", () => {
    expect(
      validateReleaseVersion({
        tag: "0.1.3",
        manifest,
        packageJson,
        versions,
      }),
    ).toEqual({
      pluginId: "cti-stix-workbench",
      version: "0.1.3",
    });
  });

  it.each(["v0.1.3", "0.1.3-beta.1", "0.1.3+build.1"])(
    "rejects non-numeric release tag %s",
    (tag) => {
      expect(() =>
        validateReleaseVersion({
          tag,
          manifest,
          packageJson,
          versions,
        }),
      ).toThrow(/without a v prefix/u);
    },
  );

  it("rejects a tag that differs from the manifest", () => {
    expect(() =>
      validateReleaseVersion({
        tag: "0.1.2",
        manifest,
        packageJson,
        versions,
      }),
    ).toThrow(/does not match manifest version/u);
  });

  it("rejects inconsistent package and version-map metadata", () => {
    expect(() =>
      validateReleaseVersion({
        tag: "0.1.3",
        manifest,
        packageJson: { ...packageJson, version: "0.1.2" },
        versions,
      }),
    ).toThrow(/versions must match/u);
    expect(() =>
      validateReleaseVersion({
        tag: "0.1.3",
        manifest,
        packageJson,
        versions: { "0.1.3": "1.9.0" },
      }),
    ).toThrow(/does not map/u);
  });

  it("rejects an existing release tag", () => {
    expect(() =>
      assertTagAvailable({
        existingTags: ["0.1.2", "0.1.3"],
        tag: "0.1.3",
      }),
    ).toThrow(/already exists/u);
  });
});

describe("release notes contract", () => {
  it("extracts only the matching release body", () => {
    expect(
      extractReleaseNotes({
        changelog:
          "# Changelog\n\n## 0.1.3 — 2026-07-27\n\n- Fixed release.\n\n## 0.1.2\n\n- Older.\n",
        version: "0.1.3",
      }),
    ).toBe("- Fixed release.\n");
  });

  it("rejects a missing or empty matching release section", () => {
    expect(() =>
      extractReleaseNotes({
        changelog: "# Changelog\n\n## 0.1.2\n\n- Older.\n",
        version: "0.1.3",
      }),
    ).toThrow(/exactly one/u);
    expect(() =>
      extractReleaseNotes({
        changelog: "# Changelog\n\n## 0.1.3\n\n## 0.1.2\n\n- Older.\n",
        version: "0.1.3",
      }),
    ).toThrow(/non-empty/u);
  });
});

describe("automatic release preparation", () => {
  it.each([
    ["patch", "0.1.4"],
    ["minor", "0.2.0"],
    ["major", "1.0.0"],
  ])("increments a %s version", (bump, expected) => {
    expect(incrementVersion("0.1.3", bump)).toBe(expected);
  });

  it("promotes Unreleased notes into a dated release section", () => {
    const changelog =
      "# Changelog\n\n## Unreleased\n\n### Fixed\n\n- Hardened releases.\n\n## Released\n\n## 0.1.3 — 2026-07-27\n\n- Previous.\n";
    const promoted = promoteUnreleasedNotes({
      changelog,
      date: "2026-07-28",
      version: "0.1.4",
    });
    expect(promoted).toContain("## Unreleased\n\n## Released");
    expect(
      extractReleaseNotes({
        changelog: promoted,
        version: "0.1.4",
      }),
    ).toContain("- Hardened releases.");
  });

  it("updates every version record together", () => {
    const release = prepareRelease({
      bump: "patch",
      changelog:
        "# Changelog\n\n## Unreleased\n\n- Next.\n\n## Released\n\n## 0.1.3\n\n- Current.\n",
      date: "2026-07-28",
      manifest,
      packageJson,
      versions,
    });
    expect(release.version).toBe("0.1.4");
    expect(release.manifest.version).toBe("0.1.4");
    expect(release.packageJson.version).toBe("0.1.4");
    expect(release.versions["0.1.4"]).toBe("1.8.10");
  });

  it("requires release notes before incrementing", () => {
    expect(() =>
      promoteUnreleasedNotes({
        changelog: "# Changelog\n\n## Unreleased\n\n## Released\n",
        date: "2026-07-28",
        version: "0.1.4",
      }),
    ).toThrow(/non-empty/u);
  });
});
