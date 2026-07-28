import { type App, Modal, Setting } from "obsidian";

import type { BundleImportPlan } from "../import/bundle-import";

class BundleImportModal extends Modal {
  private resolved = false;

  constructor(
    app: App,
    private readonly plan: BundleImportPlan,
    private readonly destination: string,
    private readonly resolve: (confirmed: boolean) => void,
  ) {
    super(app);
  }

  override onOpen(): void {
    this.setTitle("Import STIX bundle as notes?");
    this.contentEl.createEl("p", {
      text: `${this.plan.objectCount} objects will be imported atomically into ${this.destination}.`,
    });
    const list = this.contentEl.createEl("ul");
    for (const [type, count] of Object.entries(this.plan.countsByType)) {
      list.createEl("li", { text: `${type}: ${count}` });
    }
    new Setting(this.contentEl)
      .addButton((button) =>
        button.setButtonText("Cancel").onClick(() => this.finish(false)),
      )
      .addButton((button) =>
        button
          .setCta()
          .setButtonText("Import bundle")
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

export function confirmBundleImport(
  app: App,
  plan: BundleImportPlan,
  destination: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    new BundleImportModal(app, plan, destination, resolve).open();
  });
}
