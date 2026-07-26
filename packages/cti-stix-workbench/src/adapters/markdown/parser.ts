import { stixCatalog } from "../../catalog/stix-2.1";
import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
} from "../../core/diagnostics";
import type { Diagnostic } from "../../core/diagnostics";
import type {
  NormalizedStixDraft,
  ResolvedLink,
} from "../../core/types";
import {
  closesMarkdownFence,
  readMarkdownFence,
} from "./fences";
import type { MarkdownFence } from "./fences";
import { parseExplicitRelationships } from "./relationships";

export interface MarkdownParseResult {
  readonly draft?: NormalizedStixDraft;
  readonly quarantinedKeys: readonly string[];
  readonly diagnostics: readonly Diagnostic[];
}

interface MappedSection {
  readonly field: "content" | "description" | "explanation";
  readonly content: string;
  readonly headingLine: number;
}

const sectionFields = new Map<string, MappedSection["field"]>([
  ["Summary", "description"],
  ["Content", "content"],
  ["Explanation", "explanation"],
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeLinks(value: unknown): readonly ResolvedLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const links: ResolvedLink[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.raw !== "string") {
      continue;
    }

    const targetPath =
      typeof candidate.targetPath === "string"
        ? candidate.targetPath
        : undefined;
    const rawLocation = candidate.location;
    const location =
      isRecord(rawLocation) &&
      typeof rawLocation.line === "number" &&
      Number.isInteger(rawLocation.line) &&
      typeof rawLocation.column === "number" &&
      Number.isInteger(rawLocation.column)
        ? {
          line: rawLocation.line,
          column: rawLocation.column,
        }
        : undefined;

    links.push(
      Object.freeze({
        raw: candidate.raw,
        ...(targetPath === undefined ? {} : { targetPath }),
        ...(location === undefined ? {} : { location }),
      }),
    );
  }
  return Object.freeze(links);
}

function mappedSections(markdown: string): readonly MappedSection[] {
  const lines = markdown.split(/\r?\n/u);
  const sections: MappedSection[] = [];
  let openFence: MarkdownFence | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const fence = readMarkdownFence(line);
    if (openFence !== undefined) {
      if (fence !== undefined && closesMarkdownFence(fence, openFence)) {
        openFence = undefined;
      }
      continue;
    }
    if (fence !== undefined) {
      openFence = fence;
      continue;
    }

    const heading = /^##\s+(.+?)\s*$/u.exec(line)?.[1];
    const field = heading === undefined ? undefined : sectionFields.get(heading);
    if (field === undefined) {
      continue;
    }

    let end = index + 1;
    let nestedFence: MarkdownFence | undefined;
    while (end < lines.length) {
      const candidate = lines[end] ?? "";
      const candidateFence = readMarkdownFence(candidate);
      if (nestedFence !== undefined) {
        if (
          candidateFence !== undefined &&
          closesMarkdownFence(candidateFence, nestedFence)
        ) {
          nestedFence = undefined;
        }
      } else if (candidateFence !== undefined) {
        nestedFence = candidateFence;
      } else if (
        /^##(?:\s|$)/u.test(candidate)
      ) {
        break;
      }
      end += 1;
    }

    sections.push({
      field,
      content: lines.slice(index + 1, end).join("\n").trim(),
      headingLine: index + 1,
    });
    index = end - 1;
  }

  return sections;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function inputDiagnostic(message: string, notePath?: string): Diagnostic {
  return createDiagnostic({
    authority: "input",
    code: DIAGNOSTIC_CODES.noteInputInvalid,
    severity: "error",
    message,
    ...(notePath === undefined ? {} : { notePath }),
  });
}

