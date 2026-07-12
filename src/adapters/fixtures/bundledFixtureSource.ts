import type { ProjectSource } from "../../core/source/ProjectSource";
import {
  compareProjectPaths,
  normalizeProjectPath,
} from "../../core/source/projectPath";

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
  "SDP/Sprints/SPR-001/ScrumIterations.md":
    "Placeholder bundled fixture Sprint plan.\n",
  "SDP/Traceability/CurrentIndex.yaml":
    "Placeholder bundled fixture CurrentIndex.\n",
  "SDP/Traceability/Ledger.ndjson":
    "Placeholder bundled fixture Ledger.\n",
  "SDP/Traceability/Relations.yaml":
    "Placeholder bundled fixture Relations.\n",
  "SDP/Verification/verification-plan.md":
    "Placeholder bundled fixture verification plan.\n",
});

export const BUNDLED_FIXTURE_PATHS: readonly string[] = Object.freeze(
  Object.keys(FIXTURE_TEXT_BY_PATH).sort(compareProjectPaths),
);

export type FixtureSourceReadErrorCode =
  | "unsafe-path"
  | "non-canonical-path"
  | "file-not-found";

export class FixtureSourceReadError extends Error {
  readonly code: FixtureSourceReadErrorCode;
  readonly path: string;

  constructor(code: FixtureSourceReadErrorCode, path: string, message: string) {
    super(message);
    this.name = "FixtureSourceReadError";
    this.code = code;
    this.path = path;
  }
}

export const bundledFixtureSource: ProjectSource = {
  sourceId: BUNDLED_FIXTURE_SOURCE_ID,
  displayName: BUNDLED_FIXTURE_DISPLAY_NAME,
  async listFiles() {
    return BUNDLED_FIXTURE_PATHS.map((path) => ({ kind: "file", path }));
  },
  async readText(path) {
    const normalized = normalizeProjectPath(path);

    if (!normalized.ok) {
      throw new FixtureSourceReadError(
        "unsafe-path",
        path,
        `Unsafe fixture path: ${normalized.error.message}`,
      );
    }

    if (normalized.path !== path) {
      throw new FixtureSourceReadError(
        "non-canonical-path",
        path,
        `Fixture reads require a canonical path: ${normalized.path}`,
      );
    }

    const text = FIXTURE_TEXT_BY_PATH[path];

    if (text === undefined) {
      throw new FixtureSourceReadError(
        "file-not-found",
        path,
        `Fixture file not found: ${path}`,
      );
    }

    return { path, text };
  },
};
