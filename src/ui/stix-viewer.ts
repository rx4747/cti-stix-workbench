import { ItemView, setIcon, type ViewStateResult, type WorkspaceLeaf } from "obsidian";
import { stixIconDataUrl } from "../viewer/icons";
import {
  layoutStixViewerNodes,
  STIX_VIEWER_NODE_LABEL_WIDTH,
  STIX_VIEWER_NODE_RADIUS,
  STIX_VIEWER_NODE_SIZE,
  type StixViewerPoint,
  stixViewerEdgePath,
  wrapStixViewerLabel,
} from "../viewer/layout";
import type { StixViewerEdge, StixViewerModel, StixViewerNode } from "../viewer/model";

export const STIX_VIEWER_VIEW_TYPE = "cti-stix-viewer";

export type StixViewerSource =
  | { readonly kind: "json"; readonly path: string }
  | { readonly kind: "note"; readonly path: string };

export interface LoadedStixViewerSource {
  readonly model: StixViewerModel;
  readonly title: string;
  readonly description: string;
  readonly watchedPaths: ReadonlySet<string>;
}

export interface StixViewerDependencies {
  load(source: StixViewerSource): Promise<LoadedStixViewerSource>;
  openNote(path: string): Promise<void>;
}

interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const NODE_ICON_SIZE = 52;
const NODE_LABEL_LINE_HEIGHT = 14;
const MINIMUM_SCALE = 0.08;
let nextViewerInstance = 0;

function nextMarkerId(): string {
  nextViewerInstance += 1;
  return `cti-stix-viewer-arrow-${nextViewerInstance}`;
}

function svgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Readonly<Record<string, string>> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return element;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseSource(value: unknown): StixViewerSource | undefined {
  if (!isRecord(value) || (value.kind !== "json" && value.kind !== "note")) {
    return undefined;
  }
  return typeof value.path === "string" && value.path.trim() !== ""
    ? { kind: value.kind, path: value.path }
    : undefined;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function humanSource(source: StixViewerSource): string {
  return source.kind === "json" ? "JSON file" : "Note graph";
}

function countLabel(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

export class StixViewerView extends ItemView {
  private source?: StixViewerSource;
  private loaded?: LoadedStixViewerSource;
  private loadSequence = 0;
  private renderAbort?: AbortController;
  private transform: ViewportTransform = { x: 24, y: 24, scale: 1 };
  private positions = new Map<string, StixViewerPoint>();
  private world?: SVGGElement;
  private svg?: SVGSVGElement;
  private details?: HTMLElement;
  private refreshTimer?: number;
  private showReferences = false;
  private readonly markerId = nextMarkerId();

  constructor(
    leaf: WorkspaceLeaf,
    private readonly dependencies: StixViewerDependencies,
  ) {
    super(leaf);
    this.navigation = true;
  }

  override getViewType(): string {
    return STIX_VIEWER_VIEW_TYPE;
  }

  override getDisplayText(): string {
    return this.loaded?.title ?? "STIX viewer";
  }

  override getIcon(): string {
    return "waypoints";
  }

  override getState(): Record<string, unknown> {
    return this.source === undefined ? {} : { source: this.source };
  }

  override async setState(state: unknown, result: ViewStateResult): Promise<void> {
    await super.setState(state, result);
    const source = isRecord(state) ? parseSource(state.source) : undefined;
    if (source === undefined) {
      this.source = undefined;
      this.renderEmpty();
      return;
    }
    this.source = source;
    await this.reload();
  }

  protected override async onOpen(): Promise<void> {
    this.addAction("refresh-cw", "Refresh STIX viewer", () => {
      void this.reload();
    });
    this.addAction("scan", "Fit graph to view", () => this.fitGraph());
    if (this.source === undefined) this.renderEmpty();
    else await this.reload();
  }

  protected override async onClose(): Promise<void> {
    this.renderAbort?.abort();
    if (this.refreshTimer !== undefined) {
      this.contentEl.win.clearTimeout(this.refreshTimer);
    }
  }

  override onResize(): void {
    if (this.loaded !== undefined) this.fitGraph();
  }

  refreshIfRelevant(path: string, oldPath?: string): void {
    if (
      this.source !== undefined &&
      (this.source.path === path ||
        this.source.path === oldPath ||
        this.loaded?.watchedPaths.has(path) === true ||
        (oldPath !== undefined && this.loaded?.watchedPaths.has(oldPath) === true))
    ) {
      if (oldPath !== undefined && this.source.path === oldPath) {
        this.source = { ...this.source, path };
      }
      if (this.refreshTimer !== undefined) {
        this.contentEl.win.clearTimeout(this.refreshTimer);
      }
      this.refreshTimer = this.contentEl.win.setTimeout(() => {
        this.refreshTimer = undefined;
        void this.reload();
      }, 180);
    }
  }

  private renderEmpty(): void {
    this.renderAbort?.abort();
    this.contentEl.empty();
    this.contentEl.addClass("cti-stix-viewer");
    const empty = this.contentEl.createDiv({ cls: "cti-stix-viewer-empty" });
    empty.createEl("h2", { text: "STIX viewer" });
    empty.createEl("p", {
      text: "Open a STIX JSON file or a typed STIX note, then use the STIX viewer command.",
    });
  }

  private async reload(): Promise<void> {
    const source = this.source;
    if (source === undefined) {
      this.renderEmpty();
      return;
    }
    const sequence = ++this.loadSequence;
    this.renderLoading(source);
    try {
      const loaded = await this.dependencies.load(source);
      if (sequence !== this.loadSequence) return;
      this.loaded = loaded;
      this.positions = layoutStixViewerNodes(loaded.model);
      this.renderGraph(loaded);
    } catch (error) {
      if (sequence !== this.loadSequence) return;
      this.renderError(source, error);
    }
  }

  private renderLoading(source: StixViewerSource): void {
    this.renderAbort?.abort();
    this.contentEl.empty();
    this.contentEl.addClass("cti-stix-viewer");
    const loading = this.contentEl.createDiv({ cls: "cti-stix-viewer-empty" });
    loading.createEl("h2", { text: "Loading STIX graph…" });
    loading.createEl("p", { text: `${humanSource(source)} · ${source.path}` });
  }

  private renderError(source: StixViewerSource, error: unknown): void {
    this.renderAbort?.abort();
    this.contentEl.empty();
    this.contentEl.addClass("cti-stix-viewer");
    const panel = this.contentEl.createDiv({ cls: "cti-stix-viewer-empty" });
    panel.createEl("h2", { text: "Could not open STIX viewer" });
    panel.createEl("p", {
      text: error instanceof Error ? error.message : "Unexpected viewer error.",
      cls: "cti-stix-viewer-error",
    });
    panel.createEl("p", { text: `${humanSource(source)} · ${source.path}` });
    const retry = panel.createEl("button", { text: "Try again" });
    retry.addEventListener(
      "click",
      () => {
        void this.reload();
      },
      { once: true },
    );
  }

  private renderGraph(loaded: LoadedStixViewerSource): void {
    this.renderAbort?.abort();
    const abort = new AbortController();
    this.renderAbort = abort;
    this.contentEl.empty();
    this.contentEl.addClass("cti-stix-viewer");

    const header = this.contentEl.createDiv({ cls: "cti-stix-viewer-header" });
    const heading = header.createDiv({ cls: "cti-stix-viewer-header-copy" });
    heading.createDiv({
      cls: "cti-stix-viewer-eyebrow",
      text: "STIX viewer",
    });
    heading.createEl("h2", { text: loaded.title });
    const metadata = heading.createDiv({ cls: "cti-stix-viewer-metadata" });
    metadata.createSpan({
      cls: "cti-stix-viewer-source",
      text: loaded.description,
    });
    metadata.createSpan({
      cls: "cti-stix-viewer-stat",
      text: countLabel(loaded.model.nodes.length, "node"),
    });
    metadata.createSpan({
      cls: "cti-stix-viewer-stat",
      text: `${countLabel(
        loaded.model.edges.filter((edge) => edge.kind === "relationship").length,
        "relationship",
      )} · ${countLabel(
        loaded.model.edges.filter((edge) => edge.kind === "reference").length,
        "reference",
      )}`,
    });
    const controls = header.createDiv({ cls: "cti-stix-viewer-controls" });
    const search = controls.createEl("input", {
      type: "search",
      placeholder: "Filter objects",
      attr: { "aria-label": "Filter STIX objects" },
    });
    const referenceToggle = this.iconButton(
      "git-branch",
      this.showReferences ? "Hide reference connections" : "Show reference connections",
      () => {
        this.showReferences = !this.showReferences;
        referenceToggle.setAttribute("aria-pressed", String(this.showReferences));
        referenceToggle.setAttribute(
          "title",
          this.showReferences
            ? "Hide reference connections"
            : "Show reference connections",
        );
        referenceToggle.setAttribute(
          "aria-label",
          this.showReferences
            ? "Hide reference connections"
            : "Show reference connections",
        );
        referenceToggle.toggleClass("is-active", this.showReferences);
        this.world
          ?.querySelectorAll(
            ".cti-stix-viewer-edge-reference, .cti-stix-viewer-edge-label-reference",
          )
          .forEach((element) => {
            element.toggleClass("is-reference-hidden", !this.showReferences);
          });
      },
    );
    referenceToggle.setAttribute("aria-pressed", String(this.showReferences));
    referenceToggle.toggleClass("is-active", this.showReferences);
    const zoomControls = controls.createDiv({ cls: "cti-stix-viewer-button-group" });
    zoomControls.append(
      this.iconButton("minus", "Zoom out", () => this.zoomBy(0.8)),
      this.iconButton("scan", "Fit graph to view", () => this.fitGraph()),
      this.iconButton("plus", "Zoom in", () => this.zoomBy(1.25)),
    );
    controls.append(
      referenceToggle,
      this.iconButton("refresh-cw", "Refresh source", () => {
        void this.reload();
      }),
    );

    const body = this.contentEl.createDiv({ cls: "cti-stix-viewer-body" });
    const stage = body.createDiv({ cls: "cti-stix-viewer-stage" });
    const svg = svgElement("svg", {
      class: "cti-stix-viewer-canvas",
      role: "img",
      "aria-label": `Interactive STIX graph for ${loaded.title}`,
      tabindex: "0",
    });
    stage.append(svg);
    this.svg = svg;
    this.details = body.createEl("aside", {
      cls: "cti-stix-viewer-details",
      attr: { "aria-label": "Selected STIX item details" },
    });
    this.renderDetailsPrompt();

    const definitions = svgElement("defs");
    const marker = svgElement("marker", {
      id: this.markerId,
      viewBox: "0 0 10 10",
      refX: "9",
      refY: "5",
      markerWidth: "7",
      markerHeight: "7",
      orient: "auto-start-reverse",
    });
    marker.append(svgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    definitions.append(marker);
    svg.append(definitions);
    const world = svgElement("g", { class: "cti-stix-viewer-world" });
    svg.append(world);
    this.world = world;

    const edgeElements = new Map<string, SVGPathElement>();
    const edgeLabelElements = new Map<string, SVGTextElement>();
    for (const edge of loaded.model.edges) {
      const sourcePoint = this.positions.get(edge.sourceKey);
      const targetPoint = this.positions.get(edge.targetKey);
      if (sourcePoint === undefined || targetPoint === undefined) continue;
      const path = svgElement("path", {
        class: `cti-stix-viewer-edge cti-stix-viewer-edge-${edge.kind}${
          edge.kind === "reference" && !this.showReferences
            ? " is-reference-hidden"
            : ""
        }`,
        d: stixViewerEdgePath(sourcePoint, targetPoint),
        "marker-end": `url(#${this.markerId})`,
        "data-edge-id": edge.key,
        tabindex: "0",
        role: "button",
        "aria-label": `${edge.label}: ${edge.sourceId} to ${edge.targetId}`,
      });
      path.addEventListener("click", () => this.selectEdge(edge), {
        signal: abort.signal,
      });
      path.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.selectEdge(edge);
          }
        },
        { signal: abort.signal },
      );
      world.append(path);
      edgeElements.set(edge.key, path);
      const label = svgElement("text", {
        class: `cti-stix-viewer-edge-label cti-stix-viewer-edge-label-${edge.kind}${
          edge.kind === "reference" && !this.showReferences
            ? " is-reference-hidden"
            : ""
        }`,
        x: String((sourcePoint.x + targetPoint.x) / 2 + STIX_VIEWER_NODE_RADIUS),
        y: String((sourcePoint.y + targetPoint.y) / 2 + STIX_VIEWER_NODE_RADIUS - 7),
      });
      label.textContent = edge.label;
      world.append(label);
      edgeLabelElements.set(edge.key, label);
    }

    const updateConnectedEdges = (): void => {
      for (const edge of loaded.model.edges) {
        const sourcePoint = this.positions.get(edge.sourceKey);
        const targetPoint = this.positions.get(edge.targetKey);
        if (sourcePoint === undefined || targetPoint === undefined) continue;
        edgeElements
          .get(edge.key)
          ?.setAttribute("d", stixViewerEdgePath(sourcePoint, targetPoint));
        const label = edgeLabelElements.get(edge.key);
        label?.setAttribute(
          "x",
          String((sourcePoint.x + targetPoint.x) / 2 + STIX_VIEWER_NODE_RADIUS),
        );
        label?.setAttribute(
          "y",
          String((sourcePoint.y + targetPoint.y) / 2 + STIX_VIEWER_NODE_RADIUS - 7),
        );
      }
    };

    const nodeElements = new Map<string, SVGGElement>();
    for (const node of loaded.model.nodes) {
      const point = this.positions.get(node.key);
      if (point === undefined) continue;
      const group = svgElement("g", {
        class: `cti-stix-viewer-node${node.placeholder ? " is-placeholder" : ""}`,
        transform: `translate(${point.x} ${point.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": `${node.type}: ${node.label}`,
        "data-node-id": node.key,
      });
      group.append(
        svgElement("circle", {
          class: "cti-stix-viewer-node-halo",
          cx: String(STIX_VIEWER_NODE_RADIUS),
          cy: String(STIX_VIEWER_NODE_RADIUS),
          r: String(STIX_VIEWER_NODE_RADIUS - 2),
        }),
      );
      const iconInset = (STIX_VIEWER_NODE_SIZE - NODE_ICON_SIZE) / 2;
      const icon = svgElement("image", {
        href: stixIconDataUrl(node.type),
        x: String(iconInset),
        y: String(iconInset),
        width: String(NODE_ICON_SIZE),
        height: String(NODE_ICON_SIZE),
        preserveAspectRatio: "xMidYMid meet",
      });
      group.append(icon);
      const name = svgElement("text", {
        class: "cti-stix-viewer-node-name",
        x: String(STIX_VIEWER_NODE_RADIUS),
        y: String(STIX_VIEWER_NODE_SIZE + 16),
      });
      const nameLines = wrapStixViewerLabel(node.label);
      for (const [index, line] of nameLines.entries()) {
        const segment = svgElement("tspan", {
          x: String(STIX_VIEWER_NODE_RADIUS),
          dy: index === 0 ? "0" : String(NODE_LABEL_LINE_HEIGHT),
        });
        segment.textContent = line;
        name.append(segment);
      }
      group.append(name);
      const type = svgElement("text", {
        class: "cti-stix-viewer-node-type",
        x: String(STIX_VIEWER_NODE_RADIUS),
        y: String(
          STIX_VIEWER_NODE_SIZE + 18 + nameLines.length * NODE_LABEL_LINE_HEIGHT,
        ),
      });
      type.textContent = node.placeholder ? `${node.type} · unresolved` : node.type;
      group.append(type);
      world.append(group);
      group.addEventListener("click", () => this.selectNode(node), {
        signal: abort.signal,
      });
      group.addEventListener(
        "dblclick",
        () => {
          if (node.notePath !== undefined)
            void this.dependencies.openNote(node.notePath);
        },
        { signal: abort.signal },
      );
      group.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.selectNode(node);
          }
        },
        { signal: abort.signal },
      );
      this.bindNodeDrag(group, node.key, updateConnectedEdges, abort.signal);
      nodeElements.set(node.key, group);
    }

    search.addEventListener(
      "input",
      () => {
        const query = search.value.trim().toLocaleLowerCase();
        const visible = new Set<string>();
        for (const node of loaded.model.nodes) {
          const matches =
            query === "" ||
            node.label.toLocaleLowerCase().includes(query) ||
            node.type.toLocaleLowerCase().includes(query) ||
            node.id.toLocaleLowerCase().includes(query);
          nodeElements.get(node.key)?.toggleClass("is-filtered", !matches);
          if (matches) visible.add(node.key);
        }
        for (const edge of loaded.model.edges) {
          const hidden = !visible.has(edge.sourceKey) || !visible.has(edge.targetKey);
          edgeElements.get(edge.key)?.toggleClass("is-filtered", hidden);
          edgeLabelElements.get(edge.key)?.toggleClass("is-filtered", hidden);
        }
      },
      { signal: abort.signal },
    );
    this.bindPanAndZoom(svg, abort.signal);
    this.applyTransform();
    this.contentEl.win.requestAnimationFrame(() => this.fitGraph());
  }

  private iconButton(
    icon: string,
    label: string,
    callback: () => void,
  ): HTMLButtonElement {
    const button = this.contentEl.createEl("button");
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    setIcon(button, icon);
    button.addEventListener("click", callback);
    return button;
  }

  private bindNodeDrag(
    group: SVGGElement,
    nodeId: string,
    onMove: () => void,
    signal: AbortSignal,
  ): void {
    group.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0) return;
        event.stopPropagation();
        const origin = this.positions.get(nodeId);
        if (origin === undefined) return;
        const start = { x: event.clientX, y: event.clientY };
        const pointerId = event.pointerId;
        group.setPointerCapture(pointerId);
        const move = (moveEvent: PointerEvent): void => {
          if (moveEvent.pointerId !== pointerId) return;
          const scale = this.transform.scale;
          const next = {
            x: origin.x + (moveEvent.clientX - start.x) / scale,
            y: origin.y + (moveEvent.clientY - start.y) / scale,
          };
          this.positions.set(nodeId, next);
          group.setAttribute("transform", `translate(${next.x} ${next.y})`);
          onMove();
        };
        const end = (endEvent: PointerEvent): void => {
          if (endEvent.pointerId !== pointerId) return;
          group.releasePointerCapture(pointerId);
          group.removeEventListener("pointermove", move);
          group.removeEventListener("pointerup", end);
          group.removeEventListener("pointercancel", end);
        };
        group.addEventListener("pointermove", move, { signal });
        group.addEventListener("pointerup", end, { signal });
        group.addEventListener("pointercancel", end, { signal });
      },
      { signal },
    );
  }

  private bindPanAndZoom(svg: SVGSVGElement, signal: AbortSignal): void {
    svg.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const rectangle = svg.getBoundingClientRect();
        const cursorX = event.clientX - rectangle.left;
        const cursorY = event.clientY - rectangle.top;
        const previousScale = this.transform.scale;
        const nextScale = clamp(
          previousScale * (event.deltaY > 0 ? 0.88 : 1.14),
          MINIMUM_SCALE,
          3,
        );
        const graphX = (cursorX - this.transform.x) / previousScale;
        const graphY = (cursorY - this.transform.y) / previousScale;
        this.transform = {
          x: cursorX - graphX * nextScale,
          y: cursorY - graphY * nextScale,
          scale: nextScale,
        };
        this.applyTransform();
      },
      { passive: false, signal },
    );
    svg.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0 || event.target !== svg) return;
        const start = { x: event.clientX, y: event.clientY };
        const origin = { ...this.transform };
        const pointerId = event.pointerId;
        svg.setPointerCapture(pointerId);
        const move = (moveEvent: PointerEvent): void => {
          if (moveEvent.pointerId !== pointerId) return;
          this.transform = {
            ...origin,
            x: origin.x + moveEvent.clientX - start.x,
            y: origin.y + moveEvent.clientY - start.y,
          };
          this.applyTransform();
        };
        const end = (endEvent: PointerEvent): void => {
          if (endEvent.pointerId !== pointerId) return;
          svg.releasePointerCapture(pointerId);
          svg.removeEventListener("pointermove", move);
          svg.removeEventListener("pointerup", end);
          svg.removeEventListener("pointercancel", end);
        };
        svg.addEventListener("pointermove", move, { signal });
        svg.addEventListener("pointerup", end, { signal });
        svg.addEventListener("pointercancel", end, { signal });
      },
      { signal },
    );
  }

  private applyTransform(): void {
    this.world?.setAttribute(
      "transform",
      `translate(${this.transform.x} ${this.transform.y}) scale(${this.transform.scale})`,
    );
  }

  private zoomBy(factor: number): void {
    const svg = this.svg;
    if (svg === undefined) return;
    const nextScale = clamp(this.transform.scale * factor, MINIMUM_SCALE, 3);
    const centerX = svg.clientWidth / 2;
    const centerY = svg.clientHeight / 2;
    const graphX = (centerX - this.transform.x) / this.transform.scale;
    const graphY = (centerY - this.transform.y) / this.transform.scale;
    this.transform = {
      x: centerX - graphX * nextScale,
      y: centerY - graphY * nextScale,
      scale: nextScale,
    };
    this.applyTransform();
  }

  private fitGraph(): void {
    const svg = this.svg;
    if (svg === undefined || this.positions.size === 0) return;
    const points = [...this.positions.values()];
    const labelOverflow = (STIX_VIEWER_NODE_LABEL_WIDTH - STIX_VIEWER_NODE_SIZE) / 2;
    const minimumX = Math.min(...points.map((point) => point.x - labelOverflow));
    const minimumY = Math.min(...points.map((point) => point.y));
    const maximumX = Math.max(
      ...points.map((point) => point.x + STIX_VIEWER_NODE_SIZE + labelOverflow),
    );
    const maximumLabelLines = Math.max(
      1,
      ...(this.loaded?.model.nodes.map(
        (node) => wrapStixViewerLabel(node.label).length,
      ) ?? []),
    );
    const maximumNodeHeight =
      STIX_VIEWER_NODE_SIZE + 32 + maximumLabelLines * NODE_LABEL_LINE_HEIGHT;
    const maximumY = Math.max(...points.map((point) => point.y + maximumNodeHeight));
    const width = Math.max(1, maximumX - minimumX);
    const height = Math.max(1, maximumY - minimumY);
    const padding = 56;
    const scale = clamp(
      Math.min(
        (svg.clientWidth - padding * 2) / width,
        (svg.clientHeight - padding * 2) / height,
      ),
      MINIMUM_SCALE,
      1.35,
    );
    this.transform = {
      x: (svg.clientWidth - width * scale) / 2 - minimumX * scale,
      y: (svg.clientHeight - height * scale) / 2 - minimumY * scale,
      scale,
    };
    this.applyTransform();
  }

  private selectNode(node: StixViewerNode): void {
    this.world
      ?.querySelectorAll(".cti-stix-viewer-node, .cti-stix-viewer-edge")
      .forEach((element) => {
        element.removeClass("is-selected");
      });
    const escapedId = CSS.escape(node.key);
    this.world
      ?.querySelector(`[aria-label][data-node-id="${escapedId}"]`)
      ?.addClass("is-selected");
    this.renderNodeDetails(node);
  }

  private selectEdge(edge: StixViewerEdge): void {
    this.world
      ?.querySelectorAll(".cti-stix-viewer-node, .cti-stix-viewer-edge")
      .forEach((element) => {
        element.removeClass("is-selected");
      });
    const escapedId = CSS.escape(edge.key);
    this.world?.querySelector(`[data-edge-id="${escapedId}"]`)?.addClass("is-selected");
    this.renderEdgeDetails(edge);
  }

  private renderDetailsPrompt(): void {
    const details = this.details;
    if (details === undefined) return;
    details.empty();
    const prompt = details.createDiv({ cls: "cti-stix-viewer-details-prompt" });
    const icon = prompt.createDiv({ cls: "cti-stix-viewer-details-prompt-icon" });
    setIcon(icon, "mouse-pointer-click");
    prompt.createEl("h3", { text: "Inspect the graph" });
    prompt.createEl("p", {
      text: "Select a node or relationship to inspect its STIX properties.",
      cls: "cti-stix-viewer-muted",
    });
  }

  private renderNodeDetails(node: StixViewerNode): void {
    const details = this.details;
    if (details === undefined) return;
    details.empty();
    const identity = details.createDiv({ cls: "cti-stix-viewer-details-heading" });
    const icon = identity.createEl("img", {
      attr: { src: stixIconDataUrl(node.type), alt: "" },
    });
    icon.width = 44;
    icon.height = 44;
    const copy = identity.createDiv();
    copy.createEl("h3", { text: node.label });
    copy.createSpan({
      text: node.type,
      cls: "cti-stix-viewer-type-badge",
    });
    details.createEl("code", { text: node.id });
    if (node.notePath !== undefined) {
      const notePath = node.notePath;
      const open = details.createEl("button", {
        text: "Open source note",
        cls: "mod-cta",
      });
      open.addEventListener("click", () => {
        void this.dependencies.openNote(notePath);
      });
    }
    if (node.placeholder || node.object === undefined) {
      details.createEl("p", {
        text: "This object is referenced but is not present in the selected source.",
        cls: "cti-stix-viewer-muted",
      });
      return;
    }
    this.renderProperties(details, node.object);
  }

  private renderEdgeDetails(edge: StixViewerEdge): void {
    const details = this.details;
    if (details === undefined) return;
    details.empty();
    details.createDiv({
      text: edge.kind === "relationship" ? "Relationship" : "Reference",
      cls: "cti-stix-viewer-eyebrow",
    });
    details.createEl("h3", { text: edge.label });
    const list = details.createEl("dl");
    list.createEl("dt", { text: "Source" });
    list.createEl("dd").createEl("code", { text: edge.sourceId });
    list.createEl("dt", { text: "Target" });
    list.createEl("dd").createEl("code", { text: edge.targetId });
    if (edge.field !== undefined) {
      list.createEl("dt", { text: "Property" });
      list.createEl("dd", { text: edge.field });
    }
    if (edge.notePath !== undefined) {
      const notePath = edge.notePath;
      const open = details.createEl("button", {
        text: "Open source note",
        cls: "mod-cta",
      });
      open.addEventListener("click", () => {
        void this.dependencies.openNote(notePath);
      });
    }
    if (edge.object !== undefined) this.renderProperties(details, edge.object);
  }

  private renderProperties(
    container: HTMLElement,
    object: Readonly<Record<string, unknown>>,
  ): void {
    const heading = container.createEl("h4", { text: "Properties" });
    heading.addClass("cti-stix-viewer-properties-heading");
    const list = container.createEl("dl", { cls: "cti-stix-viewer-properties" });
    for (const [field, value] of Object.entries(object)) {
      if (field === "id" || field === "type") continue;
      list.createEl("dt", { text: field });
      const item = list.createEl("dd");
      if (typeof value === "string" || typeof value === "number") {
        item.setText(String(value));
      } else if (typeof value === "boolean" || value === null) {
        item.setText(String(value));
      } else {
        item.createEl("pre", { text: JSON.stringify(value, null, 2) });
      }
    }
  }
}
