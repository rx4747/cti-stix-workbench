import { ItemView, setIcon, type ViewStateResult, type WorkspaceLeaf } from "obsidian";
import { stixIconDataUrl } from "../viewer/icons";
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

interface Point {
  x: number;
  y: number;
}

interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const NODE_WIDTH = 208;
const NODE_HEIGHT = 82;
const HORIZONTAL_GAP = 116;
const VERTICAL_GAP = 54;
const NODE_TEXT_X = 68;
const NODE_TEXT_WIDTH = NODE_WIDTH - NODE_TEXT_X - 14;
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

function layoutNodes(model: StixViewerModel): Map<string, Point> {
  const positions = new Map<string, Point>();
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  for (const node of model.nodes) {
    outgoing.set(node.key, []);
    incoming.set(node.key, 0);
  }
  for (const edge of model.edges) {
    outgoing.get(edge.sourceKey)?.push(edge.targetKey);
    incoming.set(edge.targetKey, (incoming.get(edge.targetKey) ?? 0) + 1);
  }

  const depth = new Map<string, number>();
  const roots = model.nodes
    .filter((node) => (incoming.get(node.key) ?? 0) === 0)
    .map((node) => node.key);
  const queue = roots.length > 0 ? roots.map((id) => ({ id, depth: 0 })) : [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    const previous = depth.get(current.id);
    if (previous !== undefined && previous <= current.depth) continue;
    depth.set(current.id, current.depth);
    for (const targetId of outgoing.get(current.id) ?? []) {
      queue.push({ id: targetId, depth: current.depth + 1 });
    }
  }
  let cycleDepth = Math.max(-1, ...depth.values()) + 1;
  for (const node of model.nodes) {
    if (!depth.has(node.key)) {
      depth.set(node.key, cycleDepth);
      cycleDepth += 1;
    }
  }

  const layers = new Map<number, StixViewerNode[]>();
  for (const node of model.nodes) {
    const nodeDepth = depth.get(node.key) ?? 0;
    const layer = layers.get(nodeDepth) ?? [];
    layer.push(node);
    layers.set(nodeDepth, layer);
  }
  for (const [layerIndex, nodes] of [...layers.entries()].sort(
    ([left], [right]) => left - right,
  )) {
    nodes.sort((left, right) => left.label.localeCompare(right.label));
    for (const [row, node] of nodes.entries()) {
      positions.set(node.key, {
        x: 72 + layerIndex * (NODE_WIDTH + HORIZONTAL_GAP),
        y: 72 + row * (NODE_HEIGHT + VERTICAL_GAP),
      });
    }
  }
  return positions;
}

function edgePath(source: Point, target: Point): string {
  const startX = source.x + NODE_WIDTH;
  const startY = source.y + NODE_HEIGHT / 2;
  const endX = target.x;
  const endY = target.y + NODE_HEIGHT / 2;
  const bend = Math.max(48, Math.abs(endX - startX) * 0.45);
  return `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`;
}

function humanSource(source: StixViewerSource): string {
  return source.kind === "json" ? "JSON file" : "Note graph";
}

