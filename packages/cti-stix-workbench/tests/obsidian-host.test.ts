import { beforeEach, describe, expect, it, vi } from "vitest";

class FakeTFile {
  readonly extension = "md";

  constructor(
    readonly path: string,
    readonly basename = "Observable",
  ) {}
}

class FakeTFolder {}

vi.mock("obsidian", () => ({
  normalizePath: (value: string) => value.replaceAll("\\", "/"),
  TFile: FakeTFile,
  TFolder: FakeTFolder,
}));

const { ObsidianActiveGraphHost } = await import(
  "../src/adapters/obsidian/host"
);

describe("Obsidian active graph host", () => {
  let frontmatter: Record<string, unknown>;
  let processCount: number;
  const file = new FakeTFile("Objects/Observable.md");
  const app = {
    vault: {
      getFileByPath: () => file,
    },
    fileManager: {
      processFrontMatter: async (
        _file: FakeTFile,
        update: (value: Record<string, unknown>) => void,
      ) => {
        processCount += 1;
        update(frontmatter);
      },
    },
  };
  const host = new ObsidianActiveGraphHost(
    app as never,
    {
      load: () => ({}),
      save: async () => {},
    },
  );

  beforeEach(() => {
    frontmatter = {};
    processCount = 0;
  });

  it.each([undefined, null, ""])(
    "persists over Obsidian's empty stix_id representation %j",
    async (emptyValue) => {
      frontmatter.stix_id = emptyValue;

      await host.persistStixId(
        file.path,
        "domain-name--415ecb74-ed6a-5329-8970-b2eeb7774e06",
      );

      expect(frontmatter.stix_id).toBe(
        "domain-name--415ecb74-ed6a-5329-8970-b2eeb7774e06",
      );
      expect(processCount).toBe(1);
    },
  );

  it("preserves the same ID and rejects replacement of a real ID", async () => {
    frontmatter.stix_id =
      "domain-name--415ecb74-ed6a-5329-8970-b2eeb7774e06";
    await expect(
      host.persistStixId(
        file.path,
        "domain-name--415ecb74-ed6a-5329-8970-b2eeb7774e06",
      ),
    ).resolves.toBeUndefined();

    await expect(
      host.persistStixId(
        file.path,
        "domain-name--aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa",
      ),
    ).rejects.toThrow("Cannot replace existing stix_id");
  });
});
