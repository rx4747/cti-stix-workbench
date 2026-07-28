import type { Diagnostic } from "../../core/diagnostics";
import {
  type GraphMapperDependencies,
  mapGraphToBundle,
} from "../../core/graph-mapper";
import type {
  GeneratedIdentity,
  NormalizedStixDraft,
  PersistedRelationshipIdentity,
  StixBundle,
  UntrustedNoteInput,
} from "../../core/types";
import type { WorkbenchSettings } from "../../settings";
import { parseMarkdownNote } from "../markdown/parser";

export interface ActiveGraphHost {
  readNote(path: string): Promise<UntrustedNoteInput | undefined>;
  persistStixId(path: string, id: string): Promise<void>;
  loadRelationshipIdentities(): Promise<
    Readonly<Record<string, PersistedRelationshipIdentity>>
  >;
  saveRelationshipIdentities(
    identities: Readonly<Record<string, PersistedRelationshipIdentity>>,
  ): Promise<void>;
  ensureFolder(path: string): Promise<void>;
  exists(path: string): boolean;
  createFile(path: string, content: string): Promise<void>;
}

export type ActiveGraphValidationResult =
  | {
      readonly ok: true;
      readonly bundle: StixBundle;
      readonly objectCount: number;
      readonly warnings: readonly Diagnostic[];
      readonly identities: readonly GeneratedIdentity[];
      readonly notePathById: ReadonlyMap<string, string>;
    }
  | {
      readonly ok: false;
      readonly errors: readonly Diagnostic[];
      readonly warnings: readonly Diagnostic[];
    };

