import type { ProjectSource } from "../core/source/ProjectSource";
import type { AnalysisContext } from "../core/validation/AnalysisContext";
import { analyzeProject, type ProjectAnalysis } from "./analyzeProject";

export type AnalysisLifecycle =
  | { readonly status: "idle"; readonly selectedSource: ProjectSource }
  | { readonly status: "loading"; readonly selectedSource: ProjectSource }
  | { readonly status: "ready"; readonly selectedSource: ProjectSource; readonly analysis: ProjectAnalysis }
  | { readonly status: "failed"; readonly selectedSource: ProjectSource; readonly message: string };

export type AnalyzeProject = typeof analyzeProject;
export type AnalysisListener = (lifecycle: AnalysisLifecycle) => void;

export interface AnalysisController {
  readonly getState: () => AnalysisLifecycle;
  readonly subscribe: (listener: AnalysisListener) => () => void;
  readonly selectSource: (source: ProjectSource) => void;
  readonly analyzeSelected: () => Promise<void>;
}

const SAFE_FAILURE_MESSAGE = "The selected fixture could not be analyzed.";

export function createAnalysisController(
  initialSource: ProjectSource,
  context: AnalysisContext,
  runAnalysis: AnalyzeProject = analyzeProject,
): AnalysisController {
  let lifecycle: AnalysisLifecycle = Object.freeze({ status: "idle", selectedSource: initialSource });
  let latestRun = 0;
  const listeners = new Set<AnalysisListener>();
  const publish = (next: AnalysisLifecycle) => {
    lifecycle = Object.freeze(next);
    listeners.forEach((listener) => listener(lifecycle));
  };

  return Object.freeze({
    getState: () => lifecycle,
    subscribe(listener: AnalysisListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    selectSource(source: ProjectSource) {
      latestRun += 1;
      publish({ status: "idle", selectedSource: source });
    },
    async analyzeSelected() {
      const source = lifecycle.selectedSource;
      const run = ++latestRun;
      publish({ status: "loading", selectedSource: source });
      try {
        const analysis = await runAnalysis(source, context);
        if (run === latestRun) publish({ status: "ready", selectedSource: source, analysis });
      } catch {
        if (run === latestRun) publish({ status: "failed", selectedSource: source, message: SAFE_FAILURE_MESSAGE });
      }
    },
  });
}
