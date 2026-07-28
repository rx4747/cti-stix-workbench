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

import {
  type AnalystWorkflowDefinition,
  analystWorkflowDefinitions,
  createAnalystWorkflowNote,
  defaultWorkflowPath,
} from "../workflows/analyst-workflows";

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

class AnalystWorkflowDetailsModal extends Modal {
  private titleValue: string;
  private pathValue: string;
  private saving = false;

  constructor(
    app: App,
    private readonly workflow: AnalystWorkflowDefinition,
    private readonly relatedFile: TFile | null,
  ) {
    super(app);
    this.titleValue = workflow.title;
    this.pathValue = defaultWorkflowPath(workflow, workflow.title);
  }

  override onOpen(): void {
    this.setTitle(`Create ${this.workflow.title}`);
    this.contentEl.createEl("p", { text: this.workflow.description });
    this.contentEl.createEl("p", {
      text:
        this.relatedFile === null
          ? "No active Markdown note will be linked. Add at least one STIX object reference before export."
          : `The workflow will reference ${this.relatedFile.path}.`,
    });
    new Setting(this.contentEl).setName("Workflow title").addText((input) => {
      input.setValue(this.titleValue).onChange((value) => {
        this.titleValue = value;
        try {
          this.pathValue = defaultWorkflowPath(this.workflow, value);
          this.renderPathValue();
        } catch {
          // The create action reports an empty or unsafe title.
        }
      });
    });
    new Setting(this.contentEl).setName("Vault path").addText((input) => {
      input.inputEl.addClass("cti-analyst-workflow-path");
      input.setValue(this.pathValue).onChange((value) => {
        this.pathValue = value;
      });
    });
    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.close()))
      .addButton((button) =>
        button
          .setCta()
          .setButtonText("Create workflow")
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
      ".cti-analyst-workflow-path",
    );
    if (input !== null) input.value = this.pathValue;
  }

  private async create(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      const expectedDefault = defaultWorkflowPath(this.workflow, this.titleValue);
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
      const relatedNote =
        this.relatedFile === null
          ? undefined
          : { basename: this.relatedFile.basename, path: this.relatedFile.path };
      const file = await this.app.vault.create(
        path,
        createAnalystWorkflowNote(
          this.workflow,
          this.titleValue,
          new Date(),
          relatedNote,
        ),
      );
      await this.app.workspace.getLeaf(false).openFile(file);
      this.close();
      new Notice(`Created ${this.workflow.title}: ${path}`);
    } catch (error) {
      new Notice(
        error instanceof Error
          ? error.message
          : "Could not create the analyst workflow.",
        10_000,
      );
    } finally {
      this.saving = false;
    }
  }
}

class AnalystWorkflowSuggestModal extends FuzzySuggestModal<AnalystWorkflowDefinition> {
  override getItems(): AnalystWorkflowDefinition[] {
    return [...analystWorkflowDefinitions];
  }

  override getItemText(item: AnalystWorkflowDefinition): string {
    return `${item.title} — ${item.description}`;
  }

  override onChooseItem(item: AnalystWorkflowDefinition): void {
    const active = this.app.workspace.getActiveFile();
    const related = active?.extension.toLowerCase() === "md" ? active : null;
    new AnalystWorkflowDetailsModal(this.app, item, related).open();
  }
}

export function openAnalystWorkflowCreator(app: App): void {
  const modal = new AnalystWorkflowSuggestModal(app);
  modal.setPlaceholder("Choose an analyst workflow");
  modal.open();
}
