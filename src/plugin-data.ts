import type { PersistedRelationshipIdentity } from "./core/types";
import { parseWorkbenchSettings, type WorkbenchSettings } from "./settings";

const RELATIONSHIP_ID_PATTERN =
  /^relationship--[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export interface WorkbenchPluginData {
  readonly settings: WorkbenchSettings;
  readonly relationshipIdentities: Readonly<
    Record<string, PersistedRelationshipIdentity>
  >;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseRelationshipIdentities(
  value: unknown,
): Record<string, PersistedRelationshipIdentity> {
  if (!isRecord(value)) {
    return {};
  }

  const identities: Record<string, PersistedRelationshipIdentity> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (
      key.length === 0 ||
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      !RELATIONSHIP_ID_PATTERN.test(candidate.id) ||
      typeof candidate.created !== "string" ||
      Number.isNaN(Date.parse(candidate.created))
    ) {
      continue;
    }
    identities[key] = {
      id: candidate.id,
      created: candidate.created,
    };
  }
  return identities;
}

export function parsePluginData(value: unknown): WorkbenchPluginData {
  const record = isRecord(value) ? value : {};
  const hasStructuredData = isRecord(record.settings);
  return {
    settings: parseWorkbenchSettings(hasStructuredData ? record.settings : record),
    relationshipIdentities: parseRelationshipIdentities(
      hasStructuredData ? record.relationshipIdentities : undefined,
    ),
  };
}

export function serializePluginData(data: WorkbenchPluginData): WorkbenchPluginData {
  return {
    settings: { ...data.settings },
    relationshipIdentities: Object.fromEntries(
      Object.entries(data.relationshipIdentities).map(([key, identity]) => [
        key,
        { ...identity },
      ]),
    ),
  };
}