function countLabel(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function fitSvgText(
  element: SVGTextElement,
  value: string,
  maximumWidth: number,
): void {
  element.textContent = value;
  if (element.getComputedTextLength() <= maximumWidth) return;

  const characters = [...value];
  let lower = 0;
  let upper = characters.length;
  while (lower < upper) {
    const candidateLength = Math.ceil((lower + upper) / 2);
    element.textContent = `${characters.slice(0, candidateLength).join("")}…`;
    if (element.getComputedTextLength() <= maximumWidth) {
      lower = candidateLength;
    } else {
      upper = candidateLength - 1;
    }
  }
  element.textContent = `${characters.slice(0, lower).join("")}…`;
}

export class StixViewerView extends ItemView {
  private source?: StixViewerSource;
  private loaded?: LoadedStixViewerSource;
  private loadSequence = 0;
  private renderAbort?: AbortController;
  private transform: ViewportTransform = { x: 24, y: 24, scale: 1 };
  private positions = new Map<string, Point>();
  private world?: SVGGElement;
  private svg?: SVGSVGElement;
  private details?: HTMLElement;
  private refreshTimer?: number;
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
      this.positions = layoutNodes(loaded.model);
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
      text: countLabel(loaded.model.edges.length, "edge"),
    });
    const controls = header.createDiv({ cls: "cti-stix-viewer-controls" });
    const search = controls.createEl("input", {
      type: "search",
      placeholder: "Filter objects",
      attr: { "aria-label": "Filter STIX objects" },
    });
    const zoomControls = controls.createDiv({ cls: "cti-stix-viewer-button-group" });
    zoomControls.append(
      this.iconButton("minus", "Zoom out", () => this.zoomBy(0.8)),
      this.iconButton("scan", "Fit graph to view", () => this.fitGraph()),
      this.iconButton("plus", "Zoom in", () => this.zoomBy(1.25)),
    );
    controls.append(
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
    const nodeCopyClipId = `${this.markerId}-node-copy`;
    const nodeCopyClip = svgElement("clipPath", { id: nodeCopyClipId });
    nodeCopyClip.append(
      svgElement("rect", {
        x: String(NODE_TEXT_X),
        y: "12",
        width: String(NODE_TEXT_WIDTH),
        height: "52",
      }),
    );
    definitions.append(nodeCopyClip);
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
        class: `cti-stix-viewer-edge cti-stix-viewer-edge-${edge.kind}`,
        d: edgePath(sourcePoint, targetPoint),
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
        class: "cti-stix-viewer-edge-label",
        x: String((sourcePoint.x + NODE_WIDTH + targetPoint.x) / 2),
        y: String((sourcePoint.y + targetPoint.y + NODE_HEIGHT) / 2 - 7),
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
          ?.setAttribute("d", edgePath(sourcePoint, targetPoint));
        const label = edgeLabelElements.get(edge.key);
        label?.setAttribute(
          "x",
          String((sourcePoint.x + NODE_WIDTH + targetPoint.x) / 2),
        );
        label?.setAttribute(
          "y",
          String((sourcePoint.y + targetPoint.y + NODE_HEIGHT) / 2 - 7),
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
      const fullTitle = svgElement("title");
      fullTitle.textContent = `${node.label} (${node.type})`;
      group.append(fullTitle);
      group.append(
        svgElement("rect", {
          width: String(NODE_WIDTH),
          height: String(NODE_HEIGHT),
          rx: "12",
        }),
      );
      const icon = svgElement("image", {
        href: stixIconDataUrl(node.type),
        x: "14",
        y: "14",
        width: "42",
        height: "42",
        preserveAspectRatio: "xMidYMid meet",
      });
      group.append(icon);
      world.append(group);
      const label = svgElement("text", {
        x: String(NODE_TEXT_X),
        y: "34",
        class: "cti-stix-node-label",
        "clip-path": `url(#${nodeCopyClipId})`,
      });
      group.append(label);
      fitSvgText(label, node.label, NODE_TEXT_WIDTH);
      const type = svgElement("text", {
        x: String(NODE_TEXT_X),
        y: "56",
        class: "cti-stix-node-type",
        "clip-path": `url(#${nodeCopyClipId})`,
      });
      group.append(type);
      fitSvgText(
        type,
        node.placeholder ? `${node.type} · unresolved` : node.type,
        NODE_TEXT_WIDTH,
      );
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
          0.2,
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
    const nextScale = clamp(this.transform.scale * factor, 0.2, 3);
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
    const minimumX = Math.min(...points.map((point) => point.x));
    const minimumY = Math.min(...points.map((point) => point.y));
    const maximumX = Math.max(...points.map((point) => point.x + NODE_WIDTH));
    const maximumY = Math.max(...points.map((point) => point.y + NODE_HEIGHT));
    const width = Math.max(1, maximumX - minimumX);
    const height = Math.max(1, maximumY - minimumY);
    const padding = 56;
    const scale = clamp(
      Math.min(
        (svg.clientWidth - padding * 2) / width,
        (svg.clientHeight - padding * 2) / height,
      ),
      0.2,
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
