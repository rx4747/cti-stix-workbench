import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CONTRIBUTORS_START = "<!-- contributors:start -->";
export const CONTRIBUTORS_END = "<!-- contributors:end -->";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function visibleContributors(contributors) {
  return contributors.filter((contributor) => {
    const login = contributor.login.toLowerCase();
    return contributor.type !== "Bot" && !login.endsWith("[bot]");
  });
}

export function renderContributorTable(contributors, columns = 7) {
  assert.ok(
    Number.isInteger(columns) && columns > 0,
    "columns must be a positive integer.",
  );
  const visible = visibleContributors(contributors);
  if (visible.length === 0) {
    return "_The contributor wall will appear after the first accepted contribution._";
  }
  const rows = [];
  for (let index = 0; index < visible.length; index += columns) {
    const cells = visible.slice(index, index + columns).map((contributor) => {
      const login = escapeHtml(contributor.login);
      const profile = escapeHtml(contributor.html_url);
      const avatar = escapeHtml(contributor.avatar_url);
      return [
        '    <td align="center">',
        `      <a href="${profile}">`,
        `        <img src="${avatar}" width="72" alt="${login}" />`,
        "        <br />",
        `        <sub><b>@${login}</b></sub>`,
        "      </a>",
        "    </td>",
      ].join("\n");
    });
    rows.push(["  <tr>", ...cells, "  </tr>"].join("\n"));
  }
  return ["<table>", "<tbody>", ...rows, "</tbody>", "</table>"].join("\n");
}

export function replaceContributorSection(readme, contributors) {
  const start = readme.indexOf(CONTRIBUTORS_START);
  const end = readme.indexOf(CONTRIBUTORS_END);
  assert.ok(start >= 0, `README is missing ${CONTRIBUTORS_START}.`);
  assert.ok(end > start, `README is missing ${CONTRIBUTORS_END}.`);
  const contentStart = start + CONTRIBUTORS_START.length;
  return `${readme.slice(0, contentStart)}\n${renderContributorTable(contributors)}\n${readme.slice(end)}`;
}

async function fetchContributors(repository, token, fetchImplementation = fetch) {
  const contributors = [];
  for (let page = 1; ; page += 1) {
    const response = await fetchImplementation(
      `https://api.github.com/repos/${repository}/contributors?anon=0&per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "cti-stix-workbench-contributors",
          ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!response.ok) {
      throw new Error(`GitHub contributors request failed: HTTP ${response.status}.`);
    }
    const pageItems = await response.json();
    if (!Array.isArray(pageItems)) {
      throw new TypeError("GitHub contributors response is not an array.");
    }
    contributors.push(
      ...pageItems.filter(
        (item) =>
          item !== null &&
          typeof item === "object" &&
          typeof item.login === "string" &&
          typeof item.avatar_url === "string" &&
          typeof item.html_url === "string" &&
          typeof item.type === "string",
      ),
    );
    if (pageItems.length < 100) break;
  }
  return contributors;
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY ?? "rx4747/cti-stix-workbench";
  assert.match(repository, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u);
  const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
  const readmePath = path.join(repositoryRoot, "README.md");
  const [readme, contributors] = await Promise.all([
    readFile(readmePath, "utf8"),
    fetchContributors(repository, process.env.GITHUB_TOKEN),
  ]);
  const updated = replaceContributorSection(readme, contributors);
  if (updated === readme) {
    console.log("Contributor wall is already current.");
    return;
  }
  await writeFile(readmePath, updated, "utf8");
  console.log(
    `Updated contributor wall with ${visibleContributors(contributors).length} profile(s).`,
  );
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
