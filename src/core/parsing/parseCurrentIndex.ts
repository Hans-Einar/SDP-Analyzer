import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { ProjectTextFile } from "../source/ProjectSource";
import type { SourceRef } from "../source/SourceRef";
import type { ParsedSource } from "./ParsedSource";
import { isRawObject, type RawObject, type RawValue } from "./RawValue";
import {
  escapeJsonPointerSegment,
  parseYamlMapping,
  yamlMapAtKey,
  yamlMapValueNode,
  yamlSourceForNode,
} from "./yamlSupport";

export type RawActiveField = "sprint" | "refactor" | "iteration" | "slice";

export interface RawCurrentIndexActive {
  readonly fields: RawObject;
  readonly source: SourceRef;
  readonly fieldSources: Readonly<Record<string, SourceRef>>;
  readonly sprint?: string | null;
  readonly refactor?: string | null;
  readonly iteration?: string | null;
  readonly slice?: string | null;
}

export interface RawCurrentIndex {
  readonly fields: RawObject;
  readonly source: SourceRef;
  readonly fieldSources: Readonly<Record<string, SourceRef>>;
  readonly project?: RawValue;
  readonly active?: RawCurrentIndexActive;
  readonly planning?: RawValue;
}

const ACTIVE_FIELDS: readonly RawActiveField[] = [
  "sprint",
  "refactor",
  "iteration",
  "slice",
];

function hasOwn(value: RawObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function describeValue(value: RawValue): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

export function parseCurrentIndex(
  file: ProjectTextFile,
  source: SourceRef,
): ParsedSource<RawCurrentIndex> {
  const parsed = parseYamlMapping(file, source);

  if (parsed.value === undefined || parsed.map === undefined) {
    return { source, diagnostics: parsed.diagnostics };
  }

  const diagnostics: Diagnostic[] = [...parsed.diagnostics];
  const root = parsed.value;
  const fieldSources: Record<string, SourceRef> = {};

  for (const key of Object.keys(root)) {
    const pointer = `/${escapeJsonPointerSegment(key)}`;
    fieldSources[key] = yamlSourceForNode(
      source,
      parsed.lineCounter,
      yamlMapValueNode(parsed.map, key),
      pointer,
    );
  }

  let active: RawCurrentIndexActive | undefined;

  if (hasOwn(root, "active")) {
    const rawActive = root.active;
    const activePointer = "/active";
    const activeNode = yamlMapValueNode(parsed.map, "active");

    if (rawActive === undefined || !isRawObject(rawActive)) {
      diagnostics.push({
        code: "PARSE_CURRENT_INDEX_INVALID_FIELD",
        severity: "error",
        message: `CurrentIndex field /active must be a mapping object; received ${
          rawActive === undefined ? "missing" : describeValue(rawActive)
        }.`,
        source: yamlSourceForNode(
          source,
          parsed.lineCounter,
          activeNode,
          activePointer,
        ),
      });
    } else {
      const activeMap = yamlMapAtKey(parsed.map, "active");
      const activeFieldSources: Record<string, SourceRef> = {};
      const supportedValues: Partial<
        Record<RawActiveField, string | null>
      > = {};

      for (const key of Object.keys(rawActive)) {
        const pointer = `${activePointer}/${escapeJsonPointerSegment(key)}`;
        activeFieldSources[key] = yamlSourceForNode(
          source,
          parsed.lineCounter,
          activeMap === undefined
            ? undefined
            : yamlMapValueNode(activeMap, key),
          pointer,
        );
      }

      for (const field of ACTIVE_FIELDS) {
        if (!hasOwn(rawActive, field)) {
          continue;
        }

        const value = rawActive[field];

        if (value === undefined) {
          continue;
        }

        if (value === null || typeof value === "string") {
          supportedValues[field] = value;
          continue;
        }

        diagnostics.push({
          code: "PARSE_CURRENT_INDEX_INVALID_FIELD",
          severity: "error",
          message: `CurrentIndex field /active/${field} must be a string or null; received ${describeValue(
            value,
          )}.`,
          source:
            activeFieldSources[field] ??
            yamlSourceForNode(
              source,
              parsed.lineCounter,
              undefined,
              `/active/${field}`,
            ),
        });
      }

      active = Object.freeze({
        fields: rawActive,
        source: yamlSourceForNode(
          source,
          parsed.lineCounter,
          activeNode,
          activePointer,
        ),
        fieldSources: Object.freeze(activeFieldSources),
        ...supportedValues,
      });
    }
  }

  const value: RawCurrentIndex = Object.freeze({
    fields: root,
    source: yamlSourceForNode(source, parsed.lineCounter, parsed.map),
    fieldSources: Object.freeze(fieldSources),
    ...(hasOwn(root, "project") ? { project: root.project } : {}),
    ...(active === undefined ? {} : { active }),
    ...(hasOwn(root, "planning") ? { planning: root.planning } : {}),
  });

  return { source, diagnostics, value };
}
