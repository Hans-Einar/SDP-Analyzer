import type { SourceRef } from "../source/SourceRef";

export type ActiveField = "sprint" | "refactor" | "iteration" | "slice";

export interface ActiveDeclaration {
  readonly sprint?: string | null;
  readonly refactor?: string | null;
  readonly iteration?: string | null;
  readonly slice?: string | null;
  readonly source: SourceRef;
  readonly fieldSources: Readonly<Partial<Record<ActiveField, SourceRef>>>;
}
