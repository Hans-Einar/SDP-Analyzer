import { compareSourceRefs, compareText } from "../normalization/canonicalOrdering";
import type { Finding, FindingSeverity } from "./Finding";

const RANK: Record<FindingSeverity, number> = { error: 0, warning: 1, unknown: 2, info: 3 };
export function compareFindings(a: Finding, b: Finding): number {
  const idsA = JSON.stringify(a.affectedEntityIds), idsB = JSON.stringify(b.affectedEntityIds);
  const sourceCount = Math.min(a.sources.length, b.sources.length);
  let sourceOrder = 0;
  for (let i = 0; i < sourceCount && sourceOrder === 0; i += 1) sourceOrder = compareSourceRefs(a.sources[i]!, b.sources[i]!);
  return RANK[a.severity] - RANK[b.severity] || compareText(a.ruleId, b.ruleId) || compareText(idsA, idsB) || sourceOrder || a.sources.length - b.sources.length || compareText(a.fingerprint, b.fingerprint);
}
