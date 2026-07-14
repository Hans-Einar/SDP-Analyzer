import { baselineComponentRegistry, defineDashboardConfig } from "SharedUI";
import type { StateValidatorRegistry } from "SharedUI/schema";
import { AnalyzerWorkflow, SourceSelector } from "./AnalyzerWorkflow";

type AnalyzerDashboardState = Record<never, never>;

export const analyzerComponentRegistry = {
  ...baselineComponentRegistry,
  SourceSelector: { kind: "custom" as const, component: SourceSelector },
  AnalyzerWorkflow: { kind: "custom" as const, component: AnalyzerWorkflow },
};

const validatorRegistry: StateValidatorRegistry = {};
const config = defineDashboardConfig<AnalyzerDashboardState>({
  state: {},
  statePolicy: {},
  layout: {
    topBar: { view: "analyzerTopBar" },
    main: { view: "analysis" },
  },
  views: {
    analyzerTopBar: {
      type: "stack",
      children: [{
          kind: "component", ref: "TopNav", props: {
            title: "SDP Analyzer", subtitle: "Read-only repository evidence", statusLabel: "Structured-core fixture mode",
          },
      }],
    },
    analysis: { type: "stack", children: [
      { kind: "component", ref: "SourceSelector" },
      { kind: "component", ref: "AnalyzerWorkflow" },
    ] },
  },
});

export const analyzerDashboard = Object.freeze({ config, validatorRegistry });
