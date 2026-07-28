import type { SettingDefinitionItem } from "obsidian";

import { parseWorkbenchSettings, type WorkbenchSettings } from "./settings";

export type WorkbenchSettingKey = keyof WorkbenchSettings;

const settingKeys = new Set<WorkbenchSettingKey>([
  "exportFolder",
  "importFolder",
  "linkTraversalDepth",
  "includeContextualLinks",
  "readTypedCanvasEdges",
  "validationMode",
  "prettyPrint",
  "extensionRegistryPath",
  "scopeExcludedFolders",
]);

function normalizedVaultPath(value: string): string {
  return value.trim().replaceAll("\\", "/").replace(/\/+/gu, "/");
}

export function validateVaultPath(value: string): string | undefined {
  const parsed = parseWorkbenchSettings({ exportFolder: value }).exportFolder;
  if (parsed !== normalizedVaultPath(value)) {
    return "Enter a path inside the vault without parent segments.";
  }
  return undefined;
}

export function isWorkbenchSettingKey(key: string): key is WorkbenchSettingKey {
  return settingKeys.has(key as WorkbenchSettingKey);
}

export function createWorkbenchSettingDefinitions(): SettingDefinitionItem<WorkbenchSettingKey>[] {
  return [
    {
      name: "Export folder",
      desc: "Vault folder where validated STIX bundles are written.",
      control: {
        type: "text",
        key: "exportFolder",
        placeholder: "Exports",
        validate: validateVaultPath,
      },
    },
    {
      name: "Import folder",
      desc: "Vault folder where imported STIX Bundles become typed notes.",
      control: {
        type: "text",
        key: "importFolder",
        placeholder: "STIX Imports",
        validate: validateVaultPath,
      },
    },
    {
      name: "Link traversal depth",
      desc: "Outgoing links followed from the active note, from 0 through 5.",
      control: {
        type: "slider",
        key: "linkTraversalDepth",
        min: 0,
        max: 5,
        step: 1,
      },
    },
    {
      name: "Include contextual linked objects",
      desc: "Include linked typed notes within the configured traversal depth.",
      control: {
        type: "toggle",
        key: "includeContextualLinks",
      },
    },
    {
      name: "Read typed Canvas edges",
      desc: "Treat directed stix-prefixed Canvas edges as exportable relationships.",
      control: {
        type: "toggle",
        key: "readTypedCanvasEdges",
      },
    },
    {
      name: "Validation mode",
      desc: "Strict mode blocks unvalidated custom content.",
      control: {
        type: "dropdown",
        key: "validationMode",
        options: {
          strict: "Strict",
          lenient: "Lenient",
        },
      },
    },
    {
      name: "Pretty-print bundles",
      desc: "Format exported JSON for human review.",
      control: {
        type: "toggle",
        key: "prettyPrint",
      },
    },
    {
      name: "Extension registry",
      desc: "Vault-relative path to the local extension registry manifest.",
      control: {
        type: "text",
        key: "extensionRegistryPath",
        placeholder: "STIX Extensions/registry.json",
        validate: validateVaultPath,
      },
    },
    {
      name: "Folders excluded from broad scopes",
      desc: "Comma-separated vault folders skipped by folder and whole-vault validation, export, and canvas generation.",
      control: {
        type: "text",
        key: "scopeExcludedFolders",
        placeholder: "Templates",
      },
    },
  ];
}
