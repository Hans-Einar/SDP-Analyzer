// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

afterEach(cleanup);

describe("App", () => {
  it("renders the SharedUI shell and identifies the bundled fixture source", async () => {
    render(<App />);

    expect(screen.getByText("SDP Analyzer")).toBeInTheDocument();
    expect(await screen.findByText("Bundled minimal SDP fixture")).toBeInTheDocument();
    expect(screen.getByText("SDP/Fixture.txt")).toBeInTheDocument();
    expect(screen.getByText("Fixture ready")).toBeInTheDocument();
  });
});

