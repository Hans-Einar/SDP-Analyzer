import { describe, expect, it } from "vitest";
import type { ProjectTextFile } from "../source/ProjectSource";
import type { SourceRef } from "../source/SourceRef";
import { parseCurrentIndex } from "./parseCurrentIndex";
import { YAML_MAX_ALIAS_COUNT, YAML_PARSE_OPTIONS } from "./yamlSupport";

const PATH = "SDP/Traceability/CurrentIndex.yaml";
const SOURCE: SourceRef = {
  sourceId: "fixture:parser-test",
  path: PATH,
  kind: "yaml",
};

function parse(text: string, source: SourceRef = SOURCE) {
  const file: ProjectTextFile = { path: PATH, text };
  return parseCurrentIndex(file, source);
}

describe("parseCurrentIndex", () => {
  it("parses supported raw structure and preserves unknown data and pointers", () => {
    const result = parse(
      "project:\n" +
        "  id: EXAMPLE\n" +
        "  extension: true\n" +
        "active:\n" +
        "  sprint: SPR-001\n" +
        "  refactor: null\n" +
        "  iteration: ITR-001\n" +
        "  slice: SLC-MISSING\n" +
        "  future: preserved\n" +
        "planning:\n" +
        "  requirements: REQSET-001\n" +
        "updated: 2026-07-12\n" +
        "extension:\n" +
        "  nested: [one, 2, false]\n",
    );

    expect(result.source).toEqual(SOURCE);
    expect(result.diagnostics).toEqual([]);
    expect(result.value?.project).toEqual({ id: "EXAMPLE", extension: true });
    expect(result.value?.planning).toEqual({ requirements: "REQSET-001" });
    expect(result.value?.active).toMatchObject({
      sprint: "SPR-001",
      refactor: null,
      iteration: "ITR-001",
      slice: "SLC-MISSING",
      fields: {
        sprint: "SPR-001",
        refactor: null,
        iteration: "ITR-001",
        slice: "SLC-MISSING",
        future: "preserved",
      },
    });
    expect(result.value?.fields).toMatchObject({
      updated: "2026-07-12",
      extension: { nested: ["one", 2, false] },
    });
    expect(result.value?.fieldSources.extension).toMatchObject({
      pointer: "/extension",
      lineStart: 14,
      columnStart: 3,
    });
    expect(result.value?.active?.fieldSources.slice).toMatchObject({
      pointer: "/active/slice",
      lineStart: 8,
      columnStart: 10,
      lineEnd: 8,
      columnEnd: 21,
    });
  });

  it("keeps missing optional active fields missing without defaults", () => {
    const result = parse("active:\n  sprint: SPR-001\n");

    expect(result.diagnostics).toEqual([]);
    expect(result.value?.active?.sprint).toBe("SPR-001");
    expect(result.value?.active).not.toHaveProperty("refactor");
    expect(result.value?.active).not.toHaveProperty("iteration");
    expect(result.value?.active).not.toHaveProperty("slice");
  });

  it("preserves null active declarations exactly", () => {
    const result = parse(
      "active:\n" +
        "  sprint: null\n" +
        "  refactor: null\n" +
        "  iteration: null\n" +
        "  slice: null\n",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.value?.active).toMatchObject({
      sprint: null,
      refactor: null,
      iteration: null,
      slice: null,
    });
  });

  it("diagnoses non-string active IDs without coercion and retains their raw values", () => {
    const result = parse(
      "active:\n" +
        "  sprint: 123\n" +
        "  refactor: false\n" +
        "  iteration: [ITR-001]\n" +
        "  slice: { id: SLC-003 }\n",
    );

    expect(result.diagnostics).toHaveLength(4);
    expect(
      result.diagnostics.every(
        (diagnostic) =>
          diagnostic.code === "PARSE_CURRENT_INDEX_INVALID_FIELD",
      ),
    ).toBe(true);
    expect(result.value?.active).not.toHaveProperty("sprint");
    expect(result.value?.active).not.toHaveProperty("refactor");
    expect(result.value?.active).not.toHaveProperty("iteration");
    expect(result.value?.active).not.toHaveProperty("slice");
    expect(result.value?.active?.fields).toEqual({
      sprint: 123,
      refactor: false,
      iteration: ["ITR-001"],
      slice: { id: "SLC-003" },
    });
    expect(result.diagnostics[0]?.source?.pointer).toBe("/active/sprint");
  });

  it("rejects duplicate keys with the parser-derived second-key location", () => {
    const result = parse(
      "active:\n  slice: SLC-001\n  slice: SLC-002\n",
    );

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_YAML_DUPLICATE_KEY",
        severity: "error",
        source: expect.objectContaining({
          path: PATH,
          lineStart: 3,
          columnStart: 3,
          lineEnd: 3,
          columnEnd: 4,
        }),
      }),
    ]);
  });

  it("rejects a multi-document stream without exposing the discarded document", () => {
    const result = parse(
      "active:\n" +
        "  slice: SLC-FIRST\n" +
        "---\n" +
        "active:\n" +
        "  slice: SLC-DISCARDED\n",
    );

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_YAML_MULTIPLE_DOCUMENTS",
        severity: "error",
        source: expect.objectContaining({
          path: PATH,
          lineStart: 3,
          columnStart: 1,
          lineEnd: 6,
          columnEnd: 1,
        }),
      }),
    ]);
  });

  it("rejects unsafe YAML integers without exposing a rounded raw value", () => {
    const result = parse("extension:\n  count: 9007199254740993\n");

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_YAML_UNSAFE_INTEGER",
        severity: "error",
        source: SOURCE,
      }),
    ]);
    expect(JSON.stringify(result)).not.toContain("9007199254740992");
  });

  it("uses 1-based, start-inclusive/end-exclusive parser locations", () => {
    const result = parse("project: ok\nactive: ]\n");

    expect(result.value).toBeUndefined();
    expect(result.diagnostics[0]).toMatchObject({
      code: "PARSE_YAML_SYNTAX_ERROR",
      source: {
        sourceId: SOURCE.sourceId,
        path: PATH,
        kind: "yaml",
        lineStart: 2,
        columnStart: 9,
        lineEnd: 2,
        columnEnd: 10,
      },
    });
  });

  it.each(["[one, two]\n", "text\n", "null\n", "42\n"])(
    "diagnoses unsupported non-object root %j",
    (text) => {
      const result = parse(text);

      expect(result.value).toBeUndefined();
      expect(result.diagnostics).toEqual([
        expect.objectContaining({ code: "PARSE_YAML_UNSUPPORTED_ROOT" }),
      ]);
    },
  );

  it("rejects executable-looking custom tags without executing their text", () => {
    const marker = "__sdpAnalyzerYamlTagExecuted";
    const globalRecord = globalThis as unknown as Record<string, unknown>;
    globalRecord[marker] = false;

    try {
      const result = parse(
        `project: !!js/function "globalThis.${marker} = true"\n`,
      );

      expect(globalRecord[marker]).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.diagnostics).toEqual([
        expect.objectContaining({ code: "PARSE_YAML_UNSUPPORTED_TAG" }),
      ]);
    } finally {
      delete globalRecord[marker];
    }
  });

  it("enforces the documented finite alias expansion bound", () => {
    const result = parse(
      "a: &a [x, x]\n" +
        "b: &b [*a, *a]\n" +
        "c: &c [*b, *b]\n" +
        "d: &d [*c, *c]\n" +
        "e: &e [*d, *d]\n" +
        "out: *e\n",
    );

    expect(YAML_MAX_ALIAS_COUNT).toBe(32);
    expect(Object.isFrozen(YAML_PARSE_OPTIONS)).toBe(true);
    expect(Object.isFrozen(YAML_PARSE_OPTIONS.customTags)).toBe(true);
    expect(YAML_PARSE_OPTIONS).toMatchObject({
      version: "1.2",
      schema: "core",
      strict: true,
      uniqueKeys: true,
      stringKeys: true,
      logLevel: "error",
      merge: false,
      customTags: [],
      resolveKnownTags: false,
    });
    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: "PARSE_YAML_ALIAS_LIMIT" }),
    ]);
  });

  it("returns a diagnostic rather than exposing a cyclic alias value", () => {
    const result = parse("project: &project\n  self: *project\n");

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "PARSE_YAML_NON_SERIALIZABLE_VALUE",
      }),
    ]);
  });

  it("diagnoses a source-kind mismatch before parsing", () => {
    const result = parse("active: {}\n", { ...SOURCE, kind: "markdown" });

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: "PARSE_SOURCE_KIND_MISMATCH" }),
    ]);
  });
});
