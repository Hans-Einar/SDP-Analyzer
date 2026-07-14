import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardRenderer } from "SharedUI/renderer";
import { bundledFixtureSource } from "../adapters/fixtures/bundledFixtureSource";
import { brokenFixtureSource } from "../adapters/fixtures/brokenFixtureSource";
import { analyzeProject } from "../application/analyzeProject";
import { createAnalysisController, type AnalysisLifecycle } from "../application/analysisController";
import type { ProjectSource } from "../core/source/ProjectSource";
import { AnalysisViewProvider } from "./AnalyzerWorkflow";
import { analyzerComponentRegistry, analyzerDashboard } from "./dashboardConfig";

const ANALYSIS_CONTEXT = Object.freeze({
  analyzerVersion: "0.1.0", profileId: "sdp-toolkit-structured-core-v1", analysisTime: "2026-07-13T00:00:00Z",
});

export interface AppProps {
  readonly source?: ProjectSource;
  readonly analyze?: typeof analyzeProject;
}

export function App({ source = bundledFixtureSource, analyze = analyzeProject }: AppProps) {
  const controller = useMemo(() => createAnalysisController(bundledFixtureSource, ANALYSIS_CONTEXT, analyze), [analyze]);
  const availableSources = useMemo(() => {
    const sourcesById = new Map(
      [bundledFixtureSource, brokenFixtureSource, source].map((candidate) => [
        candidate.sourceId,
        candidate,
      ]),
    );
    return Object.freeze([...sourcesById.values()]);
  }, [source]);
  const [lifecycle, setLifecycle] = useState<AnalysisLifecycle>(() => controller.getState());
  const onAnalyzeSelected = useCallback(() => {
    void controller.analyzeSelected();
  }, [controller]);
  const onSelectSource = useCallback(
    (sourceId: string) => {
      const selected = availableSources.find(
        (candidate) => candidate.sourceId === sourceId,
      );
      if (selected === undefined) {
        return;
      }

      controller.selectSource(selected);
      void controller.analyzeSelected();
    },
    [availableSources, controller],
  );
  useEffect(() => {
    setLifecycle(controller.getState());
    const unsubscribe = controller.subscribe(setLifecycle);
    controller.selectSource(source);
    void controller.analyzeSelected();
    return unsubscribe;
  }, [controller, source]);

  return (
    <AnalysisViewProvider
      value={{
        lifecycle,
        availableSources,
        onAnalyzeSelected,
        onSelectSource,
      }}
    >
      <DashboardRenderer componentRegistry={analyzerComponentRegistry} config={analyzerDashboard.config}
        development={import.meta.env.DEV} validatorRegistry={analyzerDashboard.validatorRegistry} />
    </AnalysisViewProvider>
  );
}
