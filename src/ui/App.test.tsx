// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bundledFixtureSource } from "../adapters/fixtures/bundledFixtureSource";
import { analyzeProject, type ProjectAnalysis } from "../application/analyzeProject";
import type { Finding } from "../core/findings/Finding";
import { App } from "./App";
import { analyzerComponentRegistry, analyzerDashboard } from "./dashboardConfig";

afterEach(cleanup);
const context = { analyzerVersion: "0.1.0", profileId: "sdp-tier-1", analysisTime: "2026-07-12T00:00:00Z" };

async function baseAnalysis(): Promise<ProjectAnalysis> { return analyzeProject(bundledFixtureSource, context); }

function expectDetailItem(panelTitle: string, label: string, expectedValue: string) {
  const title = screen.getByText(panelTitle, { selector: '[data-slot="card-title"]' });
  const panel = title.closest<HTMLElement>('[data-slot="card"]');
  if (panel === null) throw new Error(`Detail panel not found: ${panelTitle}`);
  const term = within(panel).getByText(label, { selector: "dt" });
  const row = term.parentElement;
  if (row === null) throw new Error(`Detail row not found: ${label}`);
  expect(within(row).getByText(expectedValue, { exact: true, selector: "dd" })).toBeInTheDocument();
}

describe("App workflow", () => {
  it("renders loading then truthful clean end-to-end analysis", async () => {
    let resolve!: (result: ProjectAnalysis) => void;
    const pending = new Promise<ProjectAnalysis>((done) => { resolve = done; });
    render(<App analyze={vi.fn(() => pending)} />);
    expect(screen.getByRole("region", { name: "Fixture source selection" })).toBeInTheDocument();
    expect(screen.getByText("Fixture source")).toBeInTheDocument();
    expect(screen.getByText("Local folders unavailable")).toBeInTheDocument();
    expect(screen.getByText(/does not request filesystem access/i)).toBeInTheDocument();
    expectDetailItem("Selected bundled source", "Fixture", "Bundled minimal SDP fixture");
    expectDetailItem("Selected bundled source", "Source ID", "fixture:minimal");
    expectDetailItem("Selected bundled source", "Source type", "Bundled fixture");
    expect(screen.getByText("Analyzing bundled fixture")).toBeInTheDocument();
    expect(screen.getByText(/Loading Bundled minimal SDP fixture/)).toBeInTheDocument();
    resolve(await baseAnalysis());
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    expect(screen.getByText("Compatibility: supported")).toBeInTheDocument();
    expectDetailItem("Project summary", "Source", "Bundled minimal SDP fixture");
    expectDetailItem("Project summary", "Discovered files", "14");
    expectDetailItem("Project summary", "Profile ID", "sdp-toolkit-current");
    expectDetailItem("Project summary", "Profile support", "supported");
    expectDetailItem("Project summary", "Input status", "Loaded without diagnostics");
    expectDetailItem("Project summary", "Entities", "4");
    expectDetailItem("Project summary", "Relations", "5");
    expectDetailItem("Project summary", "Ledger events", "3");
    expectDetailItem("Project summary", "Parse/normalization diagnostics", "0");
    expectDetailItem("Project summary", "Validation findings", "0");
    expectDetailItem("Declared values", "Sprint", "SPR-001");
    expectDetailItem("Declared values", "Refactor", "Explicitly none");
    expectDetailItem("Declared values", "Iteration", "ITR-001");
    expectDetailItem("Declared values", "Slice", "SLC-003");
    expect(screen.getByText("No acquisition or parsing diagnostics")).toBeInTheDocument();
    expect(screen.getByText("No validation findings")).toBeInTheDocument();
    expect(screen.getByText(/not a claim of total project correctness/i)).toBeInTheDocument();
    expect(screen.queryByText(/health/i)).not.toBeInTheDocument();
  });

  it("replaces loading with a safe failure and no stale result", async () => {
    const { rerender } = render(<App />);
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    const failingSource = { ...bundledFixtureSource, sourceId: "fixture:failed", displayName: "Broken fixture" };
    rerender(<App source={failingSource} analyze={vi.fn(async () => { throw new Error("secret stack"); })} />);
    expect(screen.getByText("Analyzing bundled fixture")).toBeInTheDocument();
    expect(await screen.findByText("Analysis failed")).toBeInTheDocument();
    expectDetailItem("Selected bundled source", "Fixture", "Broken fixture");
    expectDetailItem("Selected bundled source", "Source ID", "fixture:failed");
    expect(screen.getByText("No previous analysis result is displayed.")).toBeInTheDocument();
    expect(screen.queryByText("Bundled fixture analysis")).not.toBeInTheDocument();
    expect(screen.queryByText(/secret stack/i)).not.toBeInTheDocument();
  });

  it("shows canonical findings, complete detail, immutable filters, and does not reanalyze for UI changes", async () => {
    const base = await baseAnalysis();
    const findings: readonly Finding[] = [
      { fingerprint: "fp-1", ruleId: "SDP001", severity: "error", title: "Missing target", explanation: "A relation target is unresolved.", recommendation: "Declare the target.", affectedEntityIds: ["SLC-X"], sources: [
        { sourceId: "fixture:minimal", path: "SDP/Traceability/Relations.yaml", kind: "yaml", lineStart: 7, columnStart: 3, lineEnd: 8, columnEnd: 9, pointer: "/slices/SLC-X" },
        { sourceId: "fixture:minimal", path: "SDP/Traceability/CurrentIndex.yaml", kind: "yaml", pointer: "/active/slice" },
      ] },
      { fingerprint: "fp-2", ruleId: "SDP008", severity: "warning", title: "Unknown profile", explanation: "Compatibility is ambiguous.", affectedEntityIds: [], sources: [] },
    ];
    const analyze = vi.fn(async () => ({ ...base, findings, snapshot: { ...base.snapshot, profile: { ...base.snapshot.profile, support: "partial" as const } } }));
    render(<App analyze={analyze} />);
    expect(await screen.findByText("SDP001: Missing target; affected: SLC-X")).toBeInTheDocument();
    expect(screen.getByText("Compatibility: partial")).toBeInTheDocument();
    expect(screen.getByText("This profile is partial; results remain visible with that limitation.")).toBeInTheDocument();
    const first = screen.getByRole("button", { name: /SDP001: Missing target/ });
    const second = screen.getByRole("button", { name: /SDP008: Unknown profile/ });
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-pressed", "true");
    expectDetailItem("Missing target", "Severity", "ERROR");
    expectDetailItem("Missing target", "Rule ID", "SDP001");
    expectDetailItem("Missing target", "Explanation", "A relation target is unresolved.");
    expectDetailItem("Missing target", "Recommendation", "Declare the target.");
    expectDetailItem("Missing target", "Affected IDs", "SLC-X");
    expectDetailItem("Missing target", "Fingerprint", "fp-1");
    expectDetailItem("Provenance source 1", "Source ID", "fixture:minimal");
    expectDetailItem("Provenance source 1", "Path", "SDP/Traceability/Relations.yaml");
    expectDetailItem("Provenance source 1", "Kind", "yaml");
    expectDetailItem("Provenance source 1", "Line range", "7-8");
    expectDetailItem("Provenance source 1", "Column range", "3-9");
    expectDetailItem("Provenance source 1", "Pointer", "/slices/SLC-X");
    expectDetailItem("Provenance source 2", "Source ID", "fixture:minimal");
    expectDetailItem("Provenance source 2", "Path", "SDP/Traceability/CurrentIndex.yaml");
    expectDetailItem("Provenance source 2", "Kind", "yaml");
    expectDetailItem("Provenance source 2", "Line range", "Not available");
    expectDetailItem("Provenance source 2", "Column range", "Not available");
    expectDetailItem("Provenance source 2", "Pointer", "/active/slice");
    fireEvent.change(screen.getByLabelText("Filter findings by severity"), { target: { value: "warning" } });
    expect(screen.queryByRole("button", { name: /SDP001/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SDP008/ })).toBeInTheDocument();
    expect(findings).toHaveLength(2);
    expect(analyze).toHaveBeenCalledTimes(1);
  });

  it.each(["partial", "unknown", "unsupported"] as const)("renders %s compatibility honestly", async (support) => {
    const base = await baseAnalysis();
    render(<App analyze={vi.fn(async () => ({ ...base, snapshot: { ...base.snapshot, profile: { ...base.snapshot.profile, support } } }))} />);
    expect(await screen.findByText(`Compatibility: ${support}`)).toBeInTheDocument();
    expect(screen.getByText(`This profile is ${support}; results remain visible with that limitation.`)).toBeInTheDocument();
  });

  it("distinguishes a missing active declaration", async () => {
    const base = await baseAnalysis();
    const { active: _active, ...snapshotWithoutActive } = base.snapshot;
    render(<App analyze={vi.fn(async () => ({ ...base, snapshot: snapshotWithoutActive }))} />);
    expect(await screen.findByText("No active-work declaration")).toBeInTheDocument();
    expect(screen.getByText("The analyzed evidence did not provide an active declaration.")).toBeInTheDocument();
  });

  it("distinguishes a missing declared value from an explicit null", async () => {
    const base = await baseAnalysis();
    const { refactor: _refactor, ...activeWithoutRefactor } = base.snapshot.active!;
    render(<App analyze={vi.fn(async () => ({ ...base, snapshot: { ...base.snapshot, active: activeWithoutRefactor } }))} />);
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    expectDetailItem("Declared values", "Sprint", "SPR-001");
    expectDetailItem("Declared values", "Refactor", "Not declared");
    expectDetailItem("Declared values", "Iteration", "ITR-001");
    expectDetailItem("Declared values", "Slice", "SLC-003");
    expect(screen.queryByText("Explicitly none")).not.toBeInTheDocument();
  });

  it("shows each canonical input diagnostic once with code, severity, path, location and pointer, plus distinct validation diagnostics", async () => {
    const base = await baseAnalysis();
    const canonical = { code: "SDP-PARSE-001", severity: "warning" as const, message: "A field could not be parsed.", source: {
      sourceId: "fixture:minimal", path: "SDP/Traceability/CurrentIndex.yaml", kind: "yaml" as const, lineStart: 12, columnStart: 4, lineEnd: 13, columnEnd: 8, pointer: "/active/slice",
    } };
    const validation = { code: "SDP-ENGINE-001", severity: "info" as const, message: "A rule was skipped.", source: {
      sourceId: "fixture:minimal", path: "SDP/Traceability/Relations.yaml", kind: "yaml" as const, lineStart: 3, columnStart: 2, lineEnd: 3, columnEnd: 6, pointer: "/slices",
    } };
    render(<App analyze={vi.fn(async () => ({ ...base, discovery: { ...base.discovery, diagnostics: [canonical] }, snapshot: { ...base.snapshot, diagnostics: [canonical] }, validationDiagnostics: [validation] }))} />);
    expect(await screen.findByText("SDP-PARSE-001")).toBeInTheDocument();
    expect(screen.getAllByText("SDP-PARSE-001")).toHaveLength(1);
    expect(screen.getByText("WARNING")).toBeInTheDocument();
    expect(screen.getByText("SDP-ENGINE-001")).toBeInTheDocument();
    expect(screen.getByText(/CurrentIndex\.yaml:12:4-13:8 \(\/active\/slice\)/)).toBeInTheDocument();
    expect(screen.getByText(/Relations\.yaml:3:2-3:6 \(\/slices\)/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /SDP-PARSE-001/ })).not.toBeInTheDocument();
  });

  it.each([
    { key: "{Enter}", label: "Enter" },
    { key: "[Space]", label: "Space" },
  ])("uses native button activation for finding selection with $label", async ({ key }) => {
    const base = await baseAnalysis();
    const finding: Finding = { fingerprint: "keyboard-fp", ruleId: "SDP005", severity: "error", title: "Missing declaration", explanation: "The declaration is unresolved.", affectedEntityIds: ["SLC-X"], sources: [] };
    render(<App analyze={vi.fn(async () => ({ ...base, findings: [finding] }))} />);
    const button = await screen.findByRole("button", { name: /SDP005: Missing declaration/ });
    expect(button.tagName).toBe("BUTTON");
    button.focus();
    await userEvent.keyboard(key);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("The declaration is unresolved.")).toBeInTheDocument();
  });

  it("keeps selected source out of SharedUI dashboard state", () => {
    expect(analyzerDashboard.config.state).toEqual({});
    expect(analyzerDashboard.config.statePolicy).toEqual({});
    expect(analyzerComponentRegistry.SourceSelector.kind).toBe("custom");
    expect(analyzerComponentRegistry.AnalyzerWorkflow.kind).toBe("custom");
  });
});
