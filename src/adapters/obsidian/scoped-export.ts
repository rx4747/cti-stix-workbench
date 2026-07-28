import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  type Diagnostic,
} from "../../core/diagnostics";
import { mapGraphToBundle } from "../../core/graph-mapper";
import { validateStixIdentifier } from "../../core/identifiers";
import type {
  GeneratedIdentity,
  NormalizedStixDraft,
  PersistedRelationshipIdentity,
  RelationshipDeclaration,
  StixBundle,
} from "../../core/types";
import { stixDraftPathsById } from "../../core/versioning";
import type { WorkbenchSettings } from "../../settings";
import { parseCanvas } from "../canvas/parser";
import { parseMarkdownNote } from "../markdown/parser";
import {
  type ActiveGraphDependencies,
  type ActiveGraphHost,
  nextAvailableExportPath,
} from "./active-graph";

export interface ScopedGraphHost extends ActiveGraphHost {
  readTextFile(path: string): Promise<string | undefined>;
  listMarkdownPaths(folderPath?: string): readonly string[];
}

export interface ScopeExecution {
  readonly signal?: AbortSignal;
  readonly onProgress?: (completed: number, total: number, path: string) => void;
}

export class ScopeCancelledError extends Error {
  constructor() {
    super("STIX scope processing was cancelled before any Bundle was written.");
    this.name = "ScopeCancelledError";
  }
}

function throwIfCancelled(signal: AbortSignal | undefined): void {
  if (signal?.aborted === true) throw new ScopeCancelledError();
}

export type ScopedValidationResult =
  | {
      readonly ok: true;
      readonly bundle: StixBundle;
      readonly objectCount: number;
      readonly skippedCount: number;
      readonly warnings: readonly Diagnostic[];
      readonly identities: readonly GeneratedIdentity[];
      readonly notePathById: ReadonlyMap<string, string>;
    }
  | {
      readonly ok: false;
      readonly errors: readonly Diagnostic[];
      readonly warnings: readonly Diagnostic[];
      readonly skippedCount: number;
    };

export type ScopedExportResult =
  | {
      readonly ok: true;
      readonly bundle: StixBundle;
      readonly outputPath: string;
      readonly skippedCount: number;
      readonly warnings: readonly Diagnostic[];
    }
  | Extract<ScopedValidationResult, { readonly ok: false }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function declaresStix(frontmatter: unknown): boolean {
  return (
    isRecord(frontmatter) &&
    (typeof frontmatter.stix_type === "string" || typeof frontmatter.type === "string")
  );
}

function splitDiagnostics(diagnostics: readonly Diagnostic[]): {
  readonly errors: readonly Diagnostic[];
  readonly warnings: readonly Diagnostic[];
} {
  return {
    errors: diagnostics.filter((item) => item.severity === "error"),
    warnings: diagnostics.filter((item) => item.severity === "warning"),
  };
}

async function externalIdsForLinks(
  host: ScopedGraphHost,
  drafts: readonly NormalizedStixDraft[],
): Promise<ReadonlyMap<string, string>> {
  const includedPaths = new Set(drafts.map((draft) => draft.path));
  const targetPaths = new Set(
    drafts.flatMap((draft) =>
      draft.links.flatMap((link) =>
        link.targetPath === undefined || includedPaths.has(link.targetPath)
          ? []
          : [link.targetPath],
      ),
    ),
  );
  const externalIds = new Map<string, string>();
  for (const path of targetPaths) {
    const input = await host.readNote(path);
    if (input === undefined || !declaresStix(input.frontmatter)) continue;
    const draft = parseMarkdownNote(input).draft;
    if (draft?.stixType === undefined || draft.stixId === undefined) continue;
    const identifier = validateStixIdentifier(draft.stixType, draft.stixId);
    if (identifier.ok) externalIds.set(path, identifier.id);
  }
  return externalIds;
}

