// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bundledFixtureSource } from "../adapters/fixtures/bundledFixtureSource";
import { brokenFixtureSource } from "../adapters/fixtures/brokenFixtureSource";
import { analyzeProject, type ProjectAnalysis } from "../application/analyzeProject";
import type { ProjectSource } from "../core/source/ProjectSource";
import type { SourceRef } from "../core/source/SourceRef";
import { App } from "./App";
import { analyzerComponentRegistry, analyzerDashboard } from "./dashboardConfig";

afterEach(cleanup);
const context = { analyzerVersion: "0.1.0", profileId: "sdp-tier-1", analysisTime: "2026-07-12T00:00:00Z" };

async function baseAnalysis(): Promise<ProjectAnalysis> { return analyzeProject(bundledFixtureSource, context); }

function expectedRange(start: number | undefined, end: number | undefined) {
  return start === undefined
    ? "Not available"
    : end === undefined
      ? String(start)
      : `${start}-${end}`;
}

function expectDetailItem(panelTitle: string, label: string, expectedValue: string) {
  const title = screen.getByText(panelTitle, { selector: '[data-slot="card-title"]' });
  const panel = title.closest<HTMLElement>('[data-slot="card"]');
  if (panel === null) throw new Error(`Detail panel not found: ${panelTitle}`);
  const term = within(panel).getByText(label, { selector: "dt" });
  const row = term.parentElement;
  if (row === null) throw new Error(`Detail row not found: ${label}`);
  expect(within(row).getByText(expectedValue, { exact: true, selector: "dd" })).toBeInTheDocument();
}

