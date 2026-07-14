import {
  createFixtureProjectSource,
  FixtureSourceReadError,
  type FixtureSourceReadErrorCode,
} from "./createFixtureProjectSource";

export const BUNDLED_FIXTURE_SOURCE_ID = "fixture:minimal";
export const BUNDLED_FIXTURE_DISPLAY_NAME = "Bundled minimal SDP fixture";

const FIXTURE_TEXT_BY_PATH: Readonly<Record<string, string>> = Object.freeze({
  "AGENTS.md": "Placeholder for the bundled fixture agent instructions.\n",
  "AGENTS-project.md": "Placeholder for bundled fixture project instructions.\n",
  "SDP/01--Mandate/mandate.md": "Placeholder bundled fixture mandate.\n",
  "SDP/02--Study/study.md": "Placeholder bundled fixture study.\n",
  "SDP/03--Requirements/requirements.md":
    "Placeholder bundled fixture requirements.\n",
  "SDP/04--Architecture/architecture.md":
    "Placeholder bundled fixture architecture.\n",
  "SDP/05--DesignAnalysis/design-analysis.md":
    "Placeholder bundled fixture design analysis.\n",
  "SDP/06--Design/design.md": "Placeholder bundled fixture design.\n",
  "SDP/07--Implementation/implementation-plan.md":
    "Placeholder bundled fixture implementation plan.\n",
  "SDP/CodeReview/REV-SLC-002.md":
    "Placeholder bundled fixture review record; Tier 1 does not read this content.\n",
  "SDP/Sprints/SPR-001/ScrumIterations.md":
    "Placeholder bundled fixture Sprint plan.\n",
  "SDP/Traceability/CurrentIndex.yaml":
    "project:\n  id: FIXTURE-PROJECT\n  name: Bundled minimal fixture\n  status: active\n  tier: TIER-001\nactive:\n  sprint: SPR-001\n  refactor: null\n  iteration: ITR-001\n  slice: SLC-003\nplanning:\n  requirements: REQSET-001\n",
  "SDP/Traceability/Ledger.ndjson":
    '{"event_id":"EVT-001","type":"sprint_opened","subject_id":"SPR-001"}\n{"event_id":"EVT-002","type":"iteration_opened","subject_id":"ITR-001","parent_id":"SPR-001"}\n{"event_id":"EVT-003","type":"slice_completed","subject_id":"SLC-002","parent_id":"ITR-001"}\n{"event_id":"EVT-004","type":"verification_recorded","subject_id":"VER-SLC-002","parent_id":"SLC-002"}\n{"event_id":"EVT-005","type":"slice_activated","subject_id":"SLC-003","parent_id":"ITR-001"}\n',
  "SDP/Traceability/Relations.yaml":
    "documents:\n  REQSET-001:\n    path: SDP/03--Requirements/requirements.md\ntiers:\n  TIER-001:\n    status: active\nsprints:\n  SPR-001:\n    tier: TIER-001\n    requirements: [REQSET-001]\niterations:\n  ITR-001:\n    sprint: SPR-001\n    slices: [SLC-002, SLC-003]\nslices:\n  SLC-002:\n    sprint: SPR-001\n    iteration: ITR-001\n    status: completed\n    verification: VER-SLC-002\n  SLC-003:\n    sprint: SPR-001\n    iteration: ITR-001\n    status: active\nverification:\n  VER-SLC-002:\n    check: Synthetic fixture assertion that the clean analysis remains finding-free\n    outcome: passed\n",
  "SDP/Verification/VER-SLC-002.md":
    "Placeholder bundled fixture verification record; Tier 1 does not read this content.\n",
  "SDP/Verification/verification-plan.md":
    "Placeholder bundled fixture verification plan.\n",
});

export const bundledFixtureSource = createFixtureProjectSource({
  sourceId: BUNDLED_FIXTURE_SOURCE_ID,
  displayName: BUNDLED_FIXTURE_DISPLAY_NAME,
  textByPath: FIXTURE_TEXT_BY_PATH,
});

export const BUNDLED_FIXTURE_PATHS = bundledFixtureSource.paths;
export { FixtureSourceReadError };
export type { FixtureSourceReadErrorCode };
