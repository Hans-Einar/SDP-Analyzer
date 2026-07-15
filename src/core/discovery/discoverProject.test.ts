import { describe, expect, it } from "vitest";
import { bundledFixtureSource } from "../../adapters/fixtures/bundledFixtureSource";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type {
  ProjectFileEntry,
  ProjectSource,
  ProjectSourceAcquisitionSnapshot,
  ProjectSourceWithAcquisitionListing,
} from "../source/ProjectSource";
import {
  CORE_TRACEABILITY_PATHS,
  CURRENT_SDP_PROFILE_ID,
  discoverProject,
} from "./discoverProject";

function createListOnlySource(
  entries: readonly ProjectFileEntry[],
): ProjectSource & { readonly getReadCount: () => number } {
  let readCount = 0;

  return {
    sourceId: "fixture:list-only",
    displayName: "List-only fixture",
    async listFiles() {
      return entries;
    },
    async readText() {
      readCount += 1;
      throw new Error("Discovery must not read source contents.");
    },
    getReadCount() {
      return readCount;
    },
  };
}

function createListFailureSource(): ProjectSource & {
  readonly getReadCount: () => number;
} {
  let readCount = 0;

  return {
    sourceId: "fixture:list-failure",
    displayName: "List failure fixture",
    async listFiles() {
      throw new Error("listing unavailable");
    },
    async readText() {
      readCount += 1;
      throw new Error("Discovery must not read source contents.");
    },
    getReadCount() {
      return readCount;
    },
  };
}

function createDiagnosticSource(
  entries: readonly ProjectFileEntry[],
  diagnostics: readonly Diagnostic[],
  completeness: "complete" | "partial" | "failed",
  rejectListing = false,
): ProjectSourceWithAcquisitionListing {
  const acquisition: ProjectSourceAcquisitionSnapshot = {
    completeness,
    diagnostics,
  };

  return {
    sourceId: "diagnostic-source",
    displayName: "Diagnostic source",
    async listFiles() {
      throw new Error("Discovery must prefer the atomic acquisition listing.");
    },
    async readText() {
      throw new Error("Discovery must not read source contents.");
    },
    async listFilesWithAcquisition() {
      if (rejectListing) {
        const error = new Error("sanitized listing failure") as Error & {
          readonly acquisition: ProjectSourceAcquisitionSnapshot;
        };
        Object.defineProperty(error, "acquisition", {
          value: acquisition,
          enumerable: true,
        });
        throw error;
      }

      return { entries, acquisition };
    },
  };
}

