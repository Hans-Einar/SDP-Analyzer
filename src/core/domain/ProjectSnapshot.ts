import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { SourceRef } from "../source/SourceRef";
import type { ActiveDeclaration } from "./ActiveDeclaration";
import type { Entity } from "./Entity";
import type { LedgerEvent } from "./LedgerEvent";
import type { Relation } from "./Relation";

export type ProjectSnapshotProfileSupport =
  | "supported"
  | "partial"
  | "unsupported"
  | "unknown";

export interface ProjectMetadata {
  readonly id?: string;
  readonly name?: string;
  readonly status?: string;
  readonly tier?: string;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly source: SourceRef;
  readonly fieldSources: Readonly<Record<string, SourceRef>>;
}

export interface ProjectSnapshot {
  readonly profile: {
    readonly id: string;
    readonly support: ProjectSnapshotProfileSupport;
  };
  readonly sources: readonly SourceRef[];
  readonly diagnostics: readonly Diagnostic[];
  readonly project?: ProjectMetadata;
  readonly entities: readonly Entity[];
  readonly relations: readonly Relation[];
  readonly ledger: readonly LedgerEvent[];
  readonly active?: ActiveDeclaration;
}
