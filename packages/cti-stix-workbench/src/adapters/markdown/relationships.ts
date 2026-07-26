import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
} from "../../core/diagnostics";
import type { Diagnostic } from "../../core/diagnostics";
import type {
  RelationshipDeclaration,
  ResolvedLink,
} from "../../core/types";
import {
  closesMarkdownFence,
  readMarkdownFence,
} from "./fences";
import type { MarkdownFence } from "./fences";

export interface RelationshipParseResult {
  readonly relationships: readonly RelationshipDeclaration[];
  readonly diagnostics: readonly Diagnostic[];
}

const explicitRelationshipPattern =
  /^\s*[-*+]\s+stix:([a-z][a-z0-9-]*)\s+\[\[([^\]]+)\]\]\s*$/u;
const typedListItemPrefix = /^\s*[-*+]\s+stix:/u;

function updateFence(
  line: string,
  current: MarkdownFence | undefined,
): MarkdownFence | undefined {
  const candidate = readMarkdownFence(line);
  if (candidate === undefined) {
    return current;
  }

  if (current === undefined) {
    return candidate;
  }

  if (closesMarkdownFence(candidate, current)) {
    return undefined;
  }

  return current;
}

export function normalizeWikiLinkTarget(raw: string): string | undefined {
  const withoutAlias = raw.split("|", 1)[0]?.trim();
  const withoutHeading = withoutAlias?.split("#", 1)[0]?.trim();
  return withoutHeading === "" ? undefined : withoutHeading;
}

function linkIsResolved(
  target: string,
  links: readonly ResolvedLink[],
): boolean {
  return links.some(
    (link) =>
      link.targetPath !== undefined &&
      normalizeWikiLinkTarget(link.raw) === target,
  );
}

export function parseExplicitRelationships(
  markdown: string,
  sourceNotePath: string,
  links: readonly ResolvedLink[],
): RelationshipParseResult {
  const relationships: RelationshipDeclaration[] = [];
  const diagnostics: Diagnostic[] = [];
  const lines = markdown.split(/\r?\n/u);
  let fence: MarkdownFence | undefined;

  for (const [index, line] of lines.entries()) {
    const nextFence = updateFence(line, fence);
    if (nextFence !== fence) {
      fence = nextFence;
      continue;
    }
    if (fence !== undefined) {
      continue;
    }

    const match = explicitRelationshipPattern.exec(line);
    if (match === null) {
      if (typedListItemPrefix.test(line)) {
        diagnostics.push(
          createDiagnostic({
            authority: "input",
            code: DIAGNOSTIC_CODES.relationshipInvalid,
            severity: "error",
            message:
              "Use one relationship type and one wiki link: - stix:<type> [[Target]].",
            notePath: sourceNotePath,
            field: "relationship",
            location: {
              line: index + 1,
              column: line.search(/\S/u) + 1,
            },
          }),
        );
      }
      continue;
    }

    const relationshipType = match[1];
    const rawTarget = match[2];
    const targetLink =
      rawTarget === undefined ? undefined : normalizeWikiLinkTarget(rawTarget);
    if (relationshipType === undefined || targetLink === undefined) {
      diagnostics.push(
        createDiagnostic({
          authority: "input",
          code: DIAGNOSTIC_CODES.relationshipInvalid,
          severity: "error",
          message: "The typed relationship has an empty type or target.",
          notePath: sourceNotePath,
          field: "relationship",
          location: {
            line: index + 1,
            column: line.search(/\S/u) + 1,
          },
        }),
      );
      continue;
    }

    const declaration: RelationshipDeclaration = {
      sourceNotePath,
      relationshipType,
      targetLink,
      location: {
        line: index + 1,
        column: line.search(/\S/u) + 1,
      },
    };
    relationships.push(declaration);

    if (!linkIsResolved(targetLink, links)) {
      diagnostics.push(
        createDiagnostic({
          authority: "input",
          code: DIAGNOSTIC_CODES.referenceUnresolved,
          severity: "error",
          message: `Relationship target [[${targetLink}]] is unresolved.`,
          notePath: sourceNotePath,
          objectPath: "target_ref",
          field: "target_ref",
          location: declaration.location,
        }),
      );
    }
  }

  return {
    relationships: Object.freeze(relationships),
    diagnostics: Object.freeze(diagnostics),
  };
}
