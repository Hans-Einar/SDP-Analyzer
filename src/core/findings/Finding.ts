import type { SourceRef } from "../source/SourceRef";

export type FindingSeverity = "error" | "warning" | "info" | "unknown";

export interface Finding {
  readonly fingerprint: string;
  readonly ruleId: string;
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly explanation: string;
  readonly affectedEntityIds: readonly string[];
  readonly sources: readonly SourceRef[];
  readonly recommendation?: string;
}
