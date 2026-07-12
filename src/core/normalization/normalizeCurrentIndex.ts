import type { ActiveDeclaration, ActiveField } from "../domain/ActiveDeclaration";
import type { ProjectMetadata } from "../domain/ProjectSnapshot";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type {
  RawCurrentIndex,
  RawCurrentIndexActive,
} from "../parsing/parseCurrentIndex";
import { isRawObject, type RawValue } from "../parsing/RawValue";
import type { SourceRef } from "../source/SourceRef";
import {
  cloneRawObject,
  cloneSourceRef,
  escapePointerSegment,
  pointerSource,
} from "./canonicalOrdering";

const ACTIVE_FIELDS: readonly ActiveField[] = [
  "sprint",
  "refactor",
  "iteration",
  "slice",
];

const PROJECT_STRING_FIELDS = ["id", "name", "status", "tier"] as const;

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function describeRawValue(value: RawValue): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

function projectFieldSource(
  currentIndex: RawCurrentIndex,
  field: string,
): SourceRef {
  const base = currentIndex.fieldSources.project ?? currentIndex.source;
  return pointerSource(base, `/project/${escapePointerSegment(field)}`);
}

function normalizeProjectMetadata(
  currentIndex: RawCurrentIndex,
  diagnostics: Diagnostic[],
): ProjectMetadata | undefined {
  if (!hasOwn(currentIndex.fields, "project")) {
    return undefined;
  }

  const rawProject = currentIndex.fields.project;

  if (rawProject === undefined || !isRawObject(rawProject)) {
    diagnostics.push({
      code: "NORMALIZE_INVALID_PROJECT_METADATA",
      severity: "warning",
      message: `CurrentIndex /project must be a mapping object to preserve normalized project metadata; received ${
        rawProject === undefined ? "missing" : describeRawValue(rawProject)
      }.`,
      source:
        currentIndex.fieldSources.project ??
        pointerSource(currentIndex.source, "/project"),
    });
    return undefined;
  }

  const fieldSources: Record<string, SourceRef> = {};

  for (const key of Object.keys(rawProject)) {
    Object.defineProperty(fieldSources, key, {
      configurable: false,
      enumerable: true,
      value: projectFieldSource(currentIndex, key),
      writable: false,
    });
  }

  for (const field of PROJECT_STRING_FIELDS) {
    if (!hasOwn(rawProject, field)) {
      continue;
    }

    const value = rawProject[field];
    if (typeof value !== "string") {
      diagnostics.push({
        code: "NORMALIZE_INVALID_PROJECT_METADATA_FIELD",
        severity: "warning",
        message: `CurrentIndex project field /project/${field} must be a string to expose typed project metadata; received ${
          value === undefined ? "missing" : describeRawValue(value)
        }.`,
        source: projectFieldSource(currentIndex, field),
      });
    }
  }

  const source =
    currentIndex.fieldSources.project ??
    pointerSource(currentIndex.source, "/project");

  return Object.freeze({
    ...(typeof rawProject.id === "string" ? { id: rawProject.id } : {}),
    ...(typeof rawProject.name === "string" ? { name: rawProject.name } : {}),
    ...(typeof rawProject.status === "string"
      ? { status: rawProject.status }
      : {}),
    ...(typeof rawProject.tier === "string" ? { tier: rawProject.tier } : {}),
    attributes: cloneRawObject(rawProject) as Readonly<Record<string, unknown>>,
    source: cloneSourceRef(source),
    fieldSources: Object.freeze(fieldSources),
  });
}

function activeFieldSources(
  active: RawCurrentIndexActive,
): Readonly<Partial<Record<ActiveField, SourceRef>>> {
  const sources: Partial<Record<ActiveField, SourceRef>> = {};

  for (const field of ACTIVE_FIELDS) {
    const source = active.fieldSources[field];
    if (source !== undefined) {
      sources[field] = cloneSourceRef(source);
    }
  }

  return Object.freeze(sources);
}

function normalizeActive(
  currentIndex: RawCurrentIndex,
  diagnostics: Diagnostic[],
): ActiveDeclaration | undefined {
  if (currentIndex.active === undefined) {
    if (hasOwn(currentIndex.fields, "active")) {
      diagnostics.push({
        code: "NORMALIZE_ACTIVE_DECLARATION_UNAVAILABLE",
        severity: "warning",
        message:
          "CurrentIndex contains /active, but no supported active mapping is available for normalization.",
        source:
          currentIndex.fieldSources.active ??
          pointerSource(currentIndex.source, "/active"),
      });
    }

    return undefined;
  }

  const active = currentIndex.active;

  for (const field of ACTIVE_FIELDS) {
    if (hasOwn(active.fields, field) && !hasOwn(active, field)) {
      diagnostics.push({
        code: "NORMALIZE_ACTIVE_FIELD_UNAVAILABLE",
        severity: "warning",
        message: `CurrentIndex active field /active/${field} is present but has no supported typed value.`,
        source:
          active.fieldSources[field] ??
          pointerSource(active.source, `/active/${field}`),
      });
    }
  }

  return Object.freeze({
    ...(hasOwn(active, "sprint") ? { sprint: active.sprint } : {}),
    ...(hasOwn(active, "refactor") ? { refactor: active.refactor } : {}),
    ...(hasOwn(active, "iteration") ? { iteration: active.iteration } : {}),
    ...(hasOwn(active, "slice") ? { slice: active.slice } : {}),
    source: cloneSourceRef(active.source),
    fieldSources: activeFieldSources(active),
  });
}

export interface CurrentIndexNormalization {
  readonly project?: ProjectMetadata;
  readonly active?: ActiveDeclaration;
  readonly diagnostics: readonly Diagnostic[];
}

export function normalizeCurrentIndex(
  currentIndex: RawCurrentIndex,
): CurrentIndexNormalization {
  const diagnostics: Diagnostic[] = [];
  const project = normalizeProjectMetadata(currentIndex, diagnostics);
  const active = normalizeActive(currentIndex, diagnostics);

  return {
    ...(project === undefined ? {} : { project }),
    ...(active === undefined ? {} : { active }),
    diagnostics,
  };
}