export function parseMarkdownNote(
  input: unknown,
): MarkdownParseResult {
  if (!isRecord(input)) {
    return {
      quarantinedKeys: [],
      diagnostics: [
        inputDiagnostic("A note input must be an object."),
      ],
    };
  }

  const path = stringValue(input.path);
  const basename = stringValue(input.basename);
  const markdown =
    typeof input.markdown === "string" ? input.markdown : undefined;
  const frontmatter = isRecord(input.frontmatter) ? input.frontmatter : {};
  if (path === undefined || basename === undefined || markdown === undefined) {
    return {
      quarantinedKeys: [],
      diagnostics: [
        inputDiagnostic(
          "A note requires string path, basename, and Markdown values.",
          path,
        ),
      ],
    };
  }

  const diagnostics: Diagnostic[] = [];
  const quarantinedKeys = new Set<string>();
  const properties: Record<string, unknown> = {};
  const frontmatterType = stringValue(frontmatter.stix_type);
  const directType = stringValue(frontmatter.type);
  const stixType = frontmatterType ?? directType;
  const frontmatterId = stringValue(frontmatter.stix_id);
  const directId = stringValue(frontmatter.id);
  const stixId = frontmatterId ?? directId;

  if (
    frontmatterType !== undefined &&
    directType !== undefined &&
    frontmatterType !== directType
  ) {
    diagnostics.push(
      createDiagnostic({
        authority: "input",
        code: DIAGNOSTIC_CODES.fieldDuplicate,
        severity: "error",
        message: "stix_type and type disagree.",
        notePath: path,
        field: "type",
      }),
    );
  }
  if (
    frontmatterId !== undefined &&
    directId !== undefined &&
    frontmatterId !== directId
  ) {
    diagnostics.push(
      createDiagnostic({
        authority: "input",
        code: DIAGNOSTIC_CODES.fieldDuplicate,
        severity: "error",
        message: "stix_id and id disagree.",
        notePath: path,
        field: "id",
      }),
    );
  }

  const definition =
    stixType === undefined ? undefined : stixCatalog.getObjectType(stixType);
  if (stixType === undefined) {
    diagnostics.push(
      createDiagnostic({
        authority: "input",
        code: DIAGNOSTIC_CODES.stixTypeMissing,
        severity: "error",
        message: "The note does not declare stix_type.",
        notePath: path,
        field: "stix_type",
      }),
    );
  } else if (definition === undefined) {
    diagnostics.push(
      createDiagnostic({
        authority: "input",
        code: DIAGNOSTIC_CODES.stixTypeUnsupported,
        severity: "error",
        message: `${stixType} is not a supported STIX 2.1 type.`,
        notePath: path,
        field: "stix_type",
      }),
    );
  }
  const allowedFields = new Set(
    definition?.fields.map((field) => field.name) ?? [],
  );
  if (stixType !== undefined) {
    properties.type = stixType;
  }
  if (stixId !== undefined) {
    properties.id = stixId;
  }

  for (const [key, value] of Object.entries(frontmatter)) {
    if (key.startsWith("cti_")) {
      quarantinedKeys.add(key);
      continue;
    }
    if (key === "stix_type" || key === "stix_id" || key === "type" || key === "id") {
      continue;
    }
    if (!allowedFields.has(key) && !key.startsWith("x_")) {
      diagnostics.push(
        createDiagnostic({
          authority: "input",
          code: DIAGNOSTIC_CODES.fieldUnsupported,
          severity: "warning",
          message: `${key} is not a STIX property for ${stixType ?? "this note"}.`,
          notePath: path,
          field: key,
        }),
      );
      continue;
    }
    properties[key] = value;
  }

  const seenSections = new Set<MappedSection["field"]>();
  for (const section of mappedSections(markdown)) {
    const applies =
      allowedFields.has(section.field) &&
      (section.field === "description" ||
      (section.field === "content" && stixType === "note") ||
      (section.field === "explanation" && stixType === "opinion"));
    if (!applies || section.content === "") {
      continue;
    }
    if (seenSections.has(section.field) || Object.hasOwn(properties, section.field)) {
      diagnostics.push(
        createDiagnostic({
          authority: "input",
          code: DIAGNOSTIC_CODES.fieldDuplicate,
          severity: "error",
          message: `${section.field} is declared more than once.`,
          notePath: path,
          field: section.field,
          location: {
            line: section.headingLine,
            column: 1,
          },
        }),
      );
      continue;
    }
    seenSections.add(section.field);
    properties[section.field] = section.content;
  }

  const links = normalizeLinks(input.links);
  const relationshipResult = parseExplicitRelationships(markdown, path, links);
  diagnostics.push(...relationshipResult.diagnostics);

  return {
    draft: Object.freeze({
      path,
      basename,
      ...(stixType === undefined ? {} : { stixType }),
      ...(stixId === undefined ? {} : { stixId }),
      properties: Object.freeze(properties),
      links,
      relationships: relationshipResult.relationships,
    }),
    quarantinedKeys: Object.freeze([...quarantinedKeys].sort()),
    diagnostics: Object.freeze(diagnostics),
  };
}
