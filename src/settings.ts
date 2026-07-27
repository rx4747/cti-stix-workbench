export type ValidationMode = "strict" | "lenient";

export interface WorkbenchSettings {
  exportFolder: string;
  linkTraversalDepth: number;
  includeContextualLinks: boolean;
  readTypedCanvasEdges: boolean;
  validationMode: ValidationMode;
  prettyPrint: boolean;
  extensionRegistryPath: string;
}

export const DEFAULT_SETTINGS: Readonly<WorkbenchSettings> = Object.freeze({
  exportFolder: "Exports",
  linkTraversalDepth: 1,
  includeContextualLinks: true,
  readTypedCanvasEdges: true,
  validationMode: "strict",
  prettyPrint: true,
  extensionRegistryPath: "STIX Extensions/registry.json",
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
  };
}
