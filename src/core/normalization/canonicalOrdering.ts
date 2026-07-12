import type { Diagnostic } from "../diagnostics/Diagnostic";
import {
  isRawObject,
  toRawValue,
  type RawObject,
  type RawValue,
} from "../parsing/RawValue";
import type { SourceRef } from "../source/SourceRef";

export function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareOptionalNumber(
  left: number | undefined,
  right: number | undefined,
): number {
  if (left === right) {
    return 0;
  }

  if (left === undefined) {
    return -1;
  }

  if (right === undefined) {
    return 1;
  }

  return left - right;
}

function compareOptionalText(
  left: string | undefined,
  right: string | undefined,
): number {
  if (left === right) {
    return 0;
  }

  if (left === undefined) {
    return -1;
  }

  if (right === undefined) {
    return 1;
  }

  return compareText(left, right);
}

export function compareSourceRefs(left: SourceRef, right: SourceRef): number {
  return (
    compareText(left.path, right.path) ||
    compareOptionalNumber(left.lineStart, right.lineStart) ||
    compareOptionalNumber(left.columnStart, right.columnStart) ||
    compareOptionalNumber(left.lineEnd, right.lineEnd) ||
    compareOptionalNumber(left.columnEnd, right.columnEnd) ||
    compareOptionalText(left.pointer, right.pointer) ||
    compareText(left.sourceId, right.sourceId) ||
    compareText(left.kind, right.kind)
  );
}

export function sourceRefIdentity(source: SourceRef): string {
  return JSON.stringify([
    source.sourceId,
    source.path,
    source.kind,
    source.lineStart ?? null,
    source.columnStart ?? null,
    source.lineEnd ?? null,
    source.columnEnd ?? null,
    source.pointer ?? null,
  ]);
}

export function cloneSourceRef(source: SourceRef): SourceRef {
  return Object.freeze({
    sourceId: source.sourceId,
    path: source.path,
    kind: source.kind,
    ...(source.lineStart === undefined ? {} : { lineStart: source.lineStart }),
    ...(source.columnStart === undefined
      ? {}
      : { columnStart: source.columnStart }),
    ...(source.lineEnd === undefined ? {} : { lineEnd: source.lineEnd }),
    ...(source.columnEnd === undefined ? {} : { columnEnd: source.columnEnd }),
    ...(source.pointer === undefined ? {} : { pointer: source.pointer }),
  });
}

export function canonicalizeSourceRefs(
  sources: readonly SourceRef[],
): readonly SourceRef[] {
  const byIdentity = new Map<string, SourceRef>();

  for (const source of sources) {
    const identity = sourceRefIdentity(source);
    if (!byIdentity.has(identity)) {
      byIdentity.set(identity, cloneSourceRef(source));
    }
  }

  return Object.freeze([...byIdentity.values()].sort(compareSourceRefs));
}

export function pointerSource(base: SourceRef, pointer: string): SourceRef {
  return Object.freeze({
    sourceId: base.sourceId,
    path: base.path,
    kind: base.kind,
    pointer,
  });
}

export function escapePointerSegment(segment: string): string {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}

export function cloneRawValue(value: RawValue): RawValue {
  return toRawValue(value);
}

export function cloneRawObject(value: RawObject): RawObject {
  const clone = cloneRawValue(value);

  if (!isRawObject(clone)) {
    throw new Error("Normalization expected a raw object value.");
  }

  return clone;
}

function compareOptionalSources(
  left: SourceRef | undefined,
  right: SourceRef | undefined,
): number {
  if (left === right) {
    return 0;
  }

  if (left === undefined) {
    return -1;
  }

  if (right === undefined) {
    return 1;
  }

  return compareSourceRefs(left, right);
}

export function compareDiagnostics(left: Diagnostic, right: Diagnostic): number {
  return (
    compareText(left.code, right.code) ||
    compareOptionalSources(left.source, right.source) ||
    compareText(left.message, right.message) ||
    compareText(left.severity, right.severity)
  );
}

function diagnosticIdentity(diagnostic: Diagnostic): string {
  return JSON.stringify([
    diagnostic.code,
    diagnostic.severity,
    diagnostic.message,
    diagnostic.source === undefined
      ? null
      : sourceRefIdentity(diagnostic.source),
  ]);
}

export function canonicalizeDiagnostics(
  diagnostics: readonly Diagnostic[],
): readonly Diagnostic[] {
  const byIdentity = new Map<string, Diagnostic>();

  for (const diagnostic of diagnostics) {
    const identity = diagnosticIdentity(diagnostic);
    if (!byIdentity.has(identity)) {
      byIdentity.set(
        identity,
        Object.freeze({
          code: diagnostic.code,
          severity: diagnostic.severity,
          message: diagnostic.message,
          ...(diagnostic.source === undefined
            ? {}
            : { source: cloneSourceRef(diagnostic.source) }),
        }),
      );
    }
  }

  return Object.freeze([...byIdentity.values()].sort(compareDiagnostics));
}
