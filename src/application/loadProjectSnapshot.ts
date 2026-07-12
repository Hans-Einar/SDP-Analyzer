import type { ProjectSnapshot } from "../core/domain/ProjectSnapshot";
import { normalizeTraceability } from "../core/normalization/normalizeTraceability";
import type { ProjectSource } from "../core/source/ProjectSource";
import {
  loadCoreTraceability,
  type CoreTraceabilityParseResult,
} from "./loadCoreTraceability";

export interface ProjectSnapshotLoadResult
  extends CoreTraceabilityParseResult {
  readonly snapshot: ProjectSnapshot;
}

export async function loadProjectSnapshot(
  projectSource: ProjectSource,
): Promise<ProjectSnapshotLoadResult> {
  const traceability = await loadCoreTraceability(projectSource);
  const snapshot = normalizeTraceability({
    discovery: traceability.discovery,
    diagnostics: traceability.diagnostics,
    ...(traceability.currentIndex === undefined
      ? {}
      : { currentIndex: traceability.currentIndex }),
    ...(traceability.relations === undefined
      ? {}
      : { relations: traceability.relations }),
    ...(traceability.ledger === undefined
      ? {}
      : { ledger: traceability.ledger }),
  });

  return {
    ...traceability,
    snapshot,
  };
}
