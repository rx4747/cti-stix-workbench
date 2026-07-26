export interface MarkdownFence {
  readonly character: "`" | "~";
  readonly length: number;
  readonly info: string;
}

export function readMarkdownFence(line: string): MarkdownFence | undefined {
  const match = /^\s*(`{3,}|~{3,})(.*)$/u.exec(line);
  const marker = match?.[1];
  if (marker === undefined) {
    return undefined;
  }

  const character = marker[0];
  if (character !== "`" && character !== "~") {
    return undefined;
  }

  return {
    character,
    length: marker.length,
    info: (match?.[2] ?? "").trim(),
  };
}

export function closesMarkdownFence(
  candidate: MarkdownFence,
  openFence: MarkdownFence,
): boolean {
  return (
    candidate.character === openFence.character &&
    candidate.length >= openFence.length &&
    candidate.info === ""
  );
}
