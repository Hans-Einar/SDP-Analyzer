import type { Entity, EntityKind } from "../domain/Entity";
import type { Relation } from "../domain/Relation";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type {
  RawRelations,
  RawRelationsEntry,
} from "../parsing/parseRelations";
import { isRawObject, type RawObject, type RawValue } from "../parsing/RawValue";
import type { SourceRef } from "../source/SourceRef";
import {
  canonicalizeSourceRefs,
  cloneRawObject,
  cloneSourceRef,
  compareSourceRefs,
  compareText,
  escapePointerSegment,
  pointerSource,
} from "./canonicalOrdering";

const SECTION_KINDS: Readonly<Record<string, EntityKind | undefined>> =
  Object.freeze({
    documents: "unknown",
    tiers: "tier",
    sprints: "sprint",
    iterations: "iteration",
    slices: "slice",
    reviews: "review",
    verification: "verification",
    refactors: "unknown",
  });

const SUPPORTED_SECTIONS = new Set(Object.keys(SECTION_KINDS));

const DOCUMENT_SUBTYPES = new Set<EntityKind>([
  "mandate",
  "study",
  "requirement",
  "architecture-decision",
  "design-decision",
  "verification",
  "review",
  "unknown",
]);

const REFACTOR_SUBTYPES = new Set<EntityKind>(["refactor", "unknown"]);

export const SUPPORTED_RELATION_FIELDS = Object.freeze([
  "derives_from",
  "decisions",
  "tier",
  "sprint",
  "iteration",
  "slice",
  "slices",
  "requirements",
  "architecture",
  "study_decisions",
  "design",
  "verification_plan",
  "verification",
  "review",
] as const);

const RELATION_FIELDS = new Set<string>(SUPPORTED_RELATION_FIELDS);

interface EntityDefinition {
  readonly id: string;
  readonly kind: EntityKind;
  readonly attributes: RawObject;
  readonly source: SourceRef;
  readonly status?: string;
  readonly title?: string;
  readonly path?: string;
}

interface EntityDefinitionOccurrence {
  readonly id: string;
  readonly source: SourceRef;
}

interface RelationCandidate {
  readonly id: string;
  readonly type: string;
  readonly from: string;
  readonly to: string;
  readonly sources: readonly SourceRef[];
}

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

function definitionPointer(section: string, id: string): string {
  return `/${escapePointerSegment(section)}/${escapePointerSegment(id)}`;
}

function fieldPointer(section: string, id: string, field: string): string {
  return `${definitionPointer(section, id)}/${escapePointerSegment(field)}`;
}

function explicitSubtype(
  section: string,
  id: string,
  attributes: RawObject,
  entry: RawRelationsEntry,
  diagnostics: Diagnostic[],
): EntityKind {
  const fallback = SECTION_KINDS[section] ?? "unknown";

  if (section !== "documents" && section !== "refactors") {
    return fallback;
  }

  if (!hasOwn(attributes, "kind")) {
    return fallback;
  }

  const explicitKind = attributes.kind;
  const acceptedKinds =
    section === "documents" ? DOCUMENT_SUBTYPES : REFACTOR_SUBTYPES;

  if (typeof explicitKind === "string" && acceptedKinds.has(explicitKind)) {
    return explicitKind;
  }

  diagnostics.push({
    code: "NORMALIZE_UNSUPPORTED_ENTITY_KIND",
    severity: "warning",
    message: `Relations definition ${id} in /${section} has unsupported explicit kind metadata; the entity kind remains unknown.`,
    source: pointerSource(entry.source, fieldPointer(section, id, "kind")),
  });
  return "unknown";
}

function diagnoseInvalidTypedMetadata(
  section: string,
  entry: RawRelationsEntry,
  attributes: RawObject,
  diagnostics: Diagnostic[],
): void {
  for (const field of ["status", "title", "path"] as const) {
    if (!hasOwn(attributes, field)) {
      continue;
    }

    const value = attributes[field];
    if (typeof value !== "string") {
      diagnostics.push({
        code: "NORMALIZE_INVALID_ENTITY_METADATA",
        severity: "warning",
        message: `Relations definition ${entry.key} field ${field} must be a string to expose typed metadata; received ${
          value === undefined ? "missing" : describeRawValue(value)
        }.`,
        source: pointerSource(
          entry.source,
          fieldPointer(section, entry.key, field),
        ),
      });
    }
  }
}

function createRelationId(
  from: string,
  type: string,
  to: string,
  source: SourceRef,
): string {
  return `relation:${JSON.stringify([
    from,
    type,
    to,
    source.sourceId,
    source.path,
    source.kind,
    source.lineStart ?? null,
    source.columnStart ?? null,
    source.lineEnd ?? null,
    source.columnEnd ?? null,
    source.pointer ?? null,
  ])}`;
}

