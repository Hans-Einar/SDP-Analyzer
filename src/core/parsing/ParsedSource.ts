import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { SourceRef } from "../source/SourceRef";

export interface ParsedSource<T> {
  readonly source: SourceRef;
  readonly diagnostics: readonly Diagnostic[];
  readonly value?: T;
}
