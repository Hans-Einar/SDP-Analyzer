import type { ProjectSnapshot } from "../domain/ProjectSnapshot";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type {
  ProjectDiscoveryManifest,
  ProjectProfileSupport,
} from "../discovery/ProjectDiscoveryManifest";
import type { ParsedSource } from "../parsing/ParsedSource";
import type { RawCurrentIndex } from "../parsing/parseCurrentIndex";
import type { RawLedger } from "../parsing/parseLedger";
import type { RawRelations } from "../parsing/parseRelations";
import type { SourceRef } from "../source/SourceRef";
import {
  canonicalizeDiagnostics,
  canonicalizeSourceRefs,
} from "./canonicalOrdering";
import { normalizeCurrentIndex } from "./normalizeCurrentIndex";
import { normalizeLedger } from "./normalizeLedger";
import { normalizeRelations } from "./normalizeRelations";

export interface NormalizeTraceabilityInput {
  readonly discovery: ProjectDiscoveryManifest;
  readonly currentIndex?: ParsedSource<RawCurrentIndex>;
  readonly relations?: ParsedSource<RawRelations>;
  readonly ledger?: ParsedSource<RawLedger>;
  /**
   * Optional additional pre-normalization diagnostics. Application
   * orchestration supplies its aggregate so read failures without
   * ParsedSource objects are retained. Discovery and present parser
   * diagnostics are always composed as well; canonical deduplication removes
   * repeated entries from a complete application aggregate.
   */
  readonly diagnostics?: readonly Diagnostic[];
}

function downgradeSupported(
  support: ProjectProfileSupport,
): ProjectProfileSupport {
  return support === "supported" ? "partial" : support;
}

function unavailableSource(
  parsed: ParsedSource<unknown> | undefined,
  discovered: SourceRef | undefined,
): SourceRef | undefined {
  return parsed?.source ?? discovered;
}

function requiredSourceDiagnostic(
  label: string,
  source: SourceRef | undefined,
): Diagnostic {
  return {
    code: "NORMALIZE_REQUIRED_SOURCE_UNAVAILABLE",
    severity: "warning",
    message: `Required parsed ${label} source is missing, failed, or has no usable value.`,
    ...(source === undefined ? {} : { source }),
  };
}

function composedInputDiagnostics(
  input: NormalizeTraceabilityInput,
): readonly Diagnostic[] {
  return [
    ...input.discovery.diagnostics,
    ...(input.currentIndex?.diagnostics ?? []),
    ...(input.relations?.diagnostics ?? []),
    ...(input.ledger?.diagnostics ?? []),
    ...(input.diagnostics ?? []),
  ];
}

export function normalizeTraceability(
  input: NormalizeTraceabilityInput,
): ProjectSnapshot {
  const normalizationDiagnostics: Diagnostic[] = [];
  let support = input.discovery.profile.support;
  let project: ProjectSnapshot["project"];
  let active: ProjectSnapshot["active"];
  let entities: ProjectSnapshot["entities"] = Object.freeze([]);
  let relations: ProjectSnapshot["relations"] = Object.freeze([]);
  let ledger: ProjectSnapshot["ledger"] = Object.freeze([]);

  if (input.currentIndex?.value === undefined) {
    support = downgradeSupported(support);
    normalizationDiagnostics.push(
      requiredSourceDiagnostic(
        "CurrentIndex",
        unavailableSource(
          input.currentIndex,
          input.discovery.coreTraceability.currentIndex?.source,
        ),
      ),
    );
  } else {
    const normalized = normalizeCurrentIndex(input.currentIndex.value);
    project = normalized.project;
    active = normalized.active;
    normalizationDiagnostics.push(...normalized.diagnostics);
  }

  if (input.relations?.value === undefined) {
    support = downgradeSupported(support);
    normalizationDiagnostics.push(
      requiredSourceDiagnostic(
        "Relations",
        unavailableSource(
          input.relations,
          input.discovery.coreTraceability.relations?.source,
        ),
      ),
    );
  } else {
    const normalized = normalizeRelations(input.relations.value);
    entities = normalized.entities;
    relations = normalized.relations;
    normalizationDiagnostics.push(...normalized.diagnostics);

    if (!normalized.hasSupportedStructure) {
      support = downgradeSupported(support);
      normalizationDiagnostics.push({
        code: "NORMALIZE_RELATIONS_STRUCTURE_UNAVAILABLE",
        severity: "warning",
        message:
          "Parsed Relations contains no usable supported definition section for the current profile.",
        source: input.relations.source,
      });
    }
  }

  if (input.ledger?.value === undefined) {
    support = downgradeSupported(support);
    normalizationDiagnostics.push(
      requiredSourceDiagnostic(
        "Ledger",
        unavailableSource(
          input.ledger,
          input.discovery.coreTraceability.ledger?.source,
        ),
      ),
    );
  } else {
    const normalized = normalizeLedger(input.ledger.value);
    ledger = normalized.ledger;
    normalizationDiagnostics.push(...normalized.diagnostics);
  }

  return Object.freeze({
    profile: Object.freeze({
      id: input.discovery.profile.id,
      support,
    }),
    sources: canonicalizeSourceRefs(
      input.discovery.files.map(({ source }) => source),
    ),
    diagnostics: canonicalizeDiagnostics([
      ...composedInputDiagnostics(input),
      ...normalizationDiagnostics,
    ]),
    ...(project === undefined ? {} : { project }),
    entities,
    relations,
    ledger,
    ...(active === undefined ? {} : { active }),
  });
}
