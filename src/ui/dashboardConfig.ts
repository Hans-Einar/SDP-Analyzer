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
        title: "Bundled source smoke path",
        description:
          "SLC-001 proves read-only fixture access through the ProjectSource boundary.",
      },
    },
    {
      kind: "component",
      ref: "Section",
      props: {
        eyebrow: "SLC-001",
        title: "Fixture source boundary",
        body:
          "This shell lists and reads a deterministic in-memory text fixture. Parsing and validation are intentionally deferred.",
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
          { label: "Read result", value: source.preview.text.trim() },
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
