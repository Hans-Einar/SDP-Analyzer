import { describe, expect, it } from "vitest";
import { brokenFixtureSource } from "../adapters/fixtures/brokenFixtureSource";
import { bundledFixtureSource } from "../adapters/fixtures/bundledFixtureSource";
import { CORE_TRACEABILITY_PATHS } from "../core/discovery/discoverProject";
import { compareFindings } from "../core/findings/findingOrdering";
import type { ProjectSource } from "../core/source/ProjectSource";
import { analyzeProject } from "./analyzeProject";

const context = Object.freeze({
  analyzerVersion: "0.1.0",
  profileId: "sdp-toolkit-structured-core-v1",
  analysisTime: "2026-07-13T00:00:00Z",
});

function observeReads(
  source: ProjectSource,
  readOverride?: ProjectSource["readText"],
): ProjectSource & { readonly readPaths: readonly string[] } {
  const readPaths: string[] = [];

  return {
    ...source,
    get readPaths() {
      return [...readPaths];
    },
    async readText(path) {
      readPaths.push(path);
      return readOverride === undefined
        ? source.readText(path)
        : readOverride(path);
    },
  };
}

describe("Tier 1 integrated ProjectSource acceptance", () => {
  it("runs the clean structured-core fixture deterministically without mutation", async () => {
    const source = observeReads(bundledFixtureSource);
    const listingBefore = await source.listFiles();
    const coreTextBefore = await Promise.all(
      Object.values(CORE_TRACEABILITY_PATHS).map((path) => source.readText(path)),
    );
    const baselineReadCount = source.readPaths.length;
    const first = await analyzeProject(source, context);
    const second = await analyzeProject(source, context);
    const listingAfter = await source.listFiles();
    const coreTextAfter = await Promise.all(
      Object.values(CORE_TRACEABILITY_PATHS).map((path) => source.readText(path)),
    );
    const analysisReads = source.readPaths.slice(
      baselineReadCount,
      baselineReadCount + 6,
    );

    expect(second).toEqual(first);
    expect(first.discovery.standardDirectories).toMatchObject({
      lifecycle: expect.arrayContaining([
        "SDP/01--Mandate",
        "SDP/07--Implementation",
      ]),
      sprintsPresent: true,
      verificationPresent: true,
      codeReviewPresent: true,
      traceabilityPresent: true,
    });
    expect(
      first.discovery.files.filter((file) => file.kind === "markdown").length,
    ).toBeGreaterThan(0);
    expect(first.snapshot).toMatchObject({
      profile: {
        id: "sdp-toolkit-structured-core-v1",
        support: "supported",
      },
      project: {
        id: "FIXTURE-PROJECT",
        name: "Bundled minimal fixture",
        status: "active",
        tier: "TIER-001",
      },
      diagnostics: [],
    });
    expect(first.findings).toEqual([]);
    expect(first.validationDiagnostics).toEqual([]);
    expect(analysisReads).toEqual([
      CORE_TRACEABILITY_PATHS.currentIndex,
      CORE_TRACEABILITY_PATHS.relations,
      CORE_TRACEABILITY_PATHS.ledger,
      CORE_TRACEABILITY_PATHS.currentIndex,
      CORE_TRACEABILITY_PATHS.relations,
      CORE_TRACEABILITY_PATHS.ledger,
    ]);
    expect(analysisReads.some((path) => /\.md$/i.test(path))).toBe(false);
    expect(listingAfter).toEqual(listingBefore);
    expect(coreTextAfter).toEqual(coreTextBefore);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.snapshot)).toBe(true);
  });

  it("runs the real broken fixture through canonical findings and provenance", async () => {
    const source = observeReads(brokenFixtureSource);
    const listingBefore = await source.listFiles();
    const first = await analyzeProject(source, context);
    const firstReads = source.readPaths;
    const second = await analyzeProject(source, context);

    expect(second).toEqual(first);
    expect(first.snapshot.project).toMatchObject({
      id: "BROKEN-PROJECT",
      name: "Bundled broken fixture",
      status: "needs-attention",
      tier: "TIER-001",
    });
    expect(first.snapshot.ledger.map((event) => event.sequence)).toEqual([1, 3]);
    expect(first.snapshot.diagnostics.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "NORMALIZE_DUPLICATE_ENTITY_DEFINITION",
        "PARSE_LEDGER_INVALID_JSON",
      ]),
    );
    expect(first.findings.map((finding) => finding.ruleId)).toEqual(
      expect.arrayContaining(["SDP002", "SDP003", "SDP004", "SDP006", "SDP007"]),
    );
    expect(first.findings).toEqual([...first.findings].sort(compareFindings));
    expect(first.findings.every((finding) => finding.sources.length > 0)).toBe(
      true,
    );
    expect(second.findings.map((finding) => finding.fingerprint)).toEqual(
      first.findings.map((finding) => finding.fingerprint),
    );
    expect(firstReads).toEqual([
      CORE_TRACEABILITY_PATHS.currentIndex,
      CORE_TRACEABILITY_PATHS.relations,
      CORE_TRACEABILITY_PATHS.ledger,
    ]);
    expect(firstReads.some((path) => /\.md$/i.test(path))).toBe(false);
    expect(await source.listFiles()).toEqual(listingBefore);
  });

  it("retains usable CurrentIndex and Ledger evidence when Relations reading fails", async () => {
    const source = observeReads(brokenFixtureSource, async (path) => {
      if (path === CORE_TRACEABILITY_PATHS.relations) {
        throw new Error("simulated Relations read failure");
      }

      return brokenFixtureSource.readText(path);
    });
    const analysis = await analyzeProject(source, context);

    expect(analysis.snapshot.profile.support).toBe("partial");
    expect(analysis.snapshot.project).toMatchObject({ id: "BROKEN-PROJECT" });
    expect(analysis.snapshot.active).toMatchObject({ slice: "SLC-ACTIVE" });
    expect(analysis.snapshot.ledger.map((event) => event.sequence)).toEqual([1, 3]);
    expect(analysis.snapshot.entities).toEqual([]);
    expect(analysis.findings.map((finding) => finding.ruleId)).toEqual(
      expect.arrayContaining(["SDP001", "SDP004", "SDP005", "SDP008"]),
    );
    expect(source.readPaths).toEqual([
      CORE_TRACEABILITY_PATHS.currentIndex,
      CORE_TRACEABILITY_PATHS.relations,
      CORE_TRACEABILITY_PATHS.ledger,
    ]);
  });
});
