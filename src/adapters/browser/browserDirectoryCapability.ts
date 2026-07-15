export interface BrowserDirectoryCapability {
  readonly supported: boolean;
  readonly reason?: string;
}

export const BROWSER_DIRECTORY_UNSUPPORTED_REASON =
  "Browser directory selection is unavailable because this runtime does not expose the required File System Access API.";

interface BrowserDirectoryCapabilityEnvironment {
  readonly window?: unknown;
  readonly navigator?: unknown;
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return (
    (typeof value === "object" && value !== null) ||
    typeof value === "function"
  );
}

/**
 * Detects the user-gesture acquisition surface without invoking it. Permission
 * on an already-selected handle is deliberately inspected by the source
 * adapter instead.
 */
export function detectBrowserDirectoryCapability(
  environment: BrowserDirectoryCapabilityEnvironment = globalThis,
): BrowserDirectoryCapability {
  if (!isObject(environment.window) || !isObject(environment.navigator)) {
    return Object.freeze({
      supported: false,
      reason: BROWSER_DIRECTORY_UNSUPPORTED_REASON,
    });
  }

  let pickerCapability: unknown;

  try {
    pickerCapability = environment.window.showDirectoryPicker;
  } catch {
    return Object.freeze({
      supported: false,
      reason: BROWSER_DIRECTORY_UNSUPPORTED_REASON,
    });
  }

  return typeof pickerCapability === "function"
    ? Object.freeze({ supported: true })
    : Object.freeze({
        supported: false,
        reason: BROWSER_DIRECTORY_UNSUPPORTED_REASON,
      });
}
