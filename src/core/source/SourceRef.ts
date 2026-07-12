export type SourceKind =
  | "yaml"
  | "json"
  | "ndjson"
  | "markdown"
  | "synthetic";

export interface SourceRef {
  readonly sourceId: string;
  readonly path: string;
  readonly kind: SourceKind;
  readonly lineStart?: number;
  readonly columnStart?: number;
  readonly lineEnd?: number;
  readonly columnEnd?: number;
  readonly pointer?: string;
}
