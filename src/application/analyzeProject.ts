import type { Diagnostic } from "../core/diagnostics/Diagnostic";
import type { ProjectSnapshot } from "../core/domain/ProjectSnapshot";
import type { Finding } from "../core/findings/Finding";
import type { ProjectDiscoveryManifest } from "../core/discovery/ProjectDiscoveryManifest";
import type { ProjectSource } from "../core/source/ProjectSource";
import type { AnalysisContext } from "../core/validation/AnalysisContext";
import { validateSnapshot } from "../core/validation/validateSnapshot";
import { loadProjectSnapshot } from "./loadProjectSnapshot";
export interface ProjectAnalysis { readonly discovery: ProjectDiscoveryManifest; readonly snapshot: ProjectSnapshot; readonly findings: readonly Finding[]; readonly validationDiagnostics: readonly Diagnostic[]; }
export async function analyzeProject(source: ProjectSource, context: AnalysisContext): Promise<ProjectAnalysis> { const loaded = await loadProjectSnapshot(source); const validation = validateSnapshot(loaded.snapshot, context); return Object.freeze({ discovery: loaded.discovery, snapshot: loaded.snapshot, findings: validation.findings, validationDiagnostics: validation.diagnostics }); }
