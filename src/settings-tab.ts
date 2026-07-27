import { PluginSettingTab, Setting, type SettingDefinitionItem } from "obsidian";

import type CtiStixWorkbenchPlugin from "./main";
import {
  createWorkbenchSettingDefinitions,
  isWorkbenchSettingKey,
  validateVaultPath,
  type WorkbenchSettingKey,
} from "./settings-definitions";

export class WorkbenchSettingTab extends PluginSettingTab {
  constructor(private readonly workbench: CtiStixWorkbenchPlugin) {
    super(workbench.app, workbench);
  }

  override getSettingDefinitions(): SettingDefinitionItem<WorkbenchSettingKey>[] {
    return createWorkbenchSettingDefinitions();
  }

  override getControlValue(key: string): unknown {
    return isWorkbenchSettingKey(key) ? this.workbench.settings[key] : undefined;
  }

  override async setControlValue(key: string, value: unknown): Promise<void> {
    if (isWorkbenchSettingKey(key)) {
      await this.workbench.updateSettings({ [key]: value });
    }
  }

  override display(): void {
    this.containerEl.empty();

    this.addPathSetting(
      "Export folder",
      "Vault folder where validated STIX bundles are written.",
      "exportFolder",
      "Exports",
    );

    new Setting(this.containerEl)
      .setName("Link traversal depth")
      .setDesc("Outgoing links followed from the active note, from 0 through 5.")
      .addSlider((slider) => {
        slider
          .setLimits(0, 5, 1)
          .setValue(this.workbench.settings.linkTraversalDepth)
          .onChange(async (value) => {
            await this.workbench.updateSettings({
              linkTraversalDepth: value,
            });
          });
      });

    this.addToggleSetting(
      "Include contextual linked objects",
      "Include linked typed notes within the configured traversal depth.",
      "includeContextualLinks",
    );
    this.addToggleSetting(
      "Read typed Canvas edges",
      "Treat directed stix-prefixed Canvas edges as exportable relationships.",
      "readTypedCanvasEdges",
    );

    new Setting(this.containerEl)
      .setName("Validation mode")
      .setDesc("Strict mode blocks unvalidated custom content.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("strict", "Strict")
          .addOption("lenient", "Lenient")
          .setValue(this.workbench.settings.validationMode)
          .onChange(async (value) => {
            await this.workbench.updateSettings({
              validationMode: value,
            });
          });
      });

    this.addToggleSetting(
      "Pretty-print bundles",
      "Format exported JSON for human review.",
      "prettyPrint",
    );
    this.addPathSetting(
      "Extension registry",
      "Vault-relative path to the local extension registry manifest.",
      "extensionRegistryPath",
      "STIX Extensions/registry.json",
    );
  }

  private addToggleSetting(
    name: string,
    description: string,
    key: "includeContextualLinks" | "readTypedCanvasEdges" | "prettyPrint",
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(description)
      .addToggle((toggle) => {
        toggle.setValue(this.workbench.settings[key]).onChange(async (value) => {
          await this.workbench.updateSettings({ [key]: value });
        });
      });
  }

  private addPathSetting(
    name: string,
    description: string,
    key: "exportFolder" | "extensionRegistryPath",
    placeholder: string,
  ): void {
    const setting = new Setting(this.containerEl).setName(name).setDesc(description);
    setting.addText((input) => {
      input
        .setPlaceholder(placeholder)
        .setValue(this.workbench.settings[key])
        .onChange(async (value) => {
          const error = validateVaultPath(value);
          setting.setDesc(error ?? description);
          if (error === undefined) {
            await this.workbench.updateSettings({ [key]: value });
          }
        });
    });
  }
}
