export function excludedScopeFolders(value: string): readonly string[] {
  return Object.freeze(
    value
      .split(",")
      .map((folder) => folder.trim().replaceAll("\\", "/").replace(/\/+$/gu, ""))
      .filter((folder) => folder !== ""),
  );
}

export function filterExcludedScopePaths(
  paths: readonly string[],
  excludedFolders: string,
): readonly string[] {
  const folders = excludedScopeFolders(excludedFolders);
  return Object.freeze(
    paths.filter(
      (path) =>
        !folders.some((folder) => path === folder || path.startsWith(`${folder}/`)),
    ),
  );
}
