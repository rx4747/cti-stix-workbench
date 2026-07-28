import { type App, normalizePath, stringifyYaml, TFolder } from "obsidian";

import type { BundleImportPlan } from "../../import/bundle-import";

async function ensureFolder(app: App, path: string): Promise<void> {
  let current = "";
  for (const segment of normalizePath(path).split("/")) {
    current = current === "" ? segment : `${current}/${segment}`;
    const existing = app.vault.getAbstractFileByPath(current);
    if (existing instanceof TFolder) continue;
    if (existing !== null) throw new TypeError(`${current} is not a folder.`);
    await app.vault.createFolder(current);
  }
}

function noteContent(
  frontmatter: Readonly<Record<string, unknown>>,
  body: string,
): string {
  return `---\n${stringifyYaml(frontmatter)}---\n\n${body}`;
}

export async function executeBundleImport(
  app: App,
  plan: BundleImportPlan,
  importRoot: string,
  destinationName: string,
): Promise<string> {
  const root = normalizePath(importRoot);
  const destination = normalizePath(`${root}/${destinationName}`);
  if (app.vault.getAbstractFileByPath(destination) !== null) {
    throw new Error(`Import destination already exists: ${destination}`);
  }
  await ensureFolder(app, root);
  const staging = normalizePath(`${root}/.cti-import-${crypto.randomUUID()}`);
  await app.vault.createFolder(staging);
  try {
    for (const note of plan.notes) {
      const fullPath = normalizePath(`${staging}/${note.relativePath}`);
      const folder = fullPath.slice(0, fullPath.lastIndexOf("/"));
      await ensureFolder(app, folder);
      await app.vault.create(
        fullPath,
        noteContent(note.frontmatter, note.markdownBody),
      );
    }
    await app.vault.create(
      normalizePath(`${staging}/${plan.overviewPath}`),
      plan.overviewBody,
    );
    const stagingFolder = app.vault.getAbstractFileByPath(staging);
    if (!(stagingFolder instanceof TFolder))
      throw new Error("Import staging folder disappeared.");
    await app.vault.rename(stagingFolder, destination);
    return destination;
  } catch (error) {
    const stagingFolder = app.vault.getAbstractFileByPath(staging);
    if (stagingFolder !== null) await app.fileManager.trashFile(stagingFolder);
    throw error;
  }
}
