import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { SourceKind, SourceRef } from "../source/SourceRef";

export type ProjectProfileSupport =
  | "supported"
  | "partial"
  | "unsupported"
  | "unknown";

export interface DiscoveredSource {
  readonly path: string;
  readonly kind: SourceKind;
  readonly source: SourceRef;
}

export interface CoreTraceabilityDiscovery {
  readonly currentIndex?: DiscoveredSource;
  readonly relations?: DiscoveredSource;
  readonly ledger?: DiscoveredSource;
}

export interface StandardDirectoryDiscovery {
  readonly lifecycle: readonly string[];
  readonly sprintsPresent: boolean;
  readonly verificationPresent: boolean;
  readonly codeReviewPresent: boolean;
  readonly traceabilityPresent: boolean;
}

export interface ProjectDiscoveryManifest {
  readonly sourceId: string;
  readonly files: readonly DiscoveredSource[];
  readonly coreTraceability: CoreTraceabilityDiscovery;
  readonly standardDirectories: StandardDirectoryDiscovery;
  readonly profile: {
    readonly id: string;
    readonly support: ProjectProfileSupport;
  };
  readonly diagnostics: readonly Diagnostic[];
}
