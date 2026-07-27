// GENERATED FILE. Do not edit directly.
import type { StixCatalogData } from "./types";

export const STIX_2_1_CATALOG_DATA = {
  "catalogVersion": 1,
  "standard": "STIX 2.1",
  "conformanceBaseline": "Errata 01",
  "schemaCommit": "c4f8d589acf2bdb3783655c89e0ffb6e150006ae",
  "definitions": [
    {
      "type": "attack-pattern",
      "title": "Attack Pattern",
      "family": "sdo",
      "description": "Attack Patterns are a type of TTP that describe ways that adversaries attempt to compromise targets. ",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `attack-pattern`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "aliases",
          "dataType": "array<string>",
          "required": false,
          "description": "Alternative names used to identify this Attack Pattern."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Attack Pattern."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about the Attack Pattern, potentially including its purpose and its key characteristics."
        },
        {
          "name": "kill_chain_phases",
          "dataType": "array<object>",
          "required": false,
          "description": "The list of kill chain phases for which this attack pattern is used.",
          "children": [
            {
              "name": "kill_chain_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the kill chain."
            },
            {
              "name": "phase_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the phase in the kill chain."
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.1",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/attack-pattern.json"
    },
    {
      "type": "campaign",
      "title": "Campaign",
      "family": "sdo",
      "description": "A Campaign is a grouping of adversary behavior that describes a set of malicious activities or attacks that occur over a period of time against a specific set of targets.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `campaign`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Campaign."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about the Campaign, potentially including its purpose and its key characteristics."
        },
        {
          "name": "aliases",
          "dataType": "array<string>",
          "required": false,
          "description": "Alternative names used to identify this campaign."
        },
        {
          "name": "first_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this Campaign was first seen."
        },
        {
          "name": "last_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this Campaign was last seen."
        },
        {
          "name": "objective",
          "dataType": "string",
          "required": false,
          "description": "This field defines the Campaign’s primary goal, objective, desired outcome, or intended effect."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.2",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/campaign.json"
    },
    {
      "type": "course-of-action",
      "title": "Course of Action",
      "family": "sdo",
      "description": "A Course of Action is an action taken either to prevent an attack or to respond to an attack that is in progress. ",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `course-of-action`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Course of Action."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about this object, potentially including its purpose and its key characteristics."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.3",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/course-of-action.json"
    },
    {
      "type": "grouping",
      "title": "Grouping",
      "family": "sdo",
      "description": "A Grouping object explicitly asserts that the referenced STIX Objects have a shared content.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `grouping`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": false,
          "description": "A name used to identify the Grouping."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description which provides more details and context about the Grouping, potentially including the purpose and key characteristics."
        },
        {
          "name": "context",
          "dataType": "string",
          "required": true,
          "description": "A short description of the particular context shared by the content referenced by the Grouping."
        },
        {
          "name": "object_refs",
          "dataType": "array<string>",
          "required": true,
          "description": "The STIX Objects (SDOs and SROs) that  are referred to by this Grouping.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.4",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/grouping.json"
    },
    {
      "type": "identity",
      "title": "Identity",
      "family": "sdo",
      "description": "Identities can represent actual individuals, organizations, or groups (e.g., ACME, Inc.) as well as classes of individuals, organizations, or groups.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `identity`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "roles",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of roles that this Identity performs (e.g., CEO, Domain Administrators, Doctors, Hospital, or Retailer). No open vocabulary is yet defined for this property."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name of this Identity."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about the Identity."
        },
        {
          "name": "identity_class",
          "dataType": "string",
          "required": false,
          "description": "The type of entity that this Identity describes, e.g., an individual or organization. Open Vocab - identity-class-ov",
          "vocabulary": {
            "kind": "open",
            "name": "identity-class-ov",
            "values": [
              "individual",
              "group",
              "system",
              "organization",
              "class",
              "unknown"
            ]
          }
        },
        {
          "name": "sectors",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of sectors that this Identity belongs to. Open Vocab - industry-sector-ov",
          "vocabulary": {
            "kind": "open",
            "name": "industry-sector-ov",
            "values": [
              "agriculture",
              "aerospace",
              "automotive",
              "chemical",
              "commercial",
              "communications",
              "construction",
              "defense",
              "education",
              "energy",
              "engineering",
              "entertainment",
              "financial-services",
              "government",
              "emergency-services",
              "government-local",
              "government-national",
              "government-public-services",
              "government-regional",
              "healthcare",
              "hospitality-leisure",
              "infrastructure",
              "dams",
              "nuclear",
              "water",
              "insurance",
              "manufacturing",
              "mining",
              "non-profit",
              "pharmaceuticals",
              "retail",
              "technology",
              "telecommunications",
              "transportation",
              "utilities"
            ]
          }
        },
        {
          "name": "contact_information",
          "dataType": "string",
          "required": false,
          "description": "The contact information (e-mail, phone number, etc.) for this Identity."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.5",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/identity.json"
    },
    {
      "type": "incident",
      "title": "Incident",
      "family": "sdo",
      "description": "The Incident object in STIX 2.1 is a stub, to be expanded in future STIX 2 releases.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `incident`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Incident."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about the Incident."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.6",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/incident.json"
    },
    {
      "type": "indicator",
      "title": "Indicator",
      "family": "sdo",
      "description": "Indicators contain a pattern that can be used to detect suspicious or malicious cyber activity.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `indicator`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "indicator_types",
          "dataType": "array<string>",
          "required": false,
          "description": "This field is an Open Vocabulary that specifies the type of indicator. Open vocab - indicator-type-ov",
          "vocabulary": {
            "kind": "open",
            "name": "indicator-type-ov",
            "values": [
              "anomalous-activity",
              "anonymization",
              "benign",
              "compromised",
              "malicious-activity",
              "attribution",
              "unknown"
            ]
          }
        },
        {
          "name": "name",
          "dataType": "string",
          "required": false,
          "description": "The name used to identify the Indicator."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides the recipient with context about this Indicator potentially including its purpose and its key characteristics."
        },
        {
          "name": "pattern",
          "dataType": "string",
          "required": true,
          "description": "The detection pattern for this indicator."
        },
        {
          "name": "pattern_type",
          "dataType": "string",
          "required": true,
          "description": "The type of pattern used in this indicator."
        },
        {
          "name": "pattern_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the pattern that is used."
        },
        {
          "name": "valid_from",
          "dataType": "string",
          "required": true,
          "description": "The time from which this indicator should be considered valuable intelligence."
        },
        {
          "name": "valid_until",
          "dataType": "string",
          "required": false,
          "description": "The time at which this indicator should no longer be considered valuable intelligence."
        },
        {
          "name": "kill_chain_phases",
          "dataType": "array<object>",
          "required": false,
          "description": "The phases of the kill chain that this indicator detects.",
          "children": [
            {
              "name": "kill_chain_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the kill chain."
            },
            {
              "name": "phase_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the phase in the kill chain."
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.7",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/indicator.json"
    },
    {
      "type": "infrastructure",
      "title": "Infrastructure",
      "family": "sdo",
      "description": "Infrastructure objects describe systems, software services, and associated physical or virtual resources.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `infrastructure`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Infrastructure."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about this Infrastructure potentially including its purpose and its key characteristics."
        },
        {
          "name": "infrastructure_types",
          "dataType": "array<string>",
          "required": false,
          "description": "This field is an Open Vocabulary that specifies the type of infrastructure. Open vocab - infrastructure-type-ov",
          "vocabulary": {
            "kind": "open",
            "name": "infrastructure-type-ov",
            "values": [
              "amplification",
              "anonymization",
              "botnet",
              "command-and-control",
              "exfiltration",
              "hosting-malware",
              "hosting-target-lists",
              "phishing",
              "reconnaissance",
              "staging",
              "unknown"
            ]
          }
        },
        {
          "name": "aliases",
          "dataType": "array<string>",
          "required": false,
          "description": "Alternative names used to identify this Infrastructure."
        },
        {
          "name": "kill_chain_phases",
          "dataType": "array<object>",
          "required": false,
          "description": "The list of kill chain phases for which this infrastructure is used.",
          "children": [
            {
              "name": "kill_chain_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the kill chain."
            },
            {
              "name": "phase_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the phase in the kill chain."
            }
          ]
        },
        {
          "name": "first_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this infrastructure was first seen performing malicious activities."
        },
        {
          "name": "last_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this infrastructure was last seen performing malicious activities."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.8",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/infrastructure.json"
    },
    {
      "type": "intrusion-set",
      "title": "Intrusion Set",
      "family": "sdo",
      "description": "An Intrusion Set is a grouped set of adversary behavior and resources with common properties that is believed to be orchestrated by a single organization.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `intrusion-set`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Intrusion Set."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "Provides more context and details about the Intrusion Set object."
        },
        {
          "name": "aliases",
          "dataType": "array<string>",
          "required": false,
          "description": "Alternative names used to identify this Intrusion Set."
        },
        {
          "name": "first_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this Intrusion Set was first seen."
        },
        {
          "name": "last_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this Intrusion Set was last seen."
        },
        {
          "name": "goals",
          "dataType": "array<string>",
          "required": false,
          "description": "The high level goals of this Intrusion Set, namely, what are they trying to do."
        },
        {
          "name": "resource_level",
          "dataType": "string",
          "required": false,
          "description": "This defines the organizational level at which this Intrusion Set typically works. Open Vocab - attack-resource-level-ov",
          "vocabulary": {
            "kind": "open",
            "name": "attack-resource-level-ov",
            "values": [
              "individual",
              "club",
              "contest",
              "team",
              "organization",
              "government"
            ]
          }
        },
        {
          "name": "primary_motivation",
          "dataType": "string",
          "required": false,
          "description": "The primary reason, motivation, or purpose behind this Intrusion Set. Open Vocab - attack-motivation-ov",
          "vocabulary": {
            "kind": "open",
            "name": "attack-motivation-ov",
            "values": [
              "accidental",
              "coercion",
              "dominance",
              "ideology",
              "notoriety",
              "organizational-gain",
              "personal-gain",
              "personal-satisfaction",
              "revenge",
              "unpredictable"
            ]
          }
        },
        {
          "name": "secondary_motivations",
          "dataType": "array<string>",
          "required": false,
          "description": "The secondary reasons, motivations, or purposes behind this Intrusion Set. Open Vocab - attack-motivation-ov",
          "vocabulary": {
            "kind": "open",
            "name": "attack-motivation-ov",
            "values": [
              "accidental",
              "coercion",
              "dominance",
              "ideology",
              "notoriety",
              "organizational-gain",
              "personal-gain",
              "personal-satisfaction",
              "revenge",
              "unpredictable"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.9",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/intrusion-set.json"
    },
    {
      "type": "location",
      "title": "Location",
      "family": "sdo",
      "description": "A Location represents a geographic location. The location may be described as any, some or all of the following: region (e.g., North America), civic address (e.g. New York, US), latitude and longitude.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `location`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A textual description of the Location."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": false,
          "description": "A name used to identify the Location."
        },
        {
          "name": "latitude",
          "dataType": "number",
          "required": false,
          "description": "The latitude of the Location in decimal degrees."
        },
        {
          "name": "longitude",
          "dataType": "number",
          "required": false,
          "description": "The longitude of the Location in decimal degrees."
        },
        {
          "name": "precision",
          "dataType": "number",
          "required": false,
          "description": "Defines the precision of the coordinates specified by the latitude and longitude properties, measured in meters."
        },
        {
          "name": "region",
          "dataType": "string",
          "required": false,
          "description": "The region that this Location describes."
        },
        {
          "name": "country",
          "dataType": "string",
          "required": false,
          "description": "The country that this Location describes."
        },
        {
          "name": "administrative_area",
          "dataType": "string",
          "required": false,
          "description": "The state, province, or other sub-national administrative area that this Location describes."
        },
        {
          "name": "city",
          "dataType": "string",
          "required": false,
          "description": "The city that this Location describes."
        },
        {
          "name": "street_address",
          "dataType": "string",
          "required": false,
          "description": "The street address that this Location describes."
        },
        {
          "name": "postal_code",
          "dataType": "string",
          "required": false,
          "description": "The postal code for this Location."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.10",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/location.json"
    },
    {
      "type": "malware",
      "title": "Malware",
      "family": "sdo",
      "description": "Malware is a type of TTP that is also known as malicious code and malicious software, refers to a program that is inserted into a system, usually covertly, with the intent of compromising the confidentiality, integrity, or availability of the victim's data, applications, or operating system (OS) or of otherwise annoying or disrupting the victim.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `malware`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "aliases",
          "dataType": "array<string>",
          "required": false,
          "description": "Alternative names used to identify this Malware or Malware family."
        },
        {
          "name": "first_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that the malware instance or family was first seen."
        },
        {
          "name": "last_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that the malware family or malware instance was last seen."
        },
        {
          "name": "operating_system_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The operating systems that the malware family or malware instance is executable on.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "architecture_execution_envs",
          "dataType": "array<string>",
          "required": false,
          "description": "The processor architectures (e.g., x86, ARM, etc.) that the malware instance or family is executable on. Open Vocab - processor-architecture-os.",
          "vocabulary": {
            "kind": "open",
            "name": "processor-architecture-os",
            "values": []
          }
        },
        {
          "name": "implementation_languages",
          "dataType": "array<string>",
          "required": false,
          "description": "The programming language(s) used to implement the malware instance or family. Open Vocab - implementation-language-ov.",
          "vocabulary": {
            "kind": "open",
            "name": "implementation-language-ov",
            "values": [
              "applescript",
              "bash",
              "c",
              "c++",
              "c#",
              "go",
              "java",
              "javascript",
              "lua",
              "objective-c",
              "perl",
              "php",
              "powershell",
              "python",
              "ruby",
              "scala",
              "swift",
              "typescript",
              "visual-basic",
              "x86-32",
              "x86-64"
            ]
          }
        },
        {
          "name": "capabilities",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies any capabilities identified for the malware instance or family. Open Vocab - malware-capabilities-ov.",
          "vocabulary": {
            "kind": "open",
            "name": "malware-capabilities-ov",
            "values": [
              "accesses-remote-machines",
              "anti-debugging",
              "anti-disassembly",
              "anti-emulation",
              "anti-memory-forensics",
              "anti-sandbox",
              "anti-vm",
              "captures-input-peripherals",
              "captures-output-peripherals",
              "captures-system-state-data",
              "cleans-traces-of-infection",
              "commits-fraud",
              "communicates-with-c2",
              "compromises-data-availability",
              "compromises-data-integrity",
              "compromises-system-availability",
              "controls-local-machine",
              "degrades-security-software",
              "degrades-system-updates",
              "determines-c2-server",
              "emails-spam",
              "escalates-privileges",
              "evades-av",
              "exfiltrates-data",
              "fingerprints-host",
              "hides-artifacts",
              "hides-executing-code",
              "infects-files",
              "infects-remote-machines",
              "installs-other-components",
              "persists-after-system-reboot",
              "prevents-artifact-access",
              "prevents-artifact-deletion",
              "probes-network-environment",
              "self-modifies",
              "steals-authentication-credentials",
              "violates-system-operational-integrity"
            ]
          }
        },
        {
          "name": "sample_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The sample_refs property specifies a list of identifiers of the SCO file or artifact objects associated with this malware instance(s) or family.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "malware_types",
          "dataType": "array<string>",
          "required": false,
          "description": "The type of malware being described. Open Vocab - malware-type-ov",
          "vocabulary": {
            "kind": "open",
            "name": "malware-type-ov",
            "values": [
              "adware",
              "backdoor",
              "bot",
              "bootkit",
              "ddos",
              "downloader",
              "dropper",
              "exploit-kit",
              "keylogger",
              "ransomware",
              "remote-access-trojan",
              "resource-exploitation",
              "rogue-security-software",
              "rootkit",
              "screen-capture",
              "spyware",
              "trojan",
              "unknown",
              "virus",
              "webshell",
              "wiper",
              "worm"
            ]
          }
        },
        {
          "name": "name",
          "dataType": "string",
          "required": false,
          "description": "The name used to identify the Malware."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "Provides more context and details about the Malware object."
        },
        {
          "name": "kill_chain_phases",
          "dataType": "array<object>",
          "required": false,
          "description": "The list of kill chain phases for which this Malware instance can be used.",
          "children": [
            {
              "name": "kill_chain_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the kill chain."
            },
            {
              "name": "phase_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the phase in the kill chain."
            }
          ]
        },
        {
          "name": "is_family",
          "dataType": "boolean",
          "required": true,
          "description": "Whether the object represents a malware family (if true) or a malware instance (if false).",
          "vocabulary": {
            "kind": "closed",
            "name": "is_family-enum",
            "values": []
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.11",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/malware.json"
    },
    {
      "type": "malware-analysis",
      "title": "Malware Analysis",
      "family": "sdo",
      "description": "Malware Analysis captures the metadata and results of a particular analysis performed (static or dynamic) on the malware instance or family.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `malware-analysis`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "product",
          "dataType": "string",
          "required": true,
          "description": "The name of the analysis engine or product that was used for this analysis."
        },
        {
          "name": "version",
          "dataType": "string",
          "required": false,
          "description": "The version of the analysis product that was used to perform this analysis."
        },
        {
          "name": "configuration_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the analysis product configuration that was used to perform this analysis."
        },
        {
          "name": "modules",
          "dataType": "array<string>",
          "required": false,
          "description": "The particular analysis product modules that were used to perform the analysis."
        },
        {
          "name": "analysis_engine_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the analysis engine or product that was used to perform this analysis."
        },
        {
          "name": "analysis_definition_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the analysis definitions used by the analysis tool."
        },
        {
          "name": "submitted",
          "dataType": "string",
          "required": false,
          "description": "The date and time that this malware was first submitted for scanning or analysis."
        },
        {
          "name": "analysis_started",
          "dataType": "string",
          "required": false,
          "description": "The date and time that the malware analysis was initiated."
        },
        {
          "name": "analysis_ended",
          "dataType": "string",
          "required": false,
          "description": "The date and time that the malware analysis ended."
        },
        {
          "name": "result_name",
          "dataType": "string",
          "required": false,
          "description": "The classification result or name assigned to the malware instance by the scanner tool."
        },
        {
          "name": "result",
          "dataType": "string",
          "required": false,
          "description": "The classification result as determined by the scanner or tool analysis process."
        },
        {
          "name": "host_vm_ref",
          "dataType": "string",
          "required": false,
          "description": "A description of the virtual machine environment used to host the guest operating system (if applicable) that was used for the dynamic analysis of the malware instance or family.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "operating_system_ref",
          "dataType": "string",
          "required": false,
          "description": "The operating system that was used to perform the dynamic analysis.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "installed_software_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Any non-standard software installed on the operating system used for the dynamic analysis of the malware instance or family.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "analysis_sco_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of STIX objects that were captured during the analysis process.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "sample_ref",
          "dataType": "string",
          "required": false,
          "description": "Refers to the object this analysis was performed against.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.12",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/malware-analysis.json"
    },
    {
      "type": "note",
      "title": "Note",
      "family": "sdo",
      "description": "A Note is a comment or note containing informative text to help explain the context of one or more STIX Objects (SDOs or SROs) or to provide additional analysis that is not contained in the original object.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `note`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "abstract",
          "dataType": "string",
          "required": false,
          "description": "A brief summary of the note."
        },
        {
          "name": "content",
          "dataType": "string",
          "required": true,
          "description": "The content of the note."
        },
        {
          "name": "authors",
          "dataType": "array<string>",
          "required": false,
          "description": "The name of the author(s) of this note (e.g., the analyst(s) that created it)."
        },
        {
          "name": "object_refs",
          "dataType": "array<string>",
          "required": true,
          "description": "The STIX Objects (SDOs and SROs) that the note is being applied to.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.13",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/note.json"
    },
    {
      "type": "observed-data",
      "title": "Observed Data",
      "family": "sdo",
      "description": "Observed data conveys information that was observed on systems and networks, such as log data or network traffic, using the Cyber Observable specification.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `observed-data`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "first_observed",
          "dataType": "string",
          "required": true,
          "description": "The beginning of the time window that the data was observed during."
        },
        {
          "name": "last_observed",
          "dataType": "string",
          "required": true,
          "description": "The end of the time window that the data was observed during."
        },
        {
          "name": "number_observed",
          "dataType": "integer",
          "required": true,
          "description": "The number of times the data represented in the objects property was observed. This MUST be an integer between 1 and 999,999,999 inclusive."
        },
        {
          "name": "objects",
          "dataType": "object",
          "required": false,
          "description": "A dictionary of Cyber Observable Objects that describes the single 'fact' that was observed."
        },
        {
          "name": "object_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "A list of SCOs and SROs representing the observation.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.14",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/observed-data.json"
    },
    {
      "type": "opinion",
      "title": "Opinion",
      "family": "sdo",
      "description": "An Opinion is an assessment of the correctness of the information in a STIX Object produced by a different entity and captures the level of agreement or disagreement using a fixed scale.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `opinion`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "explanation",
          "dataType": "string",
          "required": false,
          "description": "An explanation of why the producer has this Opinion."
        },
        {
          "name": "authors",
          "dataType": "array<string>",
          "required": false,
          "description": "The name of the author(s) of this opinion (e.g., the analyst(s) that created it)."
        },
        {
          "name": "object_refs",
          "dataType": "array<string>",
          "required": true,
          "description": "The STIX Objects (SDOs and SROs) that the opinion is being applied to.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "opinion",
          "dataType": "string",
          "required": true,
          "description": "The opinion that the producer has about about all of the STIX Object(s) listed in the object_refs property.",
          "vocabulary": {
            "kind": "closed",
            "name": "opinion-enum",
            "values": [
              "strongly-disagree",
              "disagree",
              "neutral",
              "agree",
              "strongly-agree"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.15",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/opinion.json"
    },
    {
      "type": "report",
      "title": "Report",
      "family": "sdo",
      "description": "Reports are collections of threat intelligence focused on one or more topics, such as a description of a threat actor, malware, or attack technique, including context and related details.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `report`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "report_types",
          "dataType": "array<string>",
          "required": false,
          "description": "This field is an Open Vocabulary that specifies the primary subject of this report. The suggested values for this field are in report-type-ov."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Report."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about Report."
        },
        {
          "name": "published",
          "dataType": "string",
          "required": true,
          "description": "The date that this report object was officially published by the creator of this report."
        },
        {
          "name": "object_refs",
          "dataType": "array<string>",
          "required": true,
          "description": "Specifies the STIX Objects that are referred to by this Report.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.16",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/report.json"
    },
    {
      "type": "threat-actor",
      "title": "Threat Actor",
      "family": "sdo",
      "description": "Threat Actors are actual individuals, groups, or organizations believed to be operating with malicious intent.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `threat-actor`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "threat_actor_types",
          "dataType": "array<string>",
          "required": false,
          "description": "This field specifies the type of threat actor. Open Vocab - threat-actor-type-ov",
          "vocabulary": {
            "kind": "open",
            "name": "threat-actor-type-ov",
            "values": [
              "activist",
              "competitor",
              "crime-syndicate",
              "criminal",
              "hacker",
              "insider-accidental",
              "insider-disgruntled",
              "nation-state",
              "sensationalist",
              "spy",
              "terrorist",
              "unknown"
            ]
          }
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "A name used to identify this Threat Actor or Threat Actor group."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about the Threat Actor."
        },
        {
          "name": "aliases",
          "dataType": "array<string>",
          "required": false,
          "description": "A list of other names that this Threat Actor is believed to use."
        },
        {
          "name": "roles",
          "dataType": "array<string>",
          "required": false,
          "description": "This is a list of roles the Threat Actor plays. Open Vocab - threat-actor-role-ov",
          "vocabulary": {
            "kind": "open",
            "name": "threat-actor-role-ov",
            "values": [
              "agent",
              "director",
              "independent",
              "sponsor",
              "infrastructure-operator",
              "infrastructure-architect",
              "malware-author"
            ]
          }
        },
        {
          "name": "goals",
          "dataType": "array<string>",
          "required": false,
          "description": "The high level goals of this Threat Actor, namely, what are they trying to do."
        },
        {
          "name": "first_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this Threat Actor was first seen."
        },
        {
          "name": "last_seen",
          "dataType": "string",
          "required": false,
          "description": "The time that this Threat Actor was last seen."
        },
        {
          "name": "sophistication",
          "dataType": "string",
          "required": false,
          "description": "The skill, specific knowledge, special training, or expertise a Threat Actor must have to perform the attack. Open Vocab - threat-actor-sophistication-ov",
          "vocabulary": {
            "kind": "open",
            "name": "threat-actor-sophistication-ov",
            "values": [
              "none",
              "minimal",
              "intermediate",
              "advanced",
              "strategic",
              "expert",
              "innovator"
            ]
          }
        },
        {
          "name": "resource_level",
          "dataType": "string",
          "required": false,
          "description": "This defines the organizational level at which this Threat Actor typically works. Open Vocab - attack-resource-level-ov",
          "vocabulary": {
            "kind": "open",
            "name": "attack-resource-level-ov",
            "values": [
              "individual",
              "club",
              "contest",
              "team",
              "organization",
              "government"
            ]
          }
        },
        {
          "name": "primary_motivation",
          "dataType": "string",
          "required": false,
          "description": "The primary reason, motivation, or purpose behind this Threat Actor. Open Vocab - attack-motivation-ov",
          "vocabulary": {
            "kind": "open",
            "name": "attack-motivation-ov",
            "values": [
              "accidental",
              "coercion",
              "dominance",
              "ideology",
              "notoriety",
              "organizational-gain",
              "personal-gain",
              "personal-satisfaction",
              "revenge",
              "unpredictable"
            ]
          }
        },
        {
          "name": "secondary_motivations",
          "dataType": "array<string>",
          "required": false,
          "description": "The secondary reasons, motivations, or purposes behind this Threat Actor. Open Vocab - attack-motivation-ov",
          "vocabulary": {
            "kind": "open",
            "name": "attack-motivation-ov",
            "values": [
              "accidental",
              "coercion",
              "dominance",
              "ideology",
              "notoriety",
              "organizational-gain",
              "personal-gain",
              "personal-satisfaction",
              "revenge",
              "unpredictable"
            ]
          }
        },
        {
          "name": "personal_motivations",
          "dataType": "array<string>",
          "required": false,
          "description": "The personal reasons, motivations, or purposes of the Threat Actor regardless of organizational goals. Open Vocab - attack-motivation-ov",
          "vocabulary": {
            "kind": "open",
            "name": "attack-motivation-ov",
            "values": [
              "accidental",
              "coercion",
              "dominance",
              "ideology",
              "notoriety",
              "organizational-gain",
              "personal-gain",
              "personal-satisfaction",
              "revenge",
              "unpredictable"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.17",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/threat-actor.json"
    },
    {
      "type": "tool",
      "title": "Tool",
      "family": "sdo",
      "description": "Tools are legitimate software that can be used by threat actors to perform attacks.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `tool`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "aliases",
          "dataType": "array<string>",
          "required": false,
          "description": "Alternative names used to identify this Tool."
        },
        {
          "name": "tool_types",
          "dataType": "array<string>",
          "required": false,
          "description": "The kind(s) of tool(s) being described. Open Vocab - tool-type-ov",
          "vocabulary": {
            "kind": "open",
            "name": "tool-type-ov",
            "values": [
              "denial-of-service",
              "exploitation",
              "information-gathering",
              "network-capture",
              "credential-exploitation",
              "remote-access",
              "vulnerability-scanning",
              "unknown"
            ]
          }
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Tool."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "Provides more context and details about the Tool object."
        },
        {
          "name": "tool_version",
          "dataType": "string",
          "required": false,
          "description": "The version identifier associated with the tool."
        },
        {
          "name": "kill_chain_phases",
          "dataType": "array<object>",
          "required": false,
          "description": "The list of kill chain phases for which this Tool instance can be used.",
          "children": [
            {
              "name": "kill_chain_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the kill chain."
            },
            {
              "name": "phase_name",
              "dataType": "string",
              "required": true,
              "description": "The name of the phase in the kill chain."
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.18",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/tool.json"
    },
    {
      "type": "vulnerability",
      "title": "Vulnerability",
      "family": "sdo",
      "description": "A Vulnerability is a mistake in software that can be directly used by a hacker to gain access to a system or network.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `vulnerability`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the Vulnerability."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about the Vulnerability."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §4.19",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sdos/vulnerability.json"
    },
    {
      "type": "relationship",
      "title": "Relationship",
      "family": "sro",
      "description": "The Relationship object is used to link together two SDOs in order to describe how they are related to each other.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `relationship`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "relationship_type",
          "dataType": "string",
          "required": true,
          "description": "The name used to identify the type of relationship."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that helps provide context about the relationship."
        },
        {
          "name": "source_ref",
          "dataType": "string",
          "required": true,
          "description": "The ID of the source (from) object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "target_ref",
          "dataType": "string",
          "required": true,
          "description": "The ID of the target (to) object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "start_time",
          "dataType": "string",
          "required": false,
          "description": "This optional timestamp represents the earliest time at which the Relationship between the objects exists. If this property is a future timestamp, at the time the updated property is defined, then this represents an estimate by the producer of the intelligence of the earliest time at which relationship will be asserted to be true."
        },
        {
          "name": "stop_time",
          "dataType": "string",
          "required": false,
          "description": "The latest time at which the Relationship between the objects exists. If this property is a future timestamp, at the time the updated property is defined, then this represents an estimate by the producer of the intelligence of the latest time at which relationship will be asserted to be true."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §5.1",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sros/relationship.json"
    },
    {
      "type": "sighting",
      "title": "Sighting",
      "family": "sro",
      "description": "A Sighting denotes the belief that something in CTI (e.g., an indicator, malware, tool, threat actor, etc.) was seen.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `sighting`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A description that provides more details and context about the Sighting."
        },
        {
          "name": "first_seen",
          "dataType": "string",
          "required": false,
          "description": "The beginning of the time window during which the SDO referenced by the sighting_of_ref property was sighted."
        },
        {
          "name": "last_seen",
          "dataType": "string",
          "required": false,
          "description": "The end of the time window during which the SDO referenced by the sighting_of_ref property was sighted."
        },
        {
          "name": "count",
          "dataType": "integer",
          "required": false,
          "description": "This is an integer between 0 and 999,999,999 inclusive and represents the number of times the object was sighted."
        },
        {
          "name": "sighting_of_ref",
          "dataType": "string",
          "required": true,
          "description": "An ID reference to the object that has been sighted.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "observed_data_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "A list of ID references to the Observed Data objects that contain the raw cyber data for this Sighting.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "where_sighted_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "A list of ID references to the Identity or Location objects describing the entities or types of entities that saw the sighting.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "summary",
          "dataType": "boolean",
          "required": false,
          "description": "The summary property indicates whether the Sighting should be considered summary data. "
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §5.2",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/sros/sighting.json"
    },
    {
      "type": "artifact",
      "title": "Artifact",
      "family": "sco",
      "description": "The Artifact Object permits capturing an array of bytes (8-bits), as a base64-encoded string string, or linking to a file-like payload.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `artifact`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "mime_type",
          "dataType": "string",
          "required": false,
          "description": "The value of this property MUST be a valid MIME type as specified in the IANA Media Types registry."
        },
        {
          "name": "payload_bin",
          "dataType": "string",
          "required": false,
          "description": "Specifies the binary data contained in the artifact as a base64-encoded string."
        },
        {
          "name": "url",
          "dataType": "string",
          "required": false,
          "description": "The value of this property MUST be a valid URL that resolves to the unencoded content."
        },
        {
          "name": "hashes",
          "dataType": "object",
          "required": false,
          "description": "Specifies a dictionary of hashes for the contents of the url or the payload_bin.  This MUST be provided when the url property is present."
        },
        {
          "name": "encryption_algorithm",
          "dataType": "string",
          "required": false,
          "description": "If the artifact is encrypted, specifies the type of encryption algorithm the binary data  (either via payload_bin or url) is encoded in."
        },
        {
          "name": "decryption_key",
          "dataType": "string",
          "required": false,
          "description": "Specifies the decryption key for the encrypted binary data (either via payload_bin or url)."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.1",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/artifact.json",
      "idContributingProperties": [
        "hashes",
        "payload_bin"
      ]
    },
    {
      "type": "autonomous-system",
      "title": "Autonomous System",
      "family": "sco",
      "description": "The AS object represents the properties of an Autonomous Systems (AS).",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `autonomous-system`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "number",
          "dataType": "integer",
          "required": true,
          "description": "Specifies the number assigned to the AS. Such assignments are typically performed by a Regional Internet Registries (RIR)."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the AS."
        },
        {
          "name": "rir",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the Regional Internet Registry (RIR) that assigned the number to the AS."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.2",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/autonomous-system.json",
      "idContributingProperties": [
        "number"
      ]
    },
    {
      "type": "directory",
      "title": "Directory",
      "family": "sco",
      "description": "The Directory Object represents the properties common to a file system directory.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `directory`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "path",
          "dataType": "string",
          "required": true,
          "description": "Specifies the path, as originally observed, to the directory on the file system."
        },
        {
          "name": "path_enc",
          "dataType": "string",
          "required": false,
          "description": "Specifies the observed encoding for the path."
        },
        {
          "name": "ctime",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the directory was created."
        },
        {
          "name": "mtime",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the directory was last written to/modified."
        },
        {
          "name": "atime",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the directory was last accessed."
        },
        {
          "name": "contains_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a list of references to other File and/or Directory Objects contained within the directory.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.3",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/directory.json",
      "idContributingProperties": [
        "path"
      ]
    },
    {
      "type": "domain-name",
      "title": "Domain Name",
      "family": "sco",
      "description": "The Domain Name represents the properties of a network domain name.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `domain-name`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "value",
          "dataType": "string",
          "required": true,
          "description": "Specifies the value of the domain name."
        },
        {
          "name": "resolves_to_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a list of references to one or more IP addresses or domain names that the domain name resolves to.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.4",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/domain-name.json",
      "idContributingProperties": [
        "value"
      ]
    },
    {
      "type": "email-addr",
      "title": "Email Address",
      "family": "sco",
      "description": "The Email Address Object represents a single email address.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `email-addr`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "value",
          "dataType": "string",
          "required": true,
          "description": "Specifies a single email address. This MUST not include the display name."
        },
        {
          "name": "display_name",
          "dataType": "string",
          "required": false,
          "description": "Specifies a single email display name, i.e., the name that is displayed to the human user of a mail application."
        },
        {
          "name": "belongs_to_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the user account that the email address belongs to, as a reference to a User Account Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.5",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/email-addr.json",
      "idContributingProperties": [
        "value"
      ]
    },
    {
      "type": "email-message",
      "title": "Email Message",
      "family": "sco",
      "description": "The Email Message Object represents an instance of an email message.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `email-message`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "date",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time that the email message was sent."
        },
        {
          "name": "content_type",
          "dataType": "string",
          "required": false,
          "description": "Specifies the value of the 'Content-Type' header of the email message."
        },
        {
          "name": "from_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the value of the 'From:' header of the email message.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "sender_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the value of the 'From' field of the email message.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "to_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the mailboxes that are 'To:' recipients of the email message.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "cc_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the mailboxes that are 'CC:' recipients of the email message.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "bcc_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the mailboxes that are 'BCC:' recipients of the email message.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "message_id",
          "dataType": "string",
          "required": false,
          "description": "Specifies the Message-ID field of the email message."
        },
        {
          "name": "subject",
          "dataType": "string",
          "required": false,
          "description": "Specifies the subject of the email message."
        },
        {
          "name": "received_lines",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies one or more Received header fields that may be included in the email headers."
        },
        {
          "name": "additional_header_fields",
          "dataType": "object",
          "required": false,
          "description": "Specifies any other header fields found in the email message, as a dictionary."
        },
        {
          "name": "raw_email_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the raw binary contents of the email message, including both the headers and body, as a reference to an Artifact Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "is_multipart",
          "dataType": "boolean",
          "required": false,
          "description": "Indicates whether the email body contains multiple MIME parts.",
          "vocabulary": {
            "kind": "closed",
            "name": "is_multipart-enum",
            "values": []
          }
        },
        {
          "name": "body",
          "dataType": "string",
          "required": false,
          "description": "Specifies a string containing the email body. This field MAY only be used if is_multipart is false."
        },
        {
          "name": "body_multipart",
          "dataType": "array<object>",
          "required": false,
          "description": "Specifies a list of the MIME parts that make up the email body. This property MAY only be used if is_multipart is true.",
          "children": [
            {
              "name": "body",
              "dataType": "string",
              "required": false,
              "description": "Specifies the contents of the MIME part if the content_type is not provided OR starts with text/"
            },
            {
              "name": "body_raw_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the contents of non-textual MIME parts, that is those whose content_type does not start with text/, as a reference to an Artifact Object or File Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "content_type",
              "dataType": "string",
              "required": false,
              "description": "Specifies the value of the 'Content-Type' header field of the MIME part."
            },
            {
              "name": "content_disposition",
              "dataType": "string",
              "required": false,
              "description": "Specifies the value of the 'Content-Disposition' header field of the MIME part."
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.6",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/email-message.json",
      "idContributingProperties": [
        "from_ref",
        "subject",
        "body"
      ]
    },
    {
      "type": "file",
      "title": "File",
      "family": "sco",
      "description": "The File Object represents the properties of a file.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `file`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "The File Object defines the following extensions. In addition to these, producers MAY create their own. Extensions: ntfs-ext, raster-image-ext, pdf-ext, archive-ext, windows-pebinary-ext"
        },
        {
          "name": "hashes",
          "dataType": "object",
          "required": false,
          "description": "Specifies a dictionary of hashes for the file."
        },
        {
          "name": "size",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the size of the file, in bytes, as a non-negative integer."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the file."
        },
        {
          "name": "name_enc",
          "dataType": "string",
          "required": false,
          "description": "Specifies the observed encoding for the name of the file."
        },
        {
          "name": "magic_number_hex",
          "dataType": "string",
          "required": false,
          "description": "Specifies the hexadecimal constant ('magic number') associated with a specific file format that corresponds to the file, if applicable."
        },
        {
          "name": "mime_type",
          "dataType": "string",
          "required": false,
          "description": "Specifies the MIME type name specified for the file, e.g., 'application/msword'."
        },
        {
          "name": "ctime",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the file was created."
        },
        {
          "name": "mtime",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the file was last written to/modified."
        },
        {
          "name": "atime",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the file was last accessed."
        },
        {
          "name": "parent_directory_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the parent directory of the file, as a reference to a Directory Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "contains_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a list of references to other Observable Objects contained within the file.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "content_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the content of the file, represented as an Artifact Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.7",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/file.json",
      "idContributingProperties": [
        "hashes",
        "name",
        "extensions",
        "parent_directory_ref"
      ]
    },
    {
      "type": "ipv4-addr",
      "title": "IPv4 Address",
      "family": "sco",
      "description": "The IPv4 Address Object represents one or more IPv4 addresses expressed using CIDR notation.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `ipv4-addr`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "value",
          "dataType": "string",
          "required": true,
          "description": "Specifies one or more IPv4 addresses expressed using CIDR notation."
        },
        {
          "name": "resolves_to_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a list of references to one or more Layer 2 Media Access Control (MAC) addresses that the IPv4 address resolves to.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "belongs_to_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a reference to one or more autonomous systems (AS) that the IPv4 address belongs to.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.8",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/ipv4-addr.json",
      "idContributingProperties": [
        "value"
      ]
    },
    {
      "type": "ipv6-addr",
      "title": "IPv6 Address",
      "family": "sco",
      "description": "The IPv6 Address Object represents one or more IPv6 addresses expressed using CIDR notation.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `ipv6-addr`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "value",
          "dataType": "string",
          "required": true,
          "description": "Specifies one or more IPv6 addresses expressed using CIDR notation."
        },
        {
          "name": "resolves_to_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a list of references to one or more Layer 2 Media Access Control (MAC) addresses that the IPv6 address resolves to.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "belongs_to_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a reference to one or more autonomous systems (AS) that the IPv6 address belongs to.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.9",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/ipv6-addr.json",
      "idContributingProperties": [
        "value"
      ]
    },
    {
      "type": "mac-addr",
      "title": "MAC Address",
      "family": "sco",
      "description": "The MAC Address Object represents a single Media Access Control (MAC) address.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `mac-addr`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "value",
          "dataType": "string",
          "required": true,
          "description": "Specifies one or more mac addresses expressed using CIDR notation."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.10",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/mac-addr.json",
      "idContributingProperties": [
        "value"
      ]
    },
    {
      "type": "mutex",
      "title": "Mutex",
      "family": "sco",
      "description": "The Mutex Object represents the properties of a mutual exclusion (mutex) object.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `mutex`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "Specifies the name of the mutex object."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.11",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/mutex.json",
      "idContributingProperties": [
        "name"
      ]
    },
    {
      "type": "network-traffic",
      "title": "Network Traffic",
      "family": "sco",
      "description": "The Network Traffic Object represents arbitrary network traffic that originates from a source and is addressed to a destination.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `network-traffic`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "The Network Traffic Object defines the following extensions. In addition to these, producers MAY create their own. Extensions: http-ext, tcp-ext, icmp-ext, socket-ext"
        },
        {
          "name": "start",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the network traffic was initiated, if known."
        },
        {
          "name": "end",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time the network traffic ended, if known."
        },
        {
          "name": "src_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the source of the network traffic, as a reference to an Observable Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "dst_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the destination of the network traffic, as a reference to an Observable Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "src_port",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the source port used in the network traffic, as an integer. The port value MUST be in the range of 0 - 65535."
        },
        {
          "name": "dst_port",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the destination port used in the network traffic, as an integer. The port value MUST be in the range of 0 - 65535."
        },
        {
          "name": "protocols",
          "dataType": "array<string>",
          "required": true,
          "description": "Specifies the protocols observed in the network traffic, along with their corresponding state."
        },
        {
          "name": "src_byte_count",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the number of bytes sent from the source to the destination."
        },
        {
          "name": "dst_byte_count",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the number of bytes sent from the destination to the source."
        },
        {
          "name": "src_packets",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the number of packets sent from the source to the destination."
        },
        {
          "name": "dst_packets",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the number of packets sent destination to the source."
        },
        {
          "name": "ipfix",
          "dataType": "object",
          "required": false,
          "description": "Specifies any IP Flow Information Export (IPFIX) data for the traffic."
        },
        {
          "name": "src_payload_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the bytes sent from the source to the destination.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "dst_payload_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the bytes sent from the source to the destination.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "encapsulates_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Links to other network-traffic objects encapsulated by a network-traffic.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "encapsulated_by_ref",
          "dataType": "string",
          "required": false,
          "description": "Links to another network-traffic object which encapsulates this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "is_active",
          "dataType": "boolean",
          "required": false,
          "description": "Indicates whether the network traffic is still ongoing.",
          "vocabulary": {
            "kind": "closed",
            "name": "is_active-enum",
            "values": []
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.12",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/network-traffic.json",
      "idContributingProperties": [
        "start",
        "end",
        "src_ref",
        "dst_ref",
        "src_port",
        "dst_port",
        "protocols",
        "extensions"
      ]
    },
    {
      "type": "process",
      "title": "Process",
      "family": "sco",
      "description": "The Process Object represents common properties of an instance of a computer program as executed on an operating system.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `process`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "The Process Object defines the following extensions. In addition to these, producers MAY create their own. Extensions: windows-process-ext, windows-service-ext."
        },
        {
          "name": "is_hidden",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies whether the process is hidden."
        },
        {
          "name": "pid",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the Process ID, or PID, of the process."
        },
        {
          "name": "created_time",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date/time at which the process was created."
        },
        {
          "name": "cwd",
          "dataType": "string",
          "required": false,
          "description": "Specifies the current working directory of the process."
        },
        {
          "name": "command_line",
          "dataType": "string",
          "required": false,
          "description": "Specifies the full command line used in executing the process, including the process name (which may be specified individually via the binary_ref.name property) and any arguments."
        },
        {
          "name": "environment_variables",
          "dataType": "object",
          "required": false,
          "description": "Specifies the list of environment variables associated with the process as a dictionary."
        },
        {
          "name": "opened_connection_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the list of network connections opened by the process, as a reference to one or more Network Traffic Objects.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "creator_user_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the user that created the process, as a reference to a User Account Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "image_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the executable binary that was executed as the process image, as a reference to a File Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "parent_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the other process that spawned (i.e. is the parent of) this one, as represented by a Process Object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "child_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the other processes that were spawned by (i.e. children of) this process, as a reference to one or more other Process Objects.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.13",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/process.json",
      "idContributingProperties": []
    },
    {
      "type": "software",
      "title": "Software",
      "family": "sco",
      "description": "The Software Object represents high-level properties associated with software, including software products.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `software`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "Specifies the name of the software."
        },
        {
          "name": "cpe",
          "dataType": "string",
          "required": false,
          "description": "Specifies the Common Platform Enumeration (CPE) entry for the software, if available. The value for this property MUST be a CPE v2.3 entry from the official NVD CPE Dictionary."
        },
        {
          "name": "swid",
          "dataType": "string",
          "required": false,
          "description": "Specifies the Software Identification (SWID) Tags entry for the software, if available."
        },
        {
          "name": "languages",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the languages supported by the software. The value of each list member MUST be an RFC 5646 language code. ISO 639-2 codes are accepted for backward compatibility."
        },
        {
          "name": "vendor",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the vendor of the software."
        },
        {
          "name": "version",
          "dataType": "string",
          "required": false,
          "description": "Specifies the version of the software."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.14",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/software.json",
      "idContributingProperties": [
        "name",
        "cpe",
        "swid",
        "vendor",
        "version"
      ]
    },
    {
      "type": "url",
      "title": "URL",
      "family": "sco",
      "description": "The URL Object represents the properties of a uniform resource locator (URL).",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `url`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "value",
          "dataType": "string",
          "required": true,
          "description": "Specifies the value of the URL."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.15",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/url.json",
      "idContributingProperties": [
        "value"
      ]
    },
    {
      "type": "user-account",
      "title": "User Account",
      "family": "sco",
      "description": "The User Account Object represents an instance of any type of user account, including but not limited to operating system, device, messaging service, and social media platform accounts.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `user-account`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "The User Account Object defines the following extensions. In addition to these, producers MAY create their own. Extensions: unix-account-ext."
        },
        {
          "name": "user_id",
          "dataType": "string",
          "required": false,
          "description": "Specifies the identifier of the account."
        },
        {
          "name": "credential",
          "dataType": "string",
          "required": false,
          "description": "Specifies a cleartext credential. This is only intended to be used in capturing metadata from malware analysis (e.g., a hard-coded domain administrator password that the malware attempts to use for lateral movement) and SHOULD NOT be used for sharing of PII."
        },
        {
          "name": "account_login",
          "dataType": "string",
          "required": false,
          "description": "Specifies the account login string, used in cases where the user_id property specifies something other than what a user would type when they login."
        },
        {
          "name": "account_type",
          "dataType": "string",
          "required": false,
          "description": "Specifies the type of the account. This is an open vocabulary and values SHOULD come from the account-type-ov vocabulary."
        },
        {
          "name": "display_name",
          "dataType": "string",
          "required": false,
          "description": "Specifies the display name of the account, to be shown in user interfaces, if applicable."
        },
        {
          "name": "is_service_account",
          "dataType": "boolean",
          "required": false,
          "description": "Indicates that the account is associated with a network service or system process (daemon), not a specific individual."
        },
        {
          "name": "is_privileged",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies that the account has elevated privileges (i.e., in the case of root on Unix or the Windows Administrator account)."
        },
        {
          "name": "can_escalate_privs",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies that the account has the ability to escalate privileges (i.e., in the case of sudo on Unix or a Windows Domain Admin account)."
        },
        {
          "name": "is_disabled",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies if the account is disabled."
        },
        {
          "name": "account_created",
          "dataType": "string",
          "required": false,
          "description": "Specifies when the account was created."
        },
        {
          "name": "account_expires",
          "dataType": "string",
          "required": false,
          "description": "Specifies the expiration date of the account."
        },
        {
          "name": "credential_last_changed",
          "dataType": "string",
          "required": false,
          "description": "Specifies when the account credential was last changed."
        },
        {
          "name": "account_first_login",
          "dataType": "string",
          "required": false,
          "description": "Specifies when the account was first accessed."
        },
        {
          "name": "account_last_login",
          "dataType": "string",
          "required": false,
          "description": "Specifies when the account was last accessed."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.16",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/user-account.json",
      "idContributingProperties": [
        "account_type",
        "user_id",
        "account_login"
      ]
    },
    {
      "type": "windows-registry-key",
      "title": "Windows Registry Key",
      "family": "sco",
      "description": "The Registry Key Object represents the properties of a Windows registry key.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `windows-registry-key`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "key",
          "dataType": "string",
          "required": false,
          "description": "Specifies the full registry key including the hive."
        },
        {
          "name": "values",
          "dataType": "array<object>",
          "required": false,
          "description": "Specifies the values found under the registry key.",
          "children": [
            {
              "name": "name",
              "dataType": "string",
              "required": false,
              "description": "Specifies the name of the registry value. For specifying the default value in a registry key, an empty string MUST be used."
            },
            {
              "name": "data",
              "dataType": "string",
              "required": false,
              "description": "Specifies the data contained in the registry value."
            },
            {
              "name": "data_type",
              "dataType": "string",
              "required": false,
              "description": "Specifies the registry (REG_*) data type used in the registry value.",
              "vocabulary": {
                "kind": "closed",
                "name": "data_type-enum",
                "values": [
                  "REG_NONE",
                  "REG_SZ",
                  "REG_EXPAND_SZ",
                  "REG_BINARY",
                  "REG_DWORD",
                  "REG_DWORD_BIG_ENDIAN",
                  "REG_DWORD_LITTLE_ENDIAN",
                  "REG_LINK",
                  "REG_MULTI_SZ",
                  "REG_RESOURCE_LIST",
                  "REG_FULL_RESOURCE_DESCRIPTION",
                  "REG_RESOURCE_REQUIREMENTS_LIST",
                  "REG_QWORD",
                  "REG_INVALID_TYPE"
                ]
              }
            }
          ]
        },
        {
          "name": "modified_time",
          "dataType": "string",
          "required": false,
          "description": "Specifies the last date/time that the registry key was modified."
        },
        {
          "name": "creator_user_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies a reference to a user account, represented as a User Account Object, that created the registry key.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "number_of_subkeys",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the number of subkeys contained under the registry key."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.17",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/windows-registry-key.json",
      "idContributingProperties": [
        "key",
        "values"
      ]
    },
    {
      "type": "x509-certificate",
      "title": "X.509 Certificate",
      "family": "sco",
      "description": "The X509 Certificate Object represents the properties of an X.509 certificate.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The value of this property MUST be `x509-certificate`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "defanged",
          "dataType": "boolean",
          "required": false,
          "description": "Defines whether or not the data contained within the object has been defanged."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "Specifies the identifier of the observable object, as a string."
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "is_self_signed",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies whether the certificate is self-signed, i.e., whether it is signed by the same entity whose identity it certifies."
        },
        {
          "name": "hashes",
          "dataType": "object",
          "required": false,
          "description": "Specifies any hashes that were calculated for the entire contents of the certificate."
        },
        {
          "name": "version",
          "dataType": "string",
          "required": false,
          "description": "Specifies the version of the encoded certificate."
        },
        {
          "name": "serial_number",
          "dataType": "string",
          "required": false,
          "description": "Specifies the unique identifier for the certificate, as issued by a specific Certificate Authority."
        },
        {
          "name": "signature_algorithm",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the algorithm used to sign the certificate."
        },
        {
          "name": "issuer",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the Certificate Authority that issued the certificate."
        },
        {
          "name": "validity_not_before",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date on which the certificate validity period begins."
        },
        {
          "name": "validity_not_after",
          "dataType": "string",
          "required": false,
          "description": "Specifies the date on which the certificate validity period ends."
        },
        {
          "name": "subject",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the entity associated with the public key stored in the subject public key field of the certificate."
        },
        {
          "name": "subject_public_key_algorithm",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the algorithm with which to encrypt data being sent to the subject."
        },
        {
          "name": "subject_public_key_modulus",
          "dataType": "string",
          "required": false,
          "description": "Specifies the modulus portion of the subject’s public RSA key."
        },
        {
          "name": "subject_public_key_exponent",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the exponent portion of the subject’s public RSA key, as an integer."
        },
        {
          "name": "x509_v3_extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any standard X.509 v3 extensions that may be used in the certificate.",
          "children": [
            {
              "name": "basic_constraints",
              "dataType": "string",
              "required": false,
              "description": "Specifies a multi-valued extension which indicates whether a certificate is a CA certificate."
            },
            {
              "name": "name_constraints",
              "dataType": "string",
              "required": false,
              "description": "Specifies a namespace within which all subject names in subsequent certificates in a certification path MUST be located."
            },
            {
              "name": "policy_constraints",
              "dataType": "string",
              "required": false,
              "description": "Specifies any constraints on path validation for certificates issued to CAs."
            },
            {
              "name": "key_usage",
              "dataType": "string",
              "required": false,
              "description": "Specifies a multi-valued extension consisting of a list of names of the permitted key usages."
            },
            {
              "name": "extended_key_usage",
              "dataType": "string",
              "required": false,
              "description": "Specifies a list of usages indicating purposes for which the certificate public key can be used for."
            },
            {
              "name": "subject_key_identifier",
              "dataType": "string",
              "required": false,
              "description": "Specifies the identifier that provides a means of identifying certificates that contain a particular public key."
            },
            {
              "name": "authority_key_identifier",
              "dataType": "string",
              "required": false,
              "description": "Specifies the identifier that provides a means of identifying the public key corresponding to the private key used to sign a certificate."
            },
            {
              "name": "subject_alternative_name",
              "dataType": "string",
              "required": false,
              "description": "Specifies the additional identities to be bound to the subject of the certificate."
            },
            {
              "name": "issuer_alternative_name",
              "dataType": "string",
              "required": false,
              "description": "Specifies the additional identities to be bound to the issuer of the certificate."
            },
            {
              "name": "subject_directory_attributes",
              "dataType": "string",
              "required": false,
              "description": "Specifies the identification attributes (e.g., nationality) of the subject."
            },
            {
              "name": "crl_distribution_points",
              "dataType": "string",
              "required": false,
              "description": "Specifies how CRL information is obtained."
            },
            {
              "name": "inhibit_any_policy",
              "dataType": "string",
              "required": false,
              "description": "Specifies the number of additional certificates that may appear in the path before anyPolicy is no longer permitted."
            },
            {
              "name": "private_key_usage_period_not_before",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date on which the validity period begins for the private key, if it is different from the validity period of the certificate."
            },
            {
              "name": "private_key_usage_period_not_after",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date on which the validity period ends for the private key, if it is different from the validity period of the certificate."
            },
            {
              "name": "certificate_policies",
              "dataType": "string",
              "required": false,
              "description": "Specifies a sequence of one or more policy information terms, each of which consists of an object identifier (OID) and optional qualifiers."
            },
            {
              "name": "policy_mappings",
              "dataType": "string",
              "required": false,
              "description": "Specifies one or more pairs of OIDs; each pair includes an issuerDomainPolicy and a subjectDomainPolicy"
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.18",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/x509-certificate.json",
      "idContributingProperties": [
        "hashes",
        "serial_number"
      ]
    },
    {
      "type": "language-content",
      "title": "Language Content",
      "family": "smo",
      "description": "The language-content object represents text content for STIX Objects represented in languages other than that of the original object.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `language-content`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "object_ref",
          "dataType": "string",
          "required": true,
          "description": "Identifies the object that this Language Content applies to.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "object_modified",
          "dataType": "string",
          "required": false,
          "description": "Identifies the modified time of the object that this Language Content applies to."
        },
        {
          "name": "contents",
          "dataType": "object",
          "required": true,
          "description": "Contains the actual Language Content (translation)."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §7.1",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/common/language-content.json"
    },
    {
      "type": "marking-definition",
      "title": "Marking Definition",
      "family": "smo",
      "description": "The marking-definition object represents a specific marking.",
      "fields": [
        {
          "name": "definition_type",
          "dataType": "string",
          "required": false,
          "description": "The definition_type property identifies the type of Marking Definition.",
          "vocabulary": {
            "kind": "closed",
            "name": "definition_type-enum",
            "values": [
              "tlp"
            ]
          }
        },
        {
          "name": "definition",
          "dataType": "object",
          "required": false,
          "description": "The marking object itself.",
          "children": [
            {
              "name": "statement",
              "dataType": "string",
              "required": true,
              "description": "A statement (e.g., copyright, terms of use) applied to the content marked by this marking definition."
            },
            {
              "name": "tlp",
              "dataType": "string",
              "required": false,
              "vocabulary": {
                "kind": "closed",
                "name": "tlp-enum",
                "values": [
                  "red"
                ]
              }
            }
          ]
        },
        {
          "name": "id",
          "dataType": "string",
          "required": false,
          "description": "The unique identifier for this TLP Marking Definition.",
          "vocabulary": {
            "kind": "closed",
            "name": "id-enum",
            "values": [
              "marking-definition--5e57c739-391a-4eb3-b6be-7d15ca92d5ed"
            ]
          }
        },
        {
          "name": "name",
          "dataType": "string",
          "required": false,
          "description": "A name used to identify the Marking Definition.",
          "vocabulary": {
            "kind": "closed",
            "name": "name-enum",
            "values": [
              "TLP:RED"
            ]
          }
        },
        {
          "name": "type",
          "dataType": "string",
          "required": false,
          "description": "The type of this object, which MUST be the literal `marking-definition`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": false,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "created",
          "dataType": "string",
          "required": false,
          "description": "The created property represents the time at which the first version of this Marking Definition object was created.",
          "vocabulary": {
            "kind": "closed",
            "name": "created-enum",
            "values": [
              "2017-01-20T00:00:00.000Z"
            ]
          }
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The created_by_ref property specifies the ID of the identity object that describes the entity that created this Marking Definition.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The object_marking_refs property specifies a list of IDs of marking-definition objects that apply to this Marking Definition.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The granular_markings property specifies a list of granular markings applied to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §7.2.1",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/common/marking-definition.json"
    },
    {
      "type": "extension-definition",
      "title": "Extension Definition",
      "family": "smo",
      "description": "The STIX Extension Definition object allows producers of threat intelligence to extend existing STIX objects or to create entirely new STIX objects in a standardized way.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `extension-definition`."
        },
        {
          "name": "spec_version",
          "dataType": "string",
          "required": true,
          "description": "The version of the STIX specification used to represent this object.",
          "vocabulary": {
            "kind": "closed",
            "name": "spec-version",
            "values": [
              "2.1"
            ]
          }
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true,
          "description": "The id property universally and uniquely identifies this object."
        },
        {
          "name": "created_by_ref",
          "dataType": "string",
          "required": false,
          "description": "The ID of the Source object that describes who created this object.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "labels",
          "dataType": "array<string>",
          "required": false,
          "description": "The labels property specifies a set of terms used to describe this object."
        },
        {
          "name": "created",
          "dataType": "string",
          "required": true,
          "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "modified",
          "dataType": "string",
          "required": true,
          "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
        },
        {
          "name": "revoked",
          "dataType": "boolean",
          "required": false,
          "description": "The revoked property indicates whether the object has been revoked."
        },
        {
          "name": "confidence",
          "dataType": "integer",
          "required": false,
          "description": "Identifies the confidence that the creator has in the correctness of their data."
        },
        {
          "name": "lang",
          "dataType": "string",
          "required": false,
          "description": "Identifies the language of the text content in this object."
        },
        {
          "name": "external_references",
          "dataType": "array<object>",
          "required": false,
          "description": "A list of external references which refers to non-STIX information.",
          "children": [
            {
              "name": "source_name",
              "dataType": "string",
              "required": false,
              "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
            },
            {
              "name": "external_id",
              "dataType": "string",
              "required": false,
              "description": "An identifier for the external reference content."
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A human readable description"
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "A URL reference to an external resource."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the file."
            }
          ]
        },
        {
          "name": "object_marking_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of marking-definition objects to be applied to this object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "granular_markings",
          "dataType": "array<object>",
          "required": false,
          "description": "The set of granular markings that apply to this object.",
          "children": [
            {
              "name": "selectors",
              "dataType": "array<string>",
              "required": true,
              "description": "A list of selectors for content contained within the STIX object in which this property appears."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text identified by this marking."
            },
            {
              "name": "marking_ref",
              "dataType": "string",
              "required": true,
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            }
          ]
        },
        {
          "name": "extensions",
          "dataType": "object",
          "required": false,
          "description": "Specifies any extensions of the object, as a dictionary."
        },
        {
          "name": "name",
          "dataType": "string",
          "required": true,
          "description": "A name used for display purposes during execution, development, or debugging."
        },
        {
          "name": "description",
          "dataType": "string",
          "required": false,
          "description": "A detailed explanation of what data the extension conveys and how it is intended to be used."
        },
        {
          "name": "schema",
          "dataType": "string",
          "required": true,
          "description": "The normative definition of the extension, either as a URL or as plain text explaining the definition."
        },
        {
          "name": "version",
          "dataType": "string",
          "required": true,
          "description": "The version of this extension."
        },
        {
          "name": "extension_types",
          "dataType": "array<string>",
          "required": true,
          "description": "Which extension types are contained within this extension."
        },
        {
          "name": "extension_properties",
          "dataType": "array<string>",
          "required": false,
          "description": "The list of new property names that are added to an object by this extension"
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §7.3",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/common/extension-definition.json"
    },
    {
      "type": "bundle",
      "title": "Bundle",
      "family": "bundle",
      "description": "A Bundle is a collection of arbitrary STIX Objects and Marking Definitions grouped together in a single container.",
      "fields": [
        {
          "name": "type",
          "dataType": "string",
          "required": true,
          "description": "The type of this object, which MUST be the literal `bundle`."
        },
        {
          "name": "id",
          "dataType": "string",
          "required": true
        },
        {
          "name": "objects",
          "dataType": "array<object>",
          "required": false,
          "description": "Specifies a set of one or more STIX Objects.",
          "children": [
            {
              "name": "type",
              "dataType": "string",
              "required": false,
              "description": "The type of this object, which for custom objects cannot be one of those defined in the specification."
            },
            {
              "name": "spec_version",
              "dataType": "string",
              "required": false,
              "description": "The version of the STIX specification used to represent the content in this cyber-observable.",
              "vocabulary": {
                "kind": "closed",
                "name": "spec-version",
                "values": [
                  "2.1"
                ]
              }
            },
            {
              "name": "id",
              "dataType": "string",
              "required": false,
              "description": "Specifies the identifier of the observable object, as a string.",
              "vocabulary": {
                "kind": "closed",
                "name": "id-enum",
                "values": [
                  "marking-definition--5e57c739-391a-4eb3-b6be-7d15ca92d5ed"
                ]
              }
            },
            {
              "name": "created_by_ref",
              "dataType": "string",
              "required": false,
              "description": "The ID of the Source object that describes who created this object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "labels",
              "dataType": "array<string>",
              "required": false,
              "description": "The labels property specifies a set of terms used to describe this object."
            },
            {
              "name": "created",
              "dataType": "string",
              "required": false,
              "description": "The created property represents the time at which the first version of this object was created. The timstamp value MUST be precise to the nearest millisecond.",
              "vocabulary": {
                "kind": "closed",
                "name": "created-enum",
                "values": [
                  "2017-01-20T00:00:00.000Z"
                ]
              }
            },
            {
              "name": "modified",
              "dataType": "string",
              "required": false,
              "description": "The modified property represents the time that this particular version of the object was modified. The timstamp value MUST be precise to the nearest millisecond."
            },
            {
              "name": "revoked",
              "dataType": "boolean",
              "required": false,
              "description": "The revoked property indicates whether the object has been revoked."
            },
            {
              "name": "confidence",
              "dataType": "integer",
              "required": false,
              "description": "Identifies the confidence that the creator has in the correctness of their data."
            },
            {
              "name": "lang",
              "dataType": "string",
              "required": false,
              "description": "Identifies the language of the text content in this object."
            },
            {
              "name": "external_references",
              "dataType": "array<object>",
              "required": false,
              "description": "A list of external references which refers to non-STIX information.",
              "children": [
                {
                  "name": "source_name",
                  "dataType": "string",
                  "required": false,
                  "description": "The source within which the external-reference is defined (system, registry, organization, etc.)"
                },
                {
                  "name": "external_id",
                  "dataType": "string",
                  "required": false,
                  "description": "An identifier for the external reference content."
                },
                {
                  "name": "description",
                  "dataType": "string",
                  "required": false,
                  "description": "A human readable description"
                },
                {
                  "name": "url",
                  "dataType": "string",
                  "required": false,
                  "description": "A URL reference to an external resource."
                },
                {
                  "name": "hashes",
                  "dataType": "object",
                  "required": false,
                  "description": "Specifies a dictionary of hashes for the file."
                }
              ]
            },
            {
              "name": "object_marking_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "The list of marking-definition objects to be applied to this object.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "granular_markings",
              "dataType": "array<object>",
              "required": false,
              "description": "The set of granular markings that apply to this object.",
              "children": [
                {
                  "name": "selectors",
                  "dataType": "array<string>",
                  "required": true,
                  "description": "A list of selectors for content contained within the STIX object in which this property appears."
                },
                {
                  "name": "lang",
                  "dataType": "string",
                  "required": false,
                  "description": "Identifies the language of the text identified by this marking."
                },
                {
                  "name": "marking_ref",
                  "dataType": "string",
                  "required": true,
                  "reference": {
                    "cardinality": "one",
                    "targetTypes": [
                      "*"
                    ]
                  }
                }
              ]
            },
            {
              "name": "extensions",
              "dataType": "object",
              "required": false,
              "description": "Specifies any extensions of the object, as a dictionary."
            },
            {
              "name": "aliases",
              "dataType": "array<string>",
              "required": false,
              "description": "Alternative names used to identify this Tool."
            },
            {
              "name": "name",
              "dataType": "string",
              "required": false,
              "description": "A name used to identify the Marking Definition.",
              "vocabulary": {
                "kind": "closed",
                "name": "name-enum",
                "values": [
                  "TLP:RED"
                ]
              }
            },
            {
              "name": "description",
              "dataType": "string",
              "required": false,
              "description": "A description that provides more details and context about the Vulnerability."
            },
            {
              "name": "kill_chain_phases",
              "dataType": "array<object>",
              "required": false,
              "description": "The list of kill chain phases for which this Tool instance can be used.",
              "children": [
                {
                  "name": "kill_chain_name",
                  "dataType": "string",
                  "required": true,
                  "description": "The name of the kill chain."
                },
                {
                  "name": "phase_name",
                  "dataType": "string",
                  "required": true,
                  "description": "The name of the phase in the kill chain."
                }
              ]
            },
            {
              "name": "first_seen",
              "dataType": "string",
              "required": false,
              "description": "The time that this Threat Actor was first seen."
            },
            {
              "name": "last_seen",
              "dataType": "string",
              "required": false,
              "description": "The time that this Threat Actor was last seen."
            },
            {
              "name": "objective",
              "dataType": "string",
              "required": false,
              "description": "This field defines the Campaign’s primary goal, objective, desired outcome, or intended effect."
            },
            {
              "name": "roles",
              "dataType": "array<string>",
              "required": false,
              "description": "This is a list of roles the Threat Actor plays. Open Vocab - threat-actor-role-ov",
              "vocabulary": {
                "kind": "open",
                "name": "threat-actor-role-ov",
                "values": []
              }
            },
            {
              "name": "identity_class",
              "dataType": "string",
              "required": false,
              "description": "The type of entity that this Identity describes, e.g., an individual or organization. Open Vocab - identity-class-ov",
              "vocabulary": {
                "kind": "open",
                "name": "identity-class-ov",
                "values": []
              }
            },
            {
              "name": "sectors",
              "dataType": "array<string>",
              "required": false,
              "description": "The list of sectors that this Identity belongs to. Open Vocab - industry-sector-ov",
              "vocabulary": {
                "kind": "open",
                "name": "industry-sector-ov",
                "values": []
              }
            },
            {
              "name": "contact_information",
              "dataType": "string",
              "required": false,
              "description": "The contact information (e-mail, phone number, etc.) for this Identity."
            },
            {
              "name": "indicator_types",
              "dataType": "array<string>",
              "required": false,
              "description": "This field is an Open Vocabulary that specifies the type of indicator. Open vocab - indicator-type-ov",
              "vocabulary": {
                "kind": "open",
                "name": "indicator-type-ov",
                "values": []
              }
            },
            {
              "name": "pattern",
              "dataType": "string",
              "required": false,
              "description": "The detection pattern for this indicator."
            },
            {
              "name": "pattern_type",
              "dataType": "string",
              "required": false,
              "description": "The type of pattern used in this indicator."
            },
            {
              "name": "pattern_version",
              "dataType": "string",
              "required": false,
              "description": "The version of the pattern that is used."
            },
            {
              "name": "valid_from",
              "dataType": "string",
              "required": false,
              "description": "The time from which this indicator should be considered valuable intelligence."
            },
            {
              "name": "valid_until",
              "dataType": "string",
              "required": false,
              "description": "The time at which this indicator should no longer be considered valuable intelligence."
            },
            {
              "name": "infrastructure_types",
              "dataType": "array<string>",
              "required": false,
              "description": "This field is an Open Vocabulary that specifies the type of infrastructure. Open vocab - infrastructure-type-ov",
              "vocabulary": {
                "kind": "open",
                "name": "infrastructure-type-ov",
                "values": []
              }
            },
            {
              "name": "goals",
              "dataType": "array<string>",
              "required": false,
              "description": "The high level goals of this Threat Actor, namely, what are they trying to do."
            },
            {
              "name": "resource_level",
              "dataType": "string",
              "required": false,
              "description": "This defines the organizational level at which this Threat Actor typically works. Open Vocab - attack-resource-level-ov",
              "vocabulary": {
                "kind": "open",
                "name": "attack-resource-level-ov",
                "values": []
              }
            },
            {
              "name": "primary_motivation",
              "dataType": "string",
              "required": false,
              "description": "The primary reason, motivation, or purpose behind this Threat Actor. Open Vocab - attack-motivation-ov",
              "vocabulary": {
                "kind": "open",
                "name": "attack-motivation-ov",
                "values": []
              }
            },
            {
              "name": "secondary_motivations",
              "dataType": "array<string>",
              "required": false,
              "description": "The secondary reasons, motivations, or purposes behind this Threat Actor. Open Vocab - attack-motivation-ov",
              "vocabulary": {
                "kind": "open",
                "name": "attack-motivation-ov",
                "values": []
              }
            },
            {
              "name": "operating_system_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "The operating systems that the malware family or malware instance is executable on.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "architecture_execution_envs",
              "dataType": "array<string>",
              "required": false,
              "description": "The processor architectures (e.g., x86, ARM, etc.) that the malware instance or family is executable on. Open Vocab - processor-architecture-os.",
              "vocabulary": {
                "kind": "open",
                "name": "processor-architecture-os",
                "values": []
              }
            },
            {
              "name": "implementation_languages",
              "dataType": "array<string>",
              "required": false,
              "description": "The programming language(s) used to implement the malware instance or family. Open Vocab - implementation-language-ov.",
              "vocabulary": {
                "kind": "open",
                "name": "implementation-language-ov",
                "values": []
              }
            },
            {
              "name": "capabilities",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies any capabilities identified for the malware instance or family. Open Vocab - malware-capabilities-ov.",
              "vocabulary": {
                "kind": "open",
                "name": "malware-capabilities-ov",
                "values": []
              }
            },
            {
              "name": "sample_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "The sample_refs property specifies a list of identifiers of the SCO file or artifact objects associated with this malware instance(s) or family.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "malware_types",
              "dataType": "array<string>",
              "required": false,
              "description": "The type of malware being described. Open Vocab - malware-type-ov",
              "vocabulary": {
                "kind": "open",
                "name": "malware-type-ov",
                "values": []
              }
            },
            {
              "name": "is_family",
              "dataType": "boolean",
              "required": false,
              "description": "Whether the object represents a malware family (if true) or a malware instance (if false).",
              "vocabulary": {
                "kind": "closed",
                "name": "is_family-enum",
                "values": []
              }
            },
            {
              "name": "product",
              "dataType": "string",
              "required": false,
              "description": "The name of the analysis engine or product that was used for this analysis."
            },
            {
              "name": "version",
              "dataType": "string",
              "required": false,
              "description": "Specifies the version of the encoded certificate."
            },
            {
              "name": "configuration_version",
              "dataType": "string",
              "required": false,
              "description": "The version of the analysis product configuration that was used to perform this analysis."
            },
            {
              "name": "modules",
              "dataType": "array<string>",
              "required": false,
              "description": "The particular analysis product modules that were used to perform the analysis."
            },
            {
              "name": "analysis_engine_version",
              "dataType": "string",
              "required": false,
              "description": "The version of the analysis engine or product that was used to perform this analysis."
            },
            {
              "name": "analysis_definition_version",
              "dataType": "string",
              "required": false,
              "description": "The version of the analysis definitions used by the analysis tool."
            },
            {
              "name": "submitted",
              "dataType": "string",
              "required": false,
              "description": "The date and time that this malware was first submitted for scanning or analysis."
            },
            {
              "name": "analysis_started",
              "dataType": "string",
              "required": false,
              "description": "The date and time that the malware analysis was initiated."
            },
            {
              "name": "analysis_ended",
              "dataType": "string",
              "required": false,
              "description": "The date and time that the malware analysis ended."
            },
            {
              "name": "result_name",
              "dataType": "string",
              "required": false,
              "description": "The classification result or name assigned to the malware instance by the scanner tool."
            },
            {
              "name": "result",
              "dataType": "string",
              "required": false,
              "description": "The classification result as determined by the scanner or tool analysis process."
            },
            {
              "name": "host_vm_ref",
              "dataType": "string",
              "required": false,
              "description": "A description of the virtual machine environment used to host the guest operating system (if applicable) that was used for the dynamic analysis of the malware instance or family.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "operating_system_ref",
              "dataType": "string",
              "required": false,
              "description": "The operating system that was used to perform the dynamic analysis.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "installed_software_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Any non-standard software installed on the operating system used for the dynamic analysis of the malware instance or family.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "analysis_sco_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "The list of STIX objects that were captured during the analysis process.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "sample_ref",
              "dataType": "string",
              "required": false,
              "description": "Refers to the object this analysis was performed against.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "first_observed",
              "dataType": "string",
              "required": false,
              "description": "The beginning of the time window that the data was observed during."
            },
            {
              "name": "last_observed",
              "dataType": "string",
              "required": false,
              "description": "The end of the time window that the data was observed during."
            },
            {
              "name": "number_observed",
              "dataType": "integer",
              "required": false,
              "description": "The number of times the data represented in the objects property was observed. This MUST be an integer between 1 and 999,999,999 inclusive."
            },
            {
              "name": "objects",
              "dataType": "object",
              "required": false,
              "description": "A dictionary of Cyber Observable Objects that describes the single 'fact' that was observed."
            },
            {
              "name": "object_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the STIX Objects that are referred to by this Report.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "relationship_type",
              "dataType": "string",
              "required": false,
              "description": "The name used to identify the type of relationship."
            },
            {
              "name": "source_ref",
              "dataType": "string",
              "required": false,
              "description": "The ID of the source (from) object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "target_ref",
              "dataType": "string",
              "required": false,
              "description": "The ID of the target (to) object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "start_time",
              "dataType": "string",
              "required": false,
              "description": "This optional timestamp represents the earliest time at which the Relationship between the objects exists. If this property is a future timestamp, at the time the updated property is defined, then this represents an estimate by the producer of the intelligence of the earliest time at which relationship will be asserted to be true."
            },
            {
              "name": "stop_time",
              "dataType": "string",
              "required": false,
              "description": "The latest time at which the Relationship between the objects exists. If this property is a future timestamp, at the time the updated property is defined, then this represents an estimate by the producer of the intelligence of the latest time at which relationship will be asserted to be true."
            },
            {
              "name": "report_types",
              "dataType": "array<string>",
              "required": false,
              "description": "This field is an Open Vocabulary that specifies the primary subject of this report. The suggested values for this field are in report-type-ov."
            },
            {
              "name": "published",
              "dataType": "string",
              "required": false,
              "description": "The date that this report object was officially published by the creator of this report."
            },
            {
              "name": "count",
              "dataType": "integer",
              "required": false,
              "description": "This is an integer between 0 and 999,999,999 inclusive and represents the number of times the object was sighted."
            },
            {
              "name": "sighting_of_ref",
              "dataType": "string",
              "required": false,
              "description": "An ID reference to the object that has been sighted.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "observed_data_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "A list of ID references to the Observed Data objects that contain the raw cyber data for this Sighting.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "where_sighted_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "A list of ID references to the Identity or Location objects describing the entities or types of entities that saw the sighting.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "summary",
              "dataType": "boolean",
              "required": false,
              "description": "The summary property indicates whether the Sighting should be considered summary data. "
            },
            {
              "name": "threat_actor_types",
              "dataType": "array<string>",
              "required": false,
              "description": "This field specifies the type of threat actor. Open Vocab - threat-actor-type-ov",
              "vocabulary": {
                "kind": "open",
                "name": "threat-actor-type-ov",
                "values": []
              }
            },
            {
              "name": "sophistication",
              "dataType": "string",
              "required": false,
              "description": "The skill, specific knowledge, special training, or expertise a Threat Actor must have to perform the attack. Open Vocab - threat-actor-sophistication-ov",
              "vocabulary": {
                "kind": "open",
                "name": "threat-actor-sophistication-ov",
                "values": []
              }
            },
            {
              "name": "personal_motivations",
              "dataType": "array<string>",
              "required": false,
              "description": "The personal reasons, motivations, or purposes of the Threat Actor regardless of organizational goals. Open Vocab - attack-motivation-ov",
              "vocabulary": {
                "kind": "open",
                "name": "attack-motivation-ov",
                "values": []
              }
            },
            {
              "name": "tool_types",
              "dataType": "array<string>",
              "required": false,
              "description": "The kind(s) of tool(s) being described. Open Vocab - tool-type-ov",
              "vocabulary": {
                "kind": "open",
                "name": "tool-type-ov",
                "values": []
              }
            },
            {
              "name": "tool_version",
              "dataType": "string",
              "required": false,
              "description": "The version identifier associated with the tool."
            },
            {
              "name": "defanged",
              "dataType": "boolean",
              "required": false,
              "description": "Defines whether or not the data contained within the object has been defanged."
            },
            {
              "name": "mime_type",
              "dataType": "string",
              "required": false,
              "description": "Specifies the MIME type name specified for the file, e.g., 'application/msword'."
            },
            {
              "name": "payload_bin",
              "dataType": "string",
              "required": false,
              "description": "Specifies the binary data contained in the artifact as a base64-encoded string."
            },
            {
              "name": "url",
              "dataType": "string",
              "required": false,
              "description": "The value of this property MUST be a valid URL that resolves to the unencoded content."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies any hashes that were calculated for the entire contents of the certificate."
            },
            {
              "name": "encryption_algorithm",
              "dataType": "string",
              "required": false,
              "description": "If the artifact is encrypted, specifies the type of encryption algorithm the binary data  (either via payload_bin or url) is encoded in."
            },
            {
              "name": "decryption_key",
              "dataType": "string",
              "required": false,
              "description": "Specifies the decryption key for the encrypted binary data (either via payload_bin or url)."
            },
            {
              "name": "number",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the number assigned to the AS. Such assignments are typically performed by a Regional Internet Registries (RIR)."
            },
            {
              "name": "rir",
              "dataType": "string",
              "required": false,
              "description": "Specifies the name of the Regional Internet Registry (RIR) that assigned the number to the AS."
            },
            {
              "name": "path",
              "dataType": "string",
              "required": false,
              "description": "Specifies the path, as originally observed, to the directory on the file system."
            },
            {
              "name": "path_enc",
              "dataType": "string",
              "required": false,
              "description": "Specifies the observed encoding for the path."
            },
            {
              "name": "ctime",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date/time the file was created."
            },
            {
              "name": "mtime",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date/time the file was last written to/modified."
            },
            {
              "name": "atime",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date/time the file was last accessed."
            },
            {
              "name": "contains_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies a list of references to other Observable Objects contained within the file.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "value",
              "dataType": "string",
              "required": false,
              "description": "Specifies the value of the URL."
            },
            {
              "name": "resolves_to_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies a list of references to one or more Layer 2 Media Access Control (MAC) addresses that the IPv6 address resolves to.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "display_name",
              "dataType": "string",
              "required": false,
              "description": "Specifies the display name of the account, to be shown in user interfaces, if applicable."
            },
            {
              "name": "belongs_to_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the user account that the email address belongs to, as a reference to a User Account Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "date",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date/time that the email message was sent."
            },
            {
              "name": "content_type",
              "dataType": "string",
              "required": false,
              "description": "Specifies the value of the 'Content-Type' header of the email message."
            },
            {
              "name": "from_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the value of the 'From:' header of the email message.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "sender_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the value of the 'From' field of the email message.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "to_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the mailboxes that are 'To:' recipients of the email message.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "cc_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the mailboxes that are 'CC:' recipients of the email message.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "bcc_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the mailboxes that are 'BCC:' recipients of the email message.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "message_id",
              "dataType": "string",
              "required": false,
              "description": "Specifies the Message-ID field of the email message."
            },
            {
              "name": "subject",
              "dataType": "string",
              "required": false,
              "description": "Specifies the name of the entity associated with the public key stored in the subject public key field of the certificate."
            },
            {
              "name": "received_lines",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies one or more Received header fields that may be included in the email headers."
            },
            {
              "name": "additional_header_fields",
              "dataType": "object",
              "required": false,
              "description": "Specifies any other header fields found in the email message, as a dictionary."
            },
            {
              "name": "raw_email_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the raw binary contents of the email message, including both the headers and body, as a reference to an Artifact Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "is_multipart",
              "dataType": "boolean",
              "required": false,
              "description": "Indicates whether the email body contains multiple MIME parts.",
              "vocabulary": {
                "kind": "closed",
                "name": "is_multipart-enum",
                "values": []
              }
            },
            {
              "name": "body",
              "dataType": "string",
              "required": false,
              "description": "Specifies a string containing the email body. This field MAY only be used if is_multipart is false."
            },
            {
              "name": "body_multipart",
              "dataType": "array<object>",
              "required": false,
              "description": "Specifies a list of the MIME parts that make up the email body. This property MAY only be used if is_multipart is true.",
              "children": [
                {
                  "name": "body",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the contents of the MIME part if the content_type is not provided OR starts with text/"
                },
                {
                  "name": "body_raw_ref",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the contents of non-textual MIME parts, that is those whose content_type does not start with text/, as a reference to an Artifact Object or File Object.",
                  "reference": {
                    "cardinality": "one",
                    "targetTypes": [
                      "*"
                    ]
                  }
                },
                {
                  "name": "content_type",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the value of the 'Content-Type' header field of the MIME part."
                },
                {
                  "name": "content_disposition",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the value of the 'Content-Disposition' header field of the MIME part."
                }
              ]
            },
            {
              "name": "size",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the file, in bytes, as a non-negative integer."
            },
            {
              "name": "name_enc",
              "dataType": "string",
              "required": false,
              "description": "Specifies the observed encoding for the name of the file."
            },
            {
              "name": "magic_number_hex",
              "dataType": "string",
              "required": false,
              "description": "Specifies the hexadecimal constant ('magic number') associated with a specific file format that corresponds to the file, if applicable."
            },
            {
              "name": "parent_directory_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the parent directory of the file, as a reference to a Directory Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "content_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the content of the file, represented as an Artifact Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "belongs_to_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies a reference to one or more autonomous systems (AS) that the IPv6 address belongs to.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "start",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date/time the network traffic was initiated, if known."
            },
            {
              "name": "end",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date/time the network traffic ended, if known."
            },
            {
              "name": "src_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the source of the network traffic, as a reference to an Observable Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "dst_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the destination of the network traffic, as a reference to an Observable Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "src_port",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the source port used in the network traffic, as an integer. The port value MUST be in the range of 0 - 65535."
            },
            {
              "name": "dst_port",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the destination port used in the network traffic, as an integer. The port value MUST be in the range of 0 - 65535."
            },
            {
              "name": "protocols",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the protocols observed in the network traffic, along with their corresponding state."
            },
            {
              "name": "src_byte_count",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the number of bytes sent from the source to the destination."
            },
            {
              "name": "dst_byte_count",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the number of bytes sent from the destination to the source."
            },
            {
              "name": "src_packets",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the number of packets sent from the source to the destination."
            },
            {
              "name": "dst_packets",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the number of packets sent destination to the source."
            },
            {
              "name": "ipfix",
              "dataType": "object",
              "required": false,
              "description": "Specifies any IP Flow Information Export (IPFIX) data for the traffic."
            },
            {
              "name": "src_payload_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the bytes sent from the source to the destination.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "dst_payload_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the bytes sent from the source to the destination.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "encapsulates_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Links to other network-traffic objects encapsulated by a network-traffic.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "encapsulated_by_ref",
              "dataType": "string",
              "required": false,
              "description": "Links to another network-traffic object which encapsulates this object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "is_active",
              "dataType": "boolean",
              "required": false,
              "description": "Indicates whether the network traffic is still ongoing.",
              "vocabulary": {
                "kind": "closed",
                "name": "is_active-enum",
                "values": []
              }
            },
            {
              "name": "is_hidden",
              "dataType": "boolean",
              "required": false,
              "description": "Specifies whether the process is hidden."
            },
            {
              "name": "pid",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the Process ID, or PID, of the process."
            },
            {
              "name": "created_time",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date/time at which the process was created."
            },
            {
              "name": "cwd",
              "dataType": "string",
              "required": false,
              "description": "Specifies the current working directory of the process."
            },
            {
              "name": "command_line",
              "dataType": "string",
              "required": false,
              "description": "Specifies the full command line used in executing the process, including the process name (which may be specified individually via the binary_ref.name property) and any arguments."
            },
            {
              "name": "environment_variables",
              "dataType": "object",
              "required": false,
              "description": "Specifies the list of environment variables associated with the process as a dictionary."
            },
            {
              "name": "opened_connection_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the list of network connections opened by the process, as a reference to one or more Network Traffic Objects.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "creator_user_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies a reference to a user account, represented as a User Account Object, that created the registry key.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "image_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the executable binary that was executed as the process image, as a reference to a File Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "parent_ref",
              "dataType": "string",
              "required": false,
              "description": "Specifies the other process that spawned (i.e. is the parent of) this one, as represented by a Process Object.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "child_refs",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the other processes that were spawned by (i.e. children of) this process, as a reference to one or more other Process Objects.",
              "reference": {
                "cardinality": "many",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "cpe",
              "dataType": "string",
              "required": false,
              "description": "Specifies the Common Platform Enumeration (CPE) entry for the software, if available. The value for this property MUST be a CPE v2.3 entry from the official NVD CPE Dictionary."
            },
            {
              "name": "swid",
              "dataType": "string",
              "required": false,
              "description": "Specifies the Software Identification (SWID) Tags entry for the software, if available."
            },
            {
              "name": "languages",
              "dataType": "array<string>",
              "required": false,
              "description": "Specifies the languages supported by the software. The value of each list member MUST be an RFC 5646 language code. ISO 639-2 codes are accepted for backward compatibility."
            },
            {
              "name": "vendor",
              "dataType": "string",
              "required": false,
              "description": "Specifies the name of the vendor of the software."
            },
            {
              "name": "user_id",
              "dataType": "string",
              "required": false,
              "description": "Specifies the identifier of the account."
            },
            {
              "name": "credential",
              "dataType": "string",
              "required": false,
              "description": "Specifies a cleartext credential. This is only intended to be used in capturing metadata from malware analysis (e.g., a hard-coded domain administrator password that the malware attempts to use for lateral movement) and SHOULD NOT be used for sharing of PII."
            },
            {
              "name": "account_login",
              "dataType": "string",
              "required": false,
              "description": "Specifies the account login string, used in cases where the user_id property specifies something other than what a user would type when they login."
            },
            {
              "name": "account_type",
              "dataType": "string",
              "required": false,
              "description": "Specifies the type of the account. This is an open vocabulary and values SHOULD come from the account-type-ov vocabulary."
            },
            {
              "name": "is_service_account",
              "dataType": "boolean",
              "required": false,
              "description": "Indicates that the account is associated with a network service or system process (daemon), not a specific individual."
            },
            {
              "name": "is_privileged",
              "dataType": "boolean",
              "required": false,
              "description": "Specifies that the account has elevated privileges (i.e., in the case of root on Unix or the Windows Administrator account)."
            },
            {
              "name": "can_escalate_privs",
              "dataType": "boolean",
              "required": false,
              "description": "Specifies that the account has the ability to escalate privileges (i.e., in the case of sudo on Unix or a Windows Domain Admin account)."
            },
            {
              "name": "is_disabled",
              "dataType": "boolean",
              "required": false,
              "description": "Specifies if the account is disabled."
            },
            {
              "name": "account_created",
              "dataType": "string",
              "required": false,
              "description": "Specifies when the account was created."
            },
            {
              "name": "account_expires",
              "dataType": "string",
              "required": false,
              "description": "Specifies the expiration date of the account."
            },
            {
              "name": "credential_last_changed",
              "dataType": "string",
              "required": false,
              "description": "Specifies when the account credential was last changed."
            },
            {
              "name": "account_first_login",
              "dataType": "string",
              "required": false,
              "description": "Specifies when the account was first accessed."
            },
            {
              "name": "account_last_login",
              "dataType": "string",
              "required": false,
              "description": "Specifies when the account was last accessed."
            },
            {
              "name": "key",
              "dataType": "string",
              "required": false,
              "description": "Specifies the full registry key including the hive."
            },
            {
              "name": "values",
              "dataType": "array<object>",
              "required": false,
              "description": "Specifies the values found under the registry key.",
              "children": [
                {
                  "name": "name",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the name of the registry value. For specifying the default value in a registry key, an empty string MUST be used."
                },
                {
                  "name": "data",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the data contained in the registry value."
                },
                {
                  "name": "data_type",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the registry (REG_*) data type used in the registry value.",
                  "vocabulary": {
                    "kind": "closed",
                    "name": "data_type-enum",
                    "values": [
                      "REG_NONE",
                      "REG_SZ",
                      "REG_EXPAND_SZ",
                      "REG_BINARY",
                      "REG_DWORD",
                      "REG_DWORD_BIG_ENDIAN",
                      "REG_DWORD_LITTLE_ENDIAN",
                      "REG_LINK",
                      "REG_MULTI_SZ",
                      "REG_RESOURCE_LIST",
                      "REG_FULL_RESOURCE_DESCRIPTION",
                      "REG_RESOURCE_REQUIREMENTS_LIST",
                      "REG_QWORD",
                      "REG_INVALID_TYPE"
                    ]
                  }
                }
              ]
            },
            {
              "name": "modified_time",
              "dataType": "string",
              "required": false,
              "description": "Specifies the last date/time that the registry key was modified."
            },
            {
              "name": "number_of_subkeys",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the number of subkeys contained under the registry key."
            },
            {
              "name": "is_self_signed",
              "dataType": "boolean",
              "required": false,
              "description": "Specifies whether the certificate is self-signed, i.e., whether it is signed by the same entity whose identity it certifies."
            },
            {
              "name": "serial_number",
              "dataType": "string",
              "required": false,
              "description": "Specifies the unique identifier for the certificate, as issued by a specific Certificate Authority."
            },
            {
              "name": "signature_algorithm",
              "dataType": "string",
              "required": false,
              "description": "Specifies the name of the algorithm used to sign the certificate."
            },
            {
              "name": "issuer",
              "dataType": "string",
              "required": false,
              "description": "Specifies the name of the Certificate Authority that issued the certificate."
            },
            {
              "name": "validity_not_before",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date on which the certificate validity period begins."
            },
            {
              "name": "validity_not_after",
              "dataType": "string",
              "required": false,
              "description": "Specifies the date on which the certificate validity period ends."
            },
            {
              "name": "subject_public_key_algorithm",
              "dataType": "string",
              "required": false,
              "description": "Specifies the name of the algorithm with which to encrypt data being sent to the subject."
            },
            {
              "name": "subject_public_key_modulus",
              "dataType": "string",
              "required": false,
              "description": "Specifies the modulus portion of the subject’s public RSA key."
            },
            {
              "name": "subject_public_key_exponent",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the exponent portion of the subject’s public RSA key, as an integer."
            },
            {
              "name": "x509_v3_extensions",
              "dataType": "object",
              "required": false,
              "description": "Specifies any standard X.509 v3 extensions that may be used in the certificate.",
              "children": [
                {
                  "name": "basic_constraints",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies a multi-valued extension which indicates whether a certificate is a CA certificate."
                },
                {
                  "name": "name_constraints",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies a namespace within which all subject names in subsequent certificates in a certification path MUST be located."
                },
                {
                  "name": "policy_constraints",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies any constraints on path validation for certificates issued to CAs."
                },
                {
                  "name": "key_usage",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies a multi-valued extension consisting of a list of names of the permitted key usages."
                },
                {
                  "name": "extended_key_usage",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies a list of usages indicating purposes for which the certificate public key can be used for."
                },
                {
                  "name": "subject_key_identifier",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the identifier that provides a means of identifying certificates that contain a particular public key."
                },
                {
                  "name": "authority_key_identifier",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the identifier that provides a means of identifying the public key corresponding to the private key used to sign a certificate."
                },
                {
                  "name": "subject_alternative_name",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the additional identities to be bound to the subject of the certificate."
                },
                {
                  "name": "issuer_alternative_name",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the additional identities to be bound to the issuer of the certificate."
                },
                {
                  "name": "subject_directory_attributes",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the identification attributes (e.g., nationality) of the subject."
                },
                {
                  "name": "crl_distribution_points",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies how CRL information is obtained."
                },
                {
                  "name": "inhibit_any_policy",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the number of additional certificates that may appear in the path before anyPolicy is no longer permitted."
                },
                {
                  "name": "private_key_usage_period_not_before",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the date on which the validity period begins for the private key, if it is different from the validity period of the certificate."
                },
                {
                  "name": "private_key_usage_period_not_after",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies the date on which the validity period ends for the private key, if it is different from the validity period of the certificate."
                },
                {
                  "name": "certificate_policies",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies a sequence of one or more policy information terms, each of which consists of an object identifier (OID) and optional qualifiers."
                },
                {
                  "name": "policy_mappings",
                  "dataType": "string",
                  "required": false,
                  "description": "Specifies one or more pairs of OIDs; each pair includes an issuerDomainPolicy and a subjectDomainPolicy"
                }
              ]
            },
            {
              "name": "object_ref",
              "dataType": "string",
              "required": false,
              "description": "Identifies the object that this Language Content applies to.",
              "reference": {
                "cardinality": "one",
                "targetTypes": [
                  "*"
                ]
              }
            },
            {
              "name": "object_modified",
              "dataType": "string",
              "required": false,
              "description": "Identifies the modified time of the object that this Language Content applies to."
            },
            {
              "name": "contents",
              "dataType": "object",
              "required": false,
              "description": "Contains the actual Language Content (translation)."
            },
            {
              "name": "definition_type",
              "dataType": "string",
              "required": false,
              "description": "The definition_type property identifies the type of Marking Definition.",
              "vocabulary": {
                "kind": "closed",
                "name": "definition_type-enum",
                "values": [
                  "tlp"
                ]
              }
            },
            {
              "name": "definition",
              "dataType": "object",
              "required": false,
              "description": "The marking object itself.",
              "children": [
                {
                  "name": "statement",
                  "dataType": "string",
                  "required": true,
                  "description": "A statement (e.g., copyright, terms of use) applied to the content marked by this marking definition."
                },
                {
                  "name": "tlp",
                  "dataType": "string",
                  "required": false,
                  "vocabulary": {
                    "kind": "closed",
                    "name": "tlp-enum",
                    "values": [
                      "red"
                    ]
                  }
                }
              ]
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §8",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/common/bundle.json"
    },
    {
      "type": "archive-ext",
      "title": "Archive File Extension",
      "family": "predefined-extension",
      "description": "The Archive File extension specifies a default extension for capturing properties specific to archive files.",
      "fields": [
        {
          "name": "contains_refs",
          "dataType": "array<string>",
          "required": true,
          "description": "Specifies the files contained in the archive, as a reference to one or more other File Objects. The objects referenced in this list MUST be of type file-object.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "comment",
          "dataType": "string",
          "required": false,
          "description": "Specifies a comment included as part of the archive file."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.7.2",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/file.json",
      "extensionOf": "file"
    },
    {
      "type": "ntfs-ext",
      "title": "NTFS File Extension",
      "family": "predefined-extension",
      "description": "The NTFS file extension specifies a default extension for capturing properties specific to the storage of the file on the NTFS file system.",
      "fields": [
        {
          "name": "sid",
          "dataType": "string",
          "required": false,
          "description": "Specifies the security ID (SID) value assigned to the file."
        },
        {
          "name": "alternate_data_streams",
          "dataType": "array<object>",
          "required": false,
          "description": "Specifies a list of NTFS alternate data streams that exist for the file.",
          "children": [
            {
              "name": "name",
              "dataType": "string",
              "required": true,
              "description": "Specifies the name of the alternate data stream."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies a dictionary of hashes for the data contained in the alternate data stream."
            },
            {
              "name": "size",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the alternate data stream, in bytes, as a non-negative integer."
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.7.3",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/file.json",
      "extensionOf": "file"
    },
    {
      "type": "pdf-ext",
      "title": "PDF File Extension",
      "family": "predefined-extension",
      "description": "The PDF file extension specifies a default extension for capturing properties specific to PDF files.",
      "fields": [
        {
          "name": "version",
          "dataType": "string",
          "required": false,
          "description": "Specifies the decimal version number of the string from the PDF header that specifies the version of the PDF specification to which the PDF file conforms. E.g., '1.4'."
        },
        {
          "name": "is_optimized",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies whether the PDF file has been optimized."
        },
        {
          "name": "document_info_dict",
          "dataType": "object",
          "required": false,
          "description": "Specifies details of the PDF document information dictionary (DID), which includes properties like the document creation data and producer, as a dictionary."
        },
        {
          "name": "pdfid0",
          "dataType": "string",
          "required": false,
          "description": "Specifies the first file identifier found for the PDF file."
        },
        {
          "name": "pdfid1",
          "dataType": "string",
          "required": false,
          "description": "Specifies the second file identifier found for the PDF file."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.7.4",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/file.json",
      "extensionOf": "file"
    },
    {
      "type": "raster-image-ext",
      "title": "Raster Image File Extension",
      "family": "predefined-extension",
      "description": "The Raster Image file extension specifies a default extension for capturing properties specific to image files.",
      "fields": [
        {
          "name": "image_height",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the height of the image in the image file, in pixels."
        },
        {
          "name": "image_width",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the width of the image in the image file, in pixels."
        },
        {
          "name": "bits_per_pixel",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the sum of bits used for each color channel in the image in the image file, and thus the total number of pixels used for expressing the color depth of the image."
        },
        {
          "name": "exif_tags",
          "dataType": "object",
          "required": false,
          "description": "Specifies the set of EXIF tags found in the image file, as a dictionary. Each key/value pair in the dictionary represents the name/value of a single EXIF tag."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.7.5",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/file.json",
      "extensionOf": "file"
    },
    {
      "type": "windows-pebinary-ext",
      "title": "Windows PE Binary Extension",
      "family": "predefined-extension",
      "description": "The Windows PE Binary File extension specifies a default extension for capturing properties specific to Windows portable executable (PE) files.",
      "fields": [
        {
          "name": "pe_type",
          "dataType": "string",
          "required": true,
          "description": "Specifies the type of the PE binary. Open Vocabulary - windows-pebinary-type-ov",
          "vocabulary": {
            "kind": "open",
            "name": "windows-pebinary-type-ov",
            "values": []
          }
        },
        {
          "name": "imphash",
          "dataType": "string",
          "required": false,
          "description": "Specifies the special import hash, or 'imphash', calculated for the PE Binary based on its imported libraries and functions."
        },
        {
          "name": "machine_hex",
          "dataType": "string",
          "required": false,
          "description": "Specifies the type of target machine."
        },
        {
          "name": "number_of_sections",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the number of sections in the PE binary, as a non-negative integer."
        },
        {
          "name": "time_date_stamp",
          "dataType": "string",
          "required": false,
          "description": "Specifies the time when the PE binary was created.  The timestamp value MUST BE precise to the second."
        },
        {
          "name": "pointer_to_symbol_table_hex",
          "dataType": "string",
          "required": false,
          "description": "Specifies the file offset of the COFF symbol table."
        },
        {
          "name": "number_of_symbols",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the number of entries in the symbol table of the PE binary, as a non-negative integer."
        },
        {
          "name": "size_of_optional_header",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the size of the optional header of the PE binary."
        },
        {
          "name": "characteristics_hex",
          "dataType": "string",
          "required": false,
          "description": "Specifies the flags that indicate the file’s characteristics."
        },
        {
          "name": "file_header_hashes",
          "dataType": "object",
          "required": false,
          "description": "Specifies any hashes that were computed for the file header."
        },
        {
          "name": "optional_header",
          "dataType": "object",
          "required": false,
          "description": "Specifies the PE optional header of the PE binary.",
          "children": [
            {
              "name": "magic_hex",
              "dataType": "string",
              "required": false,
              "description": "Specifies the unsigned integer that indicates the type of the PE binary."
            },
            {
              "name": "major_linker_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the linker major version number."
            },
            {
              "name": "minor_linker_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the linker minor version number."
            },
            {
              "name": "size_of_code",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the code (text) section. If there are multiple such sections, this refers to the sum of the sizes of each section."
            },
            {
              "name": "size_of_initialized_data",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the initialized data section. If there are multiple such sections, this refers to the sum of the sizes of each section."
            },
            {
              "name": "size_of_uninitialized_data",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the uninitialized data section. If there are multiple such sections, this refers to the sum of the sizes of each section."
            },
            {
              "name": "address_of_entry_point",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the address of the entry point relative to the image base when the executable is loaded into memory."
            },
            {
              "name": "base_of_code",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the address that is relative to the image base of the beginning-of-code section when it is loaded into memory."
            },
            {
              "name": "base_of_data",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the address that is relative to the image base of the beginning-of-data section when it is loaded into memory."
            },
            {
              "name": "image_base",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the preferred address of the first byte of the image when loaded into memory."
            },
            {
              "name": "section_alignment",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the alignment (in bytes) of PE sections when they are loaded into memory."
            },
            {
              "name": "file_alignment",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the factor (in bytes) that is used to align the raw data of sections in the image file."
            },
            {
              "name": "major_os_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the major version number of the required operating system."
            },
            {
              "name": "minor_os_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the minor version number of the required operating system."
            },
            {
              "name": "major_image_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the major version number of the image."
            },
            {
              "name": "minor_image_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the minor version number of the image."
            },
            {
              "name": "major_subsystem_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the major version number of the subsystem."
            },
            {
              "name": "minor_subsystem_version",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the minor version number of the subsystem."
            },
            {
              "name": "win32_version_value_hex",
              "dataType": "string",
              "required": false,
              "description": "Specifies the reserved win32 version value."
            },
            {
              "name": "size_of_image",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size, in bytes, of the image, including all headers, as the image is loaded in memory."
            },
            {
              "name": "size_of_headers",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the combined size of the MS-DOS, PE header, and section headers, rounded up a multiple of the value specified in the file_alignment header."
            },
            {
              "name": "checksum_hex",
              "dataType": "string",
              "required": false,
              "description": "Specifies the checksum of the PE binary."
            },
            {
              "name": "subsystem_hex",
              "dataType": "string",
              "required": false,
              "description": "Specifies the subsystem (e.g., GUI, device driver, etc.) that is required to run this image."
            },
            {
              "name": "dll_characteristics_hex",
              "dataType": "string",
              "required": false,
              "description": "Specifies the flags that characterize the PE binary."
            },
            {
              "name": "size_of_stack_reserve",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the stack to reserve"
            },
            {
              "name": "size_of_stack_commit",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the stack to commit."
            },
            {
              "name": "size_of_heap_reserve",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the local heap space to reserve."
            },
            {
              "name": "size_of_heap_commit",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the local heap space to commit."
            },
            {
              "name": "loader_flags_hex",
              "dataType": "string",
              "required": false,
              "description": "Specifies the reserved loader flags."
            },
            {
              "name": "number_of_rva_and_sizes",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the number of data-directory entries in the remainder of the optional header."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies any hashes that were computed for the optional header."
            }
          ]
        },
        {
          "name": "sections",
          "dataType": "array<object>",
          "required": false,
          "description": "Specifies metadata about the sections in the PE file.",
          "children": [
            {
              "name": "name",
              "dataType": "string",
              "required": true,
              "description": "Specifies the name of the section."
            },
            {
              "name": "size",
              "dataType": "integer",
              "required": false,
              "description": "Specifies the size of the section, in bytes."
            },
            {
              "name": "entropy",
              "dataType": "number",
              "required": false,
              "description": "Specifies the calculated entropy for the section, as calculated using the Shannon algorithm."
            },
            {
              "name": "hashes",
              "dataType": "object",
              "required": false,
              "description": "Specifies any hashes computed over the section."
            }
          ]
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.7.6",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/file.json",
      "extensionOf": "file"
    },
    {
      "type": "http-request-ext",
      "title": "HTTP Request Extension",
      "family": "predefined-extension",
      "description": "The HTTP request extension specifies a default extension for capturing network traffic properties specific to HTTP requests.",
      "fields": [
        {
          "name": "request_method",
          "dataType": "string",
          "required": true,
          "description": "Specifies the HTTP method portion of the HTTP request line, as a lowercase string."
        },
        {
          "name": "request_value",
          "dataType": "string",
          "required": true,
          "description": "Specifies the value (typically a resource path) portion of the HTTP request line."
        },
        {
          "name": "request_version",
          "dataType": "string",
          "required": false,
          "description": "Specifies the HTTP version portion of the HTTP request line, as a lowercase string."
        },
        {
          "name": "request_header",
          "dataType": "object",
          "required": false,
          "description": "Specifies all of the HTTP header fields that may be found in the HTTP client request, as a dictionary."
        },
        {
          "name": "message_body_length",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the length of the HTTP message body, if included, in bytes."
        },
        {
          "name": "message_body_data_ref",
          "dataType": "string",
          "required": false,
          "description": "Specifies the data contained in the HTTP message body, if included.",
          "reference": {
            "cardinality": "one",
            "targetTypes": [
              "*"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.12.2",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/network-traffic.json",
      "extensionOf": "network-traffic"
    },
    {
      "type": "icmp-ext",
      "title": "ICMP Extension",
      "family": "predefined-extension",
      "description": "The ICMP extension specifies a default extension for capturing network traffic properties specific to ICMP.",
      "fields": [
        {
          "name": "icmp_type_hex",
          "dataType": "string",
          "required": true,
          "description": "Specifies the ICMP type byte."
        },
        {
          "name": "icmp_code_hex",
          "dataType": "string",
          "required": true,
          "description": "Specifies the ICMP code byte."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.12.3",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/network-traffic.json",
      "extensionOf": "network-traffic"
    },
    {
      "type": "socket-ext",
      "title": "Network Socket Extension",
      "family": "predefined-extension",
      "description": "The Network Socket extension specifies a default extension for capturing network traffic properties associated with network sockets.",
      "fields": [
        {
          "name": "address_family",
          "dataType": "string",
          "required": true,
          "description": "Specifies the address family (AF_*) that the socket is configured for.",
          "vocabulary": {
            "kind": "closed",
            "name": "address_family-enum",
            "values": [
              "AF_UNSPEC",
              "AF_INET",
              "AF_IPX",
              "AF_APPLETALK",
              "AF_NETBIOS",
              "AF_INET6",
              "AF_IRDA",
              "AF_BTH"
            ]
          }
        },
        {
          "name": "is_blocking",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies whether the socket is in blocking mode."
        },
        {
          "name": "is_listening",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies whether the socket is in listening mode."
        },
        {
          "name": "options",
          "dataType": "object",
          "required": false,
          "description": "Specifies any options (SO_*) that may be used by the socket, as a dictionary."
        },
        {
          "name": "socket_type",
          "dataType": "string",
          "required": false,
          "description": "Specifies the type of the socket.",
          "vocabulary": {
            "kind": "closed",
            "name": "socket_type-enum",
            "values": [
              "SOCK_STREAM",
              "SOCK_DGRAM",
              "SOCK_RAW",
              "SOCK_RDM",
              "SOCK_SEQPACKET"
            ]
          }
        },
        {
          "name": "socket_descriptor",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the socket file descriptor value associated with the socket, as a non-negative integer."
        },
        {
          "name": "socket_handle",
          "dataType": "integer",
          "required": false,
          "description": "Specifies the handle or inode value associated with the socket."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.12.4",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/network-traffic.json",
      "extensionOf": "network-traffic"
    },
    {
      "type": "tcp-ext",
      "title": "TCP Extension",
      "family": "predefined-extension",
      "description": "The TCP extension specifies a default extension for capturing network traffic properties specific to TCP.",
      "fields": [
        {
          "name": "src_flags_hex",
          "dataType": "string",
          "required": false,
          "description": "Specifies the source TCP flags, as the union of all TCP flags observed between the start of the traffic (as defined by the start property) and the end of the traffic (as defined by the end property). "
        },
        {
          "name": "dst_flags_hex",
          "dataType": "string",
          "required": false,
          "description": "Specifies the destination TCP flags, as the union of all TCP flags observed between the start of the traffic (as defined by the start property) and the end of the traffic (as defined by the end property)."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.12.5",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/network-traffic.json",
      "extensionOf": "network-traffic"
    },
    {
      "type": "windows-process-ext",
      "title": "Windows Process Extension",
      "family": "predefined-extension",
      "description": "The Windows Process extension specifies a default extension for capturing properties specific to Windows processes.",
      "fields": [
        {
          "name": "aslr_enabled",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies whether Address Space Layout Randomization (ASLR) is enabled for the process."
        },
        {
          "name": "dep_enabled",
          "dataType": "boolean",
          "required": false,
          "description": "Specifies whether Data Execution Prevention (DEP) is enabled for the process."
        },
        {
          "name": "priority",
          "dataType": "string",
          "required": false,
          "description": "Specifies the current priority class of the process in Windows."
        },
        {
          "name": "owner_sid",
          "dataType": "string",
          "required": false,
          "description": "Specifies the Security ID (SID) value of the owner of the process."
        },
        {
          "name": "window_title",
          "dataType": "string",
          "required": false,
          "description": "Specifies the title of the main window of the process."
        },
        {
          "name": "startup_info",
          "dataType": "object",
          "required": false,
          "description": "Specifies the STARTUP_INFO struct used by the process, as a dictionary."
        },
        {
          "name": "integrity_level",
          "dataType": "string",
          "required": false,
          "description": "Specifies the Windows integrity level, or trustworthiness, of the process."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.13.2",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/process.json",
      "extensionOf": "process"
    },
    {
      "type": "windows-service-ext",
      "title": "Windows Service Extension",
      "family": "predefined-extension",
      "description": "The Windows Service extension specifies a default extension for capturing properties specific to Windows services.",
      "fields": [
        {
          "name": "service_name",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the service."
        },
        {
          "name": "descriptions",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the descriptions defined for the service."
        },
        {
          "name": "display_name",
          "dataType": "string",
          "required": false,
          "description": "Specifies the displayed name of the service in Windows GUI controls."
        },
        {
          "name": "group_name",
          "dataType": "string",
          "required": false,
          "description": "Specifies the name of the load ordering group of which the service is a member."
        },
        {
          "name": "start_type",
          "dataType": "string",
          "required": false,
          "description": "Specifies the start options defined for the service. windows-service-start-enum",
          "vocabulary": {
            "kind": "closed",
            "name": "start_type-enum",
            "values": [
              "SERVICE_AUTO_START",
              "SERVICE_BOOT_START",
              "SERVICE_DEMAND_START",
              "SERVICE_DISABLED",
              "SERVICE_SYSTEM_ALERT"
            ]
          }
        },
        {
          "name": "service_dll_refs",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies the DLLs loaded by the service, as a reference to one or more File Objects.",
          "reference": {
            "cardinality": "many",
            "targetTypes": [
              "*"
            ]
          }
        },
        {
          "name": "service_type",
          "dataType": "string",
          "required": false,
          "description": "Specifies the type of the service. windows-service-enum",
          "vocabulary": {
            "kind": "closed",
            "name": "service_type-enum",
            "values": [
              "SERVICE_KERNEL_DRIVER",
              "SERVICE_FILE_SYSTEM_DRIVER",
              "SERVICE_WIN32_OWN_PROCESS",
              "SERVICE_WIN32_SHARE_PROCESS"
            ]
          }
        },
        {
          "name": "service_status",
          "dataType": "string",
          "required": false,
          "description": "Specifies the current status of the service. windows-service-status-enum",
          "vocabulary": {
            "kind": "closed",
            "name": "service_status-enum",
            "values": [
              "SERVICE_CONTINUE_PENDING",
              "SERVICE_PAUSE_PENDING",
              "SERVICE_PAUSED",
              "SERVICE_RUNNING",
              "SERVICE_START_PENDING",
              "SERVICE_STOP_PENDING",
              "SERVICE_STOPPED"
            ]
          }
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.13.3",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/process.json",
      "extensionOf": "process"
    },
    {
      "type": "unix-account-ext",
      "title": "UNIX Account Extension",
      "family": "predefined-extension",
      "description": "The User Account Object defines the following extensions. In addition to these, producers MAY create their own.",
      "fields": [
        {
          "name": "gid",
          "dataType": "number",
          "required": false,
          "description": "Specifies the primary group ID of the account."
        },
        {
          "name": "groups",
          "dataType": "array<string>",
          "required": false,
          "description": "Specifies a list of names of groups that the account is a member of."
        },
        {
          "name": "home_dir",
          "dataType": "string",
          "required": false,
          "description": "Specifies the home directory of the account."
        },
        {
          "name": "shell",
          "dataType": "string",
          "required": false,
          "description": "Specifies the account’s command shell."
        }
      ],
      "citation": {
        "section": "STIX 2.1 Errata 01 §6.16.2",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html"
      },
      "schemaSource": "standards/vendor/stix-2.1/schemas/observables/user-account.json",
      "extensionOf": "user-account"
    }
  ]
} as const satisfies StixCatalogData;
