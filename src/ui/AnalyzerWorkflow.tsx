import { createContext, useContext, useMemo, useState } from "react";
import { AlertBanner, Badge, CardSkeleton, DataTable, DetailPanel, EmptyState, PageHeader, Section, TableSkeleton } from "SharedUI/components/baseline";
import type { ProjectAnalysis } from "../application/analyzeProject";
import type { AnalysisLifecycle } from "../application/analysisController";
import type { Diagnostic } from "../core/diagnostics/Diagnostic";
import type { Finding, FindingSeverity } from "../core/findings/Finding";
import type { SourceRef } from "../core/source/SourceRef";

const AnalysisViewContext = createContext<AnalysisLifecycle | undefined>(undefined);
export const AnalysisViewProvider = AnalysisViewContext.Provider;
const value = (item: string | null | undefined) => item === undefined ? "Not declared" : item === null ? "Explicitly none" : item;
const location = (source: SourceRef) => {
  const start = source.lineStart === undefined ? "" : `:${source.lineStart}${source.columnStart === undefined ? "" : `:${source.columnStart}`}`;
  const end = source.lineEnd === undefined ? "" : `-${source.lineEnd}${source.columnEnd === undefined ? "" : `:${source.columnEnd}`}`;
  return `${source.path}${start}${end}${source.pointer === undefined ? "" : ` (${source.pointer})`}`;
};
const diagnosticLocation = (diagnostic: Diagnostic) => diagnostic.source === undefined ? "Project-level" : location(diagnostic.source);
const severityTone = (severity: FindingSeverity) => severity === "error" ? "danger" : severity === "warning" ? "warning" : "info";
const range = (start: number | undefined, end: number | undefined) => start === undefined ? "Not available" : end === undefined ? String(start) : `${start}-${end}`;

function useAnalysisView() {
  return useContext(AnalysisViewContext);
}

export function SourceSelector() {
  const lifecycle = useAnalysisView();
  if (lifecycle === undefined) return <AlertBanner title="Source unavailable" message="The application source owner is not connected." tone="danger" />;
  const source = lifecycle.selectedSource;
  return <section aria-label="Fixture source selection">
    <Section title="Fixture source" eyebrow="Source selection" body="Tier 1 analyzes the selected bundled fixture through the project-source interface." />
    <DetailPanel title="Selected bundled source" items={[
      { label: "Fixture", value: source.displayName },
      { label: "Source ID", value: source.sourceId },
      { label: "Source type", value: "Bundled fixture" },
    ]} />
    <AlertBanner title="Local folders unavailable" message="Local-folder selection is not available in Tier 1. This analysis reads only the bundled fixture and does not request filesystem access." tone="info" />
  </section>;
}

function ProjectSummary({ analysis, sourceName }: { analysis: ProjectAnalysis; sourceName: string }) {
  const { snapshot, discovery, findings } = analysis;
  return <DetailPanel title="Project summary" items={[
    { label: "Source", value: sourceName }, { label: "Discovered files", value: String(discovery.files.length) },
    { label: "Profile ID", value: snapshot.profile.id }, { label: "Profile support", value: snapshot.profile.support },
    { label: "Input status", value: snapshot.diagnostics.length === 0 ? "Loaded without diagnostics" : `Loaded with ${snapshot.diagnostics.length} diagnostics` },
    { label: "Entities", value: String(snapshot.entities.length) }, { label: "Relations", value: String(snapshot.relations.length) },
    { label: "Ledger events", value: String(snapshot.ledger.length) }, { label: "Parse/normalization diagnostics", value: String(snapshot.diagnostics.length) },
    { label: "Validation findings", value: String(findings.length) },
  ]} />;
}

function DiagnosticsSummary({ diagnostics }: { diagnostics: readonly Diagnostic[] }) {
  if (diagnostics.length === 0) return <EmptyState title="No acquisition or parsing diagnostics" message="The analyzed fixture produced no discovery, parser, or normalization diagnostics." />;
  return <DataTable title="Acquisition and parsing diagnostics" columns={["severity", "code", "message", "location"]}
    data={diagnostics.map((d, index) => ({ id: `${d.code}-${index}`, severity: d.severity.toUpperCase(), code: d.code, message: d.message, location: diagnosticLocation(d) }))} />;
}

function FindingDetail({ finding }: { finding: Finding | undefined }) {
  if (finding === undefined) return <EmptyState title="No finding selected" message="Select a finding to inspect its complete explanation and provenance." />;
  return <section aria-label="Selected finding detail">
    <DetailPanel title={finding.title} items={[
      { label: "Severity", value: finding.severity.toUpperCase() }, { label: "Rule ID", value: finding.ruleId },
      { label: "Explanation", value: finding.explanation }, { label: "Recommendation", value: finding.recommendation ?? "None provided" },
      { label: "Affected IDs", value: finding.affectedEntityIds.length === 0 ? "Project-level" : finding.affectedEntityIds.join(", ") },
      { label: "Fingerprint", value: finding.fingerprint },
    ]} />
    <h3>Provenance</h3>
    {finding.sources.length === 0 ? <p>Synthetic project-level finding; no repository source is available.</p> :
      <ol aria-label="Finding provenance">{finding.sources.map((source, index) => <li key={`${source.sourceId}-${source.path}-${index}`}>
        <strong>{source.path}</strong> — source {source.sourceId}; kind {source.kind}; {location(source)}
        <DetailPanel title={`Provenance source ${index + 1}`} items={[
          { label: "Source ID", value: source.sourceId },
          { label: "Path", value: source.path },
          { label: "Kind", value: source.kind },
          { label: "Line range", value: range(source.lineStart, source.lineEnd) },
          { label: "Column range", value: range(source.columnStart, source.columnEnd) },
          { label: "Pointer", value: source.pointer ?? "Not available" },
        ]} />
      </li>)}</ol>}
  </section>;
}