describe("discoverProject", () => {
  it("discovers the complete bundled profile with canonical provenance", async () => {
    const discovery = await discoverProject(bundledFixtureSource);

    expect(discovery.sourceId).toBe("fixture:minimal");
    expect(discovery.profile).toEqual({
      id: CURRENT_SDP_PROFILE_ID,
      support: "supported",
    });
    expect(discovery.files).toHaveLength(16);
    expect(discovery.diagnostics).toEqual([]);
    expect(discovery.coreTraceability).toEqual({
      currentIndex: expect.objectContaining({
        path: CORE_TRACEABILITY_PATHS.currentIndex,
        kind: "yaml",
      }),
      relations: expect.objectContaining({
        path: CORE_TRACEABILITY_PATHS.relations,
        kind: "yaml",
      }),
      ledger: expect.objectContaining({
        path: CORE_TRACEABILITY_PATHS.ledger,
        kind: "ndjson",
      }),
    });
    expect(discovery.standardDirectories).toEqual({
      lifecycle: [
        "SDP/01--Mandate",
        "SDP/02--Study",
        "SDP/03--Requirements",
        "SDP/04--Architecture",
        "SDP/05--DesignAnalysis",
        "SDP/06--Design",
        "SDP/07--Implementation",
      ],
      sprintsPresent: true,
      verificationPresent: true,
      codeReviewPresent: true,
      traceabilityPresent: true,
    });
    expect(
      discovery.files.every(
        (file) =>
          file.path === file.source.path &&
          file.kind === file.source.kind &&
          file.source.sourceId === bundledFixtureSource.sourceId,
      ),
    ).toBe(true);
  });

  it("sorts normalized paths deterministically and never reads contents", async () => {
    const source = createListOnlySource([
      { kind: "file", path: "SDP\\Traceability\\Relations.yaml" },
      { kind: "file", path: "AGENTS.md" },
      { kind: "file", path: "SDP/Traceability/Ledger.ndjson" },
      { kind: "file", path: "SDP/Traceability/CurrentIndex.yaml" },
    ]);

    const first = await discoverProject(source);
    const second = await discoverProject(source);

    expect(first).toEqual(second);
    expect(first.files.map((file) => file.path)).toEqual([
      "AGENTS.md",
      "SDP/Traceability/CurrentIndex.yaml",
      "SDP/Traceability/Ledger.ndjson",
      "SDP/Traceability/Relations.yaml",
    ]);
    expect(first.files.map((file) => file.kind)).toEqual([
      "markdown",
      "yaml",
      "ndjson",
      "yaml",
    ]);
    expect(first.profile.support).toBe("supported");
    expect(source.getReadCount()).toBe(0);
  });

  it("classifies recognized extensions without interpreting contents", async () => {
    const source = createListOnlySource([
      { kind: "file", path: CORE_TRACEABILITY_PATHS.currentIndex },
      { kind: "file", path: CORE_TRACEABILITY_PATHS.relations },
      { kind: "file", path: CORE_TRACEABILITY_PATHS.ledger },
      { kind: "file", path: "evidence/report.json" },
      { kind: "file", path: "notes/overview.markdown" },
      { kind: "file", path: "settings/profile.yml" },
    ]);

    const discovery = await discoverProject(source);

    expect(
      Object.fromEntries(discovery.files.map((file) => [file.path, file.kind])),
    ).toMatchObject({
      "evidence/report.json": "json",
      "notes/overview.markdown": "markdown",
      "settings/profile.yml": "yaml",
    });
    expect(source.getReadCount()).toBe(0);
  });

  it("reports a partial profile and diagnostic when a core source is missing", async () => {
    const source = createListOnlySource([
      { kind: "file", path: CORE_TRACEABILITY_PATHS.currentIndex },
      { kind: "file", path: CORE_TRACEABILITY_PATHS.ledger },
    ]);

    const discovery = await discoverProject(source);

    expect(discovery.profile).toEqual({
      id: CURRENT_SDP_PROFILE_ID,
      support: "partial",
    });
    expect(discovery.coreTraceability.relations).toBeUndefined();
    expect(discovery.diagnostics).toEqual([
      {
        code: "DISCOVERY_MISSING_CORE_SOURCE",
        severity: "warning",
        message:
          "Required core traceability source is missing: SDP/Traceability/Relations.yaml",
      },
    ]);
    expect(source.getReadCount()).toBe(0);
  });

  it("reports an unobserved listing failure as unknown instead of missing core sources", async () => {
    const failedSource = createListFailureSource();
    const emptySource = createListOnlySource([]);

    const firstFailure = await discoverProject(failedSource);
    const secondFailure = await discoverProject(failedSource);
    const successfulEmptyListing = await discoverProject(emptySource);

    expect(firstFailure).toEqual(secondFailure);
    expect(firstFailure).toEqual({
      sourceId: "fixture:list-failure",
      files: [],
      coreTraceability: {},
      standardDirectories: {
        lifecycle: [],
        sprintsPresent: false,
        verificationPresent: false,
        codeReviewPresent: false,
        traceabilityPresent: false,
      },
      profile: {
        id: CURRENT_SDP_PROFILE_ID,
        support: "unknown",
      },
      diagnostics: [
        {
          code: "DISCOVERY_SOURCE_LIST_FAILED",
          severity: "error",
          message: "Project source file listing failed. listing unavailable",
        },
      ],
    });
    expect(successfulEmptyListing.profile).toEqual({
      id: CURRENT_SDP_PROFILE_ID,
      support: "partial",
    });
    expect(successfulEmptyListing.diagnostics).toHaveLength(3);
    expect(
      successfulEmptyListing.diagnostics.every(
        (diagnostic) => diagnostic.code === "DISCOVERY_MISSING_CORE_SOURCE",
      ),
    ).toBe(true);
    expect(failedSource.getReadCount()).toBe(0);
    expect(emptySource.getReadCount()).toBe(0);
  });

  it("merges acquisition diagnostics after successful and rejected listings", async () => {
    const acquisitionDiagnostic = Object.freeze({
      code: "PROJECT_SOURCE_ACQUISITION_ENTRY_INACCESSIBLE",
      severity: "error" as const,
      message: "Directory evidence could not be fully enumerated at SDP/private.",
    });
    const partialSource = createDiagnosticSource(
      [{ kind: "file", path: CORE_TRACEABILITY_PATHS.currentIndex }],
      Object.freeze([acquisitionDiagnostic]),
      "partial",
    );
    const rejectedSource = createDiagnosticSource(
      [],
      Object.freeze([acquisitionDiagnostic]),
      "failed",
      true,
    );

    const partial = await discoverProject(partialSource);
    const rejected = await discoverProject(rejectedSource);

    expect(partial.profile.support).toBe("unknown");
    expect(partial.diagnostics).toContainEqual(acquisitionDiagnostic);
    expect(
      partial.diagnostics.filter(
        (diagnostic) => diagnostic.code === "DISCOVERY_MISSING_CORE_SOURCE",
      ),
    ).toHaveLength(0);
    expect(rejected.profile.support).toBe("unknown");
    expect(rejected.diagnostics).toContainEqual(acquisitionDiagnostic);
    expect(rejected.diagnostics).toContainEqual({
      code: "DISCOVERY_SOURCE_LIST_FAILED",
      severity: "error",
      message:
        "Project source file listing failed. sanitized listing failure",
    });
    expect(rejected.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "DISCOVERY_MISSING_CORE_SOURCE" }),
    );
  });

  it("keeps partial acquisition supported when every core source was observed", async () => {
    const acquisitionDiagnostic = Object.freeze({
      code: "PROJECT_SOURCE_ACQUISITION_ENTRY_INACCESSIBLE",
      severity: "error" as const,
      message: "Directory evidence could not be fully enumerated at private.",
    });
    const source = createDiagnosticSource(
      [
        { kind: "file", path: CORE_TRACEABILITY_PATHS.currentIndex },
        { kind: "file", path: CORE_TRACEABILITY_PATHS.relations },
        { kind: "file", path: CORE_TRACEABILITY_PATHS.ledger },
      ],
      Object.freeze([acquisitionDiagnostic]),
      "partial",
    );

    const discovery = await discoverProject(source);

    expect(discovery.profile.support).toBe("supported");
    expect(discovery.diagnostics).toEqual([acquisitionDiagnostic]);
    expect(discovery.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "DISCOVERY_MISSING_CORE_SOURCE" }),
    );
  });

  it("reports unsafe listed paths instead of repairing traversal", async () => {
    const source = createListOnlySource([
      { kind: "file", path: "../outside.md" },
      { kind: "file", path: CORE_TRACEABILITY_PATHS.currentIndex },
      { kind: "file", path: CORE_TRACEABILITY_PATHS.relations },
      { kind: "file", path: CORE_TRACEABILITY_PATHS.ledger },
    ]);

    const discovery = await discoverProject(source);

    expect(discovery.files.map((file) => file.path)).not.toContain(
      "../outside.md",
    );
    expect(discovery.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DISCOVERY_INVALID_PROJECT_PATH",
        severity: "error",
      }),
    );
  });
});