function addRelation(
  candidates: RelationCandidate[],
  from: string,
  type: string,
  to: string,
  source: SourceRef,
): void {
  candidates.push({
    id: createRelationId(from, type, to, source),
    type,
    from,
    to,
    sources: [source],
  });
}

function extractRelations(
  section: string,
  entry: RawRelationsEntry,
  attributes: RawObject,
  candidates: RelationCandidate[],
  diagnostics: Diagnostic[],
): void {
  for (const [field, value] of Object.entries(attributes)) {
    if (!RELATION_FIELDS.has(field)) {
      continue;
    }

    const pointer = fieldPointer(section, entry.key, field);

    if (typeof value === "string" && value.trim().length > 0) {
      const source = pointerSource(entry.source, pointer);
      addRelation(candidates, entry.key, field, value, source);
      continue;
    }

    if (Array.isArray(value)) {
      for (const [index, target] of value.entries()) {
        const source = pointerSource(entry.source, `${pointer}/${index}`);

        if (typeof target === "string" && target.trim().length > 0) {
          addRelation(candidates, entry.key, field, target, source);
        } else {
          diagnostics.push({
            code: "NORMALIZE_INVALID_RELATION_VALUE",
            severity: "warning",
            message: `Relations field ${pointer} array element ${index} must be a non-empty string target; received ${
              typeof target === "string"
                ? "an empty or whitespace string"
                : describeRawValue(target)
            }.`,
            source,
          });
        }
      }

      continue;
    }

    diagnostics.push({
      code: "NORMALIZE_INVALID_RELATION_VALUE",
      severity: "warning",
      message: `Relations field ${pointer} must be a non-empty string target or an array of non-empty string targets; received ${
        typeof value === "string"
          ? "an empty or whitespace string"
          : describeRawValue(value)
      }.`,
      source: pointerSource(entry.source, pointer),
    });
  }
}

function compareDefinitions(
  left: EntityDefinition,
  right: EntityDefinition,
): number {
  return (
    compareText(left.kind, right.kind) ||
    compareSourceRefs(left.source, right.source)
  );
}

function compareEntities(left: Entity, right: Entity): number {
  const leftSource = left.sources[0];
  const rightSource = right.sources[0];

  return (
    compareText(left.kind, right.kind) ||
    compareText(left.id, right.id) ||
    (leftSource === undefined
      ? rightSource === undefined
        ? 0
        : -1
      : rightSource === undefined
        ? 1
        : compareSourceRefs(leftSource, rightSource))
  );
}

function compareRelations(left: Relation, right: Relation): number {
  const leftSource = left.sources[0];
  const rightSource = right.sources[0];

  return (
    compareText(left.type, right.type) ||
    compareText(left.from, right.from) ||
    compareText(left.to, right.to) ||
    (leftSource === undefined
      ? rightSource === undefined
        ? 0
        : -1
      : rightSource === undefined
        ? 1
        : compareSourceRefs(leftSource, rightSource)) ||
    compareText(left.id, right.id)
  );
}

function buildEntities(
  definitions: readonly EntityDefinition[],
  occurrences: readonly EntityDefinitionOccurrence[],
  diagnostics: Diagnostic[],
): readonly Entity[] {
  const definitionsById = new Map<string, EntityDefinition[]>();
  const occurrencesById = new Map<string, EntityDefinitionOccurrence[]>();

  for (const definition of definitions) {
    const matches = definitionsById.get(definition.id);
    if (matches === undefined) {
      definitionsById.set(definition.id, [definition]);
    } else {
      matches.push(definition);
    }
  }

  for (const occurrence of occurrences) {
    const matches = occurrencesById.get(occurrence.id);
    if (matches === undefined) {
      occurrencesById.set(occurrence.id, [occurrence]);
    } else {
      matches.push(occurrence);
    }
  }

  for (const [id, matches] of occurrencesById) {
    if (matches.length < 2) {
      continue;
    }

    const ordered = [...matches].sort((left, right) =>
      compareSourceRefs(left.source, right.source),
    );

    for (const occurrence of ordered) {
      diagnostics.push({
        code: "NORMALIZE_DUPLICATE_ENTITY_DEFINITION",
        severity: "warning",
        message: `Entity ${id} has ${ordered.length} explicit definition keys; every definition location is retained for duplicate analysis.`,
        source: occurrence.source,
      });
    }
  }

  const entities: Entity[] = [];

  for (const [id, matches] of definitionsById) {
    const ordered = [...matches].sort(compareDefinitions);
    const canonical = ordered[0];

    if (canonical === undefined) {
      continue;
    }

    const entityOccurrences = occurrencesById.get(id) ?? [];
    const sources = canonicalizeSourceRefs(
      entityOccurrences.length === 0
        ? ordered.map(({ source }) => source)
        : entityOccurrences.map(({ source }) => source),
    );

    entities.push(
      Object.freeze({
        id,
        kind: canonical.kind,
        ...(canonical.status === undefined
          ? {}
          : { status: canonical.status }),
        ...(canonical.title === undefined ? {} : { title: canonical.title }),
        ...(canonical.path === undefined ? {} : { path: canonical.path }),
        attributes: canonical.attributes as Readonly<Record<string, unknown>>,
        sources,
      }),
    );
  }

  return Object.freeze(entities.sort(compareEntities));
}

