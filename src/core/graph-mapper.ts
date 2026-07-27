import { stixCatalog } from "../catalog/stix-2.1";
import type { CatalogField, ObjectTypeDefinition } from "../catalog/types";
import { createDiagnostic, DIAGNOSTIC_CODES, type Diagnostic } from "./diagnostics";
import { isCustomObjectType } from "./extension-registry";
import { createIdentifierService, validateStixIdentifier } from "./identifiers";
import { canonicalizeJson, createDeterministicScoId } from "./sco-id";
import type {
  GeneratedIdentity,
  GeneratedRelationshipIdentity,
  GraphBundleResult,
  JsonValue,
  NormalizedStixDraft,
  PersistedRelationshipIdentity,
  RelationshipDeclaration,
  StixBundle,
  StixObject,
} from "./types";

const AUTHORABLE_FAMILIES = new Set(["sdo", "sro", "sco", "smo"]);
const STIX_ID_PATTERN =
  /^[a-z][a-z0-9-]*--[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const WIKI_LINK_PATTERN = /^\[\[([^\]]+)\]\]$/u;

export interface GraphMapperInput {
  readonly drafts: readonly NormalizedStixDraft[];
  readonly bundleId?: string;
  readonly relationshipIdentities?: Readonly<
    Record<string, PersistedRelationshipIdentity>
  >;
  readonly relationships?: readonly RelationshipDeclaration[];
}

export interface GraphMapperDependencies {
  readonly now?: () => Date;
  readonly randomUUID?: () => string;
}

interface AssignedDraft {
  readonly draft: NormalizedStixDraft;
  readonly definition: ObjectTypeDefinition;
  readonly id: string;
}

function customDefinition(type: string): ObjectTypeDefinition {
  return {
    type,
    title: type,
    family: "sdo",
    description: "Locally registered custom STIX object type.",
    fields: [],
    citation: {
      section: "STIX 2.1 §11.2",
      url: "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html",
    },
    schemaSource: "local-extension-registry",
  };
}

interface MappingContext {
  readonly assignedByPath: ReadonlyMap<string, AssignedDraft>;
  readonly includedIds: ReadonlySet<string>;
  readonly diagnostics: Diagnostic[];
}

export function relationshipIdentityKey(
  sourceId: string,
  relationshipType: string,
  targetId: string,
): string {
  return JSON.stringify([sourceId, relationshipType, targetId]);
}