export async function validateScopedGraph(
  host: ScopedGraphHost,
  notePaths: readonly string[],
  relationships: readonly RelationshipDeclaration[],
  settings: WorkbenchSettings,
  dependencies: ActiveGraphDependencies,
  initialDiagnostics: readonly Diagnostic[] = [],
  execution: ScopeExecution = {},
): Promise<ScopedValidationResult> {
  const diagnostics = [...initialDiagnostics];
  const drafts: NormalizedStixDraft[] = [];
  let skippedCount = 0;
  const uniquePaths = [...new Set(notePaths)];
  for (const [index, path] of uniquePaths.entries()) {
    throwIfCancelled(execution.signal);
    const input = await host.readNote(path);
    throwIfCancelled(execution.signal);
    if (input === undefined || !declaresStix(input.frontmatter)) {
      skippedCount += 1;
      execution.onProgress?.(index + 1, uniquePaths.length, path);
      continue;
    }
    const parsed = parseMarkdownNote(input);
    diagnostics.push(...parsed.diagnostics);
    if (parsed.draft !== undefined) drafts.push(parsed.draft);
    execution.onProgress?.(index + 1, uniquePaths.length, path);
  }
  throwIfCancelled(execution.signal);
  const parsed = splitDiagnostics(diagnostics);
  if (parsed.errors.length > 0) {
    return { ok: false, ...parsed, skippedCount };
  }
  const mapped = await mapGraphToBundle(
    {
      drafts,
      externalIdsByPath: await externalIdsForLinks(host, drafts),
      relationships,
      relationshipIdentities: await host.loadRelationshipIdentities(),
    },
    dependencies,
  );
  throwIfCancelled(execution.signal);
  if (!mapped.ok) {
    return {
      ok: false,
      errors: mapped.errors,
      warnings: [...parsed.warnings, ...mapped.warnings],
      skippedCount,
    };
  }
  if (mapped.bundle.objects.length === 0) {
    return {
      ok: false,
      errors: [
        createDiagnostic({
          authority: "input",
          code: DIAGNOSTIC_CODES.exportBlocked,
          severity: "error",
          message: "No typed STIX objects were found in this scope.",
        }),
      ],
      warnings: [...parsed.warnings, ...mapped.warnings],
      skippedCount,
    };
  }
  const notePathById = stixDraftPathsById(drafts, mapped.identities);
  const validated = splitDiagnostics([
    ...parsed.warnings,
    ...mapped.warnings,
    ...dependencies.validateBundle(
      mapped.bundle,
      notePathById,
      settings.validationMode,
    ),
  ]);
  throwIfCancelled(execution.signal);
  if (validated.errors.length > 0) {
    return { ok: false, ...validated, skippedCount };
  }
  return {
    ok: true,
    bundle: mapped.bundle,
    objectCount: mapped.bundle.objects.length,
    skippedCount,
    warnings: validated.warnings,
    identities: mapped.identities,
    notePathById,
  };
}

async function persistIdentities(
  host: ScopedGraphHost,
  identities: readonly GeneratedIdentity[],
): Promise<void> {
  const relationships: Record<string, PersistedRelationshipIdentity> = {
    ...(await host.loadRelationshipIdentities()),
  };
  let changed = false;
  for (const identity of identities) {
    if (identity.kind === "note") {
      await host.persistStixId(identity.notePath, identity.id);
    } else {
      relationships[identity.key] = { id: identity.id, created: identity.created };
      changed = true;
    }
  }
  if (changed) await host.saveRelationshipIdentities(relationships);
}

export async function exportScopedGraph(
  host: ScopedGraphHost,
  notePaths: readonly string[],
  relationships: readonly RelationshipDeclaration[],
  settings: WorkbenchSettings,
  dependencies: ActiveGraphDependencies,
  initialDiagnostics: readonly Diagnostic[] = [],
  execution: ScopeExecution = {},
): Promise<ScopedExportResult> {
  const validated = await validateScopedGraph(
    host,
    notePaths,
    relationships,
    settings,
    dependencies,
    initialDiagnostics,
    execution,
  );
  if (!validated.ok) return validated;
  throwIfCancelled(execution.signal);
  await persistIdentities(host, validated.identities);
  await host.ensureFolder(settings.exportFolder);
  const outputPath = nextAvailableExportPath(
    settings.exportFolder,
    (dependencies.now ?? (() => new Date()))(),
    (path) => host.exists(path),
  );
  await host.createFile(
    outputPath,
    `${JSON.stringify(validated.bundle, null, settings.prettyPrint ? 2 : undefined)}\n`,
  );
  return {
    ok: true,
    bundle: validated.bundle,
    outputPath,
    skippedCount: validated.skippedCount,
    warnings: validated.warnings,
  };
}

export async function validateCanvasGraph(
  host: ScopedGraphHost,
  canvasPath: string,
  settings: WorkbenchSettings,
  dependencies: ActiveGraphDependencies,
): Promise<ScopedValidationResult> {
  const source = await host.readTextFile(canvasPath);
  const parsed = parseCanvas(source ?? "", canvasPath, settings.readTypedCanvasEdges);
  return validateScopedGraph(
    host,
    parsed.notePaths,
    parsed.relationships,
    settings,
    dependencies,
    parsed.diagnostics,
  );
}

export async function exportCanvasGraph(
  host: ScopedGraphHost,
  canvasPath: string,
  settings: WorkbenchSettings,
  dependencies: ActiveGraphDependencies,
): Promise<ScopedExportResult> {
  const source = await host.readTextFile(canvasPath);
  const parsed = parseCanvas(source ?? "", canvasPath, settings.readTypedCanvasEdges);
  return exportScopedGraph(
    host,
    parsed.notePaths,
    parsed.relationships,
    settings,
    dependencies,
    parsed.diagnostics,
  );
}
