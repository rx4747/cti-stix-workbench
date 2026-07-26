import { STIX_2_1_CATALOG_DATA } from "./stix-2.1.generated";
import type {
  ObjectTypeDefinition,
  StixCatalog,
  StixCatalogData,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

class StandardStixCatalog implements StixCatalog {
  readonly version: string;
  private readonly definitions: readonly ObjectTypeDefinition[];
  private readonly byType: ReadonlyMap<string, ObjectTypeDefinition>;

  constructor(data: StixCatalogData) {
    const frozenData = deepFreeze(data);
    this.version =
      `${frozenData.standard.toLowerCase().replaceAll(" ", "-")}-errata01`;
    this.definitions = frozenData.definitions;
    this.byType = new Map(
      this.definitions.map((definition) => [definition.type, definition]),
    );
  }

  getObjectType(type: string): ObjectTypeDefinition | undefined {
    return this.byType.get(type);
  }

  listObjectTypes(): readonly ObjectTypeDefinition[] {
    return this.definitions;
  }
}

export const stixCatalog: StixCatalog = new StandardStixCatalog(
  STIX_2_1_CATALOG_DATA,
);
