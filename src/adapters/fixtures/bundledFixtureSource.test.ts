import { describe, expect, it } from "vitest";
import type { ProjectSource } from "../../core/source/ProjectSource";
import { bundledFixtureSource } from "./bundledFixtureSource";

async function readListedFixtureText(source: ProjectSource) {
  const entries = await source.listFiles();
  const firstEntry = entries[0];

  if (firstEntry === undefined) {
    throw new Error("Expected the bundled fixture to list one file.");
  }

  return source.readText(firstEntry.path);
}

describe("bundledFixtureSource", () => {
  it("lists and reads deterministic text through ProjectSource", async () => {
    await expect(bundledFixtureSource.listFiles()).resolves.toEqual([
      { kind: "file", path: "SDP/Fixture.txt" },
    ]);

    await expect(readListedFixtureText(bundledFixtureSource)).resolves.toEqual({
      path: "SDP/Fixture.txt",
      text: "Bundled fixture source is readable through ProjectSource.\n",
    });
  });
});

