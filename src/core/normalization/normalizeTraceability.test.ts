import { describe, expect, it } from "vitest";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type {
  ProjectDiscoveryManifest,
  ProjectProfileSupport,
} from "../discovery/ProjectDiscoveryManifest";
import { parseCurrentIndex } from "../parsing/parseCurrentIndex";
import { parseLedger } from "../parsing/parseLedger";
import { parseRelations } from "../parsing/parseRelations";
import type { SourceRef } from "../source/SourceRef";
import {
  normalizeTraceability,
  type NormalizeTraceabilityInput,
} from "./normalizeTraceability";

const CURRENT_PATH = "SDP/Traceability/CurrentIndex.yaml";
const RELATIONS_PATH = "SDP/Traceability/Relations.yaml";
const LEDGER_PATH = "SDP/Traceability/Ledger.ndjson";
const SOURCE_ID = "fixture:normalization-test";

const CURRENT_SOURCE: SourceRef = {
  sourceId: SOURCE_ID,
  path: CURRENT_PATH,
  kind: "yaml",
};
const RELATIONS_SOURCE: SourceRef = {
  sourceId: SOURCE_ID,
  path: RELATIONS_PATH,
  kind: "yaml",
};
const LEDGER_SOURCE: SourceRef = {
  sourceId: SOURCE_ID,
  path: LEDGER_PATH,
  kind: "ndjson",
};

const DEFAULT_CURRENT =
  "project:\n" +
  "  id: PROJECT-EXPLICIT\n" +
  "active:\n" +
  "  sprint: SPR-ACTIVE\n" +
  "  refactor: null\n" +
  "  iteration: ITR-ACTIVE\n" +
  "  slice: SLC-ACTIVE\n";
const DEFAULT_RELATIONS =
  "slices:\n" +
  "  SLC-DEFINED:\n" +
  "    status: active\n" +
  "    requirements: [REQ-UNRESOLVED]\n";
const DEFAULT_LEDGER =
  '{"event_id":"EVT-1","type":"observed","subject_id":"LEDGER-ONLY","timestamp":"later"}\n';

function createDiscovery(
  support: ProjectProfileSupport = "supported",
  diagnostics: readonly Diagnostic[] = [],
): ProjectDiscoveryManifest {
  return {
    sourceId: SOURCE_ID,
    files: [
      { path: RELATIONS_PATH, kind: "yaml", source: RELATIONS_SOURCE },
      { path: CURRENT_PATH, kind: "yaml", source: CURRENT_SOURCE },
      { path: LEDGER_PATH, kind: "ndjson", source: LEDGER_SOURCE },
    ],
    coreTraceability: {
      currentIndex: {
        path: CURRENT_PATH,
        kind: "yaml",
        source: CURRENT_SOURCE,
      },
      relations: {
        path: RELATIONS_PATH,
        kind: "yaml",
        source: RELATIONS_SOURCE,
      },
      ledger: {
        path: LEDGER_PATH,
        kind: "ndjson",
        source: LEDGER_SOURCE,
      },
    },
    standardDirectories: {
      lifecycle: [],
      sprintsPresent: false,
      verificationPresent: false,
      codeReviewPresent: false,
      traceabilityPresent: true,
    },
    profile: { id: "sdp-toolkit-structured-core-v1", support },
    diagnostics,
  };
}

function createInput(options: {
  readonly support?: ProjectProfileSupport;
  readonly discoveryDiagnostics?: readonly Diagnostic[];
  readonly current?: string;
  readonly relations?: string;
  readonly ledger?: string;
} = {}): NormalizeTraceabilityInput {
  const current = options.current ?? DEFAULT_CURRENT;
  const relations = options.relations ?? DEFAULT_RELATIONS;
  const ledger = options.ledger ?? DEFAULT_LEDGER;

  return {
    discovery: createDiscovery(
      options.support,
      options.discoveryDiagnostics,
    ),
    currentIndex: parseCurrentIndex(
      { path: CURRENT_PATH, text: current },
      CURRENT_SOURCE,
    ),
    relations: parseRelations(
      { path: RELATIONS_PATH, text: relations },
      RELATIONS_SOURCE,
    ),
    ledger: parseLedger({ path: LEDGER_PATH, text: ledger }, LEDGER_SOURCE),
  };
}

