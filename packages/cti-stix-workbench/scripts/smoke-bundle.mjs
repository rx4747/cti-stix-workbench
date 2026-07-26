import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

class PluginStub {
  constructor(app = {}) {
    this.app = app;
    this.commands = [];
    this.settingsTabs = [];
  }

  addCommand(command) {
    this.commands.push(command);
  }

  addSettingTab(tab) {
    this.settingsTabs.push(tab);
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
class TFileStub {}
class TFolderStub {}

const source = await readFile(new URL("../main.js", import.meta.url), "utf8");
const module = { exports: {} };
const obsidian = {
  Modal: ModalStub,
  Notice: class {},
  normalizePath: (value) => value.replaceAll("\\", "/"),
  Plugin: PluginStub,
  PluginSettingTab: PluginSettingTabStub,
  Setting: class {},
  TFile: TFileStub,
  TFolder: TFolderStub,
};

vm.runInNewContext(source, {
  module,
  exports: module.exports,
  require: (specifier) => {
    assert.equal(specifier, "obsidian");
    return obsidian;
  },
}, {
  filename: "main.js",
  timeout: 1_000,
});

const PluginClass = module.exports.default;
assert.equal(typeof PluginClass, "function");
const plugin = new PluginClass({});
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
    "edit-stix-properties",
    "validate-active-stix-graph",
    "export-active-stix-graph",
  ],
);
assert.equal(
  plugin.commands.some((command) => Object.hasOwn(command, "hotkeys")),
  false,
);

console.log("Loaded production bundle with an Obsidian API smoke stub.");
