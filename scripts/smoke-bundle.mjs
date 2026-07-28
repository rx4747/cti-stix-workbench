import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

class PluginStub {
  constructor(app = {}) {
    this.app = app;
    this.commands = [];
    this.events = [];
    this.ribbonIcons = [];
    this.settingsTabs = [];
    this.views = new Map();
  }

  addCommand(command) {
    this.commands.push(command);
  }

  addSettingTab(tab) {
    this.settingsTabs.push(tab);
  }

  addRibbonIcon(icon, title, callback) {
    this.ribbonIcons.push({ callback, icon, title });
    return {};
  }

  registerEvent(event) {
    this.events.push(event);
  }

  registerView(type, creator) {
    this.views.set(type, creator);
  }

  async loadData() {
    return {};
  }

  async saveData() {}
}

class PluginSettingTabStub {
  constructor(app, plugin) {
    this.app = app;
    this.plugin = plugin;
  }
}

class ModalStub {}
class FuzzySuggestModalStub extends ModalStub {}
class ItemViewStub {}
class TFileStub {}
class TFolderStub {}

const source = await readFile(new URL("../main.js", import.meta.url), "utf8");
assert.ok(
  Buffer.byteLength(source) <= 1_500_000,
  "Production main.js exceeds the 1.5 MB v1 bundle budget.",
);
const module = { exports: {} };
const obsidian = {
  FuzzySuggestModal: FuzzySuggestModalStub,
  ItemView: ItemViewStub,
  Modal: ModalStub,
  Notice: class {},
  normalizePath: (value) => value.replaceAll("\\", "/"),
  Plugin: PluginStub,
  PluginSettingTab: PluginSettingTabStub,
  Setting: class {},
  setIcon: () => {},
  TFile: TFileStub,
  TFolder: TFolderStub,
};

vm.runInNewContext(
  source,
  {
    module,
    exports: module.exports,
    require: (specifier) => {
      assert.equal(specifier, "obsidian");
      return obsidian;
    },
  },
  {
    filename: "main.js",
    timeout: 1_000,
  },
);

const PluginClass = module.exports.default;
assert.equal(typeof PluginClass, "function");
const fakeEvent = {};
const app = {
  vault: {
    on: () => fakeEvent,
  },
  workspace: {
    on: () => fakeEvent,
    onLayoutReady: (callback) => callback(),
  },
};
const plugin = new PluginClass(app);
await plugin.onload();
assert.equal(plugin.settingsTabs.length, 1);
assert.equal(
  typeof plugin.settingsTabs[0]?.display,
  "function",
  "The settings tab must implement the Obsidian 1.8 display contract.",
);
assert.deepEqual(
  plugin.commands.map((command) => command.id),
  [
    "open-stix-viewer",
    "import-stix-bundle",
    "create-stix-object",
    "validate-active-stix-canvas",
    "export-active-stix-canvas",
    "validate-current-stix-folder",
    "export-current-stix-folder",
    "validate-stix-vault",
    "export-stix-vault",
    "edit-stix-properties",
    "create-new-stix-version",
    "revoke-stix-object",
    "validate-active-stix-graph",
    "export-active-stix-graph",
  ],
);
assert.equal(plugin.views.has("cti-stix-viewer"), true);
assert.deepEqual(
  plugin.ribbonIcons.map(({ icon, title }) => ({ icon, title })),
  [{ icon: "waypoints", title: "Open in STIX viewer" }],
);
assert.equal(plugin.events.length, 4);
assert.equal(
  plugin.commands.some((command) => Object.hasOwn(command, "hotkeys")),
  false,
);

console.log("Loaded production bundle with an Obsidian API smoke stub.");
