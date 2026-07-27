import { type App, Modal, Setting } from "obsidian";

class ConfirmationModal extends Modal {
  private resolved = false;

  constructor(
    app: App,
    private readonly title: string,
    private readonly message: string,
    private readonly resolve: (confirmed: boolean) => void,
  ) {
    super(app);
  }

  override onOpen(): void {
    this.setTitle(this.title);
    this.contentEl.createEl("p", { text: this.message });
    new Setting(this.contentEl)
      .addButton((button) =>
        button.setButtonText("Cancel").onClick(() => this.finish(false)),
      )
      .addButton((button) =>
        button
          .setCta()
          .setButtonText("Export whole vault")
          .onClick(() => this.finish(true)),
      );
  }

  override onClose(): void {
    this.contentEl.empty();
    if (!this.resolved) this.finish(false);
  }

  private finish(confirmed: boolean): void {
    if (this.resolved) return;
    this.resolved = true;
    this.resolve(confirmed);
    this.close();
  }
}

export function confirmWholeVaultExport(app: App, noteCount: number): Promise<boolean> {
  return new Promise((resolve) => {
    new ConfirmationModal(
      app,
      "Export the whole vault?",
      `The workbench will inspect ${noteCount} Markdown note(s), skip untyped notes, validate the complete scope, and write one Bundle only if validation passes.`,
      resolve,
    ).open();
  });
}
