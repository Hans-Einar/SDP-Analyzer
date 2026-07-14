import { createFixtureProjectSource } from "./createFixtureProjectSource";

export const BROKEN_FIXTURE_SOURCE_ID = "fixture:broken";
export const BROKEN_FIXTURE_DISPLAY_NAME = "Bundled broken SDP fixture";

const BROKEN_FIXTURE_TEXT_BY_PATH: Readonly<Record<string, string>> =
  Object.freeze({
    "AGENTS.md": "Broken-fixture placeholder; Tier 1 does not read this content.\n",
    "SDP/01--Mandate/mandate.md":
      "Broken-fixture mandate placeholder; Tier 1 does not read this content.\n",
    "SDP/Sprints/SPR-001/ScrumIterations.md":
      "Broken-fixture Sprint placeholder; Tier 1 does not read this content.\n",
    "SDP/Traceability/CurrentIndex.yaml":
      "project:\n  id: BROKEN-PROJECT\n  name: Bundled broken fixture\n  status: needs-attention\n  tier: TIER-001\nactive:\n  sprint: SPR-001\n  refactor: null\n  iteration: ITR-001\n  slice: SLC-ACTIVE\n",
    "SDP/Traceability/Ledger.ndjson":
      '{"event_id":"EVT-BROKEN-001","type":"sprint_opened","subject_id":"SPR-001"}\nnot-json\n{"event_id":"EVT-BROKEN-003","type":"slice_completed","subject_id":"SLC-DONE"}\n',
    "SDP/Traceability/Relations.yaml":
      "documents:\n  REQSET-001:\n    path: SDP/03--Requirements/requirements.md\n  DUP-001:\n    path: SDP/03--Requirements/duplicate.md\ntiers:\n  TIER-001:\n    status: active\nsprints:\n  SPR-001:\n    tier: TIER-001\n    requirements: [REQSET-001]\niterations:\n  ITR-001:\n    sprint: SPR-MISSING\n    slices: [SLC-ACTIVE, SLC-DONE]\nslices:\n  DUP-001:\n    status: planned\n  SLC-ACTIVE:\n    sprint: SPR-001\n    iteration: ITR-MISSING\n    status: active\n  SLC-DONE:\n    sprint: SPR-001\n    iteration: ITR-001\n    status: completed\n    verification: [VER-INCOMPLETE, VER-MISSING]\nverification:\n  VER-INCOMPLETE:\n    check: \"   \"\n    outcome: passed\n",
    "SDP/Verification/VER-INCOMPLETE.md":
      "Broken-fixture verification placeholder; Tier 1 does not read this content.\n",
  });

export const brokenFixtureSource = createFixtureProjectSource({
  sourceId: BROKEN_FIXTURE_SOURCE_ID,
  displayName: BROKEN_FIXTURE_DISPLAY_NAME,
  textByPath: BROKEN_FIXTURE_TEXT_BY_PATH,
});

export const BROKEN_FIXTURE_PATHS = brokenFixtureSource.paths;
