import type { SourceRef } from "../source/SourceRef";

export interface Relation {
  readonly id: string;
  readonly type: string;
  readonly from: string;
  readonly to: string;
  readonly sources: readonly SourceRef[];
}
