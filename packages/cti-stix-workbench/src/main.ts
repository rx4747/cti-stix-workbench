import {
  normalizePath,
  Notice,
  Plugin,
  type TFile,
} from "obsidian";

import {
  exportActiveGraph,
  validateActiveGraph,
} from "./adapters/obsidian/active-graph";
import { ObsidianActiveGraphHost } from "./adapters/obsidian/host";
import { validateBundleSchema } from "./core/bundle-validator";
import type { PersistedRelationshipIdentity } from "./core/types";
import {
  parsePluginData,
  serializePluginData,
} from "./plugin-data";
import {
  parseWorkbenchSettings,
  type WorkbenchSettings,
} from "./settings";
import { WorkbenchSettingTab } from "./settings-tab";
import { openStixPropertyEditor } from "./ui/property-editor";
import { editableStixDefinition } from "./ui/property-editor-state";

export default class CtiStixWorkbenchPlugin extends Plugin {
  override settings: WorkbenchSettings = parseWorkbenchSettings(undefined);
  private relationshipIdentities: Record<
    string,
    PersistedRelationshipIdentity
  > = {};

  override async onload(): Promise<void> {
    const data = parsePluginData(await this.loadData());
    this.settings = this.normalizePaths(data.settings);
    this.relationshipIdentities = { ...data.relationshipIdentities };
    this.addSettingTab(new WorkbenchSettingTab(this));
    this.addCommand({
      id: "edit-stix-properties",
      name: "Edit STIX properties",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file === null) {
          return false;
        }
        const frontmatter =
          this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (editableStixDefinition(frontmatter) === undefined) {
          return false;
        }
        if (!checking) {
          return openStixPropertyEditor(this.app, file);
        }
        return true;
      },
    });
    this.addCommand({
      id: "validate-active-stix-graph",
      name: "Validate active STIX graph",
      checkCallback: (checking) => {
        const file = this.activeStixFile();
        if (file === null) {
          return false;
        }
        if (!checking) {
          void this.runValidation(file);
        }
        return true;
      },
    });
    this.addCommand({
      id: "export-active-stix-graph",
      name: "Export active STIX graph",
      checkCallback: (checking) => {
        const file = this.activeStixFile();
        if (file === null) {
          return false;
        }
        if (!checking) {
          void this.runExport(file);
        }
        return true;
      },
    });
  }

  async updateSettings(patch: Record<string, unknown>): Promise<void> {
    this.settings = this.normalizePaths(
      parseWorkbenchSettings({ ...this.settings, ...patch }),
    );
    await this.savePluginData();
  }

  private normalizePaths(settings: WorkbenchSettings): WorkbenchSettings {
    return {
      ...settings,
      exportFolder: normalizePath(settings.exportFolder),
      extensionRegistryPath: normalizePath(settings.extensionRegistryPath),
    };
  }

  private activeStixFile(): TFile | null {
    const file = this.app.workspace.getActiveFile();
    if (file === null || file.extension.toLowerCase() !== "md") {
      return null;
    }
    const frontmatter =
      this.app.metadataCache.getFileCache(file)?.frontmatter;
    return editableStixDefinition(frontmatter) === undefined ? null : file;
  }

  private createActiveGraphHost(): ObsidianActiveGraphHost {
    return new ObsidianActiveGraphHost(this.app, {
      load: () => ({ ...this.relationshipIdentities }),
      save: async (identities) => {
        this.relationshipIdentities = { ...identities };
        await this.savePluginData();
      },
    });
  }

  private async runValidation(file: TFile): Promise<void> {
    try {
      const result = await validateActiveGraph(
        this.createActiveGraphHost(),
        file.path,
        this.settings,
        { validateBundle: validateBundleSchema },
      );
      if (!result.ok) {
        new Notice(
          `STIX validation blocked: ${result.errors.length} error(s). `
          + result.errors[0]?.message,
          10_000,
        );
        return;
      }
      new Notice(
        `STIX graph is valid: ${result.objectCount} object(s), `
        + `${result.warnings.length} warning(s).`,
      );
    } catch (error) {
      new Notice(`STIX validation failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async runExport(file: TFile): Promise<void> {
    try {
      const result = await exportActiveGraph(
        this.createActiveGraphHost(),
        file.path,
        this.settings,
        { validateBundle: validateBundleSchema },
      );
      if (!result.ok) {
        new Notice(
          `STIX export blocked: ${result.errors.length} error(s). `
          + result.errors[0]?.message,
          10_000,
        );
        return;
      }
      new Notice(
        `Exported ${result.bundle.objects.length} object(s) to `
        + `${result.outputPath}.`,
      );
    } catch (error) {
      new Notice(`STIX export failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async savePluginData(): Promise<void> {
    await this.saveData(
      serializePluginData({
        settings: this.settings,
        relationshipIdentities: this.relationshipIdentities,
      }),
    );
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unexpected error.";
  }
}
