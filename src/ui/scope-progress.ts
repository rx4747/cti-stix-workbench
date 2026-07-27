import { type App, Modal, Setting } from "obsidian";

interface ProgressUpdate {
  readonly completed: number;
  readonly total: number;
  readonly path: string;
}

class ScopeProgressModal extends Modal {
  readonly controller = new AbortController();
  private progress?: HTMLProgressElement;
  private detail?: HTMLElement;
  private finished = false;

  constructor(
    app: App,
    private readonly title: string,
    private readonly total: number,
  ) {
    super(app);
  }

  override onOpen(): void {
    this.setTitle(this.title);
    this.progress = this.contentEl.createEl("progress");
    this.progress.max = Math.max(1, this.total);
    this.progress.value = 0;
    this.detail = this.contentEl.createEl("p", {
      text: `Preparing ${this.total} note(s)…`,
    });
    new Setting(this.contentEl).addButton((button) =>
      button.setButtonText("Cancel").onClick(() => {
        this.controller.abort();
        this.detail?.setText("Cancelling…");
      }),
    );
  }

  override onClose(): void {
    this.contentEl.empty();
    if (!this.finished) this.controller.abort();
  }

  update(update: ProgressUpdate): void {
    if (this.progress !== undefined) this.progress.value = update.completed;
    this.detail?.setText(`${update.completed}/${update.total}: ${update.path}`);
  }

  finish(): void {
    this.finished = true;
    this.close();
  }
}

export async function withScopeProgress<T>(
  app: App,
  title: string,
  total: number,
  operation: (
    signal: AbortSignal,
    update: (completed: number, count: number, path: string) => void,
  ) => Promise<T>,
): Promise<T> {
  const modal = new ScopeProgressModal(app, title, total);
  modal.open();
  try {
    return await operation(modal.controller.signal, (completed, count, path) => {
      modal.update({ completed, total: count, path });
    });
  } finally {
    modal.finish();
  }
}