function mappingDiagnostic(
  code:
    | typeof DIAGNOSTIC_CODES.fieldDuplicate
    | typeof DIAGNOSTIC_CODES.fieldTypeInvalid
    | typeof DIAGNOSTIC_CODES.referenceUnresolved
    | typeof DIAGNOSTIC_CODES.stixIdInvalid
    | typeof DIAGNOSTIC_CODES.stixTypeMissing
    | typeof DIAGNOSTIC_CODES.stixTypeUnsupported,
  message: string,
  notePath?: string,
  field?: string,
  objectPath?: string,
): Diagnostic {
  return createDiagnostic({
    authority: "mapping",
    code,
    severity: "error",
    message,
    ...(notePath === undefined ? {} : { notePath }),
    ...(field === undefined ? {} : { field }),
    ...(objectPath === undefined ? {} : { objectPath }),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeWikiTarget(raw: string): string | undefined {
  const withoutAlias = raw.split("|", 1)[0]?.trim();
  const withoutHeading = withoutAlias?.split("#", 1)[0]?.trim();
  return withoutHeading === "" ? undefined : withoutHeading;
}

function jsonValue(
  value: unknown,
  draft: NormalizedStixDraft,
  field: string,
  objectPath: string,
  diagnostics: Diagnostic[],
): JsonValue | undefined {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    const result: JsonValue[] = [];
    for (const [index, item] of value.entries()) {
      const mapped = jsonValue(
        item,
        draft,
        field,
        `${objectPath}[${index}]`,
        diagnostics,
      );
      if (mapped !== undefined) {
        result.push(mapped);
      }
    }
    return result;
  }
  if (isRecord(value)) {
    const result: Record<string, JsonValue> = {};
    for (const [key, nested] of Object.entries(value)) {
      const mapped = jsonValue(
        nested,
        draft,
        field,
        `${objectPath}.${key}`,
        diagnostics,
      );
      if (mapped !== undefined) {
        result[key] = mapped;
      }
    }
    return result;
  }

  diagnostics.push(
    mappingDiagnostic(
      DIAGNOSTIC_CODES.fieldTypeInvalid,
      `${field} contains a value that cannot be serialized as STIX JSON.`,
      draft.path,
      field,
      objectPath,
    ),
  );
  return undefined;
}

function resolveReference(
  value: unknown,
  draft: NormalizedStixDraft,
  field: string,
  objectPath: string,
  context: MappingContext,
): string | undefined {
  if (typeof value !== "string") {
    context.diagnostics.push(
      mappingDiagnostic(
        DIAGNOSTIC_CODES.fieldTypeInvalid,
        `${field} must contain a STIX ID or a wiki link.`,
        draft.path,
        field,
        objectPath,
      ),
    );
    return undefined;
  }

  if (STIX_ID_PATTERN.test(value)) {
    if (context.includedIds.has(value)) {
      return value;
    }
    context.diagnostics.push(
      mappingDiagnostic(
        DIAGNOSTIC_CODES.referenceUnresolved,
        `${field} references STIX ID "${value}", which is not in the export scope.`,
        draft.path,
        field,
        objectPath,
      ),
    );
    return undefined;
  }

  const wikiMatch = WIKI_LINK_PATTERN.exec(value);
  const target =
    wikiMatch?.[1] === undefined ? undefined : normalizeWikiTarget(wikiMatch[1]);
  const resolvedLink =
    target === undefined
      ? undefined
      : draft.links.find(
          (link) =>
            link.targetPath !== undefined && normalizeWikiTarget(link.raw) === target,
        );
  const assigned =
    resolvedLink?.targetPath === undefined
      ? undefined
      : context.assignedByPath.get(resolvedLink.targetPath);
  if (assigned !== undefined) {
    return assigned.id;
  }

  context.diagnostics.push(
    mappingDiagnostic(
      DIAGNOSTIC_CODES.referenceUnresolved,
      `${field} reference "${value}" does not resolve to an included typed note.`,
      draft.path,
      field,
      objectPath,
    ),
  );
  return undefined;
}

function mapNestedValue(
  value: unknown,
  children: readonly CatalogField[],
  draft: NormalizedStixDraft,
  fieldName: string,
  objectPath: string,
  context: MappingContext,
): JsonValue | undefined {
  if (Array.isArray(value)) {
    return value.map(
      (item, index) =>
        mapNestedValue(
          item,
          children,
          draft,
          fieldName,
          `${objectPath}[${index}]`,
          context,
        ) ?? null,
    );
  }
  if (!isRecord(value)) {
    return jsonValue(value, draft, fieldName, objectPath, context.diagnostics);
  }

  const childByName = new Map(children.map((child) => [child.name, child]));
  const result: Record<string, JsonValue> = {};
  for (const [key, nested] of Object.entries(value)) {
    const child = childByName.get(key);
    const mapped =
      child === undefined
        ? jsonValue(
            nested,
            draft,
            fieldName,
            `${objectPath}.${key}`,
            context.diagnostics,
          )
        : mapFieldValue(child, nested, draft, `${objectPath}.${key}`, context);
    if (mapped !== undefined) {
      result[key] = mapped;
    }
  }
  return result;
}

function mapFieldValue(
  field: CatalogField,
  value: unknown,
  draft: NormalizedStixDraft,
  objectPath: string,
  context: MappingContext,
): JsonValue | undefined {
  if (field.reference?.cardinality === "one") {
    return resolveReference(value, draft, field.name, objectPath, context);
  }
  if (field.reference?.cardinality === "many") {
    if (!Array.isArray(value)) {
      context.diagnostics.push(
        mappingDiagnostic(
          DIAGNOSTIC_CODES.fieldTypeInvalid,
          `${field.name} must be a list of STIX IDs or wiki links.`,
          draft.path,
          field.name,
          objectPath,
        ),
      );
      return undefined;
    }
    const references: string[] = [];
    for (const [index, item] of value.entries()) {
      const resolved = resolveReference(
        item,
        draft,
        field.name,
        `${objectPath}[${index}]`,
        context,
      );
      if (resolved !== undefined) {
        references.push(resolved);
      }
    }
    return references;
  }
  if (field.children !== undefined) {
    return mapNestedValue(
      value,
      field.children,
      draft,
      field.name,
      objectPath,
      context,
    );
  }
  return jsonValue(value, draft, field.name, objectPath, context.diagnostics);
}

function identityReferenceValue(
  value: unknown,
  field: CatalogField,
  draft: NormalizedStixDraft,
  assignedByPath: ReadonlyMap<string, AssignedDraft>,
): { readonly ready: boolean; readonly value: unknown } {
  const resolveOne = (
    candidate: unknown,
  ): {
    readonly ready: boolean;
    readonly value: unknown;
  } => {
    if (typeof candidate !== "string") {
      return { ready: true, value: candidate };
    }
    const wikiMatch = WIKI_LINK_PATTERN.exec(candidate);
    const target =
      wikiMatch?.[1] === undefined ? undefined : normalizeWikiTarget(wikiMatch[1]);
    if (target === undefined) {
      return { ready: true, value: candidate };
    }
    const link = draft.links.find(
      (item) =>
        item.targetPath !== undefined && normalizeWikiTarget(item.raw) === target,
    );
    const id =
      link?.targetPath === undefined
        ? undefined
        : assignedByPath.get(link.targetPath)?.id;
    return id === undefined
      ? { ready: false, value: candidate }
      : { ready: true, value: id };
  };

  if (field.reference?.cardinality === "one") {
    return resolveOne(value);
  }
  if (field.reference?.cardinality === "many" && Array.isArray(value)) {
    const mapped = value.map((item) => resolveOne(item));
    return {
      ready: mapped.every((item) => item.ready),
      value: mapped.map((item) => item.value),
    };
  }
  if (field.children !== undefined) {
    if (Array.isArray(value)) {
      const mapped = value.map((item) =>
        identityNestedValue(item, field.children ?? [], draft, assignedByPath),
      );
      return {
        ready: mapped.every((item) => item.ready),
        value: mapped.map((item) => item.value),
      };
    }
    return identityNestedValue(value, field.children, draft, assignedByPath);
  }
  return { ready: true, value };
}

function identityNestedValue(
  value: unknown,
  fields: readonly CatalogField[],
  draft: NormalizedStixDraft,
  assignedByPath: ReadonlyMap<string, AssignedDraft>,
): { readonly ready: boolean; readonly value: unknown } {
  if (!isRecord(value)) {
    return { ready: true, value };
  }
  const byName = new Map(fields.map((field) => [field.name, field]));
  const result: Record<string, unknown> = {};
  let ready = true;
  for (const [key, nested] of Object.entries(value)) {
    const field = byName.get(key);
    const mapped =
      field === undefined
        ? { ready: true, value: nested }
        : identityReferenceValue(nested, field, draft, assignedByPath);
    ready &&= mapped.ready;
    result[key] = mapped.value;
  }
  return { ready, value: result };
}

function identityExtensionsValue(
  value: unknown,
  definition: ObjectTypeDefinition,
  draft: NormalizedStixDraft,
  assignedByPath: ReadonlyMap<string, AssignedDraft>,
): { readonly ready: boolean; readonly value: unknown } {
  if (!isRecord(value)) {
    return { ready: true, value };
  }
  const result: Record<string, unknown> = {};
  let ready = true;
  for (const [extensionType, payload] of Object.entries(value)) {
    const extension = stixCatalog.getObjectType(extensionType);
    const mapped =
      extension?.family === "predefined-extension" &&
      extension.extensionOf === definition.type
        ? identityNestedValue(payload, extension.fields, draft, assignedByPath)
        : { ready: true, value: payload };
    ready &&= mapped.ready;
    result[extensionType] = mapped.value;
  }
  return { ready, value: result };
}

function propertiesForScoIdentity(
  draft: NormalizedStixDraft,
  definition: ObjectTypeDefinition,
  assignedByPath: ReadonlyMap<string, AssignedDraft>,
): { readonly ready: boolean; readonly properties: Record<string, unknown> } {
  const properties = { ...draft.properties };
  let ready = true;
  for (const fieldName of definition.idContributingProperties ?? []) {
    if (!Object.hasOwn(properties, fieldName)) {
      continue;
    }
    const field = definition.fields.find((candidate) => candidate.name === fieldName);
    if (field === undefined) {
      continue;
    }
    const mapped =
      fieldName === "extensions"
        ? identityExtensionsValue(
            properties[fieldName],
            definition,
            draft,
            assignedByPath,
          )
        : identityReferenceValue(properties[fieldName], field, draft, assignedByPath);
    ready &&= mapped.ready;
    properties[fieldName] = mapped.value;
  }
  return { ready, properties };
}

async function assignDrafts(
  drafts: readonly NormalizedStixDraft[],
  dependencies: GraphMapperDependencies,
  diagnostics: Diagnostic[],
  identities: GeneratedIdentity[],
): Promise<readonly AssignedDraft[]> {
  const identifierService = createIdentifierService(dependencies);
  const candidates: Array<{
    readonly draft: NormalizedStixDraft;
    readonly definition: ObjectTypeDefinition;
    readonly existingId?: string;
  }> = [];
  const paths = new Set<string>();

  for (const draft of drafts) {
    if (paths.has(draft.path)) {
      diagnostics.push(
        mappingDiagnostic(
          DIAGNOSTIC_CODES.fieldDuplicate,
          `The export scope contains note path "${draft.path}" more than once.`,
          draft.path,
        ),
      );
      continue;
    }
    paths.add(draft.path);

    const type = draft.stixType;
    if (type === undefined) {
      diagnostics.push(
        mappingDiagnostic(
          DIAGNOSTIC_CODES.stixTypeMissing,
          "A graph draft is missing stix_type.",
          draft.path,
          "stix_type",
        ),
      );
      continue;
    }
    const catalogDefinition = stixCatalog.getObjectType(type);
    const definition =
      catalogDefinition ??
      (isCustomObjectType(type) ? customDefinition(type) : undefined);
    if (definition === undefined || !AUTHORABLE_FAMILIES.has(definition.family)) {
      diagnostics.push(
        mappingDiagnostic(
          DIAGNOSTIC_CODES.stixTypeUnsupported,
          `${type} is not a standalone authorable STIX object.`,
          draft.path,
          "stix_type",
        ),
      );
      continue;
    }

    const existingId =
      draft.stixId ??
      (typeof draft.properties.id === "string" ? draft.properties.id : undefined);
    candidates.push({
      draft,
      definition,
      ...(existingId === undefined ? {} : { existingId }),
    });
  }

  const assignedByPath = new Map<string, AssignedDraft>();
  const assign = (
    candidate: (typeof candidates)[number],
    identifier: ReturnType<typeof validateStixIdentifier>,
  ): void => {
    if (!identifier.ok) {
      diagnostics.push({
        ...identifier.diagnostic,
        notePath: candidate.draft.path,
      });
      return;
    }
    if (candidate.existingId === undefined) {
      identities.push({
        kind: "note",
        notePath: candidate.draft.path,
        id: identifier.id,
      });
    }
    assignedByPath.set(candidate.draft.path, {
      draft: candidate.draft,
      definition: candidate.definition,
      id: identifier.id,
    });
  };

  for (const candidate of candidates) {
    if (candidate.existingId !== undefined) {
      assign(
        candidate,
        candidate.definition.family === "sco"
          ? validateStixIdentifier(candidate.definition.type, candidate.existingId)
          : identifierService.ensureUuid4(
              candidate.definition.type,
              candidate.existingId,
            ),
      );
    } else if (candidate.definition.family !== "sco") {
      assign(candidate, identifierService.ensureUuid4(candidate.definition.type));
    }
  }

  let pending = candidates.filter(
    (candidate) =>
      candidate.existingId === undefined && candidate.definition.family === "sco",
  );
  while (pending.length > 0) {
    const remaining: typeof pending = [];
    let progress = false;
    for (const candidate of pending) {
      const normalized = propertiesForScoIdentity(
        candidate.draft,
        candidate.definition,
        assignedByPath,
      );
      if (!normalized.ready) {
        remaining.push(candidate);
        continue;
      }
      assign(
        candidate,
        await createDeterministicScoId(
          candidate.definition.type,
          normalized.properties,
          { randomUUID: dependencies.randomUUID },
        ),
      );
      progress = true;
    }
    if (!progress) {
      for (const candidate of remaining) {
        assign(candidate, identifierService.ensureUuid4(candidate.definition.type));
        diagnostics.push(
          createDiagnostic({
            authority: "mapping",
            code: DIAGNOSTIC_CODES.scoIdFallback,
            severity: "warning",
            message:
              `Used UUIDv4 for ${candidate.definition.type} because its ` +
              "ID-contributing references could not be resolved before ID assignment.",
            notePath: candidate.draft.path,
            field: "id",
          }),
        );
      }
      break;
    }
    pending = remaining;
  }

  return candidates.flatMap((candidate) => {
    const item = assignedByPath.get(candidate.draft.path);
    return item === undefined ? [] : [item];
  });
}

function mapAssignedObject(
  assigned: AssignedDraft,
  context: MappingContext,
): StixObject {
  const fieldByName = new Map(
    assigned.definition.fields.map((field) => [field.name, field]),
  );
  const result: Record<string, JsonValue> = {
    type: assigned.definition.type,
    id: assigned.id,
  };

  for (const [key, value] of Object.entries(assigned.draft.properties)) {
    if (key === "type" || key === "id" || value === undefined) {
      continue;
    }
    const field = fieldByName.get(key);
    const mapped =
      key === "extensions"
        ? mapExtensions(value, assigned, `$.${key}`, context)
        : field === undefined
          ? jsonValue(value, assigned.draft, key, `$.${key}`, context.diagnostics)
          : mapFieldValue(field, value, assigned.draft, `$.${key}`, context);
    if (mapped !== undefined) {
      result[key] = mapped;
    }
  }

  return result as StixObject;
}

function mapExtensions(
  value: unknown,
  assigned: AssignedDraft,
  objectPath: string,
  context: MappingContext,
): JsonValue | undefined {
  if (!isRecord(value)) {
    return jsonValue(
      value,
      assigned.draft,
      "extensions",
      objectPath,
      context.diagnostics,
    );
  }

  const result: Record<string, JsonValue> = {};
  for (const [extensionType, payload] of Object.entries(value)) {
    const extension = stixCatalog.getObjectType(extensionType);
    if (
      extension?.family !== "predefined-extension" ||
      extension.extensionOf !== assigned.definition.type ||
      !isRecord(payload)
    ) {
      const mapped = jsonValue(
        payload,
        assigned.draft,
        "extensions",
        `${objectPath}.${extensionType}`,
        context.diagnostics,
      );
      if (mapped !== undefined) {
        result[extensionType] = mapped;
      }
      continue;
    }

    const fieldByName = new Map(extension.fields.map((field) => [field.name, field]));
    const mappedPayload: Record<string, JsonValue> = {};
    for (const [key, nested] of Object.entries(payload)) {
      const extensionField = fieldByName.get(key);
      const mapped =
        extensionField === undefined
          ? jsonValue(
              nested,
              assigned.draft,
              "extensions",
              `${objectPath}.${extensionType}.${key}`,
              context.diagnostics,
            )
          : mapFieldValue(
              extensionField,
              nested,
              assigned.draft,
              `${objectPath}.${extensionType}.${key}`,
              context,
            );
      if (mapped !== undefined) {
        mappedPayload[key] = mapped;
      }
    }
    result[extensionType] = mappedPayload;
  }
  return result;
}

function targetIdForRelationship(
  declaration: RelationshipDeclaration,
  source: AssignedDraft,
  assignedByPath: ReadonlyMap<string, AssignedDraft>,
): string | undefined {
  if (declaration.targetNotePath !== undefined) {
    return assignedByPath.get(declaration.targetNotePath)?.id;
  }
  const link = source.draft.links.find(
    (candidate) =>
      candidate.targetPath !== undefined &&
      normalizeWikiTarget(candidate.raw) === declaration.targetLink,
  );
  return link?.targetPath === undefined
    ? undefined
    : assignedByPath.get(link.targetPath)?.id;
}

function addObject(
  object: StixObject,
  byId: Map<string, StixObject>,
  diagnostics: Diagnostic[],
  notePath?: string,
): void {
  const existing = byId.get(object.id);
  if (existing === undefined) {
    byId.set(object.id, object);
    return;
  }
  let conflicts: boolean;
  try {
    conflicts = canonicalizeJson(existing) !== canonicalizeJson(object);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown failure.";
    diagnostics.push(
      mappingDiagnostic(
        DIAGNOSTIC_CODES.fieldTypeInvalid,
        `Could not compare duplicate STIX ID "${object.id}": ${detail}`,
        notePath,
        "id",
        "$.id",
      ),
    );
    return;
  }
  if (conflicts) {
    diagnostics.push(
      mappingDiagnostic(
        DIAGNOSTIC_CODES.fieldDuplicate,
        `STIX ID "${object.id}" is assigned to conflicting object content.`,
        notePath,
        "id",
        "$.id",
      ),
    );
  }
}

export async function mapGraphToBundle(
  input: GraphMapperInput,
  dependencies: GraphMapperDependencies = {},
): Promise<GraphBundleResult> {
  const diagnostics: Diagnostic[] = [];
  const identities: GeneratedIdentity[] = [];
  const assigned = await assignDrafts(
    input.drafts,
    dependencies,
    diagnostics,
    identities,
  );
  const assignedByPath = new Map(assigned.map((item) => [item.draft.path, item]));
  const context: MappingContext = {
    assignedByPath,
    includedIds: new Set(assigned.map((item) => item.id)),
    diagnostics,
  };
  const objectsById = new Map<string, StixObject>();

  for (const item of assigned) {
    addObject(
      mapAssignedObject(item, context),
      objectsById,
      diagnostics,
      item.draft.path,
    );
  }

  const identifierService = createIdentifierService(dependencies);
  const generatedRelationships = new Map<string, PersistedRelationshipIdentity>();
  const relationshipDeclarations = [
    ...assigned.flatMap((source) => source.draft.relationships),
    ...(input.relationships ?? []),
  ];
  for (const declaration of relationshipDeclarations) {
    const source = assignedByPath.get(declaration.sourceNotePath);
    if (source === undefined) {
      diagnostics.push(
        mappingDiagnostic(
          DIAGNOSTIC_CODES.referenceUnresolved,
          `Relationship source "${declaration.sourceNotePath}" is not in the export scope.`,
          declaration.sourceNotePath,
          "source_ref",
          "$.source_ref",
        ),
      );
      continue;
    }
    const targetId = targetIdForRelationship(declaration, source, assignedByPath);
    if (targetId === undefined) {
      diagnostics.push(
        mappingDiagnostic(
          DIAGNOSTIC_CODES.referenceUnresolved,
          `Relationship target [[${declaration.targetLink}]] is not in the export scope.`,
          source.draft.path,
          "target_ref",
          "$.target_ref",
        ),
      );
      continue;
    }

    const key = relationshipIdentityKey(
      source.id,
      declaration.relationshipType,
      targetId,
    );
    let identity =
      input.relationshipIdentities?.[key] ?? generatedRelationships.get(key);
    if (identity === undefined) {
      const generatedId = identifierService.ensureUuid4("relationship");
      if (!generatedId.ok) {
        diagnostics.push(generatedId.diagnostic);
        continue;
      }
      const created = identifierService.now();
      identity = { id: generatedId.id, created };
      generatedRelationships.set(key, identity);
      const generated: GeneratedRelationshipIdentity = {
        kind: "relationship",
        key,
        ...identity,
      };
      identities.push(generated);
    } else {
      const validated = identifierService.ensureUuid4("relationship", identity.id);
      if (!validated.ok) {
        diagnostics.push(validated.diagnostic);
        continue;
      }
    }

    addObject(
      {
        type: "relationship",
        spec_version: "2.1",
        id: identity.id,
        created: identity.created,
        modified: identity.created,
        relationship_type: declaration.relationshipType,
        source_ref: source.id,
        target_ref: targetId,
      },
      objectsById,
      diagnostics,
      source.draft.path,
    );
  }

  const bundleIdentifier =
    input.bundleId === undefined
      ? identifierService.ensureUuid4("bundle")
      : identifierService.ensureUuid4("bundle", input.bundleId);
  if (!bundleIdentifier.ok) {
    diagnostics.push(bundleIdentifier.diagnostic);
  }

  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  const warnings = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning",
  );
  if (errors.length > 0 || !bundleIdentifier.ok) {
    return {
      ok: false,
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
    };
  }

  const objects = [...objectsById.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const bundle: StixBundle = {
    type: "bundle",
    id: bundleIdentifier.id as `bundle--${string}`,
    objects: Object.freeze(objects),
  };
  return {
    ok: true,
    bundle: Object.freeze(bundle),
    identities: Object.freeze(identities),
    warnings: Object.freeze(warnings),
  };
}
