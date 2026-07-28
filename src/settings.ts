export type ValidationMode = "strict" | "lenient";

export interface WorkbenchSettings {
  exportFolder: string;
  importFolder: string;
  linkTraversalDepth: number;
  includeContextualLinks: boolean;
  readTypedCanvasEdges: boolean;
  validationMode: ValidationMode;
  prettyPrint: boolean;
  extensionRegistryPath: string;
  scopeExcludedFolders: string;
}

export const DEFAULT_SETTINGS: Readonly<WorkbenchSettings> = Object.freeze({
  exportFolder: "Exports",
  importFolder: "STIX Imports",
  linkTraversalDepth: 1,
  includeContextualLinks: true,
  readTypedCanvasEdges: true,
  validationMode: "strict",
  prettyPrint: true,
  extensionRegistryPath: "STIX Extensions/registry.json",
  scopeExcludedFolders: "Templates",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseVaultRelativePath(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().replaceAll("\\", "/").replace(/\/+/gu, "/");
  const segments = normalized.split("/");
  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    /^[A-Za-z]:/u.test(normalized) ||
    segments.some((segment) => segment === ".." || segment.length === 0)
  ) {
    return fallback;
  }

  return normalized;
}

function parseExcludedFolders(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_SETTINGS.scopeExcludedFolders;
  const folders = value
    .split(",")
    .map((folder) => parseVaultRelativePath(folder, ""))
    .filter((folder) => folder !== "");
  return folders.length === value.split(",").length
    ? [...new Set(folders)].join(", ")
    : DEFAULT_SETTINGS.scopeExcludedFolders;
}

function parseDepth(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return DEFAULT_SETTINGS.linkTraversalDepth;
  }

  return Math.min(5, Math.max(0, value));
}

export function parseWorkbenchSettings(value: unknown): WorkbenchSettings {
  if (!isRecord(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    exportFolder: parseVaultRelativePath(
      value.exportFolder,
      DEFAULT_SETTINGS.exportFolder,
    ),
    importFolder: parseVaultRelativePath(
      value.importFolder,
      DEFAULT_SETTINGS.importFolder,
    ),
    linkTraversalDepth: parseDepth(value.linkTraversalDepth),
    includeContextualLinks: parseBoolean(
      value.includeContextualLinks,
      DEFAULT_SETTINGS.includeContextualLinks,
    ),
    readTypedCanvasEdges: parseBoolean(
      value.readTypedCanvasEdges,
      DEFAULT_SETTINGS.readTypedCanvasEdges,
    ),
    validationMode: value.validationMode === "lenient" ? "lenient" : "strict",
    prettyPrint: parseBoolean(value.prettyPrint, DEFAULT_SETTINGS.prettyPrint),
    extensionRegistryPath: parseVaultRelativePath(
      value.extensionRegistryPath,
      DEFAULT_SETTINGS.extensionRegistryPath,
    ),
    scopeExcludedFolders: parseExcludedFolders(value.scopeExcludedFolders),
  };
}
