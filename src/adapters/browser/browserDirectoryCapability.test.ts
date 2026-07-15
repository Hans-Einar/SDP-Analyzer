import { describe, expect, it, vi } from "vitest";
import {
  BROWSER_DIRECTORY_UNSUPPORTED_REASON,
  detectBrowserDirectoryCapability,
} from "./browserDirectoryCapability";

describe("detectBrowserDirectoryCapability", () => {
  it("reports support when the browser acquisition surface is callable", () => {
    const picker = vi.fn();

    expect(
      detectBrowserDirectoryCapability({
        window: { showDirectoryPicker: picker },
        navigator: {},
      }),
    ).toEqual({ supported: true });
    expect(picker).not.toHaveBeenCalled();
  });

  it("returns one stable unsupported result without browser globals", () => {
    expect(detectBrowserDirectoryCapability({})).toEqual({
      supported: false,
      reason: BROWSER_DIRECTORY_UNSUPPORTED_REASON,
    });
    expect(
      detectBrowserDirectoryCapability({ window: {}, navigator: {} }),
    ).toEqual({
      supported: false,
      reason: BROWSER_DIRECTORY_UNSUPPORTED_REASON,
    });
  });

  it("does not invoke the picker or rely on user-agent data", () => {
    const picker = vi.fn(() => {
      throw new Error("The capability check must not invoke the picker.");
    });
    const navigator = {
      get userAgent(): never {
        throw new Error("Capability detection must not inspect user-agent data.");
      },
    };

    expect(
      detectBrowserDirectoryCapability({
        window: { showDirectoryPicker: picker },
        navigator,
      }),
    ).toEqual({ supported: true });
    expect(picker).not.toHaveBeenCalled();
  });

  it("treats an inaccessible picker property as unsupported", () => {
    const window = Object.defineProperty({}, "showDirectoryPicker", {
      get() {
        throw new Error("hidden browser detail");
      },
    });

    expect(
      detectBrowserDirectoryCapability({ window, navigator: {} }),
    ).toEqual({
      supported: false,
      reason: BROWSER_DIRECTORY_UNSUPPORTED_REASON,
    });
  });
});
