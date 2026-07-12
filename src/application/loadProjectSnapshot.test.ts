import { describe, expect, it } from "vitest";
import { bundledFixtureSource } from "../adapters/fixtures/bundledFixtureSource";
import { CORE_TRACEABILITY_PATHS } from "../core/discovery/discoverProject";
import type { ProjectSource } from "../core/source/ProjectSource";
import { loadProjectSnapshot } from "./loadProjectSnapshot";

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

describe("loadProjectSnapshot", () => {
  it("runs one discover/read/parse/normalize flow and returns raw results plus the snapshot (case 37)", async () => {
    const source = instrumentSource();
    const result = await loadProjectSnapshot(source);

    expect(source.getListCount()).toBe(1);
    expect(source.getReadPaths()).toEqual([
      CORE_TRACEABILITY_PATHS.currentIndex,
      CORE_TRACEABILITY_PATHS.relations,
      CORE_TRACEABILITY_PATHS.ledger,
    ]);
    expect(result.currentIndex?.value).toBeDefined();
    expect(result.relations?.value).toBeDefined();
    expect(result.ledger?.value).toBeDefined();
    expect(result.snapshot.profile.support).toBe("supported");
    expect(result.snapshot.entities).toHaveLength(4);
    expect(result.snapshot.relations).toHaveLength(5);
    expect(result.snapshot.ledger).toHaveLength(3);
  });

  it("retains a read failure and neighboring normalized facts in a partial snapshot (case 38)", async () => {
    const source = instrumentSource(async (path) => {
      if (path === CORE_TRACEABILITY_PATHS.relations) {
        throw new Error("simulated Relations read failure");
      }

      return bundledFixtureSource.readText(path);
    });
    const result = await loadProjectSnapshot(source);

    expect(result.currentIndex?.value).toBeDefined();
    expect(result).not.toHaveProperty("relations");
    expect(result.ledger?.value?.records).toHaveLength(3);
    expect(result.snapshot.profile.support).toBe("partial");
    expect(result.snapshot.active).toMatchObject({ slice: "SLC-003" });
    expect(result.snapshot.entities).toEqual([]);
    expect(result.snapshot.relations).toEqual([]);
    expect(result.snapshot.ledger).toHaveLength(3);
    expect(result.snapshot.diagnostics).toEqual([
      expect.objectContaining({
        code: "NORMALIZE_REQUIRED_SOURCE_UNAVAILABLE",
        source: expect.objectContaining({
          path: CORE_TRACEABILITY_PATHS.relations,
        }),
      }),
      expect.objectContaining({
        code: "PARSE_APPLICATION_READ_FAILED",
        source: expect.objectContaining({
          path: CORE_TRACEABILITY_PATHS.relations,
        }),
      }),
    ]);
  });
});
