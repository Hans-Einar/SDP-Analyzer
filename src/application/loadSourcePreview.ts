import type { ProjectSource } from "../core/source/ProjectSource";
import { discoverProject } from "../core/discovery/discoverProject";
import type { ProjectProfileSupport } from "../core/discovery/ProjectDiscoveryManifest";

export interface SourcePreview {
  readonly displayName: string;
  readonly discoveryDiagnosticCount: number;
  readonly fileCount: number;
  readonly firstFilePath: string;
  readonly coreTraceabilityPaths: readonly string[];
  readonly profileSupport: ProjectProfileSupport;
  readonly sourceId: string;
  readonly text: string;
}

export async function loadSourcePreview(
  source: ProjectSource,
): Promise<SourcePreview> {
  const discovery = await discoverProject(source);
  const firstEntry = discovery.files[0];

  if (firstEntry === undefined) {
    throw new Error("The selected fixture source contains no files.");
  }

  const file = await source.readText(firstEntry.path);
  const coreTraceabilityPaths = [
    discovery.coreTraceability.currentIndex?.path,
    discovery.coreTraceability.relations?.path,
    discovery.coreTraceability.ledger?.path,
  ].filter((path): path is string => path !== undefined);

  return {
    displayName: source.displayName,
    discoveryDiagnosticCount: discovery.diagnostics.length,
    fileCount: discovery.files.length,
    firstFilePath: file.path,
    coreTraceabilityPaths,
    profileSupport: discovery.profile.support,
    sourceId: source.sourceId,
    text: file.text,
  };
}
