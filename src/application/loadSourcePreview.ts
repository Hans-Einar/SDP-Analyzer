import type { ProjectSource } from "../core/source/ProjectSource";

export interface SourcePreview {
  readonly displayName: string;
  readonly fileCount: number;
  readonly firstFilePath: string;
  readonly sourceId: string;
  readonly text: string;
}

export async function loadSourcePreview(
  source: ProjectSource,
): Promise<SourcePreview> {
  const entries = await source.listFiles();
  const firstEntry = entries[0];

  if (firstEntry === undefined) {
    throw new Error("The selected fixture source contains no files.");
  }

  const file = await source.readText(firstEntry.path);

  return {
    displayName: source.displayName,
    fileCount: entries.length,
    firstFilePath: file.path,
    sourceId: source.sourceId,
    text: file.text,
  };
}

