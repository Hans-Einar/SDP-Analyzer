import type { SourceRef } from "../source/SourceRef";

export interface LedgerEvent {
  readonly sequence: number;
  readonly eventType?: string;
  readonly subjectId?: string;
  readonly timestamp?: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly source: SourceRef;
}
