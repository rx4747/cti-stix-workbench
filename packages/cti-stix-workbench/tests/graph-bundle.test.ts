import { describe, expect, it } from "vitest";

import { stixCatalog } from "../src/catalog/stix-2.1";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";
import {
  mapGraphToBundle,
  relationshipIdentityKey,
} from "../src/core/graph-mapper";
import { createDeterministicScoId } from "../src/core/sco-id";
import type {
  NormalizedStixDraft,
  PersistedRelationshipIdentity,
} from "../src/core/types";

function uuid4(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

function draft(
  path: string,
  type: string,
  id: string,
  properties: Readonly<Record<string, unknown>> = {},
): NormalizedStixDraft {
  return {
    path,
    basename: path.split("/").at(-1)?.replace(/\.md$/u, "") ?? path,
    stixType: type,
    stixId: id,
    properties: { type, id, ...properties },
    links: [],
    relationships: [],
  };
}

describe("complete STIX graph mapping", () => {
  it("uses one mapping path for every authorable standard object type", async () => {
    const definitions = stixCatalog.listObjectTypes().filter(
      (definition) =>
        definition.family === "sdo"
        || definition.family === "sro"
        || definition.family === "sco"
        || definition.family === "smo",
    );
    const drafts = definitions.map((definition, index) =>
      draft(
        `Objects/${definition.type}.md`,
        definition.type,
        `${definition.type}--${uuid4(index + 1)}`,
        { x_fixture_marker: definition.type },
      )
    );

    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid4(900)}`,
      drafts,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bundle.objects).toHaveLength(42);
      expect(result.bundle.objects.map((object) => object.type).sort()).toEqual(
        definitions.map((definition) => definition.type).sort(),
      );
      expect(result.bundle.objects.every(
        (object) => object.x_fixture_marker === object.type,
      )).toBe(true);
    }
  });

  it("resolves nested refs and explicit relationships into a stable Bundle", async () => {
    const identityId = `identity--${uuid4(1)}`;
    const indicatorId = `indicator--${uuid4(2)}`;
    const addressId = "ipv4-addr--28bb3599-77cd-5a82-a950-b5bc3caf07c4";
    const markingId = `marking-definition--${uuid4(3)}`;
    const relationshipId = `relationship--${uuid4(4)}`;
    const created = "2026-07-26T10:00:00.000Z";
    const key = relationshipIdentityKey(
      indicatorId,
      "based-on",
      addressId,
    );
    const relationshipIdentities: Readonly<Record<
      string,
      PersistedRelationshipIdentity
    >> = {
      [key]: { id: relationshipId, created },
    };
    const indicator: NormalizedStixDraft = {
      ...draft("Objects/Indicator.md", "indicator", indicatorId, {
        created,
        created_by_ref: "[[Analysis Team]]",
        granular_markings: [
          {
            marking_ref: "[[TLP Marking]]",
            selectors: ["description"],
          },
        ],
        modified: created,
        object_marking_refs: ["[[TLP Marking]]"],
        pattern: "[ipv4-addr:value = '198.51.100.3']",
        pattern_type: "stix",
        spec_version: "2.1",
        valid_from: created,
      }),
      links: [
        { raw: "Analysis Team", targetPath: "Objects/Analysis Team.md" },
        { raw: "Reserved Address", targetPath: "Objects/Address.md" },
        { raw: "TLP Marking", targetPath: "Objects/TLP Marking.md" },
      ],
      relationships: [
        {
          sourceNotePath: "Objects/Indicator.md",
          relationshipType: "based-on",
          targetLink: "Reserved Address",
        },
      ],
    };
    const drafts = [
      draft("Objects/Analysis Team.md", "identity", identityId, {
        created,
        identity_class: "organization",
        modified: created,
        name: "Fictional Analysis Team",
        spec_version: "2.1",
      }),
      indicator,
      draft("Objects/Address.md", "ipv4-addr", addressId, {
        spec_version: "2.1",
        value: "198.51.100.3",
      }),
      draft("Objects/TLP Marking.md", "marking-definition", markingId, {
        created,
        definition: { statement: "Fictional handling statement." },
        definition_type: "statement",
        spec_version: "2.1",
      }),
    ];
    const input = {
      bundleId: `bundle--${uuid4(900)}`,
      drafts,
      relationshipIdentities,
      relationships: [
        {
          sourceNotePath: "Objects/Indicator.md",
          relationshipType: "based-on",
          targetLink: "Reserved Address",
        },
      ],
    };

    const first = await mapGraphToBundle(input);
    const second = await mapGraphToBundle(input);

    expect(first).toEqual(second);
    if (first.ok) {
      expect(
        first.bundle.objects.filter((object) => object.id === relationshipId),
      ).toHaveLength(1);
    }
    expect(first).toEqual({
      ok: true,
      bundle: expect.objectContaining({
        id: `bundle--${uuid4(900)}`,
        objects: expect.arrayContaining([
          expect.objectContaining({
            id: indicatorId,
            created_by_ref: identityId,
            object_marking_refs: [markingId],
            granular_markings: [
              {
                marking_ref: markingId,
                selectors: ["description"],
              },
            ],
          }),
          expect.objectContaining({
            id: relationshipId,
            relationship_type: "based-on",
            source_ref: indicatorId,
            target_ref: addressId,
          }),
        ]),
      }),
      identities: [],
      warnings: [],
    });
  });

  it("returns generated note and relationship identities for persistence", async () => {
    const indicator = {
      ...draft("Objects/Indicator.md", "indicator", "", {
        created: "2026-07-26T10:00:00.000Z",
        modified: "2026-07-26T10:00:00.000Z",
      }),
      stixId: undefined,
      properties: { type: "indicator" },
      links: [
        { raw: "Address", targetPath: "Objects/Address.md" },
      ],
      relationships: [
        {
          sourceNotePath: "Objects/Indicator.md",
          relationshipType: "based-on",
          targetLink: "Address",
        },
      ],
    } satisfies NormalizedStixDraft;
    const address = {
      ...draft("Objects/Address.md", "ipv4-addr", "", {
        value: "198.51.100.3",
      }),
      stixId: undefined,
      properties: { type: "ipv4-addr", value: "198.51.100.3" },
    } satisfies NormalizedStixDraft;
    const randomValues = [
      uuid4(11),
      uuid4(12),
      uuid4(13),
    ];
    let randomIndex = 0;

    const result = await mapGraphToBundle(
      { drafts: [indicator, address] },
      {
        now: () => new Date("2026-07-26T10:00:00.000Z"),
        randomUUID: () => randomValues[randomIndex++] ?? uuid4(99),
      },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.identities).toEqual([
        {
          kind: "note",
          notePath: "Objects/Indicator.md",
          id: `indicator--${uuid4(11)}`,
        },
        {
          kind: "note",
          notePath: "Objects/Address.md",
          id: "ipv4-addr--28bb3599-77cd-5a82-a950-b5bc3caf07c4",
        },
        expect.objectContaining({
          kind: "relationship",
          id: `relationship--${uuid4(12)}`,
        }),
      ]);
      expect(result.bundle.id).toBe(`bundle--${uuid4(13)}`);
    }
  });

  it("resolves references inside predefined extension payloads", async () => {
    const artifactId = `artifact--${uuid4(20)}`;
    const fileId = `file--${uuid4(21)}`;
    const archive = {
      ...draft("Objects/Archive.md", "file", fileId, {
        extensions: {
          "archive-ext": {
            contains_refs: ["[[Contained Artifact]]"],
          },
        },
        name: "fictional.zip",
      }),
      links: [
        {
          raw: "Contained Artifact",
          targetPath: "Objects/Artifact.md",
        },
      ],
    } satisfies NormalizedStixDraft;

    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid4(900)}`,
      drafts: [
        archive,
        draft("Objects/Artifact.md", "artifact", artifactId, {
          payload_bin: "ZXhhbXBsZQ==",
        }),
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bundle.objects).toContainEqual(
        expect.objectContaining({
          id: fileId,
          extensions: {
            "archive-ext": {
              contains_refs: [artifactId],
            },
          },
        }),
      );
    }
  });

  it("resolves ID-contributing SCO refs before creating UUIDv5", async () => {
    const address = {
      ...draft("Objects/Sender.md", "email-addr", "", {
        value: "sender@example.com",
      }),
      stixId: undefined,
      properties: { type: "email-addr", value: "sender@example.com" },
    } satisfies NormalizedStixDraft;
    const message = {
      ...draft("Objects/Message.md", "email-message", "", {
        from_ref: "[[Sender]]",
        subject: "Fictional subject",
      }),
      stixId: undefined,
      properties: {
        type: "email-message",
        from_ref: "[[Sender]]",
        subject: "Fictional subject",
      },
      links: [
        { raw: "Sender", targetPath: "Objects/Sender.md" },
      ],
    } satisfies NormalizedStixDraft;
    const senderIdentity = await createDeterministicScoId("email-addr", {
      value: "sender@example.com",
    });
    expect(senderIdentity.ok).toBe(true);
    if (!senderIdentity.ok) {
      return;
    }
    const expectedMessage = await createDeterministicScoId("email-message", {
      from_ref: senderIdentity.id,
      subject: "Fictional subject",
    });

    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid4(900)}`,
      drafts: [message, address],
    });

    expect(result.ok).toBe(true);
    if (result.ok && expectedMessage.ok) {
      expect(result.identities).toEqual([
        {
          kind: "note",
          notePath: "Objects/Sender.md",
          id: senderIdentity.id,
        },
        {
          kind: "note",
          notePath: "Objects/Message.md",
          id: expectedMessage.id,
        },
      ]);
      expect(result.bundle.objects).toContainEqual(
        expect.objectContaining({
          id: expectedMessage.id,
          from_ref: senderIdentity.id,
        }),
      );
    }
  });

  it("blocks unresolved refs and conflicting duplicate IDs", async () => {
    const id = `identity--${uuid4(1)}`;
    const unresolved = draft("Objects/Report.md", "report", `report--${uuid4(2)}`, {
      object_refs: ["[[Missing object]]"],
    });
    const first = draft("Objects/First.md", "identity", id, { name: "First" });
    const second = draft("Objects/Second.md", "identity", id, { name: "Second" });

    const result = await mapGraphToBundle({
      bundleId: `bundle--${uuid4(900)}`,
      drafts: [unresolved, first, second],
    });

    expect(result).toEqual({
      ok: false,
      errors: expect.arrayContaining([
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.referenceUnresolved,
          notePath: "Objects/Report.md",
        }),
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.fieldDuplicate,
          field: "id",
        }),
      ]),
      warnings: [],
    });
  });
});
