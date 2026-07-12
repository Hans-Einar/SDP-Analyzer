import { describe, expect, it } from "vitest";
import { normalizeProjectPath } from "./projectPath";

describe("normalizeProjectPath", () => {
  it("retains a canonical repository-relative path", () => {
    expect(
      normalizeProjectPath("SDP/Traceability/CurrentIndex.yaml"),
    ).toEqual({
      ok: true,
      path: "SDP/Traceability/CurrentIndex.yaml",
    });
  });

  it("normalizes Windows and redundant separators", () => {
    expect(
      normalizeProjectPath("SDP\\Traceability\\Relations.yaml"),
    ).toEqual({
      ok: true,
      path: "SDP/Traceability/Relations.yaml",
    });
    expect(normalizeProjectPath("SDP//Traceability///Ledger.ndjson/")).toEqual({
      ok: true,
      path: "SDP/Traceability/Ledger.ndjson",
    });
  });

  it.each(["/SDP/AGENTS.md", "\\SDP\\AGENTS.md", "\\\\server\\share\\file.md"])(
    "rejects absolute path %s",
    (path) => {
      expect(normalizeProjectPath(path)).toMatchObject({
        ok: false,
        error: { code: "absolute-path" },
      });
    },
  );

  it.each(["C:\\project\\AGENTS.md", "d:relative.md"])(
    "rejects drive-letter path %s",
    (path) => {
      expect(normalizeProjectPath(path)).toMatchObject({
        ok: false,
        error: { code: "drive-letter-path" },
      });
    },
  );

  it.each(["./AGENTS.md", "SDP/./AGENTS.md"])(
    "rejects dot segment in %s",
    (path) => {
      expect(normalizeProjectPath(path)).toMatchObject({
        ok: false,
        error: { code: "dot-segment" },
      });
    },
  );

  it.each(["../AGENTS.md", "SDP/../AGENTS.md", "SDP\\..\\AGENTS.md"])(
    "rejects parent traversal in %s",
    (path) => {
      expect(normalizeProjectPath(path)).toMatchObject({
        ok: false,
        error: { code: "parent-segment" },
      });
    },
  );

  it("rejects an empty path", () => {
    expect(normalizeProjectPath("")).toMatchObject({
      ok: false,
      error: { code: "empty-path" },
    });
  });
});