function FindingsList({ findings }: { findings: readonly Finding[] }) {
  const [severity, setSeverity] = useState<"all" | FindingSeverity>("all");
  const [rule, setRule] = useState("all");
  const [selected, setSelected] = useState<string>();
  const rules = useMemo(() => [...new Set(findings.map((f) => f.ruleId))], [findings]);
  const visible = useMemo(() => findings.filter((f) => (severity === "all" || f.severity === severity) && (rule === "all" || f.ruleId === rule)), [findings, rule, severity]);
  const selectedFinding = findings.find((finding) => finding.fingerprint === selected);
  if (findings.length === 0) return <EmptyState title="No validation findings" message="No configured Tier 1 rule reported a finding for this evidence. This is not a claim of total project correctness." />;
  return <>
    <div aria-label="Finding filters">
      <label>Severity <select aria-label="Filter findings by severity" value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
        <option value="all">All severities</option><option value="error">Error</option><option value="warning">Warning</option><option value="info">Info</option><option value="unknown">Unknown</option>
      </select></label>
      <label> Rule <select aria-label="Filter findings by rule" value={rule} onChange={(e) => setRule(e.target.value)}><option value="all">All rules</option>{rules.map((id) => <option key={id}>{id}</option>)}</select></label>
    </div>
    {visible.length === 0 ? <EmptyState title="No findings match these filters" message="Change or clear the filters to see the immutable analysis result." /> :
      <ul aria-label="Validation findings">{visible.map((finding) => <li key={finding.fingerprint}>
        <button type="button" aria-pressed={selected === finding.fingerprint} onClick={() => setSelected(finding.fingerprint)}>
          <Badge label={finding.severity.toUpperCase()} tone={severityTone(finding.severity)} /> {finding.ruleId}: {finding.title}; affected: {finding.affectedEntityIds.length === 0 ? "project" : finding.affectedEntityIds.join(", ")}
        </button>
      </li>)}</ul>}
    <FindingDetail finding={selectedFinding} />
  </>;
}

function ReadyAnalysis({ lifecycle }: { lifecycle: Extract<AnalysisLifecycle, { status: "ready" }> }) {
  const { analysis, selectedSource } = lifecycle;
  const active = analysis.snapshot.active;
  const diagnostics = [...analysis.snapshot.diagnostics, ...analysis.validationDiagnostics];
  return <>
    <PageHeader title="Bundled fixture analysis" description="The complete deterministic discovery, parsing, normalization, and validation pipeline for the selected fixture." />
    <Badge label={`Compatibility: ${analysis.snapshot.profile.support}`} tone={analysis.snapshot.profile.support === "supported" ? "success" : "warning"} />
    {analysis.snapshot.profile.support !== "supported" && <AlertBanner title="Compatibility is not fully supported" message={`This profile is ${analysis.snapshot.profile.support}; results remain visible with that limitation.`} tone="warning" />}
    <ProjectSummary analysis={analysis} sourceName={selectedSource.displayName} />
    <Section title="Declared active work" body="Values are declarations from CurrentIndex; validation findings separately report contradictions or unresolved references." />
    {active === undefined ? <EmptyState title="No active-work declaration" message="The analyzed evidence did not provide an active declaration." /> : <DetailPanel title="Declared values" items={[
      { label: "Sprint", value: value(active.sprint) }, { label: "Refactor", value: value(active.refactor) },
      { label: "Iteration", value: value(active.iteration) }, { label: "Slice", value: value(active.slice) },
    ]} />}
    <Section title="Diagnostics" body="Acquisition, parser, normalization, and isolated rule-engine diagnostics are separate from validation findings." />
    <DiagnosticsSummary diagnostics={diagnostics} />
    <Section title="Validation findings" body="Findings remain in canonical domain order until presentation-only filters are applied." />
    <FindingsList findings={analysis.findings} />
  </>;
}

export function AnalyzerWorkflow() {
  const lifecycle = useAnalysisView();
  if (lifecycle === undefined) return <AlertBanner title="Analysis unavailable" message="The application analysis owner is not connected." tone="danger" />;
  if (lifecycle.status === "idle") return <EmptyState title="No analysis started" message="Select the bundled fixture to begin analysis." />;
  if (lifecycle.status === "loading") return <section aria-live="polite" aria-busy="true"><PageHeader title="Analyzing bundled fixture" description={`Loading ${lifecycle.selectedSource.displayName}`} /><CardSkeleton label="Loading project summary" /><TableSkeleton label="Loading findings" /></section>;
  if (lifecycle.status === "failed") return <section role="alert"><AlertBanner title="Analysis failed" message={lifecycle.message} tone="danger" /><p>No previous analysis result is displayed.</p></section>;
  return <ReadyAnalysis lifecycle={lifecycle} />;
}
