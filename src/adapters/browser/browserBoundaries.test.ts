import { describe, expect, it } from "vitest";

const browserSources = import.meta.glob(["./*.ts"], {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const nonBrowserSources = import.meta.glob(
  [
    "../../core/**/*.ts",
    "../../application/**/*.ts",
    "../fixtures/**/*.ts",
    "../../ui/**/*.ts",
    "../../ui/**/*.tsx",
    "../../main.tsx",
  ],
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>;

const uiSources = import.meta.glob(
  ["../../ui/**/*.ts", "../../ui/**/*.tsx", "../../main.tsx"],
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>;

function implementationEntries(sources: Record<string, string>) {
  return Object.entries(sources).filter(
    ([path]) => !/\.test\.(?:ts|tsx)$/.test(path),
  );
}

describe("SLC-008 browser adapter boundaries", () => {
  it("keeps browser handle and permission types inside the browser adapter", () => {
    for (const [path, source] of implementationEntries(nonBrowserSources)) {
      expect(source, path).not.toMatch(
        /\b(?:BrowserFileSystem(?:DirectoryHandle|FileHandle|Handle)|FileSystemDirectoryHandle|FileSystemFileHandle|queryPermission|showDirectoryPicker)\b/,
      );
    }
  });

  it("contains capability detection but no picker or permission-request invocation", () => {
    for (const [path, source] of implementationEntries(browserSources)) {
      expect(source, path).not.toMatch(/\bshowDirectoryPicker\s*\(/);
      expect(source, path).not.toMatch(
        /\brequestPermission\b|\bcreateWritable\b|\bFileSystemWritableFileStream\b|\breadwrite\b|mode\s*:\s*["']write["']/,
      );
      expect(source, path).not.toMatch(/\buserAgent\b/);
    }
  });

  it("keeps the adapter free of UI, Node filesystem, network, telemetry, and persistence APIs", () => {
    for (const [path, source] of implementationEntries(browserSources)) {
      expect(source, path).not.toMatch(
        /from\s+["'](?:react|react-dom|SharedUI|node:fs|fs)(?:\/[^"']*)?["']/,
      );
      expect(source, path).not.toMatch(
        /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bsendBeacon\b|\bindexedDB\b|\blocalStorage\b|\bsessionStorage\b|\beval\s*\(|\bFunction\s*\(/,
      );
    }
  });

  it("adds no UI or picker integration", () => {
    for (const [path, source] of implementationEntries(uiSources)) {
      expect(source, path).not.toMatch(
        /adapters\/browser|\bBrowserDirectoryProjectSource\b|\bshowDirectoryPicker\b/,
      );
    }
  });
});
