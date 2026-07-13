import { describe, expect, it, vi } from "vitest";
import { bundledFixtureSource } from "../adapters/fixtures/bundledFixtureSource";
import type { ProjectSource } from "../core/source/ProjectSource";
import type { ProjectAnalysis } from "./analyzeProject";
import { analyzeProject } from "./analyzeProject";
import { createAnalysisController } from "./analysisController";

const context = { analyzerVersion: "0.1.0", profileId: "sdp-tier-1", analysisTime: "fixed" };
const source = (name: string): ProjectSource => ({ ...bundledFixtureSource, sourceId: `fixture:${name}`, displayName: name });

describe("analysis controller", () => {
  it("owns idle, loading, ready, and failed lifecycle while clearing stale success", async () => {
    const result = await analyzeProject(bundledFixtureSource, context);
    let resolve!: (value: ProjectAnalysis) => void;
    const pending = new Promise<ProjectAnalysis>((done) => { resolve = done; });
    const run = vi.fn().mockResolvedValueOnce(result).mockReturnValueOnce(pending).mockRejectedValueOnce(new Error("private"));
    const firstSource = source("first");
    const secondSource = source("second");
    const thirdSource = source("third");
    const controller = createAnalysisController(firstSource, context, run);
    expect(controller.getState()).toEqual({ status: "idle", selectedSource: firstSource });
    await controller.analyzeSelected();
    expect(controller.getState()).toMatchObject({ status: "ready", selectedSource: firstSource, analysis: result });
    controller.selectSource(secondSource);
    expect(controller.getState()).toEqual({ status: "idle", selectedSource: secondSource });
    const second = controller.analyzeSelected();
    expect(controller.getState()).toEqual({ status: "loading", selectedSource: secondSource });
    resolve(result);
    await second;
    controller.selectSource(thirdSource);
    const third = controller.analyzeSelected();
    expect(controller.getState()).toEqual({ status: "loading", selectedSource: thirdSource });
    await third;
    expect(controller.getState()).toEqual({ status: "failed", selectedSource: thirdSource, message: "The selected fixture could not be analyzed." });
  });

  it("deterministically ignores completion from a superseded run", async () => {
    const result = await analyzeProject(bundledFixtureSource, context);
    let resolveFirst!: (value: ProjectAnalysis) => void;
    let rejectFirst!: (reason: unknown) => void;
    const first = new Promise<ProjectAnalysis>((resolve, reject) => { resolveFirst = resolve; rejectFirst = reject; });
    const run = vi.fn().mockReturnValueOnce(first).mockResolvedValueOnce(result);
    const oldSource = source("old");
    const newSource = source("new");
    const controller = createAnalysisController(oldSource, context, run);
    const oldRun = controller.analyzeSelected();
    controller.selectSource(newSource);
    await controller.analyzeSelected();
    resolveFirst(result);
    await oldRun;
    expect(controller.getState()).toMatchObject({ status: "ready", selectedSource: newSource });

    const controller2 = createAnalysisController(oldSource, context, vi.fn().mockReturnValueOnce(new Promise<ProjectAnalysis>((_, reject) => { rejectFirst = reject; })).mockResolvedValueOnce(result));
    const rejectedOldRun = controller2.analyzeSelected();
    controller2.selectSource(newSource);
    await controller2.analyzeSelected();
    rejectFirst(new Error("late failure"));
    await rejectedOldRun;
    expect(controller2.getState()).toMatchObject({ status: "ready", selectedSource: newSource });
  });

  it("publishes changes to subscribers and stops after unsubscribe", async () => {
    const result = await analyzeProject(bundledFixtureSource, context);
    const controller = createAnalysisController(source("one"), context, vi.fn().mockResolvedValue(result));
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);
    await controller.analyzeSelected();
    expect(listener.mock.calls.map(([state]) => state.status)).toEqual(["loading", "ready"]);
    unsubscribe();
    controller.selectSource(source("two"));
    await controller.analyzeSelected();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
