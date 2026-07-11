import { useEffect, useState } from "react";
import { DashboardRenderer } from "SharedUI/renderer";
import {
  BUNDLED_FIXTURE_DISPLAY_NAME,
  BUNDLED_FIXTURE_SOURCE_ID,
  bundledFixtureSource,
} from "../adapters/fixtures/bundledFixtureSource";
import {
  loadSourcePreview,
  type SourcePreview,
} from "../application/loadSourcePreview";
import {
  analyzerComponentRegistry,
  createAnalyzerDashboard,
} from "./dashboardConfig";

export function App() {
  const [preview, setPreview] = useState<SourcePreview>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;

    void loadSourcePreview(bundledFixtureSource).then(
      (loadedPreview) => {
        if (active) {
          setPreview(loadedPreview);
        }
      },
      (cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : "Fixture source read failed.",
          );
        }
      },
    );

    return () => {
      active = false;
    };
  }, []);

  const { config, validatorRegistry } = createAnalyzerDashboard({
    displayName: BUNDLED_FIXTURE_DISPLAY_NAME,
    sourceId: BUNDLED_FIXTURE_SOURCE_ID,
    ...(preview === undefined ? {} : { preview }),
    ...(error === undefined ? {} : { error }),
  });

  return (
    <DashboardRenderer
      componentRegistry={analyzerComponentRegistry}
      config={config}
      development={import.meta.env.DEV}
      validatorRegistry={validatorRegistry}
    />
  );
}

