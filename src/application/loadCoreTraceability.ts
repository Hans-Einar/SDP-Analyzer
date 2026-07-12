import type { Diagnostic } from "../core/diagnostics/Diagnostic";
import type {
  DiscoveredSource,
  ProjectDiscoveryManifest,
} from "../core/discovery/ProjectDiscoveryManifest";
import { discoverProject } from "../core/discovery/discoverProject";
import {
  parseCurrentIndex,
  type RawCurrentIndex,
} from "../core/parsing/parseCurrentIndex";
import {
  parseLedger,
  type RawLedger,
} from "../core/parsing/parseLedger";
import {
  parseRelations,
  type RawRelations,
} from "../core/parsing/parseRelations";
import type { ParsedSource } from "../core/parsing/ParsedSource";
import type {
  ProjectSource,
  ProjectTextFile,
} from "../core/source/ProjectSource";
import type { SourceRef } from "../core/source/SourceRef";

type TraceabilityParser<T> = (
  file: ProjectTextFile,
  source: SourceRef,
) => ParsedSource<T>;

interface ParseAttempt<T> {
  readonly diagnostics: readonly Diagnostic[];
  readonly parsed?: ParsedSource<T>;
}

export interface CoreTraceabilityParseResult {
  readonly discovery: ProjectDiscoveryManifest;
  readonly diagnostics: readonly Diagnostic[];
  readonly currentIndex?: ParsedSource<RawCurrentIndex>;
  readonly relations?: ParsedSource<RawRelations>;
  readonly ledger?: ParsedSource<RawLedger>;
}

async function readAndParse<T>(
  projectSource: ProjectSource,
  discoveredSource: DiscoveredSource | undefined,
  parser: TraceabilityParser<T>,
): Promise<ParseAttempt<T>> {
  if (discoveredSource === undefined) {
    return { diagnostics: [] };
  }

  try {
    const file = await projectSource.readText(discoveredSource.path);
    const parsed = parser(file, discoveredSource.source);
    return { diagnostics: parsed.diagnostics, parsed };
  } catch (cause: unknown) {
    const detail = cause instanceof Error ? ` ${cause.message}` : "";
    return {
      diagnostics: [
        {
          code: "PARSE_APPLICATION_READ_FAILED",
          severity: "error",
          message: `Core traceability source read failed: ${discoveredSource.path}.${detail}`,
          source: discoveredSource.source,
        },
      ],
    };
  }
}

export async function loadCoreTraceability(
  projectSource: ProjectSource,
): Promise<CoreTraceabilityParseResult> {
  const discovery = await discoverProject(projectSource);
  const currentIndexAttempt = await readAndParse(
    projectSource,
    discovery.coreTraceability.currentIndex,
    parseCurrentIndex,
  );
  const relationsAttempt = await readAndParse(
    projectSource,
    discovery.coreTraceability.relations,
    parseRelations,
  );
  const ledgerAttempt = await readAndParse(
    projectSource,
    discovery.coreTraceability.ledger,
    parseLedger,
  );

  return {
    discovery,
    diagnostics: [
      ...discovery.diagnostics,
      ...currentIndexAttempt.diagnostics,
      ...relationsAttempt.diagnostics,
      ...ledgerAttempt.diagnostics,
    ],
    ...(currentIndexAttempt.parsed === undefined
      ? {}
      : { currentIndex: currentIndexAttempt.parsed }),
    ...(relationsAttempt.parsed === undefined
      ? {}
      : { relations: relationsAttempt.parsed }),
    ...(ledgerAttempt.parsed === undefined
      ? {}
      : { ledger: ledgerAttempt.parsed }),
  };
}
