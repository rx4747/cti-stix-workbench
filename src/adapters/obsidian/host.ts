import { type App, normalizePath, TFile, TFolder } from "obsidian";

import type {
  PersistedRelationshipIdentity,
  ResolvedLink,
  UntrustedNoteInput,
} from "../../core/types";
import type { ActiveGraphHost } from "./active-graph";
import type { ScopedGraphHost } from "./scoped-export";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export interface RelationshipIdentityStore {
  load(): Readonly<Record<string, PersistedRelationshipIdentity>>;
  save(
    identities: Readonly<Record<string, PersistedRelationshipIdentity>>,
  ): Promise<void>;
}

function frontmatterWithoutCacheMetadata(
  frontmatter: Readonly<Record<string, unknown>> | undefined,
): Readonly<Record<string, unknown>> {
  if (frontmatter === undefined) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(frontmatter).filter(([key]) => key !== "position"),
  );
}

export class ObsidianActiveGraphHost implements ActiveGraphHost, ScopedGraphHost {
  constructor(
    private readonly app: App,
    private readonly identityStore: RelationshipIdentityStore,
  ) {}

  async readNote(path: string): Promise<UntrustedNoteInput | undefined> {
    const normalizedPath = normalizePath(path);
    const file = this.app.vault.getFileByPath(normalizedPath);
    if (file === null || file.extension.toLowerCase() !== "md") {
      return undefined;
    }

    const cache = this.app.metadataCache.getFileCache(file);
    const cachedLinks = [...(cache?.links ?? []), ...(cache?.frontmatterLinks ?? [])];
    const links: ResolvedLink[] = cachedLinks.map((link) => {
      const target = this.app.metadataCache.getFirstLinkpathDest(link.link, file.path);
      const location =
        "position" in link
          ? {
              line: link.position.start.line + 1,
              column: link.position.start.col + 1,
            }
          : undefined;
      return {
        raw: link.link,
        ...(target === null ? {} : { targetPath: target.path }),
        ...(location === undefined ? {} : { location }),
      };
    });

    return {
      path: file.path,
      basename: file.basename,
      frontmatter: frontmatterWithoutCacheMetadata(cache?.frontmatter),
      markdown: await this.app.vault.cachedRead(file),
      links,
    };
  }

  async readTextFile(path: string): Promise<string | undefined> {
    const file = this.app.vault.getFileByPath(normalizePath(path));
    return file === null ? undefined : this.app.vault.cachedRead(file);
  }

  listMarkdownPaths(folderPath?: string): readonly string[] {
    const prefix =
      folderPath === undefined || folderPath === ""
        ? ""
        : `${normalizePath(folderPath)}/`;
    return this.app.vault
      .getMarkdownFiles()
      .map((file) => file.path)
      .filter((path) => prefix === "" || path.startsWith(prefix))
      .sort();
  }

  async persistStixId(path: string, id: string): Promise<void> {
    const file = this.app.vault.getFileByPath(normalizePath(path));
    if (file === null) {
      throw new Error(`Cannot persist a STIX ID: ${path} is not a file.`);
    }
    await this.app.fileManager.processFrontMatter(file, (frontmatter: unknown) => {
      if (!isRecord(frontmatter)) {
        throw new TypeError(
          `Cannot persist a STIX ID: ${path} frontmatter is not a dictionary.`,
        );
      }
      const current = frontmatter.stix_id;
      const missing =
        current === undefined ||
        current === null ||
        (typeof current === "string" && current.trim() === "");
      if (!missing && current !== id) {
        throw new Error(`Cannot replace existing stix_id in ${path}.`);
      }
      frontmatter.stix_id = id;
    });
  }

  async loadRelationshipIdentities(): Promise<
    Readonly<Record<string, PersistedRelationshipIdentity>>
  > {
    return { ...this.identityStore.load() };
  }

  async saveRelationshipIdentities(
    identities: Readonly<Record<string, PersistedRelationshipIdentity>>,
  ): Promise<void> {
    await this.identityStore.save(identities);
  }

  async ensureFolder(path: string): Promise<void> {
    const normalizedPath = normalizePath(path);
    const segments = normalizedPath.split("/");
    let current = "";
    for (const segment of segments) {
      current = current === "" ? segment : `${current}/${segment}`;
      const existing = this.app.vault.getAbstractFileByPath(current);
      if (existing instanceof TFolder) {
        continue;
      }
      if (existing instanceof TFile) {
        throw new Error(`${current} is a file, not an export folder.`);
      }
      await this.app.vault.createFolder(current);
    }
  }

  exists(path: string): boolean {
    return this.app.vault.getAbstractFileByPath(normalizePath(path)) !== null;
  }

  async createFile(path: string, content: string): Promise<void> {
    await this.app.vault.create(normalizePath(path), content);
  }
}