describe("normalizeTraceability diagnostics, compatibility and identity", () => {
  it("retains discovery, parser and normalization diagnostics once in canonical order (cases 2-3)", () => {
    const discoveryDiagnostic: Diagnostic = {
      code: "DISCOVERY_TEST_DIAGNOSTIC",
      severity: "info",
      message: "Discovery evidence retained.",
      source: { ...CURRENT_SOURCE, pointer: "/discovery" },
    };
    const snapshot = normalizeTraceability(
      createInput({
        discoveryDiagnostics: [discoveryDiagnostic],
        current: "active:\n  sprint: 42\n",
        relations: "custom_section:\n  X: {future: true}\n",
      }),
    );

    expect(snapshot.diagnostics.map(({ code }) => code)).toEqual([
      "DISCOVERY_TEST_DIAGNOSTIC",
      "NORMALIZE_ACTIVE_FIELD_UNAVAILABLE",
      "NORMALIZE_RELATIONS_STRUCTURE_UNAVAILABLE",
      "NORMALIZE_UNSUPPORTED_SECTION",
      "PARSE_CURRENT_INDEX_INVALID_FIELD",
    ]);
    expect(snapshot.profile.support).toBe("partial");
    expect(snapshot.diagnostics).toContainEqual(discoveryDiagnostic);
  });

  it("treats optional application diagnostics as additive rather than suppressing parser evidence (cases 2-3)", () => {
    const discoveryDiagnostic: Diagnostic = {
      code: "DISCOVERY_ADDITIVE_TEST",
      severity: "info",
      message: "Must remain present.",
    };
    const input = createInput({
      discoveryDiagnostics: [discoveryDiagnostic],
      current: "active:\n  sprint: 42\n",
    });
    const snapshot = normalizeTraceability({
      ...input,
      diagnostics: [],
    });

    expect(snapshot.diagnostics.map(({ code }) => code)).toEqual([
      "DISCOVERY_ADDITIVE_TEST",
      "NORMALIZE_ACTIVE_FIELD_UNAVAILABLE",
      "PARSE_CURRENT_INDEX_INVALID_FIELD",
    ]);
  });

  it.each(["currentIndex", "relations", "ledger"] as const)(
    "downgrades supported when the required %s result is missing (case 4)",
    (missing) => {
      const complete = createInput();
      const input: NormalizeTraceabilityInput = {
        discovery: complete.discovery,
        ...(missing === "currentIndex"
          ? {}
          : { currentIndex: complete.currentIndex }),
        ...(missing === "relations" ? {} : { relations: complete.relations }),
        ...(missing === "ledger" ? {} : { ledger: complete.ledger }),
      };
      const snapshot = normalizeTraceability(input);

      expect(snapshot.profile.support).toBe("partial");
      expect(snapshot.diagnostics).toContainEqual(
        expect.objectContaining({
          code: "NORMALIZE_REQUIRED_SOURCE_UNAVAILABLE",
        }),
      );
    },
  );

  it("downgrades a failed parser value and unavailable supported Relations structure (case 4)", () => {
    const failed = normalizeTraceability(
      createInput({ relations: "slices: ]\n" }),
    );
    const unavailable = normalizeTraceability(
      createInput({ relations: "future_only:\n  X: {}\n" }),
    );

    expect(failed.profile.support).toBe("partial");
    expect(failed.diagnostics.map(({ code }) => code)).toContain(
      "PARSE_YAML_SYNTAX_ERROR",
    );
    expect(unavailable.profile.support).toBe("partial");
    expect(unavailable.diagnostics.map(({ code }) => code)).toContain(
      "NORMALIZE_RELATIONS_STRUCTURE_UNAVAILABLE",
    );
  });

  it.each(["partial", "unsupported", "unknown"] as const)(
    "never upgrades discovery support %s (case 5)",
    (support) => {
      expect(
        normalizeTraceability(createInput({ support })).profile.support,
      ).toBe(support);
    },
  );

  it("is deeply deterministic, leaves mutable inputs unchanged and owns frozen clones (cases 6-7, 23)", () => {
    const mutableInput = JSON.parse(
      JSON.stringify(createInput()),
    ) as NormalizeTraceabilityInput;
    const before = JSON.stringify(mutableInput);
    const first = normalizeTraceability(mutableInput);
    const second = normalizeTraceability(mutableInput);

    expect(first).toEqual(second);
    expect(JSON.stringify(mutableInput)).toBe(before);
    expect(first.relations.map(({ id }) => id)).toEqual(
      second.relations.map(({ id }) => id),
    );

    const mutableAttributes = mutableInput.relations?.value?.sections[0]
      ?.entries?.[0]?.value as unknown as Record<string, unknown>;
    mutableAttributes.status = "changed-after-normalization";

    expect(first.entities[0]?.attributes.status).toBe("active");
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.sources)).toBe(true);
    expect(Object.isFrozen(first.diagnostics)).toBe(true);
    expect(Object.isFrozen(first.entities[0]?.attributes)).toBe(true);
    expect(Object.isFrozen(first.ledger[0]?.payload)).toBe(true);
  });

  it("canonically sorts and deduplicates sources and diagnostics by explicit tuples (cases 2-3)", () => {
    const input = createInput();
    const diagnosticB: Diagnostic = {
      code: "NORMALIZE_TEST_ORDER",
      severity: "warning",
      message: "same",
      source: { ...RELATIONS_SOURCE, lineStart: 3 },
    };
    const diagnosticA: Diagnostic = {
      code: "NORMALIZE_TEST_ORDER",
      severity: "warning",
      message: "same",
      source: { ...CURRENT_SOURCE, lineStart: 2 },
    };
    const discovery = {
      ...input.discovery,
      files: [
        ...input.discovery.files,
        input.discovery.files[0]!,
      ],
    };
    const snapshot = normalizeTraceability({
      ...input,
      discovery,
      diagnostics: [diagnosticB, diagnosticA, diagnosticA],
    });

    expect(snapshot.sources.map(({ path }) => path)).toEqual([
      CURRENT_PATH,
      LEDGER_PATH,
      RELATIONS_PATH,
    ]);
    expect(snapshot.diagnostics).toEqual([diagnosticA, diagnosticB]);
  });
});

