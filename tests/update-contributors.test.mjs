import { describe, expect, it } from "vitest";

import {
  CONTRIBUTORS_END,
  CONTRIBUTORS_START,
  renderContributorTable,
  replaceContributorSection,
  visibleContributors,
} from "../scripts/update-contributors.mjs";

const contributors = [
  {
    login: "rx4747",
    avatar_url: "https://avatars.example/rx4747",
    html_url: "https://github.com/rx4747",
    type: "User",
  },
  {
    login: "private-legacy-profile",
    avatar_url: "https://avatars.example/old",
    html_url: "https://github.com/private-legacy-profile",
    type: "User",
  },
  {
    login: "github-actions[bot]",
    avatar_url: "https://avatars.example/bot",
    html_url: "https://github.com/apps/github-actions",
    type: "Bot",
  },
];

describe("README contributor automation", () => {
  it("shows every real contributor and filters automated bots", () => {
    expect(visibleContributors(contributors).map((item) => item.login)).toEqual([
      "rx4747",
      "private-legacy-profile",
    ]);
  });

  it("rejects rendering column counts that cannot advance", () => {
    expect(() => renderContributorTable(contributors, 0)).toThrow("positive integer");
    expect(() => renderContributorTable(contributors, -1)).toThrow("positive integer");
  });

  it("updates only the bounded contributor section", () => {
    const readme = `before\n${CONTRIBUTORS_START}\nold\n${CONTRIBUTORS_END}\nafter\n`;
    const updated = replaceContributorSection(readme, contributors);

    expect(updated).toContain("https://github.com/rx4747");
    expect(updated).toContain("private-legacy-profile");
    expect(updated).not.toContain("github-actions");
    expect(updated).toMatch(/^before/u);
    expect(updated).toMatch(/after\n$/u);
  });
});