function expectRenderedSourceRef(source: SourceRef, index: number) {
  const panelTitle = `Provenance source ${index + 1}`;
  expectDetailItem(panelTitle, "Source ID", source.sourceId);
  expectDetailItem(panelTitle, "Path", source.path);
  expectDetailItem(panelTitle, "Kind", source.kind);
  expectDetailItem(
    panelTitle,
    "Line range",
    expectedRange(source.lineStart, source.lineEnd),
  );
  expectDetailItem(
    panelTitle,
    "Column range",
    expectedRange(source.columnStart, source.columnEnd),
  );
  expectDetailItem(panelTitle, "Pointer", source.pointer ?? "Not available");
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
    expect(screen.getByRole("combobox", { name: "Select bundled fixture" })).toHaveValue("fixture:minimal");
    expect(screen.getByRole("option", { name: "Bundled broken SDP fixture" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyzing selected fixture" })).toBeDisabled();
    expect(screen.getByText("Analyzing bundled fixture")).toBeInTheDocument();
    expect(screen.getByText(/Loading Bundled minimal SDP fixture/)).toBeInTheDocument();
    const loadingRegion = screen.getByText("Analyzing bundled fixture").closest("section");
    expect(loadingRegion).toHaveAttribute("aria-live", "polite");
    expect(loadingRegion).toHaveAttribute("aria-busy", "true");
    resolve(await baseAnalysis());
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    expect(screen.getByText("Compatibility: supported")).toBeInTheDocument();
    expect(screen.getByText("Structured-core profile")).toBeInTheDocument();
    expect(screen.getByText(/Markdown content, IDs, statuses, and verification records are not analyzed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze selected fixture" })).toBeEnabled();
    expectDetailItem("Project summary", "Source", "Bundled minimal SDP fixture");
    expectDetailItem("Project summary", "Project ID", "FIXTURE-PROJECT");
    expectDetailItem("Project summary", "Project name", "Bundled minimal fixture");
    expectDetailItem("Project summary", "Project status", "active");
    expectDetailItem("Project summary", "Declared tier", "TIER-001");
    expectDetailItem("Project summary", "Discovered files", "16");
    expectDetailItem("Project summary", "Profile ID", "sdp-toolkit-structured-core-v1");
    expectDetailItem("Project summary", "Profile support", "supported");
    expectDetailItem("Project summary", "Content coverage", "Three structured traceability files; Markdown paths only");
    expectDetailItem("Project summary", "Input status", "Loaded without diagnostics");
    expectDetailItem("Project summary", "Entities", "7");
    expectDetailItem("Project summary", "Relations", "10");
    expectDetailItem("Project summary", "Ledger events", "5");
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

  it("runs the shipped clean source through the default controller and analysis pipeline", async () => {
    render(<App />);

    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    expectDetailItem("Selected bundled source", "Source ID", "fixture:minimal");
    expectDetailItem("Project summary", "Project ID", "FIXTURE-PROJECT");
    expectDetailItem("Project summary", "Project name", "Bundled minimal fixture");
    expectDetailItem("Project summary", "Input status", "Loaded without diagnostics");
    expectDetailItem("Project summary", "Validation findings", "0");
    expect(screen.getByText("No acquisition or parsing diagnostics")).toBeInTheDocument();
    expect(screen.getByText("No validation findings")).toBeInTheDocument();
  });

  it("switches to the shipped broken source and renders real canonical findings with provenance", async () => {
    const user = userEvent.setup();
    const expected = await analyzeProject(brokenFixtureSource, context);
    render(<App />);
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Select bundled fixture" }),
      brokenFixtureSource.sourceId,
    );

    expect(await screen.findByText("PARSE_LEDGER_INVALID_JSON")).toBeInTheDocument();
    expectDetailItem("Selected bundled source", "Fixture", "Bundled broken SDP fixture");
    expectDetailItem("Project summary", "Project ID", "BROKEN-PROJECT");
    expectDetailItem("Project summary", "Project name", "Bundled broken fixture");
    expectDetailItem("Project summary", "Project status", "needs-attention");
    expectDetailItem("Project summary", "Declared tier", "TIER-001");

    const findingList = screen.getByRole("list", {
      name: "Validation findings",
    });
    const buttons = within(findingList).getAllByRole("button");
    expect(buttons).toHaveLength(expected.findings.length);
    expect(
      buttons.map((button) =>
        expected.findings.findIndex((finding) =>
          button.textContent?.includes(`${finding.ruleId}: ${finding.title}`),
        ),
      ),
    ).toEqual(expected.findings.map((_, index) => index));

    const expectedDetail = expected.findings.find(
      (finding) => finding.ruleId === "SDP007",
    );
    if (expectedDetail === undefined) {
      throw new Error("Expected the broken fixture to produce SDP007.");
    }
    expect(expectedDetail.sources.length).toBeGreaterThan(0);
    await user.click(
      within(findingList).getByRole("button", { name: /SDP007:/ }),
    );
    expectDetailItem(expectedDetail.title, "Explanation", expectedDetail.explanation);
    expectDetailItem(
      expectedDetail.title,
      "Recommendation",
      expectedDetail.recommendation ?? "None provided",
    );
    expectDetailItem(
      expectedDetail.title,
      "Affected IDs",
      expectedDetail.affectedEntityIds.join(", "),
    );
    expectDetailItem(expectedDetail.title, "Fingerprint", expectedDetail.fingerprint);
    for (const [index, source] of expectedDetail.sources.entries()) {
      expectRenderedSourceRef(source, index);
    }

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Select bundled fixture" }),
      bundledFixtureSource.sourceId,
    );
    expect(await screen.findByText("No validation findings")).toBeInTheDocument();
    expect(screen.queryByText(expectedDetail.title)).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Select bundled fixture" }),
      brokenFixtureSource.sourceId,
    );
    expect(await screen.findByText("PARSE_LEDGER_INVALID_JSON")).toBeInTheDocument();
    expect(screen.getByText("No finding selected")).toBeInTheDocument();
    expect(screen.queryByText(expectedDetail.title, { selector: '[data-slot="card-title"]' })).not.toBeInTheDocument();
  });

  it("repeats Analyze without duplicating rendered state", async () => {
    const user = userEvent.setup();
    const analyze = vi.fn(analyzeProject);
    render(<App analyze={analyze} />);
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    expect(analyze).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Analyze selected fixture" }));
    await waitFor(() => expect(analyze).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Analyze selected fixture" }));
    await waitFor(() => expect(analyze).toHaveBeenCalledTimes(3));
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    expect(
      screen.getAllByText("Project summary", {
        selector: '[data-slot="card-title"]',
      }),
    ).toHaveLength(1);
    expect(screen.getAllByText("No validation findings")).toHaveLength(1);
  });

  it("replaces loading with a safe failure and no stale result", async () => {
    const { rerender } = render(<App />);
    expect(await screen.findByText("Bundled fixture analysis")).toBeInTheDocument();
    const failingSource = { ...bundledFixtureSource, sourceId: "fixture:failed", displayName: "Broken fixture" };
    rerender(<App source={failingSource} analyze={vi.fn(async () => { throw new Error("secret stack"); })} />);
    expect(screen.getByText("Analyzing bundled fixture")).toBeInTheDocument();
    expect(await screen.findByText("Analysis failed")).toBeInTheDocument();
    const failureRegion = screen.getByText("No previous analysis result is displayed.").closest("section");
    expect(failureRegion).toHaveAttribute("role", "alert");
    expectDetailItem("Selected bundled source", "Fixture", "Broken fixture");
    expectDetailItem("Selected bundled source", "Source ID", "fixture:failed");
    expect(screen.getByText("No previous analysis result is displayed.")).toBeInTheDocument();
    expect(screen.queryByText("Bundled fixture analysis")).not.toBeInTheDocument();
    expect(screen.queryByText(/secret stack/i)).not.toBeInTheDocument();
  });

  it("shows real canonical findings, complete detail, and immutable filters without reanalysis", async () => {
    const analysis = await analyzeProject(brokenFixtureSource, context);
    const before = JSON.stringify(analysis.findings);
    const analyze = vi.fn(async () => analysis);
    render(<App source={brokenFixtureSource} analyze={analyze} />);
    const findingList = await screen.findByRole("list", {
      name: "Validation findings",
    });
    const buttons = within(findingList).getAllByRole("button");

    expect(buttons).toHaveLength(analysis.findings.length);
    for (const [index, finding] of analysis.findings.entries()) {
      expect(buttons[index]).toHaveTextContent(
        `${finding.ruleId}: ${finding.title}`,
      );
    }

    const firstFinding = analysis.findings[0];
    const firstButton = buttons[0];
    if (firstFinding === undefined || firstButton === undefined) {
      throw new Error("Expected the broken fixture to produce findings.");
    }
    expect(firstFinding.sources.length).toBeGreaterThan(0);
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-pressed", "true");
    expectDetailItem(firstFinding.title, "Severity", firstFinding.severity.toUpperCase());
    expectDetailItem(firstFinding.title, "Rule ID", firstFinding.ruleId);
    expectDetailItem(firstFinding.title, "Explanation", firstFinding.explanation);
    expectDetailItem(
      firstFinding.title,
      "Recommendation",
      firstFinding.recommendation ?? "None provided",
    );
    expectDetailItem(
      firstFinding.title,
      "Affected IDs",
      firstFinding.affectedEntityIds.join(", "),
    );
    expectDetailItem(firstFinding.title, "Fingerprint", firstFinding.fingerprint);
    for (const [index, source] of firstFinding.sources.entries()) {
      expectRenderedSourceRef(source, index);
    }

    fireEvent.change(screen.getByLabelText("Filter findings by severity"), {
      target: { value: "warning" },
    });
    expect(
      within(findingList)
        .getAllByRole("button")
        .every((button) => button.textContent?.includes("WARNING")),
    ).toBe(true);
    expect(screen.getByText("No finding selected")).toBeInTheDocument();
    expect(
      screen.queryByText(firstFinding.title, {
        selector: '[data-slot="card-title"]',
      }),
    ).not.toBeInTheDocument();
    expect(
      within(findingList)
        .getAllByRole("button")
        .every((button) => button.getAttribute("aria-pressed") === "false"),
    ).toBe(true);

    const visibleButton = within(findingList).getAllByRole("button")[0];
    if (visibleButton === undefined) {
      throw new Error("Expected a warning finding after filtering.");
    }
    fireEvent.click(visibleButton);
    expect(visibleButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByLabelText("Filter findings by severity"), {
      target: { value: "all" },
    });
    expect(visibleButton).toHaveAttribute("aria-pressed", "true");
    expect(JSON.stringify(analysis.findings)).toBe(before);
    expect(analyze).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      support: "partial" as const,
      source: {
        sourceId: "fixture:partial",
        displayName: "Partial structured-core fixture",
        async listFiles() {
          return (await bundledFixtureSource.listFiles()).filter(
            ({ path }) => path !== "SDP/Traceability/Ledger.ndjson",
          );
        },
        readText: bundledFixtureSource.readText,
      } satisfies ProjectSource,
      diagnostic: "DISCOVERY_MISSING_CORE_SOURCE",
    },
    {
      support: "unknown" as const,
      source: {
        sourceId: "fixture:unknown",
        displayName: "Unknown structured-core fixture",
        async listFiles() {
          throw new Error("Test fixture listing unavailable");
        },
        readText: bundledFixtureSource.readText,
      } satisfies ProjectSource,
      diagnostic: "DISCOVERY_SOURCE_LIST_FAILED",
    },
  ])("derives $support compatibility through a real ProjectSource and controller run", async ({ support, source, diagnostic }) => {
    render(<App source={source} />);

    expect(await screen.findByText(`Compatibility: ${support}`)).toBeInTheDocument();
    expectDetailItem("Selected bundled source", "Source ID", source.sourceId);
    expectDetailItem("Project summary", "Profile support", support);
    expect(screen.getByText(diagnostic)).toBeInTheDocument();
    expect(screen.getByText(`This profile is ${support}; results remain visible with that limitation.`)).toBeInTheDocument();
  });

  it("renders explicitly injected unsupported compatibility without claiming it is source-derived", async () => {
    const base = await baseAnalysis();
    render(<App analyze={vi.fn(async () => ({ ...base, snapshot: { ...base.snapshot, profile: { ...base.snapshot.profile, support: "unsupported" as const } } }))} />);
    expect(await screen.findByText("Compatibility: unsupported")).toBeInTheDocument();
    expect(screen.getByText("This profile is unsupported; results remain visible with that limitation.")).toBeInTheDocument();
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
    const analysis = await analyzeProject(brokenFixtureSource, context);
    const finding = analysis.findings[0];
    if (finding === undefined) throw new Error("Expected a real broken finding.");
    render(<App source={brokenFixtureSource} />);
    const button = await screen.findByRole("button", {
      name: new RegExp(`${finding.ruleId}:`),
    });
    expect(button.tagName).toBe("BUTTON");
    button.focus();
    await userEvent.keyboard(key);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(finding.explanation)).toBeInTheDocument();
  });

  it("keeps selected source out of SharedUI dashboard state", () => {
    expect(analyzerDashboard.config.state).toEqual({});
    expect(analyzerDashboard.config.statePolicy).toEqual({});
    expect(analyzerComponentRegistry.SourceSelector.kind).toBe("custom");
    expect(analyzerComponentRegistry.AnalyzerWorkflow.kind).toBe("custom");
  });
});
