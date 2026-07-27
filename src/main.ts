import { Notice, normalizePath, Plugin, type TFile } from "obsidian";

import {
  exportActiveGraph,
  validateActiveGraph,
} from "./adapters/obsidian/active-graph";
import { ObsidianActiveGraphHost } from "./adapters/obsidian/host";
import {
  exportCanvasGraph,
  exportScopedGraph,
  type ScopedExportResult,
  type ScopedValidationResult,
  validateCanvasGraph,
  validateScopedGraph,
} from "./adapters/obsidian/scoped-export";
import { validateBundleSchema } from "./core/bundle-validator";
import {
  type ExtensionRegistry,
  parseExtensionRegistry,
} from "./core/extension-registry";
import type { PersistedRelationshipIdentity } from "./core/types";
import { parsePluginData, serializePluginData } from "./plugin-data";
import { parseWorkbenchSettings, type WorkbenchSettings } from "./settings";
import { WorkbenchSettingTab } from "./settings-tab";
import { confirmWholeVaultExport } from "./ui/confirmation";
import { openStixObjectCreator } from "./ui/object-creator";
import { openStixPropertyEditor } from "./ui/property-editor";
import { editableStixDefinition } from "./ui/property-editor-state";
import { withScopeProgress } from "./ui/scope-progress";
import { openValidationReport } from "./ui/validation-report";

export default class CtiStixWorkbenchPlugin extends Plugin {
  override settings: WorkbenchSettings = parseWorkbenchSettings(undefined);
  private relationshipIdentities: Record<string, PersistedRelationshipIdentity> = {};

