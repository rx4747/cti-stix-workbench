export type CatalogFamily =
  | "sdo"
  | "sro"
  | "sco"
  | "smo"
  | "bundle"
  | "predefined-extension";

export interface CatalogCitation {
  readonly section: string;
  readonly url: string;
}

export interface CatalogVocabulary {
  readonly kind: "open" | "closed";
  readonly name: string;
  readonly values: readonly string[];
}

export interface CatalogReference {
  readonly cardinality: "one" | "many";
  readonly targetTypes: readonly string[];
}

export interface CatalogField {
  readonly name: string;
  readonly dataType: string;
  readonly required: boolean;
  readonly description?: string;
  readonly children?: readonly CatalogField[];
  readonly reference?: CatalogReference;
  readonly vocabulary?: CatalogVocabulary;
}

export interface ObjectTypeDefinition {
  readonly type: string;
  readonly title: string;
  readonly family: CatalogFamily;
  readonly description: string;
  readonly fields: readonly CatalogField[];
  readonly citation: CatalogCitation;
  readonly schemaSource: string;
  readonly extensionOf?: string;
  readonly idContributingProperties?: readonly string[];
}

export interface StixCatalogData {
  readonly catalogVersion: 1;
  readonly standard: "STIX 2.1";
  readonly conformanceBaseline: "Errata 01";
  readonly schemaCommit: string;
  readonly definitions: readonly ObjectTypeDefinition[];
}

export interface StixCatalog {
  readonly version: string;
  getObjectType(type: string): ObjectTypeDefinition | undefined;
  listObjectTypes(): readonly ObjectTypeDefinition[];
}
