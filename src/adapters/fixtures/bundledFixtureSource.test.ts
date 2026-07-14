import { describe, expect, it } from "vitest";
import type { ProjectSource } from "../../core/source/ProjectSource";
import { normalizeProjectPath } from "../../core/source/projectPath";
import {
  BUNDLED_FIXTURE_PATHS,
  bundledFixtureSource,
} from "./bundledFixtureSource";

async function readListedFixtureText(source: ProjectSource) {
  const entries = await source.listFiles();
  const firstEntry = entries[0];

  if (firstEntry === undefined) {
    throw new Error("Expected the bundled fixture to list files.");
  }

  return source.readText(firstEntry.path);
}

describe("bundledFixtureSource", () => {
  it("lists the exact standard fixture paths in deterministic canonical order", async () => {
    const expectedPaths = [
      "AGENTS-project.md",
      "AGENTS.md",
      "SDP/01--Mandate/mandate.md",
      "SDP/02--Study/study.md",
      "SDP/03--Requirements/requirements.md",
      "SDP/04--Architecture/architecture.md",
      "SDP/05--DesignAnalysis/design-analysis.md",
      "SDP/06--Design/design.md",
      "SDP/07--Implementation/implementation-plan.md",
      "SDP/CodeReview/REV-SLC-002.md",
      "SDP/Sprints/SPR-001/ScrumIterations.md",
      "SDP/Traceability/CurrentIndex.yaml",
      "SDP/Traceability/Ledger.ndjson",
      "SDP/Traceability/Relations.yaml",
      "SDP/Verification/VER-SLC-002.md",
      "SDP/Verification/verification-plan.md",
    ];

    expect(BUNDLED_FIXTURE_PATHS).toEqual(expectedPaths);

    const firstListing = await bundledFixtureSource.listFiles();
    const secondListing = await bundledFixtureSource.listFiles();

    expect(firstListing).toEqual(
      expectedPaths.map((path) => ({ kind: "file", path })),
    );
    expect(secondListing).toEqual(firstListing);
    expect(
      firstListing.every((entry) => {
        const normalized = normalizeProjectPath(entry.path);
        return normalized.ok && normalized.path === entry.path;
      }),
    ).toBe(true);
  });

  it("reads known canonical placeholder text through ProjectSource", async () => {
    await expect(readListedFixtureText(bundledFixtureSource)).resolves.toEqual({
      path: "AGENTS-project.md",
      text: "Placeholder for bundled fixture project instructions.\n",
    });
  });

  it("contains small valid core traceability examples instead of placeholders", async () => {
    const currentIndex = await bundledFixtureSource.readText(
      "SDP/Traceability/CurrentIndex.yaml",
    );
    const relations = await bundledFixtureSource.readText(
      "SDP/Traceability/Relations.yaml",
    );
    const ledger = await bundledFixtureSource.readText(
      "SDP/Traceability/Ledger.ndjson",
    );

    expect(currentIndex.text).toContain("slice: SLC-003");
    expect(relations.text).toContain("SLC-003:");
    expect(relations.text).toContain("verification: VER-SLC-002");
    expect(relations.text).toContain("check: Synthetic fixture assertion");
    expect(relations.text).toContain("outcome: passed");
    expect(ledger.text.trim().split("\n")).toHaveLength(5);
    expect([currentIndex.text, relations.text, ledger.text].join("\n")).not.toContain(
      "Placeholder",
    );
  });

  it("fails explicitly for an unknown canonical path", async () => {
    await expect(
      bundledFixtureSource.readText("SDP/Unknown.md"),
    ).rejects.toMatchObject({
      name: "FixtureSourceReadError",
      code: "file-not-found",
      path: "SDP/Unknown.md",
    });
  });

  it("fails explicitly for unsafe and non-canonical reads", async () => {
    await expect(
      bundledFixtureSource.readText("../AGENTS.md"),
    ).rejects.toMatchObject({
      code: "unsafe-path",
    });
    await expect(
      bundledFixtureSource.readText("SDP\\Traceability\\CurrentIndex.yaml"),
    ).rejects.toMatchObject({
      code: "non-canonical-path",
    });
  });
});