export type ActiveGraphExportResult =
  | {
      readonly ok: true;
      readonly bundle: StixBundle;
      readonly outputPath: string;
      readonly warnings: readonly Diagnostic[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly Diagnostic[];
      readonly warnings: readonly Diagnostic[];
    };

interface CollectedGraph {
  readonly drafts: readonly NormalizedStixDraft[];
  readonly diagnostics: readonly Diagnostic[];
}

export interface ActiveGraphDependencies extends GraphMapperDependencies {
  readonly validateBundle: (
    bundle: StixBundle,
    notePathById: ReadonlyMap<string, string>,
    mode: WorkbenchSettings["validationMode"],
  ) => readonly Diagnostic[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function noteDeclaresStix(input: UntrustedNoteInput): boolean {
  if (!isRecord(input.frontmatter)) {
    return false;
  }
  return (
    typeof input.frontmatter.stix_type === "string" ||
    typeof input.frontmatter.type === "string"
  );
}

function targetPaths(
  draft: NormalizedStixDraft,
  includeContextualLinks: boolean,
): readonly string[] {
  if (includeContextualLinks) {
    return draft.links.flatMap((link) =>
      link.targetPath === undefined ? [] : [link.targetPath],
    );
  }
  const relationshipTargets = new Set(
    draft.relationships.map((relationship) => relationship.targetLink),
  );
  return draft.links.flatMap((link) =>
    link.targetPath !== undefined && relationshipTargets.has(link.raw)
      ? [link.targetPath]
      : [],
  );
}

async function collectGraph(
  host: ActiveGraphHost,
  rootPath: string,
  settings: WorkbenchSettings,
): Promise<CollectedGraph> {
  const drafts: NormalizedStixDraft[] = [];
  const diagnostics: Diagnostic[] = [];
  const visited = new Set<string>();
  const queue: Array<{ path: string; depth: number; root: boolean }> = [
    { path: rootPath, depth: 0, root: true },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || visited.has(current.path)) {
      continue;
    }
    visited.add(current.path);
    const input = await host.readNote(current.path);
    if (input === undefined || (!current.root && !noteDeclaresStix(input))) {
      continue;
    }
    const parsed = parseMarkdownNote(input);
    diagnostics.push(...parsed.diagnostics);
    if (parsed.draft === undefined) {
      continue;
    }
    drafts.push(parsed.draft);

    if (current.depth >= settings.linkTraversalDepth) {
      continue;
    }
    for (const path of targetPaths(parsed.draft, settings.includeContextualLinks)) {
      if (!visited.has(path)) {
        queue.push({ path, depth: current.depth + 1, root: false });
      }
    }
  }

  return {
    drafts: Object.freeze(drafts),
    diagnostics: Object.freeze(diagnostics),
  };
}

function splitDiagnostics(diagnostics: readonly Diagnostic[]): {
  readonly errors: readonly Diagnostic[];
  readonly warnings: readonly Diagnostic[];
} {
  return {
    errors: diagnostics.filter((diagnostic) => diagnostic.severity === "error"),
    warnings: diagnostics.filter((diagnostic) => diagnostic.severity === "warning"),
  };
}

function notePathsById(
  drafts: readonly NormalizedStixDraft[],
  identities: readonly GeneratedIdentity[],
): ReadonlyMap<string, string> {
  const paths = new Map<string, string>();
  for (const draft of drafts) {
    const id =
      draft.stixId ??
      (typeof draft.properties.id === "string" ? draft.properties.id : undefined);
    if (id !== undefined) {
      paths.set(id, draft.path);
    }
  }
  for (const identity of identities) {
    if (identity.kind === "note") {
      paths.set(identity.id, identity.notePath);
    }
  }
  return paths;
}

export async function validateActiveGraph(
  host: ActiveGraphHost,
  rootPath: string,
  settings: WorkbenchSettings,
  dependencies: ActiveGraphDependencies,
): Promise<ActiveGraphValidationResult> {
  const collected = await collectGraph(host, rootPath, settings);
  const parsedDiagnostics = splitDiagnostics(collected.diagnostics);
  if (parsedDiagnostics.errors.length > 0) {
    return {
      ok: false,
      errors: parsedDiagnostics.errors,
      warnings: parsedDiagnostics.warnings,
    };
  }

  const relationshipIdentities = await host.loadRelationshipIdentities();
  const mapped = await mapGraphToBundle(
    {
      drafts: collected.drafts,
      relationshipIdentities,
    },
    dependencies,
  );
  if (!mapped.ok) {
    return {
      ok: false,
      errors: mapped.errors,
      warnings: [...parsedDiagnostics.warnings, ...mapped.warnings],
    };
  }

  const notePathById = notePathsById(collected.drafts, mapped.identities);
  const schemaDiagnostics = dependencies.validateBundle(
    mapped.bundle,
    notePathById,
    settings.validationMode,
  );
  const combined = splitDiagnostics([
    ...parsedDiagnostics.warnings,
    ...mapped.warnings,
    ...schemaDiagnostics,
  ]);
  if (combined.errors.length > 0) {
    return {
      ok: false,
      errors: combined.errors,
      warnings: combined.warnings,
    };
  }

  return {
    ok: true,
    bundle: mapped.bundle,
    objectCount: mapped.bundle.objects.length,
    warnings: combined.warnings,
    identities: mapped.identities,
    notePathById,
  };
}

function exportTimestamp(date: Date): string {
  return date.toISOString().replaceAll(/[-:.]/gu, "");
}

export function nextAvailableExportPath(
  folder: string,
  date: Date,
  exists: (path: string) => boolean,
): string {
  const base = `${folder}/stix-bundle-${exportTimestamp(date)}`;
  let candidate = `${base}.json`;
  let suffix = 2;
  while (exists(candidate)) {
    candidate = `${base}-${suffix}.json`;
    suffix += 1;
  }
  return candidate;
}

export async function exportActiveGraph(
  host: ActiveGraphHost,
  rootPath: string,
  settings: WorkbenchSettings,
  dependencies: ActiveGraphDependencies,
): Promise<ActiveGraphExportResult> {
  const validated = await validateActiveGraph(host, rootPath, settings, dependencies);
  if (!validated.ok) {
    return validated;
  }

  const relationshipIdentities = {
    ...(await host.loadRelationshipIdentities()),
  };
  let relationshipStateChanged = false;
  for (const identity of validated.identities) {
    if (identity.kind === "note") {
      await host.persistStixId(identity.notePath, identity.id);
    } else {
      relationshipIdentities[identity.key] = {
        id: identity.id,
        created: identity.created,
      };
      relationshipStateChanged = true;
    }
  }
  if (relationshipStateChanged) {
    await host.saveRelationshipIdentities(relationshipIdentities);
  }

  await host.ensureFolder(settings.exportFolder);
  const outputPath = nextAvailableExportPath(
    settings.exportFolder,
    (dependencies.now ?? (() => new Date()))(),
    (path) => host.exists(path),
  );
  const indentation = settings.prettyPrint ? 2 : undefined;
  await host.createFile(
    outputPath,
    `${JSON.stringify(validated.bundle, null, indentation)}\n`,
  );
  return {
    ok: true,
    bundle: validated.bundle,
    outputPath,
    warnings: validated.warnings,
  };
}