describe("normalizeTraceability entities", () => {
  it("creates entities only from explicit supported-section keys and honors explicit subtype metadata (cases 8-11)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        current:
          "project:\n  id: PROJECT-NOT-ENTITY\nactive:\n  slice: ACTIVE-NOT-ENTITY\n",
        relations:
          "documents:\n" +
          "  DOC-UNKNOWN: {path: docs/unknown.md}\n" +
          "  DOC-REQ: {kind: requirement, path: docs/req.md}\n" +
          "tiers:\n  TIER-1: {}\n" +
          "sprints:\n  SPR-1: {}\n" +
          "iterations:\n  ITR-1: {}\n" +
          "slices:\n  SLC-1: {requirements: [TARGET-NOT-ENTITY]}\n" +
          "reviews:\n  REV-1: {}\n" +
          "verification:\n  VER-1: {}\n" +
          "refactors:\n  RFC-1: {kind: refactor}\n",
        ledger: '{"subject_id":"LEDGER-NOT-ENTITY"}\n',
      }),
    );
    const kinds = Object.fromEntries(
      snapshot.entities.map(({ id, kind }) => [id, kind]),
    );

    expect(kinds).toEqual({
      "ITR-1": "iteration",
      "RFC-1": "refactor",
      "DOC-REQ": "requirement",
      "REV-1": "review",
      "SLC-1": "slice",
      "SPR-1": "sprint",
      "TIER-1": "tier",
      "DOC-UNKNOWN": "unknown",
      "VER-1": "verification",
    });
    expect(snapshot.entities.map(({ id }) => id)).not.toEqual(
      expect.arrayContaining([
        "PROJECT-NOT-ENTITY",
        "ACTIVE-NOT-ENTITY",
        "TARGET-NOT-ENTITY",
        "LEDGER-NOT-ENTITY",
      ]),
    );
  });

  it("preserves complete attributes, typed metadata and exact definition provenance (cases 12-14)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        relations:
          "slices:\n" +
          "  SLC-META:\n" +
          "    status: planned\n" +
          "    title: Preserve me\n" +
          "    path: SDP/Sprints/example.md\n" +
          "    extension: {nested: [one, 2, false]}\n",
      }),
    );
    const entity = snapshot.entities[0];

    expect(entity).toMatchObject({
      id: "SLC-META",
      kind: "slice",
      status: "planned",
      title: "Preserve me",
      path: "SDP/Sprints/example.md",
      attributes: {
        status: "planned",
        title: "Preserve me",
        path: "SDP/Sprints/example.md",
        extension: { nested: ["one", 2, false] },
      },
      sources: [
        expect.objectContaining({
          path: RELATIONS_PATH,
          pointer: "/slices/SLC-META",
          lineStart: 3,
          columnStart: 5,
        }),
      ],
    });
  });

  it("diagnoses invalid explicit records without guessing entities", () => {
    const snapshot = normalizeTraceability(
      createInput({ relations: "tiers:\n  BAD: scalar\n  GOOD: {}\n" }),
    );

    expect(snapshot.entities.map(({ id }) => id)).toEqual(["GOOD"]);
    expect(snapshot.diagnostics).toContainEqual(
      expect.objectContaining({ code: "NORMALIZE_INVALID_ENTITY_RECORD" }),
    );
  });

  it("retains an invalid-shaped duplicate key as definition evidence without guessing its attributes (case 15)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        relations:
          "tiers:\n" +
          "  DUP-MIXED: scalar\n" +
          "slices:\n" +
          "  DUP-MIXED: {status: valid-copy}\n",
      }),
    );
    const entity = snapshot.entities[0];

    expect(entity).toMatchObject({
      id: "DUP-MIXED",
      kind: "slice",
      status: "valid-copy",
      attributes: { status: "valid-copy" },
    });
    expect(entity?.sources.map(({ pointer }) => pointer)).toEqual([
      "/tiers/DUP-MIXED",
      "/slices/DUP-MIXED",
    ]);
    expect(
      snapshot.diagnostics.filter(
        ({ code }) => code === "NORMALIZE_DUPLICATE_ENTITY_DEFINITION",
      ),
    ).toHaveLength(2);
    expect(snapshot.diagnostics).toContainEqual(
      expect.objectContaining({ code: "NORMALIZE_INVALID_ENTITY_RECORD" }),
    );
  });

  it("selects one canonical duplicate entity, retains every source, diagnoses every definition and keeps all edges (case 15)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        relations:
          "tiers:\n" +
          "  DUP-1: {status: tier-copy, sprint: SPR-FROM-TIER}\n" +
          "slices:\n" +
          "  DUP-1: {status: slice-copy, sprint: SPR-FROM-SLICE}\n",
      }),
    );
    const entity = snapshot.entities[0];
    const duplicateDiagnostics = snapshot.diagnostics.filter(
      ({ code }) => code === "NORMALIZE_DUPLICATE_ENTITY_DEFINITION",
    );

    expect(snapshot.entities).toHaveLength(1);
    expect(entity).toMatchObject({
      id: "DUP-1",
      kind: "slice",
      status: "slice-copy",
      attributes: {
        status: "slice-copy",
        sprint: "SPR-FROM-SLICE",
      },
    });
    expect(entity?.sources.map(({ pointer }) => pointer)).toEqual([
      "/tiers/DUP-1",
      "/slices/DUP-1",
    ]);
    expect(duplicateDiagnostics).toHaveLength(2);
    expect(duplicateDiagnostics.map(({ source }) => source?.pointer)).toEqual([
      "/tiers/DUP-1",
      "/slices/DUP-1",
    ]);
    expect(snapshot.relations.map(({ to }) => to).sort()).toEqual([
      "SPR-FROM-SLICE",
      "SPR-FROM-TIER",
    ]);
    expect(JSON.stringify(snapshot)).not.toMatch(/SDP002|Finding|fingerprint/);
  });

  it("orders entities by kind, ID and canonical source regardless of input order (case 16)", () => {
    const first = normalizeTraceability(
      createInput({
        relations:
          "slices:\n  Z: {}\n  A: {}\n" +
          "iterations:\n  B: {}\n" +
          "tiers:\n  T: {}\n",
      }),
    );
    const second = normalizeTraceability(
      createInput({
        relations:
          "tiers:\n  T: {}\n" +
          "iterations:\n  B: {}\n" +
          "slices:\n  A: {}\n  Z: {}\n",
      }),
    );

    expect(first.entities.map(({ kind, id }) => `${kind}:${id}`)).toEqual([
      "iteration:B",
      "slice:A",
      "slice:Z",
      "tier:T",
    ]);
    expect(second.entities.map(({ kind, id }) => `${kind}:${id}`)).toEqual(
      first.entities.map(({ kind, id }) => `${kind}:${id}`),
    );
  });
});

