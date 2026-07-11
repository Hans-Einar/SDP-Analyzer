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