  override async onload(): Promise<void> {
    const data = parsePluginData(await this.loadData());
    this.settings = this.normalizePaths(data.settings);
    this.relationshipIdentities = { ...data.relationshipIdentities };
    this.addSettingTab(new WorkbenchSettingTab(this));
    this.addCommand({
      id: "create-stix-object",
      name: "Create STIX object",
      callback: () => openStixObjectCreator(this.app),
    });
    this.addCommand({
      id: "validate-active-stix-canvas",
      name: "Validate active STIX canvas",
      checkCallback: (checking) => {
        const file = this.activeCanvasFile();
        if (file === null) return false;
        if (!checking) void this.runCanvasValidation(file);
        return true;
      },
    });
    this.addCommand({
      id: "export-active-stix-canvas",
      name: "Export active STIX canvas",
      checkCallback: (checking) => {
        const file = this.activeCanvasFile();
        if (file === null) return false;
        if (!checking) void this.runCanvasExport(file);
        return true;
      },
    });
    this.addCommand({
      id: "validate-current-stix-folder",
      name: "Validate current folder as STIX",
      checkCallback: (checking) => {
        const folder = this.currentFolderPath();
        if (folder === undefined) return false;
        if (!checking) void this.runFolderValidation(folder);
        return true;
      },
    });
    this.addCommand({
      id: "export-current-stix-folder",
      name: "Export current folder as STIX",
      checkCallback: (checking) => {
        const folder = this.currentFolderPath();
        if (folder === undefined) return false;
        if (!checking) void this.runFolderExport(folder);
        return true;
      },
    });
    this.addCommand({
      id: "validate-stix-vault",
      name: "Validate whole vault as STIX",
      callback: () => {
        void this.runVaultValidation();
      },
    });
    this.addCommand({
      id: "export-stix-vault",
      name: "Export whole vault as STIX",
      callback: () => {
        void this.runVaultExport();
      },
    });
    this.addCommand({
      id: "edit-stix-properties",
      name: "Edit STIX properties",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file === null) {
          return false;
        }
        const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
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
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    const customType =
      frontmatter !== undefined &&
      typeof frontmatter.stix_type === "string" &&
      frontmatter.stix_type.startsWith("x-");
    return editableStixDefinition(frontmatter) === undefined && !customType
      ? null
      : file;
  }

  private activeCanvasFile(): TFile | null {
    const file = this.app.workspace.getActiveFile();
    return file?.extension.toLowerCase() === "canvas" ? file : null;
  }

  private currentFolderPath(): string | undefined {
    const file = this.app.workspace.getActiveFile();
    return file === null ? undefined : (file.parent?.path ?? "");
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
      const registry = await this.loadExtensionRegistry();
      const result = await validateActiveGraph(
        this.createActiveGraphHost(),
        file.path,
        this.settings,
        {
          validateBundle: (bundle, paths, mode) =>
            validateBundleSchema(bundle, paths, mode, registry),
        },
      );
      if (!result.ok) {
        openValidationReport(this.app, {
          scope: file.path,
          errors: result.errors,
          warnings: result.warnings,
        });
        new Notice(
          `STIX validation blocked: ${result.errors.length} error(s). ` +
            result.errors[0]?.message,
          10_000,
        );
        return;
      }
      openValidationReport(this.app, {
        scope: file.path,
        objectCount: result.objectCount,
        errors: [],
        warnings: result.warnings,
      });
      new Notice(
        `STIX graph is valid: ${result.objectCount} object(s), ` +
          `${result.warnings.length} warning(s).`,
      );
    } catch (error) {
      new Notice(`STIX validation failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async runExport(file: TFile): Promise<void> {
    try {
      const registry = await this.loadExtensionRegistry();
      const result = await exportActiveGraph(
        this.createActiveGraphHost(),
        file.path,
        this.settings,
        {
          validateBundle: (bundle, paths, mode) =>
            validateBundleSchema(bundle, paths, mode, registry),
        },
      );
      if (!result.ok) {
        new Notice(
          `STIX export blocked: ${result.errors.length} error(s). ` +
            result.errors[0]?.message,
          10_000,
        );
        return;
      }
      new Notice(
        `Exported ${result.bundle.objects.length} object(s) to ` +
          `${result.outputPath}.`,
      );
    } catch (error) {
      new Notice(`STIX export failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async runCanvasValidation(file: TFile): Promise<void> {
    try {
      const host = this.createActiveGraphHost();
      const registry = await this.loadExtensionRegistry();
      const result = await validateCanvasGraph(
        host,
        file.path,
        this.settings,
        this.validationDependencies(registry),
      );
      this.showScopedValidation(file.path, result);
    } catch (error) {
      new Notice(`STIX Canvas validation failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async runCanvasExport(file: TFile): Promise<void> {
    try {
      const host = this.createActiveGraphHost();
      const registry = await this.loadExtensionRegistry();
      const result = await exportCanvasGraph(
        host,
        file.path,
        this.settings,
        this.validationDependencies(registry),
      );
      this.showScopedExport(file.path, result);
    } catch (error) {
      new Notice(`STIX Canvas export failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async runFolderValidation(folder: string): Promise<void> {
    await this.runDiscoveredValidation(folder === "" ? "Vault root" : folder, folder);
  }

  private async runFolderExport(folder: string): Promise<void> {
    await this.runDiscoveredExport(folder === "" ? "Vault root" : folder, folder);
  }

  private async runVaultValidation(): Promise<void> {
    await this.runDiscoveredValidation("Whole vault");
  }

  private async runVaultExport(): Promise<void> {
    const host = this.createActiveGraphHost();
    const paths = host.listMarkdownPaths();
    if (!(await confirmWholeVaultExport(this.app, paths.length))) return;
    await this.runDiscoveredExport("Whole vault", undefined, host, paths);
  }

  private async runDiscoveredValidation(scope: string, folder?: string): Promise<void> {
    try {
      const host = this.createActiveGraphHost();
      const registry = await this.loadExtensionRegistry();
      const paths = host.listMarkdownPaths(folder);
      const result = await withScopeProgress(
        this.app,
        `Validating ${scope}`,
        paths.length,
        (signal, onProgress) =>
          validateScopedGraph(
            host,
            paths,
            [],
            this.settings,
            this.validationDependencies(registry),
            [],
            { signal, onProgress },
          ),
      );
      this.showScopedValidation(scope, result);
    } catch (error) {
      new Notice(`STIX scope validation failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async runDiscoveredExport(
    scope: string,
    folder?: string,
    existingHost?: ObsidianActiveGraphHost,
    existingPaths?: readonly string[],
  ): Promise<void> {
    try {
      const host = existingHost ?? this.createActiveGraphHost();
      const registry = await this.loadExtensionRegistry();
      const paths = existingPaths ?? host.listMarkdownPaths(folder);
      const result = await withScopeProgress(
        this.app,
        `Exporting ${scope}`,
        paths.length,
        (signal, onProgress) =>
          exportScopedGraph(
            host,
            paths,
            [],
            this.settings,
            this.validationDependencies(registry),
            [],
            { signal, onProgress },
          ),
      );
      this.showScopedExport(scope, result);
    } catch (error) {
      new Notice(`STIX scope export failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private validationDependencies(registry: ExtensionRegistry | undefined) {
    return {
      validateBundle: (
        bundle: Parameters<typeof validateBundleSchema>[0],
        paths: ReadonlyMap<string, string>,
        mode: WorkbenchSettings["validationMode"],
      ) => validateBundleSchema(bundle, paths, mode, registry),
    };
  }

  private showScopedValidation(scope: string, result: ScopedValidationResult): void {
    openValidationReport(this.app, {
      scope,
      ...(result.ok ? { objectCount: result.objectCount } : {}),
      errors: result.ok ? [] : result.errors,
      warnings: result.warnings,
    });
    new Notice(
      result.ok
        ? `${scope} is valid: ${result.objectCount} object(s), ${result.skippedCount} skipped note(s).`
        : `${scope} validation blocked: ${result.errors.length} error(s).`,
      result.ok ? 5_000 : 10_000,
    );
  }

  private showScopedExport(scope: string, result: ScopedExportResult): void {
    if (!result.ok) {
      openValidationReport(this.app, {
        scope,
        errors: result.errors,
        warnings: result.warnings,
      });
      new Notice(`${scope} export blocked: ${result.errors.length} error(s).`, 10_000);
      return;
    }
    new Notice(
      `Exported ${result.bundle.objects.length} object(s) to ${result.outputPath}; ` +
        `${result.skippedCount} untyped note(s) skipped.`,
    );
  }

  private async savePluginData(): Promise<void> {
    await this.saveData(
      serializePluginData({
        settings: this.settings,
        relationshipIdentities: this.relationshipIdentities,
      }),
    );
  }

  private async loadExtensionRegistry(): Promise<ExtensionRegistry | undefined> {
    const file = this.app.vault.getFileByPath(this.settings.extensionRegistryPath);
    if (file === null) return undefined;
    return parseExtensionRegistry(await this.app.vault.cachedRead(file));
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unexpected error.";
  }
}
