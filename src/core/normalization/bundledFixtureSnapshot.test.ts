import { describe, expect, it } from "vitest";
import { bundledFixtureSource } from "../../adapters/fixtures/bundledFixtureSource";
import { loadProjectSnapshot } from "../../application/loadProjectSnapshot";
import type { SourceKind, SourceRef } from "../source/SourceRef";

const SOURCE_ID = "fixture:minimal";
const CURRENT_INDEX_PATH = "SDP/Traceability/CurrentIndex.yaml";
const RELATIONS_PATH = "SDP/Traceability/Relations.yaml";
const LEDGER_PATH = "SDP/Traceability/Ledger.ndjson";

function source(
  path: string,
  kind: SourceKind,
  details: Omit<SourceRef, "sourceId" | "path" | "kind"> = {},
): SourceRef {
  return { sourceId: SOURCE_ID, path, kind, ...details };
}

const EXPECTED_SNAPSHOT = {
  profile: {
    id: "sdp-toolkit-structured-core-v1",
    support: "supported",
  },
  sources: [
    source("AGENTS-project.md", "markdown"),
    source("AGENTS.md", "markdown"),
    source("SDP/01--Mandate/mandate.md", "markdown"),
    source("SDP/02--Study/study.md", "markdown"),
    source("SDP/03--Requirements/requirements.md", "markdown"),
    source("SDP/04--Architecture/architecture.md", "markdown"),
    source("SDP/05--DesignAnalysis/design-analysis.md", "markdown"),
    source("SDP/06--Design/design.md", "markdown"),
    source("SDP/07--Implementation/implementation-plan.md", "markdown"),
    source("SDP/CodeReview/REV-SLC-002.md", "markdown"),
    source("SDP/Sprints/SPR-001/ScrumIterations.md", "markdown"),
    source(CURRENT_INDEX_PATH, "yaml"),
    source(LEDGER_PATH, "ndjson"),
    source(RELATIONS_PATH, "yaml"),
    source("SDP/Verification/VER-SLC-002.md", "markdown"),
    source("SDP/Verification/verification-plan.md", "markdown"),
  ],
  diagnostics: [],
  project: {
    id: "FIXTURE-PROJECT",
    name: "Bundled minimal fixture",
    status: "active",
    tier: "TIER-001",
    attributes: {
      id: "FIXTURE-PROJECT",
      name: "Bundled minimal fixture",
      status: "active",
      tier: "TIER-001",
    },
    source: source(CURRENT_INDEX_PATH, "yaml", {
      lineStart: 2,
      columnStart: 3,
      lineEnd: 6,
      columnEnd: 1,
      pointer: "/project",
    }),
    fieldSources: {
      id: source(CURRENT_INDEX_PATH, "yaml", { pointer: "/project/id" }),
      name: source(CURRENT_INDEX_PATH, "yaml", {
        pointer: "/project/name",
      }),
      status: source(CURRENT_INDEX_PATH, "yaml", {
        pointer: "/project/status",
      }),
      tier: source(CURRENT_INDEX_PATH, "yaml", {
        pointer: "/project/tier",
      }),
    },
  },
  entities: [
    {
      id: "ITR-001",
      kind: "iteration",
      attributes: {
        sprint: "SPR-001",
        slices: ["SLC-002", "SLC-003"],
      },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 13,
          columnStart: 5,
          lineEnd: 15,
          columnEnd: 1,
          pointer: "/iterations/ITR-001",
        }),
      ],
    },
    {
      id: "SLC-002",
      kind: "slice",
      status: "completed",
      attributes: {
        sprint: "SPR-001",
        iteration: "ITR-001",
        status: "completed",
        verification: "VER-SLC-002",
      },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 17,
          columnStart: 5,
          lineEnd: 21,
          columnEnd: 1,
          pointer: "/slices/SLC-002",
        }),
      ],
    },
    {
      id: "SLC-003",
      kind: "slice",
      status: "active",
      attributes: {
        sprint: "SPR-001",
        iteration: "ITR-001",
        status: "active",
      },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 22,
          columnStart: 5,
          lineEnd: 25,
          columnEnd: 1,
          pointer: "/slices/SLC-003",
        }),
      ],
    },
    {
      id: "SPR-001",
      kind: "sprint",
      attributes: {
        tier: "TIER-001",
        requirements: ["REQSET-001"],
      },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 9,
          columnStart: 5,
          lineEnd: 11,
          columnEnd: 1,
          pointer: "/sprints/SPR-001",
        }),
      ],
    },
    {
      id: "TIER-001",
      kind: "tier",
      status: "active",
      attributes: { status: "active" },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 6,
          columnStart: 5,
          lineEnd: 7,
          columnEnd: 1,
          pointer: "/tiers/TIER-001",
        }),
      ],
    },
    {
      id: "REQSET-001",
      kind: "unknown",
      path: "SDP/03--Requirements/requirements.md",
      attributes: { path: "SDP/03--Requirements/requirements.md" },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 3,
          columnStart: 5,
          lineEnd: 4,
          columnEnd: 1,
          pointer: "/documents/REQSET-001",
        }),
      ],
    },
    {
      id: "VER-SLC-002",
      kind: "verification",
      attributes: {
        check:
          "Synthetic fixture assertion that the clean analysis remains finding-free",
        outcome: "passed",
      },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 27,
          columnStart: 5,
          lineEnd: 29,
          columnEnd: 1,
          pointer: "/verification/VER-SLC-002",
        }),
      ],
    },
  ],
  relations: [
    {
      id: 'relation:["SLC-002","iteration","ITR-001","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/slices/SLC-002/iteration"]',
      type: "iteration",
      from: "SLC-002",
      to: "ITR-001",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/slices/SLC-002/iteration",
        }),
      ],
    },
    {
      id: 'relation:["SLC-003","iteration","ITR-001","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/slices/SLC-003/iteration"]',
      type: "iteration",
      from: "SLC-003",
      to: "ITR-001",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/slices/SLC-003/iteration",
        }),
      ],
    },
    {
      id: 'relation:["SPR-001","requirements","REQSET-001","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/sprints/SPR-001/requirements/0"]',
      type: "requirements",
      from: "SPR-001",
      to: "REQSET-001",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/sprints/SPR-001/requirements/0",
        }),
      ],
    },
    {
      id: 'relation:["ITR-001","slices","SLC-002","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/iterations/ITR-001/slices/0"]',
      type: "slices",
      from: "ITR-001",
      to: "SLC-002",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/iterations/ITR-001/slices/0",
        }),
      ],
    },
    {
      id: 'relation:["ITR-001","slices","SLC-003","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/iterations/ITR-001/slices/1"]',
      type: "slices",
      from: "ITR-001",
      to: "SLC-003",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/iterations/ITR-001/slices/1",
        }),
      ],
    },
    {
      id: 'relation:["ITR-001","sprint","SPR-001","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/iterations/ITR-001/sprint"]',
      type: "sprint",
      from: "ITR-001",
      to: "SPR-001",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/iterations/ITR-001/sprint",
        }),
      ],
    },
    {
      id: 'relation:["SLC-002","sprint","SPR-001","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/slices/SLC-002/sprint"]',
      type: "sprint",
      from: "SLC-002",
      to: "SPR-001",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/slices/SLC-002/sprint",
        }),
      ],
    },
    {
      id: 'relation:["SLC-003","sprint","SPR-001","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/slices/SLC-003/sprint"]',
      type: "sprint",
      from: "SLC-003",
      to: "SPR-001",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/slices/SLC-003/sprint",
        }),
      ],
    },
    {
      id: 'relation:["SPR-001","tier","TIER-001","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/sprints/SPR-001/tier"]',
      type: "tier",
      from: "SPR-001",
      to: "TIER-001",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/sprints/SPR-001/tier",
        }),
      ],
    },
    {
      id: 'relation:["SLC-002","verification","VER-SLC-002","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/slices/SLC-002/verification"]',
      type: "verification",
      from: "SLC-002",
      to: "VER-SLC-002",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/slices/SLC-002/verification",
        }),
      ],
    },
  ],
  ledger: [
    {
      sequence: 1,
      eventType: "sprint_opened",
      subjectId: "SPR-001",
      payload: {
        event_id: "EVT-001",
        type: "sprint_opened",
        subject_id: "SPR-001",
      },
      source: source(LEDGER_PATH, "ndjson", {
        lineStart: 1,
        columnStart: 1,
        lineEnd: 1,
        columnEnd: 69,
        pointer: "/lines/1",
      }),
    },
    {
      sequence: 2,
      eventType: "iteration_opened",
      subjectId: "ITR-001",
      payload: {
        event_id: "EVT-002",
        type: "iteration_opened",
        subject_id: "ITR-001",
        parent_id: "SPR-001",
      },
      source: source(LEDGER_PATH, "ndjson", {
        lineStart: 2,
        columnStart: 1,
        lineEnd: 2,
        columnEnd: 94,
        pointer: "/lines/2",
      }),
    },
    {
      sequence: 3,
      eventType: "slice_completed",
      subjectId: "SLC-002",
      payload: {
        event_id: "EVT-003",
        type: "slice_completed",
        subject_id: "SLC-002",
        parent_id: "ITR-001",
      },
      source: source(LEDGER_PATH, "ndjson", {
        lineStart: 3,
        columnStart: 1,
        lineEnd: 3,
        columnEnd: 93,
        pointer: "/lines/3",
      }),
    },
    {
      sequence: 4,
      eventType: "verification_recorded",
      subjectId: "VER-SLC-002",
      payload: {
        event_id: "EVT-004",
        type: "verification_recorded",
        subject_id: "VER-SLC-002",
        parent_id: "SLC-002",
      },
      source: source(LEDGER_PATH, "ndjson", {
        lineStart: 4,
        columnStart: 1,
        lineEnd: 4,
        columnEnd: 103,
        pointer: "/lines/4",
      }),
    },
    {
      sequence: 5,
      eventType: "slice_activated",
      subjectId: "SLC-003",
      payload: {
        event_id: "EVT-005",
        type: "slice_activated",
        subject_id: "SLC-003",
        parent_id: "ITR-001",
      },
      source: source(LEDGER_PATH, "ndjson", {
        lineStart: 5,
        columnStart: 1,
        lineEnd: 5,
        columnEnd: 93,
        pointer: "/lines/5",
      }),
    },
  ],
  active: {
    sprint: "SPR-001",
    refactor: null,
    iteration: "ITR-001",
    slice: "SLC-003",
    source: source(CURRENT_INDEX_PATH, "yaml", {
      lineStart: 7,
      columnStart: 3,
      lineEnd: 11,
      columnEnd: 1,
      pointer: "/active",
    }),
    fieldSources: {
      sprint: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 7,
        columnStart: 11,
        lineEnd: 7,
        columnEnd: 18,
        pointer: "/active/sprint",
      }),
      refactor: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 8,
        columnStart: 13,
        lineEnd: 8,
        columnEnd: 17,
        pointer: "/active/refactor",
      }),
      iteration: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 9,
        columnStart: 14,
        lineEnd: 9,
        columnEnd: 21,
        pointer: "/active/iteration",
      }),
      slice: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 10,
        columnStart: 10,
        lineEnd: 10,
        columnEnd: 17,
        pointer: "/active/slice",
      }),
    },
  },
};