describe("normalizeTraceability directed relations", () => {
  it("recognizes every deliberate field for scalar strings and array elements, but no metadata fields (cases 17-18)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        relations:
          "slices:\n" +
          "  SLC-REL:\n" +
          "    derives_from: DERIVE\n" +
          "    decisions: [DEC-1, DEC-2]\n" +
          "    tier: TIER-1\n" +
          "    sprint: SPR-1\n" +
          "    iteration: ITR-1\n" +
          "    slice: SLC-PARENT\n" +
          "    slices: [SLC-A, SLC-B]\n" +
          "    requirements: REQ-1\n" +
          "    architecture: [ARC-1]\n" +
          "    study_decisions: DEC-STU-1\n" +
          "    design: [DES-1]\n" +
          "    verification_plan: VER-PLAN-1\n" +
          "    verification: [VER-1]\n" +
          "    review: REV-1\n" +
          "    path: ignored.md\n" +
          "    status: active\n" +
          "    title: Metadata\n" +
          "    outcome: passed\n" +
          "    disposition: approved\n" +
          "    design_sections: [2, 4]\n",
      }),
    );

    expect(snapshot.relations.map(({ type }) => type)).toEqual([
      "architecture",
      "decisions",
      "decisions",
      "derives_from",
      "design",
      "iteration",
      "requirements",
      "review",
      "slice",
      "slices",
      "slices",
      "sprint",
      "study_decisions",
      "tier",
      "verification",
      "verification_plan",
    ]);
    expect(snapshot.relations).toHaveLength(16);
    expect(snapshot.relations.map(({ type }) => type)).not.toEqual(
      expect.arrayContaining([
        "path",
        "status",
        "title",
        "outcome",
        "disposition",
        "design_sections",
      ]),
    );
  });

  it("keeps unresolved targets directed, never invents reverse edges, and diagnoses invalid neighbors (cases 19-21)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        relations:
          "slices:\n" +
          "  SLC-ONE:\n" +
          "    requirements: [REQ-OK, null, 7, {id: X}, [Y]]\n" +
          "    sprint: {id: SPR-BAD}\n",
      }),
    );
    const invalid = snapshot.diagnostics.filter(
      ({ code }) => code === "NORMALIZE_INVALID_RELATION_VALUE",
    );

    expect(snapshot.relations).toEqual([
      expect.objectContaining({
        type: "requirements",
        from: "SLC-ONE",
        to: "REQ-OK",
      }),
    ]);
    expect(snapshot.relations).not.toContainEqual(
      expect.objectContaining({ from: "REQ-OK", to: "SLC-ONE" }),
    );
    expect(snapshot.entities.map(({ id }) => id)).not.toContain("REQ-OK");
    expect(invalid).toHaveLength(5);
    expect(invalid.map(({ source }) => source?.pointer)).toEqual([
      "/slices/SLC-ONE/requirements/1",
      "/slices/SLC-ONE/requirements/2",
      "/slices/SLC-ONE/requirements/3",
      "/slices/SLC-ONE/requirements/4",
      "/slices/SLC-ONE/sprint",
    ]);
    expect(snapshot.diagnostics.map(({ code }) => code)).not.toContain(
      "NORMALIZE_DANGLING_RELATION",
    );
  });

  it("diagnoses empty scalar and array targets while retaining valid neighbors (case 21)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        relations:
          "slices:\n" +
          "  SLC-EMPTY:\n" +
          '    sprint: ""\n' +
          '    requirements: ["   ", REQ-VALID]\n',
      }),
    );

    expect(snapshot.relations).toEqual([
      expect.objectContaining({
        type: "requirements",
        from: "SLC-EMPTY",
        to: "REQ-VALID",
      }),
    ]);
    expect(
      snapshot.diagnostics.filter(
        ({ code }) => code === "NORMALIZE_INVALID_RELATION_VALUE",
      ).map(({ source }) => source?.pointer),
    ).toEqual([
      "/slices/SLC-EMPTY/requirements/0",
      "/slices/SLC-EMPTY/sprint",
    ]);
  });

  it("uses escaped occurrence pointers for provenance and stable collision-free IDs (cases 22-23)", () => {
    const input = createInput({
      relations:
        'slices:\n  "S/~X":\n    requirements: ["T|1", "T|1"]\n',
    });
    const first = normalizeTraceability(input);
    const second = normalizeTraceability(input);

    expect(first.relations.map(({ sources }) => sources[0]?.pointer)).toEqual([
      "/slices/S~1~0X/requirements/0",
      "/slices/S~1~0X/requirements/1",
    ]);
    expect(new Set(first.relations.map(({ id }) => id)).size).toBe(2);
    expect(first.relations.map(({ id }) => id)).toEqual(
      second.relations.map(({ id }) => id),
    );
    expect(first.relations[0]?.id).toBe(
      'relation:["S/~X","requirements","T|1","fixture:normalization-test","SDP/Traceability/Relations.yaml","yaml",null,null,null,null,"/slices/S~1~0X/requirements/0"]',
    );
    expect(first.relations[0]?.sources[0]).toEqual({
      sourceId: SOURCE_ID,
      path: RELATIONS_PATH,
      kind: "yaml",
      pointer: "/slices/S~1~0X/requirements/0",
    });
  });

  it("orders relations by type, from, to and occurrence source (case 24)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        relations:
          "slices:\n" +
          "  Z: {sprint: B, requirements: [Z, A]}\n" +
          "  A: {sprint: C}\n" +
          "iterations:\n" +
          "  I: {sprint: A}\n",
      }),
    );

    expect(
      snapshot.relations.map(({ type, from, to }) => `${type}:${from}->${to}`),
    ).toEqual([
      "requirements:Z->A",
      "requirements:Z->Z",
      "sprint:A->C",
      "sprint:I->A",
      "sprint:Z->B",
    ]);
  });
});