function buildRelations(candidates: readonly RelationCandidate[]): readonly Relation[] {
  const byId = new Map<string, RelationCandidate>();

  for (const candidate of candidates) {
    const existing = byId.get(candidate.id);
    if (existing === undefined) {
      byId.set(candidate.id, candidate);
      continue;
    }

    byId.set(candidate.id, {
      ...existing,
      sources: [...existing.sources, ...candidate.sources],
    });
  }

  const relations: Relation[] = [...byId.values()].map((candidate) =>
    Object.freeze({
      id: candidate.id,
      type: candidate.type,
      from: candidate.from,
      to: candidate.to,
      sources: canonicalizeSourceRefs(candidate.sources),
    }),
  );

  return Object.freeze(relations.sort(compareRelations));
}

export interface RelationsNormalization {
  readonly entities: readonly Entity[];
  readonly relations: readonly Relation[];
  readonly diagnostics: readonly Diagnostic[];
  readonly hasSupportedStructure: boolean;
}

export function normalizeRelations(
  relations: RawRelations,
): RelationsNormalization {
  const diagnostics: Diagnostic[] = [];
  const definitions: EntityDefinition[] = [];
  const occurrences: EntityDefinitionOccurrence[] = [];
  const relationCandidates: RelationCandidate[] = [];
  let hasSupportedStructure = false;

  for (const section of relations.sections) {
    if (!SUPPORTED_SECTIONS.has(section.key)) {
      diagnostics.push({
        code: "NORMALIZE_UNSUPPORTED_SECTION",
        severity: "warning",
        message: `Relations section /${escapePointerSegment(
          section.key,
        )} is preserved by parsing but is not normalized by the current profile.`,
        source: cloneSourceRef(section.source),
      });
      continue;
    }

    if (section.entries === undefined) {
      diagnostics.push({
        code: "NORMALIZE_SECTION_UNAVAILABLE",
        severity: "warning",
        message: `Supported Relations section /${escapePointerSegment(
          section.key,
        )} is not a usable mapping of explicit definitions.`,
        source: cloneSourceRef(section.source),
      });
      continue;
    }

    hasSupportedStructure = true;

    for (const entry of section.entries) {
      const hasStableKey = entry.key.trim().length > 0;

      if (hasStableKey) {
        occurrences.push({
          id: entry.key,
          source: cloneSourceRef(entry.source),
        });
      }

      if (!hasStableKey || !isRawObject(entry.value)) {
        diagnostics.push({
          code: "NORMALIZE_INVALID_ENTITY_RECORD",
          severity: "warning",
          message:
            entry.key.trim().length === 0
              ? `Relations section /${section.key} contains an empty explicit definition key.`
              : `Relations definition ${entry.key} in /${section.key} must be a mapping object; received ${describeRawValue(
                  entry.value,
                )}.`,
          source: cloneSourceRef(entry.source),
        });
        continue;
      }

      const attributes = entry.value;
      const kind = explicitSubtype(
        section.key,
        entry.key,
        attributes,
        entry,
        diagnostics,
      );

      diagnoseInvalidTypedMetadata(
        section.key,
        entry,
        attributes,
        diagnostics,
      );

      definitions.push({
        id: entry.key,
        kind,
        attributes: cloneRawObject(attributes),
        source: cloneSourceRef(entry.source),
        ...(typeof attributes.status === "string"
          ? { status: attributes.status }
          : {}),
        ...(typeof attributes.title === "string"
          ? { title: attributes.title }
          : {}),
        ...(typeof attributes.path === "string" ? { path: attributes.path } : {}),
      });

      extractRelations(
        section.key,
        entry,
        attributes,
        relationCandidates,
        diagnostics,
      );
    }
  }

  return {
    entities: buildEntities(definitions, occurrences, diagnostics),
    relations: buildRelations(relationCandidates),
    diagnostics,
    hasSupportedStructure,
  };
}
