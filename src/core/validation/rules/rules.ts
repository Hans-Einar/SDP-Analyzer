import type { ProjectSnapshot } from "../../domain/ProjectSnapshot";
import type { Diagnostic } from "../../diagnostics/Diagnostic";
import type { Finding, FindingSeverity } from "../../findings/Finding";
import { canonicalEntityIds, findingFingerprint } from "../../findings/findingFingerprint";
import { canonicalizeSourceRefs } from "../../normalization/canonicalOrdering";
import type { SourceRef } from "../../source/SourceRef";
import type { ValidationRule } from "../ValidationRule";

const PROJECT_SOURCE: SourceRef = Object.freeze({ sourceId: "synthetic:project", path: "$project", kind: "synthetic", pointer: "/" });
type Draft = Omit<Finding, "fingerprint" | "affectedEntityIds" | "sources"> & { affectedEntityIds?: readonly string[]; sources?: readonly SourceRef[]; discriminator?: string };
function finding(d: Draft): Finding {
  const ids = canonicalEntityIds(d.affectedEntityIds ?? []), sources = canonicalizeSourceRefs(d.sources?.length ? d.sources : [PROJECT_SOURCE]);
  return Object.freeze({ fingerprint: findingFingerprint(d.ruleId, ids, sources, d.discriminator), ruleId: d.ruleId, severity: d.severity, title: d.title, explanation: d.explanation, affectedEntityIds: ids, sources, ...(d.recommendation ? { recommendation: d.recommendation } : {}) });
}
function groupedDiagnostics(snapshot: ProjectSnapshot, predicate: (code: string) => boolean): Map<string, typeof snapshot.diagnostics> {
  const groups = new Map<string, typeof snapshot.diagnostics>();
  for (const d of snapshot.diagnostics.filter((x) => predicate(x.code))) {
    const key = d.source ? `${d.source.sourceId}|${d.source.path}|${d.source.lineStart ?? ""}` : "$project";
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }
  return groups;
}

export const requiredCoreSourcesRule: ValidationRule = { id: "SDP001", evaluate(snapshot) {
  const codes = new Set(["DISCOVERY_MISSING_CORE_SOURCE", "DISCOVERY_SOURCE_LIST_FAILED", "PARSE_APPLICATION_READ_FAILED", "NORMALIZE_REQUIRED_SOURCE_UNAVAILABLE", "NORMALIZE_RELATIONS_STRUCTURE_UNAVAILABLE", "PARSE_YAML_SYNTAX_ERROR", "PARSE_YAML_DUPLICATE_KEY", "PARSE_YAML_MULTIPLE_DOCUMENTS", "PARSE_YAML_UNSUPPORTED_ROOT", "PARSE_YAML_UNSAFE_INTEGER"]);
  const groups = new Map<string, typeof snapshot.diagnostics>();
  const corePath = (d: Diagnostic): string => {
    if (d.source) return `${d.source.sourceId}|${d.source.path}`;
    if (d.code === "DISCOVERY_SOURCE_LIST_FAILED") return "$project";
    const path = /SDP\/Traceability\/(CurrentIndex\.yaml|Relations\.yaml|Ledger\.ndjson)/.exec(d.message)?.[0];
    if (path) return path;
    const label = /Required parsed (CurrentIndex|Relations|Ledger) source/.exec(d.message)?.[1];
    return label ? `SDP/Traceability/${label === "Ledger" ? "Ledger.ndjson" : `${label}.yaml`}` : "$project";
  };
  for (const d of snapshot.diagnostics.filter((x) => codes.has(x.code))) { const key = corePath(d); groups.set(key, [...(groups.get(key) ?? []), d]); }
  return [...groups.entries()].map(([key, ds]) => {
    const source = ds.find((d) => d.source)?.source;
    const listing = ds.some((d) => d.code === "DISCOVERY_SOURCE_LIST_FAILED");
    const missing = ds.some((d) => d.code === "DISCOVERY_MISSING_CORE_SOURCE");
    const severity: FindingSeverity = listing ? "unknown" : missing ? "warning" : "error";
    return finding({ ruleId: "SDP001", severity, title: listing ? "Core source availability is unknown" : "Required core source is unavailable", explanation: `${ds.map((d) => d.message).join(" ")} The analyzer did not infer unavailable content.`, sources: source ? [source] : [PROJECT_SOURCE], discriminator: key, recommendation: "Restore or correct the required core traceability source and analyze again." });
  });
} };

