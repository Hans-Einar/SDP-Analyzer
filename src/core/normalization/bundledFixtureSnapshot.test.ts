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

const EXPECTED_SOURCE_PATHS: readonly [string, SourceKind][] = [
  ["AGENTS-project.md", "markdown"],
  ["AGENTS.md", "markdown"],
  ["SDP/01--Mandate/mandate.md", "markdown"],
  ["SDP/02--Study/study.md", "markdown"],
  ["SDP/03--Requirements/requirements.md", "markdown"],
  ["SDP/04--Architecture/architecture.md", "markdown"],
  ["SDP/05--DesignAnalysis/design-analysis.md", "markdown"],
  ["SDP/06--Design/design.md", "markdown"],
  ["SDP/07--Implementation/implementation-plan.md", "markdown"],
  ["SDP/Sprints/SPR-001/ScrumIterations.md", "markdown"],
  [CURRENT_INDEX_PATH, "yaml"],
  [LEDGER_PATH, "ndjson"],
  [RELATIONS_PATH, "yaml"],
  ["SDP/Verification/verification-plan.md", "markdown"],
];

const EXPECTED_SNAPSHOT = {
  profile: { id: "sdp-toolkit-current", support: "supported" },
  sources: EXPECTED_SOURCE_PATHS.map(([path, kind]) =>
    source(path, kind),
  ),
  diagnostics: [],
  project: {
    id: "FIXTURE-PROJECT",
    name: "Bundled minimal fixture",
    status: "active",
    attributes: {
      id: "FIXTURE-PROJECT",
      name: "Bundled minimal fixture",
      status: "active",
    },
    source: source(CURRENT_INDEX_PATH, "yaml", {
      lineStart: 2,
      columnStart: 3,
      lineEnd: 5,
      columnEnd: 1,
      pointer: "/project",
    }),
    fieldSources: {
      id: source(CURRENT_INDEX_PATH, "yaml", { pointer: "/project/id" }),
      name: source(CURRENT_INDEX_PATH, "yaml", { pointer: "/project/name" }),
      status: source(CURRENT_INDEX_PATH, "yaml", {
        pointer: "/project/status",
      }),
    },
  },
  entities: [
    {
      id: "ITR-001",
      kind: "iteration",
      attributes: { sprint: "SPR-001", slices: ["SLC-003"] },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 9,
          columnStart: 5,
          lineEnd: 11,
          columnEnd: 1,
          pointer: "/iterations/ITR-001",
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
          lineStart: 13,
          columnStart: 5,
          lineEnd: 16,
          columnEnd: 1,
          pointer: "/slices/SLC-003",
        }),
      ],
    },
    {
      id: "SPR-001",
      kind: "sprint",
      attributes: { requirements: ["REQSET-001"] },
      sources: [
        source(RELATIONS_PATH, "yaml", {
          lineStart: 6,
          columnStart: 5,
          lineEnd: 7,
          columnEnd: 1,
          pointer: "/sprints/SPR-001",
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
  ],
  relations: [
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
      id: 'relation:["ITR-001","slices","SLC-003","fixture:minimal","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/iterations/ITR-001/slices/0"]',
      type: "slices",
      from: "ITR-001",
      to: "SLC-003",
      sources: [
        source(RELATIONS_PATH, "yaml", {
          pointer: "/iterations/ITR-001/slices/0",
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
      eventType: "slice_activated",
      subjectId: "SLC-003",
      payload: {
        event_id: "EVT-003",
        type: "slice_activated",
        subject_id: "SLC-003",
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
  ],
  active: {
    sprint: "SPR-001",
    refactor: null,
    iteration: "ITR-001",
    slice: "SLC-003",
    source: source(CURRENT_INDEX_PATH, "yaml", {
      lineStart: 6,
      columnStart: 3,
      lineEnd: 10,
      columnEnd: 1,
      pointer: "/active",
    }),
    fieldSources: {
      sprint: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 6,
        columnStart: 11,
        lineEnd: 6,
        columnEnd: 18,
        pointer: "/active/sprint",
      }),
      refactor: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 7,
        columnStart: 13,
        lineEnd: 7,
        columnEnd: 17,
        pointer: "/active/refactor",
      }),
      iteration: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 8,
        columnStart: 14,
        lineEnd: 8,
        columnEnd: 21,
        pointer: "/active/iteration",
      }),
      slice: source(CURRENT_INDEX_PATH, "yaml", {
        lineStart: 9,
        columnStart: 10,
        lineEnd: 9,
        columnEnd: 17,
        pointer: "/active/slice",
      }),
    },
  },
};

describe("bundled normalized snapshot", () => {
  it("matches the complete contract-authored canonical snapshot (case 1)", async () => {
    const result = await loadProjectSnapshot(bundledFixtureSource);

    expect(result.snapshot).toEqual(EXPECTED_SNAPSHOT);
    expect(result.snapshot.entities.some(({ id }) => id === "REQ-F-001")).toBe(
      false,
    );
    expect(Object.keys(result.snapshot.active ?? {})).toEqual([
      "sprint",
      "refactor",
      "iteration",
      "slice",
      "source",
      "fieldSources",
    ]);
  });
});
