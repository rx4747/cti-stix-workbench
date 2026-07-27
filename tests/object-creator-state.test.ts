import { describe, expect, it } from "vitest";

import { stixCatalog } from "../src/catalog/stix-2.1";
import {
  createObjectFrontmatter,
  createObjectNote,
  defaultObjectPath,
  safeNoteTitle,
} from "../src/ui/object-creator-state";

const NOW = new Date("2026-07-27T10:00:00.000Z");

describe("STIX object creator state", () => {
  it("creates every standalone catalog type with all required draft fields", () => {
    const definitions = stixCatalog
      .listObjectTypes()
      .filter((definition) => ["sdo", "sro", "sco", "smo"].includes(definition.family));
    expect(definitions).toHaveLength(42);

    for (const definition of definitions) {
      const frontmatter = createObjectFrontmatter(definition, definition.title, NOW);
      expect(frontmatter.stix_type, definition.type).toBe(definition.type);
      for (const field of definition.fields.filter(
        (item) =>
          item.required &&
          !["type", "id", "content", "description", "explanation"].includes(item.name),
      )) {
        expect(frontmatter, `${definition.type}.${field.name}`).toHaveProperty(
          field.name,
        );
      }
      expect(createObjectNote(definition, definition.title, NOW)).toContain(
        `stix_type: ${JSON.stringify(definition.type)}`,
      );
      expect(defaultObjectPath(definition, definition.title)).toMatch(/\.md$/u);
    }
  });

  it("sanitizes path-hostile titles and rejects an empty title", () => {
    expect(safeNoteTitle('  Bad:/\\*?"<>|#^[ title  ')).toBe("Bad- title");
    const indicator = stixCatalog.getObjectType("indicator");
    if (indicator === undefined) throw new Error("Missing Indicator definition.");
    expect(() => defaultObjectPath(indicator, "   ")).toThrow("title is required");
  });
});