describe("bundled normalized snapshot", () => {
  it("matches the independent complete clean snapshot oracle deterministically", async () => {
    const first = await loadProjectSnapshot(bundledFixtureSource);
    const second = await loadProjectSnapshot(bundledFixtureSource);

    expect(first.snapshot).toEqual(EXPECTED_SNAPSHOT);
    expect(second.snapshot).toEqual(EXPECTED_SNAPSHOT);
    expect(second.snapshot).toEqual(first.snapshot);
    expect(first.snapshot.sources).toHaveLength(16);
    expect(first.snapshot.entities).toHaveLength(7);
    expect(first.snapshot.relations).toHaveLength(10);
    expect(first.snapshot.ledger).toHaveLength(5);

    const verification = first.snapshot.entities.find(
      ({ id }) => id === "VER-SLC-002",
    );
    const verificationRelation = first.snapshot.relations.find(
      ({ type, to }) => type === "verification" && to === "VER-SLC-002",
    );
    expect(verification?.attributes.check).toBe(
      "Synthetic fixture assertion that the clean analysis remains finding-free",
    );
    expect(verification?.attributes.outcome).toBe("passed");
    expect(verificationRelation?.from).toBe("SLC-002");
    expect(first.snapshot.entities.some(({ id }) => id === "REQ-F-001")).toBe(
      false,
    );

    expect(Object.isFrozen(first.snapshot)).toBe(true);
    expect(Object.isFrozen(first.snapshot.sources)).toBe(true);
    expect(Object.isFrozen(first.snapshot.entities)).toBe(true);
    expect(Object.isFrozen(first.snapshot.relations)).toBe(true);
    expect(Object.isFrozen(first.snapshot.ledger)).toBe(true);
  });
});
