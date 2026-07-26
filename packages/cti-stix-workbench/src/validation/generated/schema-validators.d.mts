interface SchemaError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
}

interface Validator {
  (value: unknown): boolean;
  errors?: SchemaError[] | null;
}

export const validateBundleSchema: Validator;
export const validateArtifactSchema: Validator;
export const validateAttackPatternSchema: Validator;
export const validateAutonomousSystemSchema: Validator;
export const validateCampaignSchema: Validator;
export const validateCourseOfActionSchema: Validator;
export const validateDirectorySchema: Validator;
export const validateDomainNameSchema: Validator;
export const validateEmailAddrSchema: Validator;
export const validateEmailMessageSchema: Validator;
export const validateExtensionDefinitionSchema: Validator;
export const validateFileSchema: Validator;
export const validateGroupingSchema: Validator;
export const validateIdentitySchema: Validator;
export const validateIncidentSchema: Validator;
export const validateIndicatorSchema: Validator;
export const validateInfrastructureSchema: Validator;
export const validateIntrusionSetSchema: Validator;
export const validateIpv4AddrSchema: Validator;
export const validateIpv6AddrSchema: Validator;
export const validateLanguageContentSchema: Validator;
export const validateLocationSchema: Validator;
export const validateMacAddrSchema: Validator;
export const validateMalwareSchema: Validator;
export const validateMalwareAnalysisSchema: Validator;
export const validateMarkingDefinitionSchema: Validator;
export const validateMutexSchema: Validator;
export const validateNetworkTrafficSchema: Validator;
export const validateNoteSchema: Validator;
export const validateObservedDataSchema: Validator;
export const validateOpinionSchema: Validator;
export const validateProcessSchema: Validator;
export const validateRelationshipSchema: Validator;
export const validateReportSchema: Validator;
export const validateSightingSchema: Validator;
export const validateSoftwareSchema: Validator;
export const validateThreatActorSchema: Validator;
export const validateToolSchema: Validator;
export const validateUrlSchema: Validator;
export const validateUserAccountSchema: Validator;
export const validateVulnerabilitySchema: Validator;
export const validateWindowsRegistryKeySchema: Validator;
export const validateX509CertificateSchema: Validator;
