import { describe, expect, it } from "vitest";
import type { ProjectTextFile } from "../source/ProjectSource";
import type { SourceRef } from "../source/SourceRef";
import { parseLedger } from "./parseLedger";

const PATH = "SDP/Traceability/Ledger.ndjson";
const SOURCE: SourceRef = {
  sourceId: "fixture:parser-test",
  path: PATH,
  kind: "ndjson",
};

function parse(text: string, source: SourceRef = SOURCE) {
  const file: ProjectTextFile = { path: PATH, text };
  return parseLedger(file, source);
}

describe("parseLedger", () => {
  it("parses JSON-object lines in original order without event semantics", () => {
    const result = parse(
      '{"event_id":"DUPLICATE","timestamp":"not-interpreted"}\n' +
        '{"event_id":"DUPLICATE","unknown":{"kept":true}}\n' +
        '{"arbitrary":3}\n',
    );

    expect(result.source).toEqual(SOURCE);
    expect(result.diagnostics).toEqual([]);
    expect(result.value?.records.map((record) => record.sequence)).toEqual([
      1, 2, 3,
    ]);
    expect(result.value?.records.map((record) => record.value)).toEqual([
      { event_id: "DUPLICATE", timestamp: "not-interpreted" },
      { event_id: "DUPLICATE", unknown: { kept: true } },
      { arbitrary: 3 },
    ]);
  });

  it("ignores blank CRLF/LF lines deterministically while retaining source-line sequence", () => {
    const text =
      "\r\n   \n" +
      '{"id":1}\r\n' +
      "\t\n" +
      '{"id":2}\n';
    const first = parse(text);
    const second = parse(text);

    expect(first).toEqual(second);
    expect(first.diagnostics).toEqual([]);
    expect(first.value?.records.map((record) => record.sequence)).toEqual([
      3, 5,
    ]);
  });

  it("keeps valid neighbors around a malformed middle line", () => {
    const result = parse('{"id":1}\n{bad}\n{"id":3}');

    expect(result.value?.records.map((record) => record.sequence)).toEqual([
      1, 3,
    ]);
    expect(result.value?.records.map((record) => record.value)).toEqual([
      { id: 1 },
      { id: 3 },
    ]);
    expect(result.diagnostics).toEqual([
      {
        code: "PARSE_LEDGER_INVALID_JSON",
        severity: "error",
        message: "Ledger line 2 is not valid JSON.",
        source: {
          ...SOURCE,
          lineStart: 2,
          columnStart: 1,
          lineEnd: 2,
          columnEnd: 6,
          pointer: "/lines/2",
        },
      },
    ]);
  });

  it("rejects an unsafe integer line without exposing a rounded record", () => {
    const unsafeLine = '{"count":9007199254740993}';
    const result = parse(`{"id":1}\n${unsafeLine}\n{"id":3}`);

    expect(result.value?.records.map((record) => record.sequence)).toEqual([
      1, 3,
    ]);
    expect(result.value?.records.map((record) => record.value)).toEqual([
      { id: 1 },
      { id: 3 },
    ]);
    expect(result.diagnostics).toEqual([
      {
        code: "PARSE_LEDGER_UNSAFE_INTEGER",
        severity: "error",
        message:
          "Ledger line 2 contains an integer outside JavaScript's safe integer range.",
        source: {
          ...SOURCE,
          lineStart: 2,
          columnStart: 1,
          lineEnd: 2,
          columnEnd: unsafeLine.length + 1,
          pointer: "/lines/2",
        },
      },
    ]);
    expect(JSON.stringify(result.value)).not.toContain("9007199254740992");
  });

  it("diagnoses every JSON non-object kind independently", () => {
    const result = parse('[]\n"text"\n12\ntrue\nnull\n{"ok":true}\n');

    expect(result.diagnostics).toHaveLength(5);
    expect(
      result.diagnostics.every(
        (diagnostic) => diagnostic.code === "PARSE_LEDGER_NON_OBJECT",
      ),
    ).toBe(true);
    expect(result.diagnostics.map((diagnostic) => diagnostic.source?.lineStart)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(result.value?.records).toEqual([
      expect.objectContaining({ sequence: 6, value: { ok: true } }),
    ]);
  });

  it("uses exact 1-based whole-line, end-exclusive provenance", () => {
    const line = '  {"id":"one"}  ';
    const result = parse(line);

    expect(result.value?.records[0]?.source).toEqual({
      ...SOURCE,
      lineStart: 1,
      columnStart: 1,
      lineEnd: 1,
      columnEnd: line.length + 1,
      pointer: "/lines/1",
    });
  });

  it("parses the final line when no newline terminator is present", () => {
    const result = parse('{"first":1}\n{"final":true}');

    expect(result.diagnostics).toEqual([]);
    expect(result.value?.records).toEqual([
      expect.objectContaining({ sequence: 1, value: { first: 1 } }),
      expect.objectContaining({ sequence: 2, value: { final: true } }),
    ]);
  });

  it("returns byte-for-byte-equivalent structures on repeated parses", () => {
    const text = '{"z":1,"a":[true,null]}\ninvalid\n{"x":"y"}\n';

    expect(parse(text)).toEqual(parse(text));
  });

  it("diagnoses a source-kind mismatch without parsing lines", () => {
    const result = parse('{"id":1}\n', { ...SOURCE, kind: "json" });

    expect(result.value).toBeUndefined();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: "PARSE_SOURCE_KIND_MISMATCH" }),
    ]);
  });
});
