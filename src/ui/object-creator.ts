import {
  type App,
  FuzzySuggestModal,
  Modal,
  Notice,
  normalizePath,
  Setting,
  TFile,
  TFolder,
} from "obsidian";

import { stixCatalog } from "../catalog/stix-2.1";
import type { ObjectTypeDefinition } from "../catalog/types";
import { createObjectNote, defaultObjectPath } from "./object-creator-state";

const AUTHORABLE_FAMILIES = new Set(["sdo", "sro", "sco", "smo"]);

async function ensureParentFolders(app: App, path: string): Promise<void> {
  const segments = path.split("/").slice(0, -1);
  let current = "";
  for (const segment of segments) {
    current = current === "" ? segment : `${current}/${segment}`;
    const existing = app.vault.getAbstractFileByPath(current);
    if (existing instanceof TFolder) continue;
    if (existing instanceof TFile) throw new Error(`${current} is a file.`);
    await app.vault.createFolder(current);
  }
}

class ObjectDetailsModal extends Modal {
  private titleValue: string;
  private pathValue: string;
  private saving = false;

  constructor(
    app: App,
    private readonly definition: ObjectTypeDefinition,
  ) {
    super(app);
    this.titleValue = definition.title;
    this.pathValue = defaultObjectPath(definition, definition.title);
  }

  override onOpen(): void {
    this.setTitle(`Create ${this.definition.title}`);
    this.contentEl.createEl("p", {
      text: "Required catalog properties are added as safe draft values. Review them before export.",
    });
    new Setting(this.contentEl).setName("Note title").addText((input) => {
      input.setValue(this.titleValue).onChange((value) => {
        this.titleValue = value;
        try {
          this.pathValue = defaultObjectPath(this.definition, value);
          this.renderPathValue();
        } catch {
          // The create action reports an empty or unsafe title.
        }
      });
    });
    new Setting(this.contentEl).setName("Vault path").addText((input) => {
      input.inputEl.addClass("cti-stix-object-path");
      input.setValue(this.pathValue).onChange((value) => {
        this.pathValue = value;
      });
    });
    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.close()))
      .addButton((button) =>
        button
          .setCta()
          .setButtonText("Create note")
          .onClick(() => {
            void this.create();
          }),
      );
  }

  override onClose(): void {
    this.contentEl.empty();
  }

  private renderPathValue(): void {
    const input = this.contentEl.querySelector<HTMLInputElement>(
      ".cti-stix-object-path",
    );
    if (input !== null) input.value = this.pathValue;
  }

  private async create(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      const expectedDefault = defaultObjectPath(this.definition, this.titleValue);
      const rawPath = this.pathValue.trim() || expectedDefault;
      const path = normalizePath(rawPath);
      if (
        !path.toLowerCase().endsWith(".md") ||
        path.startsWith("/") ||
        /^[A-Za-z]:/u.test(path) ||
        rawPath.replaceAll("\\", "/").split("/").includes("..")
      ) {
        throw new Error("Choose a vault-relative Markdown path.");
      }
      if (this.app.vault.getAbstractFileByPath(path) !== null) {
        throw new Error(`${path} already exists.`);
      }
      await ensureParentFolders(this.app, path);
      const file = await this.app.vault.create(
        path,
        createObjectNote(this.definition, this.titleValue, new Date()),
      );
      await this.app.workspace.getLeaf(false).openFile(file);
      this.close();
      new Notice(`Created ${this.definition.title}: ${path}`);
    } catch (error) {
      new Notice(
        error instanceof Error ? error.message : "Could not create the STIX note.",
        10_000,
      );
    } finally {
      this.saving = false;
    }
  }
}

class StixTypeSuggestModal extends FuzzySuggestModal<ObjectTypeDefinition> {
  override getItems(): ObjectTypeDefinition[] {
    return stixCatalog
      .listObjectTypes()
      .filter((definition) => AUTHORABLE_FAMILIES.has(definition.family));
  }

  override getItemText(item: ObjectTypeDefinition): string {
    return `${item.title} (${item.type})`;
  }

  override onChooseItem(item: ObjectTypeDefinition): void {
    new ObjectDetailsModal(this.app, item).open();
  }
}

export function openStixObjectCreator(app: App): void {
  const modal = new StixTypeSuggestModal(app);
  modal.setPlaceholder("Search STIX 2.1 object types");
  modal.open();
}
