import type { Diagnostic } from "../diagnostics/Diagnostic";

export interface ProjectFileEntry {
  readonly kind: "file";
  readonly path: string;
}

export interface ProjectTextFile {
  readonly path: string;
  readonly text: string;
}

export interface ProjectSource {
  readonly sourceId: string;
  readonly displayName: string;
  listFiles(): Promise<readonly ProjectFileEntry[]>;
  readText(path: string): Promise<ProjectTextFile>;
}

/**
 * Presentation-neutral acquisition evidence returned atomically with the
 * entries from one source-listing attempt.
 */
export interface ProjectSourceAcquisitionSnapshot {
  readonly completeness: "complete" | "partial" | "failed";
  readonly diagnostics: readonly Diagnostic[];
}

export interface ProjectSourceAcquisitionListing {
  readonly entries: readonly ProjectFileEntry[];
  readonly acquisition: ProjectSourceAcquisitionSnapshot;
}

export interface ProjectSourceWithAcquisitionListing extends ProjectSource {
  listFilesWithAcquisition(): Promise<ProjectSourceAcquisitionListing>;
}

export function hasProjectSourceAcquisitionListing(
  source: ProjectSource,
): source is ProjectSourceWithAcquisitionListing {
  return (
    "listFilesWithAcquisition" in source &&
    typeof source.listFilesWithAcquisition === "function"
  );
}
