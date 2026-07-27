import type { Diagnostic } from "./diagnostics";

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];

export interface JsonObject {
  readonly [property: string]: JsonValue;
}

export interface StixObject extends JsonObject {
  readonly type: string;
  readonly id: string;
}

export interface StixBundle extends JsonObject {
  readonly type: "bundle";
  readonly id: `bundle--${string}`;
  readonly objects: readonly StixObject[];
}

export interface UntrustedNoteInput {
  readonly path: unknown;
  readonly basename: unknown;
  readonly frontmatter: unknown;
  readonly markdown: unknown;
  readonly links: unknown;
}

export interface ResolvedLink {
  readonly raw: string;
  readonly targetPath?: string;
  readonly location?: {
    readonly line: number;
    readonly column: number;
  };
}

export interface NoteRecord {
  readonly path: string;
  readonly basename: string;
  readonly frontmatter: Readonly<Record<string, unknown>>;
  readonly markdown: string;
  readonly links: readonly ResolvedLink[];
}

export interface NormalizedStixDraft {
  readonly path: string;
  readonly basename: string;
  readonly stixType?: string;
  readonly stixId?: string;
  readonly properties: Readonly<Record<string, unknown>>;
  readonly links: readonly ResolvedLink[];
  readonly relationships: readonly RelationshipDeclaration[];
}

export interface RelationshipDeclaration {
  readonly sourceNotePath: string;
  readonly relationshipType: string;
  readonly targetLink: string;
  readonly location?: {
    readonly line: number;
    readonly column: number;
  };
}

export interface GeneratedNoteIdentity {
  readonly kind: "note";
  readonly notePath: string;
  readonly id: string;
}

export interface PersistedRelationshipIdentity {
  readonly id: string;
  readonly created: string;
}

export interface GeneratedRelationshipIdentity extends PersistedRelationshipIdentity {
  readonly kind: "relationship";
  readonly key: string;
}

export type GeneratedIdentity = GeneratedNoteIdentity | GeneratedRelationshipIdentity;

export type GraphBundleResult =
  | {
      readonly ok: true;
      readonly bundle: StixBundle;
      readonly identities: readonly GeneratedIdentity[];
      readonly warnings: readonly Diagnostic[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly Diagnostic[];
      readonly warnings: readonly Diagnostic[];
    };

export type ExportScope =
  | {
      readonly kind: "active-graph";
      readonly rootNotePath: string;
      readonly outgoingDepth: number;
    }
  | {
      readonly kind: "canvas";
      readonly canvasPath: string;
    }
  | {
      readonly kind: "folder";
      readonly folderPath: string;
    }
  | {
      readonly kind: "vault";
    };

export interface ExportInput {
  readonly scope: ExportScope;
  readonly notes: readonly NoteRecord[];
  readonly relationships: readonly RelationshipDeclaration[];
}

export type ExportResult =
  | {
      readonly ok: true;
      readonly bundle: StixBundle;
      readonly warnings: readonly Diagnostic[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly Diagnostic[];
      readonly warnings: readonly Diagnostic[];
    };

export function createExportResult(
  bundle: StixBundle,
  diagnostics: readonly Diagnostic[],
): ExportResult {
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  const warnings = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning",
  );

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }

  return { ok: true, bundle, warnings };
}
