import { describe, expect, it } from "vitest";

import {
  CONTRIBUTORS_END,
  CONTRIBUTORS_START,
  loginDigest,
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
  it("keeps the explicit OPSEC denylist and bots out of the public wall", () => {
    const excluded = new Set([loginDigest("private-legacy-profile")]);
    expect(
      visibleContributors(contributors, excluded).map((item) => item.login),
    ).toEqual(["rx4747"]);
  });

  it("updates only the bounded contributor section", () => {
    const readme = `before\n${CONTRIBUTORS_START}\nold\n${CONTRIBUTORS_END}\nafter\n`;
    const excluded = new Set([loginDigest("private-legacy-profile")]);
    const updated = replaceContributorSection(readme, contributors, excluded);

    expect(updated).toContain("https://github.com/rx4747");
    expect(updated).not.toContain("private-legacy-profile");
    expect(updated).not.toContain("github-actions");
    expect(updated).toMatch(/^before/u);
    expect(updated).toMatch(/after\n$/u);
  });
});
