import type { ProjectSource } from "../../core/source/ProjectSource";

export const BUNDLED_FIXTURE_SOURCE_ID = "fixture:minimal";
export const BUNDLED_FIXTURE_DISPLAY_NAME = "Bundled minimal SDP fixture";

const FIXTURE_PATH = "SDP/Fixture.txt";
const FIXTURE_TEXT = "Bundled fixture source is readable through ProjectSource.\n";

export const bundledFixtureSource: ProjectSource = {
  sourceId: BUNDLED_FIXTURE_SOURCE_ID,
  displayName: BUNDLED_FIXTURE_DISPLAY_NAME,
  async listFiles() {
    return [{ kind: "file", path: FIXTURE_PATH }];
  },
  async readText(path) {
    if (path !== FIXTURE_PATH) {
      throw new Error(`Fixture file not found: ${path}`);
    }

    return { path: FIXTURE_PATH, text: FIXTURE_TEXT };
  },
};

