import {
  baselineComponentRegistry,
  defineDashboardConfig,
} from "SharedUI";
import type {
  DashboardNode,
  StateValidatorRegistry,
} from "SharedUI/schema";
import type { SourcePreview } from "../application/loadSourcePreview";

type AnalyzerDashboardState = {
  selectedSource: string;
};

export interface DashboardSourceState {
  readonly displayName: string;
  readonly error?: string;
  readonly preview?: SourcePreview;
  readonly sourceId: string;
}

export const analyzerComponentRegistry = {
  ...baselineComponentRegistry,
};

function createSourceChildren(source: DashboardSourceState): DashboardNode[] {
  const children: DashboardNode[] = [
    {
      kind: "component",
      ref: "PageHeader",
      props: {
        title: "Bundled discovery smoke path",
        description:
          "SLC-002 discovers canonical SDP project evidence without parsing file contents.",
      },
    },
    {
      kind: "component",
      ref: "Section",
      props: {
        eyebrow: "SLC-002",
        title: "Read-only source and discovery boundary",
        body:
          "The source exposes a deterministic 14-file SDP fixture. Discovery classifies paths and reports profile support; parsing and validation remain deferred.",
      },
    },
  ];

  if (source.error !== undefined) {
    children.push({
      kind: "component",
      ref: "AlertBanner",
      props: {
        title: "Fixture source unavailable",
        message: source.error,
        tone: "danger",
      },
    });
    return children;
  }

  if (source.preview === undefined) {
    children.push(
      {
        kind: "component",
        ref: "Badge",
        props: { label: "Loading fixture", tone: "info" },
      },
      {
        kind: "component",
        ref: "CardSkeleton",
        props: { label: `Reading ${source.displayName}` },
      },
    );
    return children;
  }

  children.push(
    {
      kind: "component",
      ref: "Badge",
      props: { label: "Fixture ready", tone: "success" },
    },
    {
      kind: "component",
      ref: "DetailPanel",
      props: {
        title: "Bundled source",
        items: [
          { label: "Name", value: source.preview.displayName },
          { label: "Source ID", value: source.preview.sourceId },
          { label: "Files", value: String(source.preview.fileCount) },
          { label: "First file", value: source.preview.firstFilePath },
          {
            label: "Core traceability",
            value: `${source.preview.coreTraceabilityPaths.length}/3`,
          },
          { label: "Profile support", value: source.preview.profileSupport },
          {
            label: "Discovery diagnostics",
            value: String(source.preview.discoveryDiagnosticCount),
          },
          { label: "Sample read", value: source.preview.text.trim() },
        ],
      },
    },
  );

  return children;
}

export function createAnalyzerDashboard(source: DashboardSourceState) {
  const validatorRegistry: StateValidatorRegistry = {
    selectedSource: (
      value: unknown,
    ): value is AnalyzerDashboardState["selectedSource"] =>
      value === source.sourceId,
  };

  const config = defineDashboardConfig<AnalyzerDashboardState>({
    state: {
      selectedSource: source.sourceId,
    },
    statePolicy: {
      selectedSource: {
        owner: "system",
        allowedUpdateSources: ["trusted-runtime"],
        validatorKey: "selectedSource",
        defaultValue: source.sourceId,
      },
    },
    layout: {
      topBar: { view: "analyzerTopBar" },
      main: { view: "fixtureSource" },
    },
    views: {
      analyzerTopBar: {
        type: "stack",
        children: [
          {
            kind: "component",
            ref: "TopNav",
            props: {
              title: "SDP Analyzer",
              subtitle: "Read-only repository evidence",
              statusLabel: "Fixture mode",
            },
          },
        ],
      },
      fixtureSource: {
        type: "stack",
        children: createSourceChildren(source),
      },
    },
  });

  return { config, validatorRegistry };
}
