import { describe, expect, it } from "vitest";
import {
  bundledFixtureSource,
} from "../adapters/fixtures/bundledFixtureSource";
import { CORE_TRACEABILITY_PATHS } from "../core/discovery/discoverProject";
import type { ProjectSource } from "../core/source/ProjectSource";
import { loadCoreTraceability } from "./loadCoreTraceability";

function instrumentSource(
  readOverride?: (path: string) => Promise<{ path: string; text: string }>,
): ProjectSource & {
  readonly getListCount: () => number;
  readonly getReadPaths: () => readonly string[];
} {
  let listCount = 0;
  const readPaths: string[] = [];

  return {
    sourceId: bundledFixtureSource.sourceId,
    displayName: bundledFixtureSource.displayName,
    async listFiles() {
      listCount += 1;
      return bundledFixtureSource.listFiles();
    },
    async readText(path) {
      readPaths.push(path);
      return readOverride === undefined
        ? bundledFixtureSource.readText(path)
        : readOverride(path);
    },
    getListCount() {
      return listCount;
    },
    getReadPaths() {
      return [...readPaths];
    },
  };
}

describe("loadCoreTraceability", () => {
  it("discovers, reads and parses all three valid bundled core sources", async () => {
    const result = await loadCoreTraceability(bundledFixtureSource);

    expect(result.discovery.profile.support).toBe("supported");
    expect(result.diagnostics).toEqual([]);
    expect(result.currentIndex?.value?.active).toMatchObject({
      sprint: "SPR-001",
      refactor: null,
      iteration: "ITR-001",
      slice: "SLC-003",
    });
    expect(result.relations?.value?.sections.map((section) => section.key)).toEqual([
      "documents",
      "sprints",
      "iterations",
      "slices",
    ]);
    expect(result.ledger?.value?.records).toHaveLength(3);
  });

  it("reuses one SLC-002 discovery pass and reads only its three discovered paths", async () => {
    const source = instrumentSource();

    await loadCoreTraceability(source);

    expect(source.getListCount()).toBe(1);
    expect(source.getReadPaths()).toEqual([
      CORE_TRACEABILITY_PATHS.currentIndex,
      CORE_TRACEABILITY_PATHS.relations,
      CORE_TRACEABILITY_PATHS.ledger,
    ]);
  });

  it("preserves successful CurrentIndex and Ledger results when Relations reading fails", async () => {
    const source = instrumentSource(async (path) => {
      if (path === CORE_TRACEABILITY_PATHS.relations) {
        throw new Error("simulated read failure");
      }

      return bundledFixtureSource.readText(path);
    });
    const result = await loadCoreTraceability(source);

    expect(result.currentIndex?.value).toBeDefined();
    expect(result).not.toHaveProperty("relations");
    expect(result.ledger?.value?.records).toHaveLength(3);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_APPLICATION_READ_FAILED",
        source: expect.objectContaining({
          path: CORE_TRACEABILITY_PATHS.relations,
        }),
      }),
    ]);
  });

  it("isolates malformed Relations parsing without erasing valid neighboring parses", async () => {
    const source = instrumentSource(async (path) => {
      if (path === CORE_TRACEABILITY_PATHS.relations) {
        return { path, text: "slices: ]\n" };
      }

      return bundledFixtureSource.readText(path);
    });
    const result = await loadCoreTraceability(source);

    expect(result.currentIndex?.value).toBeDefined();
    expect(result.relations?.value).toBeUndefined();
    expect(result.ledger?.value?.records).toHaveLength(3);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_YAML_SYNTAX_ERROR",
        source: expect.objectContaining({
          path: CORE_TRACEABILITY_PATHS.relations,
        }),
      }),
    ]);
  });
});
