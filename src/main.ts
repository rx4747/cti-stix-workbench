import { Notice, normalizePath, Plugin, TFile } from "obsidian";

import {
  exportActiveGraph,
  validateActiveGraph,
} from "./adapters/obsidian/active-graph";
import { executeBundleImport } from "./adapters/obsidian/bundle-import";
import { ObsidianActiveGraphHost } from "./adapters/obsidian/host";
import {
  exportCanvasGraph,
  exportScopedGraph,
  type ScopedExportResult,
  type ScopedValidationResult,
  validateCanvasGraph,
  validateScopedGraph,
} from "./adapters/obsidian/scoped-export";
import { generateCanvasDocument, nextAvailableCanvasPath } from "./canvas/generator";
import { validateBundleSchema } from "./core/bundle-validator";
import {
  type ExtensionRegistry,
  parseExtensionRegistry,
} from "./core/extension-registry";
import type { PersistedRelationshipIdentity } from "./core/types";
import { advanceStixTimestamp } from "./core/versioning";
import { parseStixBundleJson, planBundleImport } from "./import/bundle-import";
import { parsePluginData, serializePluginData } from "./plugin-data";
import { parseWorkbenchSettings, type WorkbenchSettings } from "./settings";
import { WorkbenchSettingTab } from "./settings-tab";
import { openAnalystWorkflowCreator } from "./ui/analyst-workflow";
import { confirmBundleImport } from "./ui/bundle-import";
import { confirmWholeVaultExport } from "./ui/confirmation";
import { openStixObjectCreator } from "./ui/object-creator";
import { openStixPropertyEditor } from "./ui/property-editor";
import { editableStixDefinition } from "./ui/property-editor-state";
import { withScopeProgress } from "./ui/scope-progress";
import {
  type LoadedStixViewerSource,
  STIX_VIEWER_VIEW_TYPE,
  type StixViewerDependencies,
  type StixViewerSource,
  StixViewerView,
} from "./ui/stix-viewer";
import { openValidationReport } from "./ui/validation-report";
import { buildStixViewerModel, parseStixViewerJson } from "./viewer/model";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export default class CtiStixWorkbenchPlugin extends Plugin {
  override settings: WorkbenchSettings = parseWorkbenchSettings(undefined);
  private relationshipIdentities: Record<string, PersistedRelationshipIdentity> = {};

  override async onload(): Promise<void> {
    const data = parsePluginData(await this.loadData());
    this.settings = this.normalizePaths(data.settings);
    this.relationshipIdentities = { ...data.relationshipIdentities };
    this.addSettingTab(new WorkbenchSettingTab(this));
    const viewerDependencies = this.viewerDependencies();
    this.registerView(
      STIX_VIEWER_VIEW_TYPE,
      (leaf) => new StixViewerView(leaf, viewerDependencies),
    );
    this.addRibbonIcon("waypoints", "Open in STIX viewer", () => {
      const source = this.activeViewerSource();
      if (source === undefined) {
        new Notice(
          "Open a typed STIX note, or right-click a STIX JSON file in the file explorer.",
        );
        return;
      }
      void this.openViewer(source);
    });
    this.addCommand({
      id: "open-stix-viewer",
      name: "Open in STIX viewer",
      checkCallback: (checking) => {
        const source = this.activeViewerSource();
        if (source === undefined) return false;
        if (!checking) void this.openViewer(source);
        return true;
      },
    });
    this.addCommand({
      id: "import-stix-bundle",
      name: "Import STIX bundle as notes",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file === null || file.extension.toLowerCase() !== "json") return false;
        if (!checking) void this.runBundleImport(file);
        return true;
      },
    });
    this.addCommand({
      id: "create-stix-object",
      name: "Create STIX object",
      callback: () => openStixObjectCreator(this.app),
    });
    this.addCommand({
      id: "create-analyst-workflow",
      name: "Create analyst workflow",
      callback: () => openAnalystWorkflowCreator(this.app),
    });
    this.addCommand({
      id: "generate-active-stix-canvas",
      name: "Generate canvas from active STIX graph",
      checkCallback: (checking) => {
        const file = this.activeStixFile();
        if (file === null) return false;
        if (!checking) void this.generateActiveGraphCanvas(file);
        return true;
      },
    });
    this.addCommand({
      id: "generate-folder-stix-canvas",
      name: "Generate canvas from current folder",
      checkCallback: (checking) => {
        const folder = this.currentFolderPath();
        if (folder === undefined) return false;
        if (!checking) void this.generateFolderCanvas(folder);
        return true;
      },
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
      id: "create-new-stix-version",
      name: "Create new STIX object version",
      checkCallback: (checking) => {
        const file = this.versionableActiveFile();
        if (file === null) return false;
        if (!checking) void this.createObjectVersion(file, false);
        return true;
      },
    });
    this.addCommand({
      id: "revoke-stix-object",
      name: "Revoke STIX object in a new version",
      checkCallback: (checking) => {
        const file = this.versionableActiveFile();
        if (file === null) return false;
        if (!checking) void this.createObjectVersion(file, true);
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
    this.app.workspace.onLayoutReady(() => this.registerViewerEvents());
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
      importFolder: normalizePath(settings.importFolder),
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

  private versionableActiveFile(): TFile | null {
    const file = this.app.workspace.getActiveFile();
    if (file === null || file.extension.toLowerCase() !== "md") return null;
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    const definition = editableStixDefinition(frontmatter);
    if (
      definition === undefined ||
      definition.family === "sco" ||
      frontmatter === undefined ||
      definition.type === "marking-definition" ||
      typeof frontmatter.stix_id !== "string" ||
      typeof frontmatter.modified !== "string" ||
      frontmatter.revoked === true
    ) {
      return null;
    }
    return file;
  }

  private async createObjectVersion(file: TFile, revoke: boolean): Promise<void> {
    try {
      const source = await this.app.vault.cachedRead(file);
      const frontmatter: unknown =
        this.app.metadataCache.getFileCache(file)?.frontmatter;
      const current = isRecord(frontmatter) ? frontmatter.modified : undefined;
      const modified = advanceStixTimestamp(
        typeof current === "string" ? current : undefined,
        new Date(),
      );
      const suffix = modified.replaceAll(/[^0-9]/gu, "").slice(0, 14);
      const parent = file.parent?.path === "/" ? "" : (file.parent?.path ?? "");
      const baseName = file.basename.replace(/ - \d{14}$/u, "");
      const path = normalizePath(`${parent}/${baseName} - ${suffix}.md`);
      if (this.app.vault.getAbstractFileByPath(path) !== null) {
        throw new Error(`A version note already exists at ${path}.`);
      }
      const created = await this.app.vault.create(path, source);
      await this.app.fileManager.processFrontMatter(created, (frontmatter: unknown) => {
        if (
          frontmatter === null ||
          typeof frontmatter !== "object" ||
          Array.isArray(frontmatter)
        ) {
          throw new TypeError("STIX note frontmatter is not a dictionary.");
        }
        const record = frontmatter as Record<string, unknown>;
        record.modified = modified;
        if (revoke) record.revoked = true;
      });
      await this.app.workspace.getLeaf(false).openFile(created);
      new Notice(
        revoke
          ? "Created a revoked STIX object version."
          : "Created a new STIX object version.",
      );
    } catch (error) {
      new Notice(`Could not create STIX version: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private viewerSourceForFile(file: TFile): StixViewerSource | undefined {
    const extension = file.extension.toLowerCase();
    if (extension === "json") return { kind: "json", path: file.path };
    if (extension !== "md") return undefined;
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (frontmatter === undefined || typeof frontmatter !== "object") {
      return undefined;
    }
    const type =
      typeof frontmatter.stix_type === "string"
        ? frontmatter.stix_type
        : typeof frontmatter.type === "string"
          ? frontmatter.type
          : undefined;
    return type !== undefined &&
      (editableStixDefinition(frontmatter) !== undefined || type.startsWith("x-"))
      ? { kind: "note", path: file.path }
      : undefined;
  }

  private activeViewerSource(): StixViewerSource | undefined {
    const file = this.app.workspace.getActiveFile();
    return file === null ? undefined : this.viewerSourceForFile(file);
  }

  private viewerDependencies(): StixViewerDependencies {
    return {
      load: (source) => this.loadViewerSource(source),
      openNote: async (path) => {
        const file = this.app.vault.getFileByPath(path);
        if (file === null) throw new Error(`Source note no longer exists: ${path}`);
        await this.app.workspace.getLeaf(false).openFile(file);
      },
    };
  }

  private async loadViewerSource(
    source: StixViewerSource,
  ): Promise<LoadedStixViewerSource> {
    const file = this.app.vault.getFileByPath(source.path);
    if (file === null) throw new Error(`Source file no longer exists: ${source.path}`);
    if (source.kind === "json") {
      if (file.extension.toLowerCase() !== "json") {
        throw new Error(`${source.path} is no longer a JSON file.`);
      }
      return {
        model: parseStixViewerJson(await this.app.vault.cachedRead(file)),
        title: file.basename,
        description: `STIX JSON · ${file.path}`,
        watchedPaths: new Set([file.path]),
      };
    }

    if (file.extension.toLowerCase() !== "md") {
      throw new Error(`${source.path} is no longer a Markdown note.`);
    }
    const result = await validateActiveGraph(
      this.createActiveGraphHost(),
      file.path,
      this.settings,
      { validateBundle: () => [] },
    );
    if (!result.ok) {
      throw new Error(
        `The note graph could not be mapped: ${result.errors[0]?.message ?? "invalid STIX input"}`,
      );
    }
    const watchedPaths = new Set([file.path, ...result.notePathById.values()]);
    return {
      model: buildStixViewerModel(result.bundle, result.notePathById),
      title: file.basename,
      description: `STIX note graph · ${file.path}`,
      watchedPaths,
    };
  }

  private async openViewer(source: StixViewerSource): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(STIX_VIEWER_VIEW_TYPE)[0];
    const leaf = existing ?? this.app.workspace.getLeaf("tab");
    await leaf.setViewState({
      type: STIX_VIEWER_VIEW_TYPE,
      active: true,
      state: { source },
    });
    await this.app.workspace.revealLeaf(leaf);
  }

  private registerViewerEvents(): void {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile)) return;
        const source = this.viewerSourceForFile(file);
        if (source === undefined) return;
        menu.addItem((item) =>
          item
            .setTitle("Open in STIX viewer")
            .setIcon("waypoints")
            .onClick(() => {
              void this.openViewer(source);
            }),
        );
        if (file.extension.toLowerCase() === "json") {
          menu.addItem((item) =>
            item
              .setTitle("Import STIX bundle as notes")
              .setIcon("package-open")
              .onClick(() => {
                void this.runBundleImport(file);
              }),
          );
        }
      }),
    );
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof TFile) this.refreshViewerLeaves(file.path);
      }),
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFile) this.refreshViewerLeaves(file.path, oldPath);
      }),
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof TFile) this.refreshViewerLeaves(file.path);
      }),
    );
  }

  private refreshViewerLeaves(path: string, oldPath?: string): void {
    for (const leaf of this.app.workspace.getLeavesOfType(STIX_VIEWER_VIEW_TYPE)) {
      if (leaf.view instanceof StixViewerView) {
        leaf.view.refreshIfRelevant(path, oldPath);
      }
    }
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

  private async runBundleImport(file: TFile): Promise<void> {
    try {
      const bundle = parseStixBundleJson(await this.app.vault.cachedRead(file));
      const registry = await this.loadExtensionRegistry();
      const diagnostics = validateBundleSchema(
        bundle,
        new Map(),
        this.settings.validationMode,
        registry,
      );
      const errors = diagnostics.filter((item) => item.severity === "error");
      if (errors.length > 0) {
        openValidationReport(this.app, {
          scope: file.path,
          errors,
          warnings: diagnostics.filter((item) => item.severity === "warning"),
        });
        new Notice(
          `STIX import blocked: ${errors[0]?.message ?? "invalid Bundle"}`,
          10_000,
        );
        return;
      }
      const plan = planBundleImport(bundle);
      const destination = `${this.settings.importFolder}/${file.basename}`;
      if (!(await confirmBundleImport(this.app, plan, destination))) return;
      const output = await executeBundleImport(
        this.app,
        plan,
        this.settings.importFolder,
        file.basename,
      );
      const warnings = diagnostics.filter((item) => item.severity === "warning");
      if (warnings.length > 0) {
        openValidationReport(this.app, { scope: file.path, errors: [], warnings });
      }
      new Notice(
        `Imported ${plan.objectCount} STIX objects into ${output}. ` +
          `${warnings.length} warning(s).`,
      );
    } catch (error) {
      new Notice(`STIX import failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async writeGeneratedCanvas(
    title: string,
    bundle: Parameters<typeof buildStixViewerModel>[0],
    notePathById: ReadonlyMap<string, string>,
  ): Promise<void> {
    const host = this.createActiveGraphHost();
    const document = generateCanvasDocument(buildStixViewerModel(bundle, notePathById));
    if (document.nodes.length === 0) {
      throw new Error("The selected STIX scope has no note-backed objects.");
    }
    await host.ensureFolder("Canvases");
    const outputPath = nextAvailableCanvasPath(title, (path) => host.exists(path));
    await host.createFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
    const created = this.app.vault.getFileByPath(outputPath);
    if (created !== null) await this.app.workspace.getLeaf(false).openFile(created);
    new Notice(
      `Generated ${outputPath} with ${document.nodes.length} object note(s) and ` +
        `${document.edges.length} relationship edge(s).`,
    );
  }

  private async generateActiveGraphCanvas(file: TFile): Promise<void> {
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
          `Canvas generation blocked: ${result.errors.length} error(s).`,
          10_000,
        );
        return;
      }
      await this.writeGeneratedCanvas(
        file.basename,
        result.bundle,
        result.notePathById,
      );
    } catch (error) {
      new Notice(`Canvas generation failed: ${this.errorMessage(error)}`, 10_000);
    }
  }

  private async generateFolderCanvas(folder: string): Promise<void> {
    try {
      const host = this.createActiveGraphHost();
      const registry = await this.loadExtensionRegistry();
      const notePaths = host.listMarkdownPaths(folder);
      const result = await validateScopedGraph(
        host,
        notePaths,
        [],
        this.settings,
        this.validationDependencies(registry),
      );
      const scope = folder === "" ? "Vault" : folder;
      if (!result.ok) {
        openValidationReport(this.app, {
          scope,
          errors: result.errors,
          warnings: result.warnings,
        });
        new Notice(
          `Canvas generation blocked: ${result.errors.length} error(s).`,
          10_000,
        );
        return;
      }
      const title = folder === "" ? "Vault" : (folder.split("/").at(-1) ?? "Vault");
      await this.writeGeneratedCanvas(title, result.bundle, result.notePathById);
    } catch (error) {
      new Notice(`Canvas generation failed: ${this.errorMessage(error)}`, 10_000);
    }
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
