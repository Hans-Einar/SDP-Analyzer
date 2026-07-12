import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { ProjectTextFile } from "../source/ProjectSource";
import type { SourceRef } from "../source/SourceRef";
import type { ParsedSource } from "./ParsedSource";
import {
  isRawObject,
  RawValueConversionError,
  toRawValue,
  type RawObject,
} from "./RawValue";
import { validateParserSource } from "./yamlSupport";

export interface RawLedgerRecord {
  readonly sequence: number;
  readonly value: RawObject;
  readonly source: SourceRef;
}

export interface RawLedger {
  readonly records: readonly RawLedgerRecord[];
}

function ledgerLineSource(
  source: SourceRef,
  line: string,
  lineNumber: number,
): SourceRef {
  return {
    sourceId: source.sourceId,
    path: source.path,
    kind: source.kind,
    lineStart: lineNumber,
    columnStart: 1,
    lineEnd: lineNumber,
    columnEnd: line.length + 1,
    pointer: `/lines/${lineNumber}`,
  };
}

export function parseLedger(
  file: ProjectTextFile,
  source: SourceRef,
): ParsedSource<RawLedger> {
  const sourceDiagnostics = validateParserSource(file, source, "ndjson");

  if (sourceDiagnostics.length > 0) {
    return { source, diagnostics: sourceDiagnostics };
  }

  const diagnostics: Diagnostic[] = [];
  const records: RawLedgerRecord[] = [];
  const lines = file.text.split(/\r\n|\n|\r/);

  for (const [index, line] of lines.entries()) {
    const sequence = index + 1;

    if (line.trim().length === 0) {
      continue;
    }

    const lineSource = ledgerLineSource(source, line, sequence);
    let parsed: unknown;

    try {
      parsed = JSON.parse(line) as unknown;
    } catch {
      diagnostics.push({
        code: "PARSE_LEDGER_INVALID_JSON",
        severity: "error",
        message: `Ledger line ${sequence} is not valid JSON.`,
        source: lineSource,
      });
      continue;
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      diagnostics.push({
        code: "PARSE_LEDGER_NON_OBJECT",
        severity: "error",
        message: `Ledger line ${sequence} must contain one JSON object.`,
        source: lineSource,
      });
      continue;
    }

    let value;

    try {
      value = toRawValue(parsed);
    } catch (cause: unknown) {
      const isUnsafeInteger =
        cause instanceof RawValueConversionError &&
        cause.reason === "unsafe-integer";
      diagnostics.push({
        code: isUnsafeInteger
          ? "PARSE_LEDGER_UNSAFE_INTEGER"
          : "PARSE_LEDGER_INVALID_JSON",
        severity: "error",
        message: isUnsafeInteger
          ? `Ledger line ${sequence} contains an integer outside JavaScript's safe integer range.`
          : `Ledger line ${sequence} cannot be represented as a finite JSON object.`,
        source: lineSource,
      });
      continue;
    }

    if (!isRawObject(value)) {
      diagnostics.push({
        code: "PARSE_LEDGER_NON_OBJECT",
        severity: "error",
        message: `Ledger line ${sequence} must contain one JSON object.`,
        source: lineSource,
      });
      continue;
    }

    records.push(
      Object.freeze({
        sequence,
        value,
        source: lineSource,
      }),
    );
  }

  return {
    source,
    diagnostics,
    value: Object.freeze({ records: Object.freeze(records) }),
  };
}