describe("normalizeTraceability active declaration and Ledger", () => {
  it("preserves explicit strings, null, missing and invalid raw active distinctions without hierarchy checks (cases 25-29)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        current:
          "active:\n" +
          "  sprint: 42\n" +
          "  refactor: null\n" +
          "  slice: SLC-UNRESOLVED\n",
        relations: "slices:\n  OTHER: {}\n",
      }),
    );

    expect(snapshot.active).toMatchObject({
      refactor: null,
      slice: "SLC-UNRESOLVED",
      source: expect.objectContaining({ pointer: "/active" }),
      fieldSources: {
        sprint: expect.objectContaining({ pointer: "/active/sprint" }),
        refactor: expect.objectContaining({ pointer: "/active/refactor" }),
        slice: expect.objectContaining({ pointer: "/active/slice" }),
      },
    });
    expect(snapshot.active).not.toHaveProperty("sprint");
    expect(snapshot.active).not.toHaveProperty("iteration");
    expect(snapshot.entities.map(({ id }) => id)).not.toContain(
      "SLC-UNRESOLVED",
    );
    expect(snapshot.diagnostics.map(({ code }) => code)).toEqual([
      "NORMALIZE_ACTIVE_FIELD_UNAVAILABLE",
      "PARSE_CURRENT_INDEX_INVALID_FIELD",
    ]);
    expect(JSON.stringify(snapshot.diagnostics)).not.toMatch(
      /hierarchy|unresolved active/i,
    );

    const absent = normalizeTraceability(createInput({ current: "project: {}\n" }));
    expect(absent).not.toHaveProperty("active");
  });

  it("maps every valid record in source order, extracts only string conveniences and preserves payloads (cases 30-34)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        ledger:
          '{"event_id":"DUP","type":"first","subject_id":"SUB-1","timestamp":"2099","nested":{"kept":[true,null]}}\n' +
          '{"event_id":"DUP","type":7,"subject_id":false,"timestamp":{"bad":true}}\n' +
          '{"arbitrary":"record"}\n' +
          '{"event_id":"OLD","type":"last","timestamp":"1900"}\n',
      }),
    );

    expect(snapshot.ledger.map(({ sequence }) => sequence)).toEqual([1, 2, 3, 4]);
    expect(snapshot.ledger[0]).toMatchObject({
      eventType: "first",
      subjectId: "SUB-1",
      timestamp: "2099",
      payload: {
        event_id: "DUP",
        type: "first",
        subject_id: "SUB-1",
        timestamp: "2099",
        nested: { kept: [true, null] },
      },
    });
    expect(snapshot.ledger[1]).not.toHaveProperty("eventType");
    expect(snapshot.ledger[1]).not.toHaveProperty("subjectId");
    expect(snapshot.ledger[1]).not.toHaveProperty("timestamp");
    expect(snapshot.ledger[1]?.payload).toEqual({
      event_id: "DUP",
      type: 7,
      subject_id: false,
      timestamp: { bad: true },
    });
    expect(snapshot.ledger[2]).toMatchObject({ payload: { arbitrary: "record" } });
    expect(snapshot.ledger[3]).toMatchObject({
      eventType: "last",
      timestamp: "1900",
    });
    expect(
      snapshot.diagnostics.filter(
        ({ code }) => code === "NORMALIZE_INVALID_LEDGER_CONVENIENCE_FIELD",
      ),
    ).toHaveLength(3);
  });

  it("keeps malformed lines as diagnostics only and performs no duplicate or chronology validation (cases 35-36)", () => {
    const snapshot = normalizeTraceability(
      createInput({
        ledger:
          '{"event_id":"DUP","timestamp":"later"}\n' +
          "{bad}\n" +
          '{"event_id":"DUP","timestamp":"earlier"}\n',
      }),
    );

    expect(snapshot.ledger.map(({ sequence }) => sequence)).toEqual([1, 3]);
    expect(snapshot.ledger.map(({ timestamp }) => timestamp)).toEqual([
      "later",
      "earlier",
    ]);
    expect(snapshot.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_LEDGER_INVALID_JSON",
        source: expect.objectContaining({ lineStart: 2 }),
      }),
    ]);
    expect(JSON.stringify(snapshot)).not.toMatch(
      /duplicate event|chronolog|completion|SDP00[1-8]/i,
    );
  });

  it("preserves raw project metadata without creating a project entity", () => {
    const snapshot = normalizeTraceability(
      createInput({
        current:
          "project:\n" +
          "  id: PROJECT-1\n" +
          "  name: Example\n" +
          "  status: active\n" +
          "  tier: TIER-1\n" +
          "  extension: {kept: true}\n",
      }),
    );

    expect(snapshot.project).toMatchObject({
      id: "PROJECT-1",
      name: "Example",
      status: "active",
      tier: "TIER-1",
      attributes: {
        id: "PROJECT-1",
        name: "Example",
        status: "active",
        tier: "TIER-1",
        extension: { kept: true },
      },
      source: expect.objectContaining({ pointer: "/project" }),
    });
    expect(snapshot.entities.map(({ id }) => id)).not.toContain("PROJECT-1");
  });

  it("preserves hostile project metadata keys and their provenance as own data", () => {
    const snapshot = normalizeTraceability(
      createInput({
        current:
          "project:\n" +
          "  id: PROJECT-1\n" +
          "  __proto__: preserved\n",
      }),
    );
    const fieldSources = snapshot.project?.fieldSources;

    expect(
      fieldSources === undefined
        ? false
        : Object.prototype.hasOwnProperty.call(fieldSources, "__proto__"),
    ).toBe(true);
    expect(fieldSources?.["__proto__"]).toEqual(
      expect.objectContaining({ pointer: "/project/__proto__" }),
    );
    expect(JSON.stringify(snapshot.project)).toContain('"__proto__":"preserved"');
  });
});
