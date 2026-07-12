import { canonicalizeSourceRefs, sourceRefIdentity } from "../normalization/canonicalOrdering";
import type { SourceRef } from "../source/SourceRef";

export function canonicalEntityIds(ids: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(ids)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** Structural tuple only: prose, severity, insertion order and time are excluded. */
export function findingFingerprint(ruleId: string, ids: readonly string[], sources: readonly SourceRef[], discriminator?: string): string {
  return JSON.stringify([ruleId, canonicalEntityIds(ids), canonicalizeSourceRefs(sources).map(sourceRefIdentity), discriminator ?? null]);
}