export const duplicateEntityDefinitionsRule: ValidationRule = { id: "SDP002", evaluate(snapshot) {
  const ids = new Set<string>();
  for (const d of snapshot.diagnostics.filter((x) => x.code === "NORMALIZE_DUPLICATE_ENTITY_DEFINITION")) { const m = /^Entity (.+?) has /.exec(d.message); if (m?.[1]) ids.add(m[1]); }
  return [...ids].sort().map((id) => { const entity = snapshot.entities.find((e) => e.id === id); const sources = entity?.sources ?? snapshot.diagnostics.filter((d) => d.code === "NORMALIZE_DUPLICATE_ENTITY_DEFINITION" && d.message.startsWith(`Entity ${id} has `)).flatMap((d) => d.source ? [d.source] : []); return finding({ ruleId: "SDP002", severity: "error", title: `Duplicate entity definition: ${id}`, explanation: `Entity ${id} has multiple explicit definitions. One canonical view was retained, but the analyzer did not decide which definition is semantically correct.`, affectedEntityIds: [id], sources, recommendation: `Consolidate the explicit definitions for ${id}.` }); });
} };

export const danglingRelationsRule: ValidationRule = { id: "SDP003", evaluate(snapshot) {
  const ids = new Set(snapshot.entities.map((e) => e.id)); const out: Finding[] = [];
  for (const r of snapshot.relations) for (const endpoint of (["from", "to"] as const)) { const unresolved = r[endpoint]; if (!ids.has(unresolved)) out.push(finding({ ruleId: "SDP003", severity: "error", title: `Dangling relation ${endpoint}: ${unresolved}`, explanation: `Relation ${r.type} from ${r.from} to ${r.to} has no normalized ${endpoint} entity ${unresolved}. The analyzer preserved the relation and did not invent an entity.`, affectedEntityIds: [r.from, r.to], sources: r.sources, discriminator: `${r.id}|${endpoint}`, recommendation: `Add or correct the explicit entity or ${r.type} relation for ${unresolved}.` })); }
  return out;
} };

export const malformedLedgerRule: ValidationRule = { id: "SDP004", evaluate(snapshot) {
  const codes = new Set(["PARSE_LEDGER_INVALID_JSON", "PARSE_LEDGER_NON_OBJECT", "PARSE_LEDGER_UNSAFE_INTEGER"]);
  return [...groupedDiagnostics(snapshot, (c) => codes.has(c)).entries()].map(([key, ds]) => finding({ ruleId: "SDP004", severity: "error", title: "Malformed Ledger record", explanation: `${ds.map((d) => d.message).join(" ")} The rejected original line was not interpreted as a Ledger event.`, sources: ds.flatMap((d) => d.source ? [d.source] : []), discriminator: key, recommendation: "Correct the sourced Ledger line so it is one safe JSON object." }));
} };

const expectedKinds = { sprint: "sprint", iteration: "iteration", slice: "slice" } as const;
export const unresolvedActiveDeclarationsRule: ValidationRule = { id: "SDP005", evaluate(snapshot) {
  if (!snapshot.active) return []; const out: Finding[] = [];
  for (const field of ["sprint", "refactor", "iteration", "slice"] as const) { const id = snapshot.active[field]; if (typeof id !== "string" || !id.trim()) continue; const entity = snapshot.entities.find((e) => e.id === id); const expected = field === "refactor" ? "refactor" : expectedKinds[field]; if (!entity || (entity.kind !== "unknown" && entity.kind !== expected)) out.push(finding({ ruleId: "SDP005", severity: "error", title: `Unresolved active ${field}: ${id}`, explanation: entity ? `Active ${field} ${id} resolves to incompatible recognized kind ${entity.kind}; the analyzer did not reinterpret it.` : `Active ${field} ${id} has no normalized entity; the analyzer did not infer one from Ledger history.`, affectedEntityIds: [id], sources: [snapshot.active.fieldSources[field] ?? snapshot.active.source], discriminator: field, recommendation: `Correct the active ${field} declaration or add its explicit ${expected} definition.` })); }
  return out;
} };

