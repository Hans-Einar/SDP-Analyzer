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

export interface RawRelationsEntry {
  readonly key: string;
  readonly value: RawValue;
  readonly source: SourceRef;
}

export interface RawRelationsSection {
  readonly key: string;
  readonly value: RawValue;
  readonly source: SourceRef;
  readonly entries?: readonly RawRelationsEntry[];
}

export interface RawRelations {
  readonly fields: RawObject;
  readonly source: SourceRef;
  readonly sections: readonly RawRelationsSection[];
}

const KNOWN_RELATIONS_SECTIONS = new Set([
  "documents",
  "tiers",
  "sprints",
  "iterations",
  "slices",
  "reviews",
  "verification",
]);

export function parseRelations(
  file: ProjectTextFile,
  source: SourceRef,
): ParsedSource<RawRelations> {
  const parsed = parseYamlMapping(file, source);

  if (parsed.value === undefined || parsed.map === undefined) {
    return { source, diagnostics: parsed.diagnostics };
  }

  const diagnostics: Diagnostic[] = [...parsed.diagnostics];
  const sections: RawRelationsSection[] = [];

  for (const [sectionKey, sectionValue] of Object.entries(parsed.value)) {
    const sectionPointer = `/${escapeJsonPointerSegment(sectionKey)}`;
    const sectionNode = yamlMapValueNode(parsed.map, sectionKey);
    const sectionSource = yamlSourceForNode(
      source,
      parsed.lineCounter,
      sectionNode,
      sectionPointer,
    );
    const sectionMap = yamlMapAtKey(parsed.map, sectionKey);
    let entries: readonly RawRelationsEntry[] | undefined;

    if (isRawObject(sectionValue)) {
      entries = Object.freeze(
        Object.entries(sectionValue).map(([entryKey, entryValue]) => ({
          key: entryKey,
          value: entryValue,
          source: yamlSourceForNode(
            source,
            parsed.lineCounter,
            sectionMap === undefined
              ? undefined
              : yamlMapValueNode(sectionMap, entryKey),
            `${sectionPointer}/${escapeJsonPointerSegment(entryKey)}`,
          ),
        })),
      );
    } else if (KNOWN_RELATIONS_SECTIONS.has(sectionKey)) {
      diagnostics.push({
        code: "PARSE_RELATIONS_INVALID_SECTION",
        severity: "error",
        message: `Relations section ${sectionPointer} must be a mapping object.`,
        source: sectionSource,
      });
    }

    sections.push(
      Object.freeze({
        key: sectionKey,
        value: sectionValue,
        source: sectionSource,
        ...(entries === undefined ? {} : { entries }),
      }),
    );
  }

  return {
    source,
    diagnostics,
    value: Object.freeze({
      fields: parsed.value,
      source: yamlSourceForNode(source, parsed.lineCounter, parsed.map),
      sections: Object.freeze(sections),
    }),
  };
}
