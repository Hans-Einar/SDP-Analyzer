import { describe, expect, it } from "vitest";
import type { ProjectTextFile } from "../source/ProjectSource";
import type { SourceRef } from "../source/SourceRef";
import { parseRelations } from "./parseRelations";

const PATH = "SDP/Traceability/Relations.yaml";
const SOURCE: SourceRef = {
  sourceId: "fixture:parser-test",
  path: PATH,
  kind: "yaml",
};

function parse(text: string) {
  const file: ProjectTextFile = { path: PATH, text };
  return parseRelations(file, SOURCE);
}

describe("parseRelations", () => {
  it("preserves stable sections, keys, raw targets, ordering and provenance", () => {
    const result = parse(
      "documents:\n" +
        "  REQSET-001:\n" +
        "    path: SDP/03--Requirements/requirements.md\n" +
        "sprints:\n" +
        "  SPR-001:\n" +
        "    requirements: [REQ-EXISTS, REQ-MISSING]\n" +
        "slices:\n" +
        "  SLC-003:\n" +
        "    sprint: SPR-NOT-RESOLVED\n" +
        "    status: active\n",
    );

    expect(result.source).toEqual(SOURCE);
    expect(result.diagnostics).toEqual([]);
    expect(result.value?.sections.map((section) => section.key)).toEqual([
      "documents",
      "sprints",
      "slices",
    ]);
    expect(result.value?.fields.sprints).toEqual({
      "SPR-001": { requirements: ["REQ-EXISTS", "REQ-MISSING"] },
    });
    expect(result.value?.fields.slices).toEqual({
      "SLC-003": { sprint: "SPR-NOT-RESOLVED", status: "active" },
    });
    const sliceEntry = result.value?.sections[2]?.entries?.[0];
    expect(sliceEntry).toMatchObject({
      key: "SLC-003",
      value: { sprint: "SPR-NOT-RESOLVED", status: "active" },
      source: {
        pointer: "/slices/SLC-003",
        lineStart: 9,
        columnStart: 5,
      },
    });
  });

  it("preserves unknown object and scalar top-level sections", () => {
    const result = parse(
      "custom_section:\n  X-001:\n    future: [one, two]\nscalar_extension: enabled\n",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.value?.fields).toEqual({
      custom_section: { "X-001": { future: ["one", "two"] } },
      scalar_extension: "enabled",
    });
    expect(result.value?.sections).toEqual([
      expect.objectContaining({
        key: "custom_section",
        entries: [expect.objectContaining({ key: "X-001" })],
      }),
      expect.objectContaining({
        key: "scalar_extension",
        value: "enabled",
      }),
    ]);
  });

  it("isolates malformed YAML to the Relations source", () => {
    const result = parse("documents: {}\nslices: ]\n");

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_YAML_SYNTAX_ERROR",
        source: expect.objectContaining({ path: PATH, lineStart: 2 }),
      }),
    ]);
  });

  it("rejects duplicate stable keys", () => {
    const result = parse(
      "slices:\n  SLC-003:\n    status: active\n  SLC-003:\n    status: planned\n",
    );

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: "PARSE_YAML_DUPLICATE_KEY" }),
    ]);
  });

  it("rejects a multi-document stream without exposing the discarded document", () => {
    const result = parse(
      "slices:\n" +
        "  SLC-FIRST:\n" +
        "    status: active\n" +
        "---\n" +
        "slices:\n" +
        "  SLC-DISCARDED:\n" +
        "    status: planned\n",
    );

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_YAML_MULTIPLE_DOCUMENTS",
        severity: "error",
        source: expect.objectContaining({
          path: PATH,
          lineStart: 4,
          columnStart: 1,
          lineEnd: 8,
          columnEnd: 1,
        }),
      }),
    ]);
  });

  it.each(["[slices]\n", "relations\n", "null\n"])(
    "diagnoses non-object root %j",
    (text) => {
      const result = parse(text);

      expect(result.value).toBeUndefined();
      expect(result.diagnostics).toEqual([
        expect.objectContaining({ code: "PARSE_YAML_UNSUPPORTED_ROOT" }),
      ]);
    },
  );

  it("diagnoses invalid known-section shapes while retaining their raw values", () => {
    const result = parse("documents: null\nslices: [SLC-003]\nfuture: scalar\n");

    expect(result.value?.fields).toEqual({
      documents: null,
      slices: ["SLC-003"],
      future: "scalar",
    });
    expect(result.diagnostics).toHaveLength(2);
    expect(
      result.diagnostics.every(
        (diagnostic) =>
          diagnostic.code === "PARSE_RELATIONS_INVALID_SECTION",
      ),
    ).toBe(true);
    expect(result.diagnostics.map((diagnostic) => diagnostic.source?.pointer)).toEqual([
      "/documents",
      "/slices",
    ]);
  });
});
