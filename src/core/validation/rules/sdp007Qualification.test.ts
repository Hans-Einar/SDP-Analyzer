import { describe, expect, it } from "vitest";
import { bundledFixtureSource } from "../../../adapters/fixtures/bundledFixtureSource";
import { analyzeProject } from "../../../application/analyzeProject";
import type { Entity } from "../../domain/Entity";
import type { ProjectSnapshot } from "../../domain/ProjectSnapshot";
import type { Relation } from "../../domain/Relation";
import { CORE_TRACEABILITY_PATHS } from "../../discovery/discoverProject";
import type { ProjectSource } from "../../source/ProjectSource";
import type { SourceRef } from "../../source/SourceRef";
import { validateSnapshot } from "../validateSnapshot";
import { completedSliceWithoutVerificationRule } from "./rules";

const context = Object.freeze({
  analyzerVersion: "0.1.0",
  profileId: "sdp-toolkit-structured-core-v1",
  analysisTime: "2026-07-13T00:00:00Z",
});

function source(pointer: string): SourceRef {
  return {
    sourceId: "fixture:sdp007",
    path: "SDP/Traceability/Relations.yaml",
    kind: "yaml",
    pointer,
  };
}

function entity(
  id: string,
  kind: string,
  attributes: Readonly<Record<string, unknown>> = {},
  status?: string,
): Entity {
  return {
    id,
    kind,
    ...(status === undefined ? {} : { status }),
    attributes,
    sources: [source(`/entities/${id}`)],
  };
}

function relation(to: string): Relation {
  return {
    id: `SLC-1:verification:${to}`,
    from: "SLC-1",
    type: "verification",
    to,
    sources: [source(`/slices/SLC-1/verification/${to}`)],
  };
}

function findings(
  targets: readonly Entity[],
  relations: readonly Relation[] = [relation("VER-1")],
) {
  const snapshot: ProjectSnapshot = {
    profile: {
      id: "sdp-toolkit-structured-core-v1",
      support: "supported",
    },
    sources: [source("/")],
    diagnostics: [],
    entities: [entity("SLC-1", "slice", {}, "completed"), ...targets],
    relations,
    ledger: [],
  };

  return validateSnapshot(snapshot, context, [
    completedSliceWithoutVerificationRule,
  ]).findings;
}

describe("SDP007 DEC-STU-016 qualification regressions", () => {
  it("1. rejects outcome passed without check or command", () => {
    expect(
      findings([entity("VER-1", "verification", { outcome: "passed" })]),
    ).toHaveLength(1);
  });

  it("2. rejects an empty check", () => {
    expect(
      findings([
        entity("VER-1", "verification", { outcome: "passed", check: "" }),
      ]),
    ).toHaveLength(1);
  });

  it("3. rejects a whitespace-only command", () => {
    expect(
      findings([
        entity("VER-1", "verification", {
          outcome: "passed",
          command: "  \t ",
        }),
      ]),
    ).toHaveLength(1);
  });

  it("4. rejects a described check with a non-passed outcome", () => {
    expect(
      findings([
        entity("VER-1", "verification", {
          outcome: "failed",
          check: "npm test",
        }),
      ]),
    ).toHaveLength(1);
  });

  it("5. accepts a non-empty command with exact passed outcome", () => {
    expect(
      findings([
        entity("VER-1", "verification", {
          outcome: "passed",
          command: "npm test",
        }),
      ]),
    ).toEqual([]);
  });

  it("6. accepts a non-empty check with exact passed outcome", () => {
    expect(
      findings([
        entity("VER-1", "verification", {
          outcome: "passed",
          check: "Rendered acceptance smoke",
        }),
      ]),
    ).toEqual([]);
  });

  it("7. accepts one qualifying target despite an incomplete peer", () => {
    expect(
      findings(
        [
          entity("VER-1", "verification", { outcome: "passed" }),
          entity("VER-2", "verification", {
            outcome: "passed",
            check: "npm run typecheck",
          }),
        ],
        [relation("VER-1"), relation("VER-2")],
      ),
    ).toEqual([]);
  });

  it("8. cites every resolved target and never invents missing-target provenance", () => {
    const resolvedOne = entity("VER-1", "verification", {
      outcome: "passed",
    });
    const resolvedTwo = entity("VER-2", "review", {
      outcome: "passed",
      check: "Review is not verification",
    });
    const result = findings(
      [resolvedOne, resolvedTwo],
      [relation("VER-1"), relation("VER-2"), relation("VER-MISSING")],
    );
    const finding = result[0];

    expect(finding?.sources).toEqual(
      expect.arrayContaining([
        ...resolvedOne.sources,
        ...resolvedTwo.sources,
        ...relation("VER-1").sources,
        ...relation("VER-2").sources,
        ...relation("VER-MISSING").sources,
      ]),
    );
    expect(
      finding?.sources.some(
        (item) => item.pointer === "/entities/VER-MISSING",
      ),
    ).toBe(false);
  });

  it("9. keeps the bundled clean fixture non-vacuous and finding-free", async () => {
    const analysis = await analyzeProject(bundledFixtureSource, context);
    const completed = analysis.snapshot.entities.find(
      (item) => item.kind === "slice" && item.status === "completed",
    );
    const verificationRelation = analysis.snapshot.relations.find(
      (item) =>
        item.from === completed?.id && item.type === "verification",
    );
    const verification = analysis.snapshot.entities.find(
      (item) => item.id === verificationRelation?.to,
    );

    expect(completed?.id).toBe("SLC-002");
    expect(verification).toMatchObject({
      kind: "verification",
      attributes: {
        outcome: "passed",
        check: expect.stringMatching(/\S/),
      },
    });
    expect(analysis.findings).toEqual([]);
  });

  it("10. reads only the three structured sources and never Markdown", async () => {
    const readPaths: string[] = [];
    const instrumented: ProjectSource = {
      ...bundledFixtureSource,
      async readText(path) {
        readPaths.push(path);
        return bundledFixtureSource.readText(path);
      },
    };

    await analyzeProject(instrumented, context);

    expect(readPaths).toEqual([
      CORE_TRACEABILITY_PATHS.currentIndex,
      CORE_TRACEABILITY_PATHS.relations,
      CORE_TRACEABILITY_PATHS.ledger,
    ]);
    expect(readPaths.some((path) => /\.md$/i.test(path))).toBe(false);
  });
});
