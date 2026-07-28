import { type App, Modal } from "obsidian";

import type { Diagnostic } from "../core/diagnostics";
import { diagnosticHint, groupDiagnostics } from "./validation-report-state";

export interface ValidationReportInput {
  readonly scope: string;
  readonly objectCount?: number;
  readonly errors: readonly Diagnostic[];
  readonly warnings: readonly Diagnostic[];
}

class ValidationReportModal extends Modal {
  constructor(
    app: App,
    private readonly report: ValidationReportInput,
  ) {
    super(app);
  }

  override onOpen(): void {
    this.modalEl.addClass("cti-stix-validation-report");
    this.setTitle("STIX validation report");
    const total = this.report.errors.length + this.report.warnings.length;
    this.contentEl.createEl("p", {
      text:
        `${this.report.scope}: ${this.report.objectCount ?? 0} object(s), ` +
        `${this.report.errors.length} error(s), ${this.report.warnings.length} warning(s).`,
    });
    if (total === 0) {
      this.contentEl.createEl("p", {
        cls: "cti-stix-validation-success",
        text: "Validation passed with no diagnostics.",
      });
      return;
    }
    const groups = groupDiagnostics([...this.report.errors, ...this.report.warnings]);
    for (const group of ["Object", "Relationship", "Canvas", "Bundle"] as const) {
      const diagnostics = groups.get(group);
      if (diagnostics === undefined) continue;
      this.contentEl.createEl("h3", { text: `${group} diagnostics` });
      const list = this.contentEl.createEl("ul");
      for (const diagnostic of diagnostics) {
        const row = list.createEl("li", {
          cls: `cti-stix-diagnostic cti-stix-diagnostic-${diagnostic.severity}`,
        });
        row.createDiv({
          cls: "cti-stix-diagnostic-message",
          text: diagnostic.message,
        });
        const hint = diagnosticHint(diagnostic);
        if (hint !== undefined) {
          row.createDiv({
            cls: "cti-stix-diagnostic-hint",
            text: `How to fix: ${hint}`,
          });
        }
        const details = [
          diagnostic.field === undefined ? undefined : `field ${diagnostic.field}`,
          diagnostic.objectPath,
          diagnostic.location === undefined
            ? undefined
            : `line ${diagnostic.location.line}, column ${diagnostic.location.column}`,
        ].filter((value): value is string => value !== undefined);
        if (details.length > 0) {
          row.createEl("small", { text: details.join(" · ") });
        }
        const technical = row.createEl("details", {
          cls: "cti-stix-diagnostic-technical",
        });
        technical.createEl("summary", { text: "Technical details" });
        technical.createEl("code", {
          text: `${diagnostic.code} · ${diagnostic.authority}`,
        });
        if (diagnostic.notePath !== undefined) {
          const path = diagnostic.notePath;
          row
            .createEl("button", {
              cls: "mod-cta",
              text: `Open ${path}`,
            })
            .addEventListener("click", () => {
              void this.app.workspace.openLinkText(path, "", false);
            });
        }
      }
    }
  }

  override onClose(): void {
    this.contentEl.empty();
  }
}

export function openValidationReport(app: App, report: ValidationReportInput): void {
  new ValidationReportModal(app, report).open();
}
