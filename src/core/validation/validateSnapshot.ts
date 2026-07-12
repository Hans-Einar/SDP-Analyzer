import type { ProjectSnapshot } from "../domain/ProjectSnapshot";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { Finding } from "../findings/Finding";
import { compareFindings } from "../findings/findingOrdering";
import { compareText } from "../normalization/canonicalOrdering";
import type { AnalysisContext } from "./AnalysisContext";
import type { ValidationRule } from "./ValidationRule";
import { TIER_1_RULES } from "./rules/rules";
export interface ValidationResult { readonly findings: readonly Finding[]; readonly diagnostics: readonly Diagnostic[]; }
export function validateSnapshot(snapshot: ProjectSnapshot, context: AnalysisContext, rules: readonly ValidationRule[] = TIER_1_RULES): ValidationResult {
  const byFingerprint = new Map<string, Finding>(), diagnostics: Diagnostic[] = [];
  for (const rule of [...rules].sort((a, b) => compareText(a.id, b.id))) try { for (const f of rule.evaluate(snapshot, context)) if (!byFingerprint.has(f.fingerprint)) byFingerprint.set(f.fingerprint, f); } catch (cause) { diagnostics.push(Object.freeze({ code: "VALIDATION_RULE_EXCEPTION", severity: "error", message: `Validation rule ${rule.id} failed unexpectedly: ${cause instanceof Error ? cause.message : String(cause)}` })); }
  return Object.freeze({ findings: Object.freeze([...byFingerprint.values()].sort(compareFindings)), diagnostics: Object.freeze(diagnostics) });
}
