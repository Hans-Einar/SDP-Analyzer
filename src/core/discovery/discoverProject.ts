import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { ProjectSource } from "../source/ProjectSource";
import {
  compareProjectPaths,
  normalizeProjectPath,
} from "../source/projectPath";
import type { SourceKind } from "../source/SourceRef";
import type {
  CoreTraceabilityDiscovery,
  DiscoveredSource,
  ProjectDiscoveryManifest,
} from "./ProjectDiscoveryManifest";

export const CURRENT_SDP_PROFILE_ID = "sdp-toolkit-structured-core-v1";

export const CORE_TRACEABILITY_PATHS = {
  currentIndex: "SDP/Traceability/CurrentIndex.yaml",
  relations: "SDP/Traceability/Relations.yaml",
  ledger: "SDP/Traceability/Ledger.ndjson",
} as const;

const LIFECYCLE_DIRECTORIES = [
  "SDP/01--Mandate",
  "SDP/02--Study",
  "SDP/03--Requirements",
  "SDP/04--Architecture",
  "SDP/05--DesignAnalysis",
  "SDP/06--Design",
  "SDP/07--Implementation",
] as const;

function classifySourceKind(path: string): SourceKind {
  const lowerPath = path.toLowerCase();

  if (lowerPath.endsWith(".ndjson")) {
    return "ndjson";
  }

  if (lowerPath.endsWith(".yaml") || lowerPath.endsWith(".yml")) {
    return "yaml";
  }

  if (lowerPath.endsWith(".json")) {
    return "json";
  }

  if (lowerPath.endsWith(".md") || lowerPath.endsWith(".markdown")) {
    return "markdown";
  }

  return "synthetic";
}

function hasDirectory(files: readonly DiscoveredSource[], directory: string) {
  const prefix = `${directory}/`;
  return files.some((file) => file.path.startsWith(prefix));
}

function compareDiagnostics(left: Diagnostic, right: Diagnostic): number {
  const codeOrder = compareProjectPaths(left.code, right.code);
  return codeOrder === 0
    ? compareProjectPaths(left.message, right.message)
    : codeOrder;
}

function createManifest(
  sourceId: string,
  files: readonly DiscoveredSource[],
  diagnostics: readonly Diagnostic[],
): ProjectDiscoveryManifest {
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const currentIndex = filesByPath.get(CORE_TRACEABILITY_PATHS.currentIndex);
  const relations = filesByPath.get(CORE_TRACEABILITY_PATHS.relations);
  const ledger = filesByPath.get(CORE_TRACEABILITY_PATHS.ledger);

  const coreTraceability: CoreTraceabilityDiscovery = {
    ...(currentIndex === undefined ? {} : { currentIndex }),
    ...(relations === undefined ? {} : { relations }),
    ...(ledger === undefined ? {} : { ledger }),
  };

  const missingCorePaths = [
    currentIndex === undefined ? CORE_TRACEABILITY_PATHS.currentIndex : undefined,
    relations === undefined ? CORE_TRACEABILITY_PATHS.relations : undefined,
    ledger === undefined ? CORE_TRACEABILITY_PATHS.ledger : undefined,
  ].filter((path) => path !== undefined);

  const missingCoreDiagnostics: Diagnostic[] = missingCorePaths.map((path) => ({
    code: "DISCOVERY_MISSING_CORE_SOURCE",
    severity: "warning",
    message: `Required core traceability source is missing: ${path}`,
  }));

  return {
    sourceId,
    files,
    coreTraceability,
    standardDirectories: {
      lifecycle: LIFECYCLE_DIRECTORIES.filter((directory) =>
        hasDirectory(files, directory),
      ),
      sprintsPresent: hasDirectory(files, "SDP/Sprints"),
      verificationPresent: hasDirectory(files, "SDP/Verification"),
      codeReviewPresent: hasDirectory(files, "SDP/CodeReview"),
      traceabilityPresent: hasDirectory(files, "SDP/Traceability"),
    },
    profile: {
      id: CURRENT_SDP_PROFILE_ID,
      support: missingCorePaths.length === 0 ? "supported" : "partial",
    },
    diagnostics: [...diagnostics, ...missingCoreDiagnostics].sort(
      compareDiagnostics,
    ),
  };
}

export async function discoverProject(
  source: ProjectSource,
): Promise<ProjectDiscoveryManifest> {
  let entries;

  try {
    entries = await source.listFiles();
  } catch (cause: unknown) {
    const detail = cause instanceof Error ? ` ${cause.message}` : "";
    return {
      sourceId: source.sourceId,
      files: [],
      coreTraceability: {},
      standardDirectories: {
        lifecycle: [],
        sprintsPresent: false,
        verificationPresent: false,
        codeReviewPresent: false,
        traceabilityPresent: false,
      },
      profile: {
        id: CURRENT_SDP_PROFILE_ID,
        support: "unknown",
      },
      diagnostics: [
        {
          code: "DISCOVERY_SOURCE_LIST_FAILED",
          severity: "error",
          message: `Project source file listing failed.${detail}`,
        },
      ],
    };
  }

  const diagnostics: Diagnostic[] = [];
  const candidates: Array<DiscoveredSource & { readonly inputPath: string }> = [];

  for (const entry of entries) {
    const normalized = normalizeProjectPath(entry.path);

    if (!normalized.ok) {
      diagnostics.push({
        code: "DISCOVERY_INVALID_PROJECT_PATH",
        severity: "error",
        message: `${normalized.error.message} Received: ${JSON.stringify(entry.path)}`,
      });
      continue;
    }

    const kind = classifySourceKind(normalized.path);
    const sourceRef = {
      sourceId: source.sourceId,
      path: normalized.path,
      kind,
    } as const;

    candidates.push({
      inputPath: entry.path,
      path: normalized.path,
      kind,
      source: sourceRef,
    });

    if (kind === "synthetic") {
      diagnostics.push({
        code: "DISCOVERY_UNRECOGNIZED_SOURCE_KIND",
        severity: "info",
        message: `Source extension is not recognized: ${normalized.path}`,
        source: sourceRef,
      });
    }
  }

  candidates.sort((left, right) => {
    const pathOrder = compareProjectPaths(left.path, right.path);
    return pathOrder === 0
      ? compareProjectPaths(left.inputPath, right.inputPath)
      : pathOrder;
  });

  const files: DiscoveredSource[] = [];
  let previousPath: string | undefined;

  for (const candidate of candidates) {
    if (candidate.path === previousPath) {
      diagnostics.push({
        code: "DISCOVERY_DUPLICATE_PROJECT_PATH",
        severity: "warning",
        message: `Multiple source entries resolve to the same canonical path: ${candidate.path}`,
        source: candidate.source,
      });
      continue;
    }

    files.push({
      path: candidate.path,
      kind: candidate.kind,
      source: candidate.source,
    });
    previousPath = candidate.path;
  }

  return createManifest(source.sourceId, files, diagnostics);
}
