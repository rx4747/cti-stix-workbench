import { stixCatalog } from "./stix-2.1";

const ALL_SCOS = new Set(
  stixCatalog
    .listObjectTypes()
    .filter((definition) => definition.family === "sco")
    .map((definition) => definition.type),
);

const SPECIFIC_RELATIONSHIPS = new Map<string, ReadonlySet<string>>(
  Object.entries({
    "attack-pattern|delivers": ["malware"],
    "attack-pattern|targets": ["identity", "location", "vulnerability"],
    "attack-pattern|uses": ["malware", "tool"],
    "campaign|attributed-to": ["intrusion-set", "threat-actor"],
    "campaign|compromises": ["infrastructure"],
    "campaign|originates-from": ["location"],
    "campaign|targets": ["identity", "location", "vulnerability"],
    "campaign|uses": ["attack-pattern", "infrastructure", "malware", "tool"],
    "course-of-action|investigates": ["indicator"],
    "course-of-action|mitigates": [
      "attack-pattern",
      "indicator",
      "malware",
      "tool",
      "vulnerability",
    ],
    "course-of-action|remediates": ["malware", "vulnerability"],
    "domain-name|resolves-to": ["domain-name", "ipv4-addr", "ipv6-addr"],
    "identity|located-at": ["location"],
    "indicator|indicates": [
      "attack-pattern",
      "campaign",
      "infrastructure",
      "intrusion-set",
      "malware",
      "threat-actor",
      "tool",
    ],
    "indicator|based-on": ["observed-data"],
    "infrastructure|communicates-with": [
      "infrastructure",
      "ipv4-addr",
      "ipv6-addr",
      "domain-name",
      "url",
    ],
    "infrastructure|controls": ["infrastructure", "malware"],
    "infrastructure|delivers": ["malware"],
    "infrastructure|has": ["vulnerability"],
    "infrastructure|hosts": ["tool", "malware"],
    "infrastructure|located-at": ["location"],
    "infrastructure|uses": ["infrastructure"],
    "intrusion-set|attributed-to": ["threat-actor"],
    "intrusion-set|compromises": ["infrastructure"],
    "intrusion-set|hosts": ["infrastructure"],
    "intrusion-set|owns": ["infrastructure"],
    "intrusion-set|originates-from": ["location"],
    "intrusion-set|targets": ["identity", "location", "vulnerability"],
    "intrusion-set|uses": ["attack-pattern", "infrastructure", "malware", "tool"],
    "ipv4-addr|belongs-to": ["autonomous-system"],
    "ipv4-addr|resolves-to": ["mac-addr"],
    "ipv6-addr|belongs-to": ["autonomous-system"],
    "ipv6-addr|resolves-to": ["mac-addr"],
    "malware|authored-by": ["threat-actor", "intrusion-set"],
    "malware|beacons-to": ["infrastructure"],
    "malware|exfiltrates-to": ["infrastructure"],
    "malware|communicates-with": ["ipv4-addr", "ipv6-addr", "domain-name", "url"],
    "malware|controls": ["malware"],
    "malware|downloads": ["malware", "tool", "file"],
    "malware|drops": ["malware", "tool", "file"],
    "malware|exploits": ["vulnerability"],
    "malware|originates-from": ["location"],
    "malware|targets": ["identity", "infrastructure", "location", "vulnerability"],
    "malware|uses": ["attack-pattern", "infrastructure", "malware", "tool"],
    "malware|variant-of": ["malware"],
    "malware-analysis|characterizes": ["malware"],
    "malware-analysis|av-analysis-of": ["malware"],
    "malware-analysis|static-analysis-of": ["malware"],
    "malware-analysis|dynamic-analysis-of": ["malware"],
    "threat-actor|attributed-to": ["identity"],
    "threat-actor|compromises": ["infrastructure"],
    "threat-actor|hosts": ["infrastructure"],
    "threat-actor|owns": ["infrastructure"],
    "threat-actor|impersonates": ["identity"],
    "threat-actor|located-at": ["location"],
    "threat-actor|targets": ["identity", "location", "vulnerability"],
    "threat-actor|uses": ["attack-pattern", "infrastructure", "malware", "tool"],
    "tool|delivers": ["malware"],
    "tool|drops": ["malware"],
    "tool|has": ["vulnerability"],
    "tool|targets": ["identity", "infrastructure", "location", "vulnerability"],
    "tool|uses": ["infrastructure"],
  }).map(([key, values]) => [key, new Set(values)]),
);

const RELATIONSHIP_CAPABLE_FAMILIES = new Set(["sdo", "sco"]);

function supportsCommonRelationships(type: string): boolean {
  const family = stixCatalog.getObjectType(type)?.family;
  return family !== undefined && RELATIONSHIP_CAPABLE_FAMILIES.has(family);
}

export function isRecommendedRelationship(
  sourceType: string,
  relationshipType: string,
  targetType: string,
): boolean {
  if (relationshipType === "related-to") {
    return (
      supportsCommonRelationships(sourceType) && supportsCommonRelationships(targetType)
    );
  }
  if (relationshipType === "derived-from" || relationshipType === "duplicate-of") {
    return sourceType === targetType && supportsCommonRelationships(sourceType);
  }
  if (
    sourceType === "infrastructure" &&
    relationshipType === "consists-of" &&
    (targetType === "infrastructure" ||
      targetType === "observed-data" ||
      ALL_SCOS.has(targetType))
  ) {
    return true;
  }
  return (
    SPECIFIC_RELATIONSHIPS.get(`${sourceType}|${relationshipType}`)?.has(targetType) ===
    true
  );
}
