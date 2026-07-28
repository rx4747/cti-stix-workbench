import {
  type App,
  FuzzySuggestModal,
  Modal,
  Notice,
  Setting,
  setIcon,
  type TFile,
} from "obsidian";

import { stixCatalog } from "../catalog/stix-2.1";
import type { CatalogField, ObjectTypeDefinition } from "../catalog/types";
import {
  addObjectListItem,
  addOptionalEditorField,
  advanceModifiedForEdit,
  applyEditorValues,
  availableOptionalFields,
  cloneEditorValue,
  createEditorValues,
  createExtensionValue,
  editableStixDefinition,
  rawStixReferenceLabel,
  referenceTypeAllowed,
  removeOptionalEditorField,
  scalarEditorText,
  stixReferenceLink,
  updateObjectListItemField,
  wikiLinkTarget,
} from "./property-editor-state";

const bodyMappedFields = new Map([
  ["content", "Content"],
  ["description", "Summary"],
  ["explanation", "Explanation"],
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function displayName(name: string): string {
  const words = name.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function parseScalar(value: string, dataType: string): unknown {
  if (value.trim() === "") {
    return "";
  }
  if (dataType === "integer") {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : value;
  }
  if (dataType === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}

function listText(value: unknown): string {
  return Array.isArray(value)
    ? value.map((item) => scalarEditorText(item)).join("\n")
    : "";
}

function parsePrimitiveList(value: string, dataType: string): unknown[] {
  const itemType = /^array<(.+)>$/u.exec(dataType)?.[1] ?? "string";
  return value
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => parseScalar(item, itemType));
}

function frontmatterKey(fieldName: string): string {
  if (fieldName === "type") {
    return "stix_type";
  }
  if (fieldName === "id") {
    return "stix_id";
  }
  return fieldName;
}

interface StixReferenceCandidate {
  readonly file: TFile;
  readonly stixType: string;
}

class StixReferenceSuggestModal extends FuzzySuggestModal<StixReferenceCandidate> {
  private readonly candidates: StixReferenceCandidate[];
  private readonly choose: (link: string) => void;

  constructor(
    app: App,
    targetTypes: readonly string[],
    choose: (link: string) => void,
  ) {
    super(app);
    this.choose = choose;
    this.setPlaceholder("Choose a typed STIX note");
    this.candidates = app.vault
      .getMarkdownFiles()
      .flatMap((file) => {
        const frontmatter: unknown = app.metadataCache.getFileCache(file)?.frontmatter;
        const stixType = isRecord(frontmatter) ? frontmatter.stix_type : undefined;
        return typeof stixType === "string" &&
          referenceTypeAllowed(stixType, targetTypes)
          ? [{ file, stixType }]
          : [];
      })
      .sort((left, right) => left.file.path.localeCompare(right.file.path));
  }

  getItems(): StixReferenceCandidate[] {
    return this.candidates;
  }

  getItemText(candidate: StixReferenceCandidate): string {
    return `${candidate.file.basename} — ${candidate.stixType} — ${candidate.file.path}`;
  }

  onChooseItem(candidate: StixReferenceCandidate): void {
    this.choose(stixReferenceLink(candidate.file.path));
  }
}

class RawStixReferenceModal extends Modal {
  private reference = "";
  private readonly choose: (reference: string) => void;

  constructor(app: App, choose: (reference: string) => void) {
    super(app);
    this.choose = choose;
  }

  override onOpen(): void {
    this.setTitle("Add raw STIX reference");
    this.contentEl.createEl("p", {
      text: "Use this only when the referenced object is not available as a typed note in this vault.",
    });
    new Setting(this.contentEl).setName("STIX id").addText((input) => {
      input.setPlaceholder("indicator--UUID").onChange((value) => {
        this.reference = value.trim();
      });
    });
    new Setting(this.contentEl)
      .addButton((button) => {
        button.setButtonText("Cancel").onClick(() => this.close());
      })
      .addButton((button) => {
        button
          .setCta()
          .setButtonText("Add reference")
          .onClick(() => {
            if (this.reference === "") {
              new Notice("Enter a STIX identifier.");
              return;
            }
            this.choose(this.reference);
            this.close();
          });
      });
  }

  override onClose(): void {
    this.contentEl.empty();
  }
}

interface PropertyEditorOptions {
  readonly app: App;
  readonly file: TFile;
  readonly definition: ObjectTypeDefinition;
  readonly frontmatter: Readonly<Record<string, unknown>>;
}

export class StixPropertyEditorModal extends Modal {
  private readonly file: TFile;
  private readonly definition: ObjectTypeDefinition;
  private readonly hasStableIdentity: boolean;
  private values: Record<string, unknown>;
  private readonly invalidJsonPaths = new Set<string>();
  private saving = false;

  constructor(options: PropertyEditorOptions) {
    super(options.app);
    this.file = options.file;
    this.definition = options.definition;
    this.hasStableIdentity =
      typeof options.frontmatter.stix_id === "string" &&
      options.frontmatter.stix_id.trim() !== "";
    this.values = createEditorValues(options.definition, options.frontmatter);
  }

  override onOpen(): void {
    this.render();
  }

  override onClose(): void {
    this.contentEl.empty();
  }

  private render(): void {
    this.invalidJsonPaths.clear();
    this.contentEl.empty();
    this.modalEl.addClass("cti-stix-property-editor-modal");
    this.setTitle(`Edit ${this.definition.title} properties`);

    this.contentEl.createEl("p", {
      cls: "cti-stix-property-editor-intro",
      text: "All values are saved to this note's STIX frontmatter. Nested fields are created only when you add them.",
    });
    if (
      this.hasStableIdentity &&
      this.definition.fields.some((field) => field.name === "modified")
    ) {
      this.contentEl.createEl("p", {
        cls: "cti-stix-property-editor-note",
        text: "Saving a changed object creates a new STIX version: id, created, and created_by_ref stay fixed while modified advances automatically.",
      });
    }

    const mappedHeadings = this.definition.fields
      .map((field) => bodyMappedFields.get(field.name))
      .filter((heading): heading is string => heading !== undefined);
    if (mappedHeadings.length > 0) {
      this.contentEl.createEl("p", {
        cls: "cti-stix-property-editor-note",
        text: `${mappedHeadings.join(", ")} prose remains in the matching note section.`,
      });
    }

    for (const field of this.definition.fields) {
      if (bodyMappedFields.has(field.name)) {
        continue;
      }
      const key = frontmatterKey(field.name);
      if (!Object.hasOwn(this.values, key)) continue;
      const fieldContainer = this.contentEl.createDiv({
        cls: "cti-stix-property-field",
      });
      if (!field.required) {
        new Setting(fieldContainer)
          .setName(displayName(field.name))
          .setDesc("Optional property")
          .addButton((button) => {
            button.buttonEl.addClass("cti-stix-destructive-button");
            button.setButtonText("Remove property").onClick(() => {
              this.values = removeOptionalEditorField(this.values, field);
              this.render();
            });
          });
      }
      this.renderField(
        fieldContainer,
        field,
        this.values[key],
        (value) => {
          this.values[key] = value;
        },
        key,
      );
    }

    const optional = availableOptionalFields(this.definition, this.values);
    if (optional.length > 0) {
      let selected = optional[0]?.name;
      new Setting(this.contentEl)
        .setName("Add property")
        .setDesc("Add an optional STIX 2.1 property only when it has a value.")
        .addDropdown((dropdown) => {
          for (const field of optional) {
            dropdown.addOption(field.name, displayName(field.name));
          }
          dropdown.onChange((next) => {
            selected = next;
          });
        })
        .addButton((button) => {
          button.setButtonText("Add property").onClick(() => {
            const field = optional.find((candidate) => candidate.name === selected);
            if (field === undefined) return;
            this.values = addOptionalEditorField(this.values, field);
            this.render();
          });
        });
    }

    const actions = this.contentEl.createDiv({
      cls: "cti-stix-property-editor-actions",
    });
    new Setting(actions)
      .addButton((button) => {
        button.setButtonText("Cancel").onClick(() => this.close());
      })
      .addButton((button) => {
        button
          .setCta()
          .setButtonText("Save properties")
          .onClick(() => {
            void this.save();
          });
      });
  }

  private renderField(
    container: HTMLElement,
    field: CatalogField,
    value: unknown,
    onChange: (value: unknown) => void,
    path: string,
  ): void {
    if (field.name === "extensions" && field.dataType === "object") {
      this.renderExtensions(container, value, onChange, path);
      return;
    }
    if (field.reference !== undefined) {
      this.renderReferenceField(container, field, value, onChange);
      return;
    }
    if (field.dataType.includes("array<object>")) {
      this.renderObjectList(container, field, value, onChange, path);
      return;
    }
    if (field.dataType === "object") {
      this.renderObject(container, field, value, onChange, path);
      return;
    }
    if (field.dataType.startsWith("array<")) {
      const setting = this.createFieldSetting(container, field);
      setting.addTextArea((input) => {
        input
          .setPlaceholder("One value or [[STIX note]] per line")
          .setValue(listText(value))
          .onChange((next) => {
            onChange(parsePrimitiveList(next, field.dataType));
          });
        input.inputEl.rows = Math.max(
          2,
          Math.min(6, Array.isArray(value) ? value.length + 1 : 2),
        );
      });
      return;
    }
    if (field.dataType === "boolean") {
      this.createFieldSetting(container, field).addDropdown((dropdown) => {
        dropdown
          .addOption("", "Not set")
          .addOption("true", "True")
          .addOption("false", "False")
          .setValue(value === true ? "true" : value === false ? "false" : "")
          .onChange((next) => {
            onChange(next === "true" ? true : next === "false" ? false : "");
          });
      });
      return;
    }

    const setting = this.createFieldSetting(container, field);
    const vocabulary = field.vocabulary;
    if (vocabulary?.kind === "closed") {
      setting.addDropdown((dropdown) => {
        dropdown.addOption("", "Not set");
        for (const option of vocabulary.values) {
          dropdown.addOption(option, option);
        }
        const current = scalarEditorText(value);
        if (current !== "" && !vocabulary.values.includes(current)) {
          dropdown.addOption(current, `${current} (invalid)`);
        }
        dropdown.setValue(current).onChange(onChange);
      });
      return;
    }

    setting.addText((input) => {
      input.setValue(scalarEditorText(value)).onChange((next) => {
        onChange(parseScalar(next, field.dataType));
      });
      if (
        field.name === "type" ||
        field.name === "id" ||
        field.name === "created" ||
        field.name === "modified" ||
        (this.hasStableIdentity && field.name === "created_by_ref")
      ) {
        input.setDisabled(true);
      }
    });
  }

  private renderReferenceField(
    container: HTMLElement,
    field: CatalogField,
    value: unknown,
    onChange: (value: unknown) => void,
  ): void {
    const setting = this.createFieldSetting(container, field);
    const targetTypes = field.reference?.targetTypes ?? ["*"];
    const controls = setting.controlEl.createDiv({
      cls: "cti-stix-reference-controls",
    });
    if (field.dataType.startsWith("array<")) {
      const current = Array.isArray(value)
        ? value.map((item) => scalarEditorText(item)).filter((item) => item !== "")
        : [];
      this.renderReferencePills(controls, current, (reference) => {
        onChange(current.filter((item) => item !== reference));
        this.render();
      });
      this.renderReferenceActions(controls, targetTypes, {
        choose: (reference) => {
          onChange(current.includes(reference) ? current : [...current, reference]);
          this.render();
        },
        chooseLabel: "Add STIX note",
      });
      return;
    }

    const lockedCreator = this.hasStableIdentity && field.name === "created_by_ref";
    const current = scalarEditorText(value);
    if (current !== "") {
      this.renderReferencePills(
        controls,
        [current],
        lockedCreator
          ? undefined
          : () => {
              onChange("");
              this.render();
            },
      );
    } else {
      controls.createSpan({
        cls: "cti-stix-reference-empty",
        text: "No reference selected",
      });
    }
    if (!lockedCreator) {
      this.renderReferenceActions(controls, targetTypes, {
        choose: (reference) => {
          onChange(reference);
          this.render();
        },
        chooseLabel: current === "" ? "Choose STIX note" : "Replace STIX note",
      });
    }
  }

  private renderReferencePills(
    container: HTMLElement,
    references: readonly string[],
    remove?: (reference: string) => void,
  ): void {
    const pills = container.createDiv({ cls: "cti-stix-reference-pills" });
    for (const reference of references) {
      const pill = pills.createDiv({ cls: "cti-stix-reference-pill" });
      pill.setAttribute("title", reference);
      pill.createSpan({ text: this.referenceDisplayLabel(reference) });
      if (remove !== undefined) {
        const removeButton = pill.createEl("button", {
          attr: { "aria-label": `Remove ${this.referenceDisplayLabel(reference)}` },
        });
        setIcon(removeButton, "x");
        removeButton.addEventListener("click", () => remove(reference));
      }
    }
  }

  private renderReferenceActions(
    container: HTMLElement,
    targetTypes: readonly string[],
    options: Readonly<{
      choose: (reference: string) => void;
      chooseLabel: string;
    }>,
  ): void {
    const actions = container.createDiv({ cls: "cti-stix-reference-actions" });
    const choose = actions.createEl("button", { text: options.chooseLabel });
    choose.addEventListener("click", () => {
      new StixReferenceSuggestModal(this.app, targetTypes, options.choose).open();
    });
    const raw = actions.createEl("button", { text: "Add raw id" });
    raw.addEventListener("click", () => {
      new RawStixReferenceModal(this.app, options.choose).open();
    });
  }

  private referenceDisplayLabel(reference: string): string {
    const linkTarget = wikiLinkTarget(reference);
    if (linkTarget === undefined) {
      return rawStixReferenceLabel(reference);
    }
    const target = this.app.metadataCache.getFirstLinkpathDest(
      linkTarget,
      this.file.path,
    );
    if (target === null) {
      return linkTarget.split("/").at(-1) ?? linkTarget;
    }
    const frontmatter: unknown =
      this.app.metadataCache.getFileCache(target)?.frontmatter;
    const stixType = isRecord(frontmatter) ? frontmatter.stix_type : undefined;
    return typeof stixType === "string"
      ? `${target.basename} · ${stixType}`
      : target.basename;
  }

  private renderObjectList(
    container: HTMLElement,
    field: CatalogField,
    value: unknown,
    onChange: (value: unknown) => void,
    path: string,
  ): void {
    const group = container.createDiv({
      cls: "cti-stix-nested-field",
    });
    let items = Array.isArray(value) ? value.map((item) => cloneEditorValue(item)) : [];
    new Setting(group)
      .setName(displayName(field.name))
      .setDesc(this.fieldDescription(field))
      .setHeading()
      .addButton((button) => {
        button.setButtonText("Add item").onClick(() => {
          onChange(addObjectListItem(items, field));
          this.render();
        });
      });

    if (items.length === 0) {
      group.createEl("p", {
        cls: "cti-stix-empty-field",
        text: "No items. Nothing will be exported for this property.",
      });
      return;
    }

    items.forEach((item, itemIndex) => {
      let itemRecord = isRecord(item) ? item : {};
      const card = group.createDiv({
        cls: "cti-stix-nested-item",
      });
      new Setting(card)
        .setName(`${displayName(field.name)} ${itemIndex + 1}`)
        .addButton((button) => {
          button.buttonEl.addClass("cti-stix-destructive-button");
          button.setButtonText("Remove").onClick(() => {
            const next = items.filter((_, index) => index !== itemIndex);
            items = next;
            onChange(next);
            this.render();
          });
        });

      if (field.children === undefined || field.children.length === 0) {
        this.renderJsonValue(
          card,
          "Item data",
          itemRecord,
          (next) => {
            const updated = [...items];
            updated[itemIndex] = next;
            items = updated;
            onChange(updated);
          },
          `${path}.${itemIndex}`,
        );
        return;
      }

      for (const child of field.children) {
        this.renderField(
          card,
          child,
          itemRecord[child.name],
          (next) => {
            items = [...updateObjectListItemField(items, itemIndex, child.name, next)];
            itemRecord = isRecord(items[itemIndex]) ? items[itemIndex] : {};
            onChange(items);
          },
          `${path}.${itemIndex}.${child.name}`,
        );
      }
    });
  }

  private renderObject(
    container: HTMLElement,
    field: CatalogField,
    value: unknown,
    onChange: (value: unknown) => void,
    path: string,
  ): void {
    if (field.children === undefined || field.children.length === 0) {
      this.renderJsonValue(
        container,
        displayName(field.name),
        isRecord(value) ? value : {},
        onChange,
        path,
        field,
      );
      return;
    }

    const group = container.createDiv({
      cls: "cti-stix-nested-field",
    });
    new Setting(group)
      .setName(displayName(field.name))
      .setDesc(this.fieldDescription(field))
      .setHeading();
    let record = isRecord(value) ? value : {};
    for (const child of field.children) {
      this.renderField(
        group,
        child,
        record[child.name],
        (next) => {
          record = { ...record, [child.name]: next };
          onChange(record);
        },
        `${path}.${child.name}`,
      );
    }
  }

  private renderExtensions(
    container: HTMLElement,
    value: unknown,
    onChange: (value: unknown) => void,
    path: string,
  ): void {
    const group = container.createDiv({
      cls: "cti-stix-nested-field",
    });
    let extensions = isRecord(value)
      ? (cloneEditorValue(value) as Record<string, unknown>)
      : {};
    const compatible = stixCatalog
      .listObjectTypes()
      .filter(
        (definition) =>
          definition.family === "predefined-extension" &&
          definition.extensionOf === this.definition.type,
      );
    let selected = compatible.find(
      (definition) => !Object.hasOwn(extensions, definition.type),
    )?.type;

    const heading = new Setting(group)
      .setName("Extensions")
      .setDesc("Predefined or deliberate custom STIX extension content.")
      .setHeading();
    if (compatible.some((definition) => !Object.hasOwn(extensions, definition.type))) {
      heading
        .addDropdown((dropdown) => {
          for (const extension of compatible) {
            if (!Object.hasOwn(extensions, extension.type)) {
              dropdown.addOption(extension.type, extension.title);
            }
          }
          dropdown.onChange((next) => {
            selected = next;
          });
        })
        .addButton((button) => {
          button.setButtonText("Add extension").onClick(() => {
            const extension =
              selected === undefined ? undefined : stixCatalog.getObjectType(selected);
            if (extension === undefined) {
              return;
            }
            extensions = {
              ...extensions,
              [extension.type]: createExtensionValue(extension),
            };
            onChange(extensions);
            this.render();
          });
        });
    }

    const entries = Object.entries(extensions);
    if (entries.length === 0) {
      group.createEl("p", {
        cls: "cti-stix-empty-field",
        text: "No extensions.",
      });
      return;
    }

    for (const [extensionType, extensionValue] of entries) {
      const extensionDefinition = stixCatalog.getObjectType(extensionType);
      const card = group.createDiv({
        cls: "cti-stix-nested-item",
      });
      new Setting(card)
        .setName(extensionDefinition?.title ?? extensionType)
        .addButton((button) => {
          button.buttonEl.addClass("cti-stix-destructive-button");
          button.setButtonText("Remove").onClick(() => {
            const next = { ...extensions };
            delete next[extensionType];
            extensions = next;
            onChange(next);
            this.render();
          });
        });
      const extensionRecord = isRecord(extensionValue) ? extensionValue : {};
      if (extensionDefinition?.family !== "predefined-extension") {
        this.renderJsonValue(
          card,
          "Custom extension data",
          extensionRecord,
          (next) => {
            extensions = { ...extensions, [extensionType]: next };
            onChange(extensions);
          },
          `${path}.${extensionType}`,
        );
        continue;
      }
      let currentExtensionRecord = extensionRecord;
      for (const child of extensionDefinition.fields) {
        this.renderField(
          card,
          child,
          currentExtensionRecord[child.name],
          (next) => {
            currentExtensionRecord = {
              ...currentExtensionRecord,
              [child.name]: next,
            };
            extensions = {
              ...extensions,
              [extensionType]: currentExtensionRecord,
            };
            onChange(extensions);
          },
          `${path}.${extensionType}.${child.name}`,
        );
      }
    }
  }

  private renderJsonValue(
    container: HTMLElement,
    name: string,
    value: Readonly<Record<string, unknown>>,
    onChange: (value: unknown) => void,
    path: string,
    field?: CatalogField,
  ): void {
    const setting = new Setting(container)
      .setName(name)
      .setDesc(field === undefined ? "JSON dictionary" : this.fieldDescription(field));
    const defaultDescription =
      field === undefined ? "JSON dictionary" : this.fieldDescription(field);
    setting.addTextArea((input) => {
      input.setValue(JSON.stringify(value, null, 2)).onChange((next) => {
        try {
          const parsed: unknown = JSON.parse(next);
          if (!isRecord(parsed)) {
            throw new TypeError("Enter a JSON dictionary.");
          }
          this.invalidJsonPaths.delete(path);
          setting.setDesc(defaultDescription);
          onChange(parsed);
        } catch (error) {
          this.invalidJsonPaths.add(path);
          setting.setDesc(
            `Invalid JSON: ${
              error instanceof Error ? error.message : "Unknown error."
            }`,
          );
        }
      });
      input.inputEl.rows = 5;
      input.inputEl.addClass("cti-stix-json-input");
    });
  }

  private createFieldSetting(container: HTMLElement, field: CatalogField): Setting {
    return new Setting(container)
      .setName(displayName(field.name))
      .setDesc(this.fieldDescription(field));
  }

  private fieldDescription(field: CatalogField): string {
    const requirement = field.required ? "Required. " : "Optional. ";
    return `${requirement}${field.description ?? field.dataType}`;
  }

  private async save(): Promise<void> {
    if (this.saving) {
      return;
    }
    if (this.invalidJsonPaths.size > 0) {
      new Notice("Resolve invalid JSON fields before saving.");
      return;
    }

    this.saving = true;
    try {
      await this.app.fileManager.processFrontMatter(
        this.file,
        (frontmatter: unknown) => {
          if (!isRecord(frontmatter)) {
            throw new TypeError("Note frontmatter is not a dictionary.");
          }
          const next = advanceModifiedForEdit(
            frontmatter,
            applyEditorValues(frontmatter, this.definition, this.values),
            new Date(),
          );
          for (const field of this.definition.fields) {
            if (bodyMappedFields.has(field.name)) {
              continue;
            }
            const key = frontmatterKey(field.name);
            if (Object.hasOwn(next, key)) {
              frontmatter[key] = next[key];
            } else {
              delete frontmatter[key];
            }
          }
        },
      );
      new Notice(`Saved ${this.definition.title} properties.`);
      this.close();
    } catch (error) {
      new Notice(
        `Could not save STIX properties: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    } finally {
      this.saving = false;
    }
  }
}

export function openStixPropertyEditor(app: App, file: TFile): boolean {
  const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
  const definition = editableStixDefinition(frontmatter);
  if (definition === undefined || !isRecord(frontmatter)) {
    return false;
  }

  new StixPropertyEditorModal({
    app,
    file,
    definition,
    frontmatter,
  }).open();
  return true;
}