export const contradictoryActiveHierarchyRule: ValidationRule = { id: "SDP006", evaluate(snapshot) {
  if (!snapshot.active) return []; const out: Finding[] = [];
  const entityIds = new Set(snapshot.entities.map((entity) => entity.id));
  const checks: Array<[string | null | undefined, string | null | undefined, string]> = [[snapshot.active.iteration, snapshot.active.sprint, "sprint"], [snapshot.active.slice, snapshot.active.iteration, "iteration"], [snapshot.active.slice, snapshot.active.sprint, "sprint"]];
  for (const [child, expected, type] of checks) { if (typeof child !== "string" || typeof expected !== "string" || !entityIds.has(child) || !entityIds.has(expected)) continue; const rels = snapshot.relations.filter((r) => r.from === child && r.type === type); const conflicts = rels.filter((r) => r.to !== expected); if (conflicts.length) out.push(finding({ ruleId: "SDP006", severity: "error", title: `Contradictory active hierarchy for ${child}`, explanation: `Active hierarchy expects ${child} to relate by ${type} to ${expected}, but explicit evidence names ${conflicts.map((r) => r.to).sort().join(", ")}. Absence alone was not treated as a contradiction.`, affectedEntityIds: [child, expected, ...conflicts.map((r) => r.to)], sources: conflicts.flatMap((r) => r.sources), discriminator: `${child}|${type}|${expected}`, recommendation: `Correct the explicit ${type} relation for ${child}.` })); }
  return out;
} };

export const completedSliceWithoutVerificationRule: ValidationRule = { id: "SDP007", evaluate(snapshot) {
  return snapshot.entities.filter((e) => e.kind === "slice" && e.status === "completed").flatMap((slice) => { const rels = snapshot.relations.filter((r) => r.from === slice.id && r.type === "verification"); const targets = rels.flatMap((r) => { const target = snapshot.entities.find((e) => e.id === r.to); return target ? [target] : []; }); const qualifies = targets.some((target) => target.kind === "verification" && target.attributes.outcome === "passed"); if (qualifies) return []; return [finding({ ruleId: "SDP007", severity: "warning", title: `Completed Slice lacks passed verification: ${slice.id}`, explanation: `Slice ${slice.id} is explicitly completed but has no verification relation resolving to a verification entity with outcome "passed". Plans, reviews and Ledger prose were not treated as passed verification.`, affectedEntityIds: [slice.id, ...rels.map((r) => r.to)], sources: [...slice.sources, ...rels.flatMap((r) => r.sources), ...targets.flatMap((target) => target.sources)], recommendation: `Add a verification relation from ${slice.id} to a verification entity with explicit outcome "passed" after real checks succeed.` })]; });
} };

export const compatibilitySupportRule: ValidationRule = { id: "SDP008", evaluate(snapshot) {
  if (snapshot.profile.support === "supported") return []; const severity = snapshot.profile.support === "partial" ? "warning" : snapshot.profile.support === "unsupported" ? "error" : "unknown"; return [finding({ ruleId: "SDP008", severity, title: `${snapshot.profile.support} SDP profile compatibility`, explanation: `Profile ${snapshot.profile.id} support is ${snapshot.profile.support}. The analyzer preserved available facts and did not describe limited evidence as complete support.`, sources: snapshot.sources.length ? snapshot.sources : [PROJECT_SOURCE], discriminator: snapshot.profile.id, recommendation: "Review compatibility diagnostics and provide the required installed-profile structures." })];
} };

export const TIER_1_RULES: readonly ValidationRule[] = Object.freeze([requiredCoreSourcesRule, duplicateEntityDefinitionsRule, danglingRelationsRule, malformedLedgerRule, unresolvedActiveDeclarationsRule, contradictoryActiveHierarchyRule, completedSliceWithoutVerificationRule, compatibilitySupportRule]);
