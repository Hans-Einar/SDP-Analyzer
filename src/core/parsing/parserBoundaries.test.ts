import { describe, expect, it } from "vitest";

const parserModuleSources = import.meta.glob("./*.ts", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

function implementationSources(): readonly [string, string][] {
  return Object.entries(parserModuleSources).filter(
    ([path]) => !path.endsWith(".test.ts"),
  );
}

describe("core parser boundaries", () => {
  it("keeps implementation modules independent of UI, fixtures and platform filesystems", () => {
    const modules = implementationSources();

    expect(modules.length).toBeGreaterThan(0);

    for (const [path, source] of modules) {
      expect(source, path).not.toMatch(
        /(?:from\s+["'](?:react|react-dom|SharedUI|node:fs|node:path|fs|path)["']|import\s+["']SharedUI)/,
      );
      expect(source, path).not.toMatch(
        /FileSystemDirectoryHandle|showDirectoryPicker|\bwindow\.|globalThis\.document|document\.(?:getElementById|querySelector|createElement)/,
      );
      expect(source, path).not.toContain("adapters/fixtures");
      expect(source, path).not.toMatch(
        /\beval\s*\(|\bnew\s+Function\s*\(|\bimport\s*\(/,
      );
    }
  });

  it("contains no SLC-004 normalized model or validation-rule surface", () => {
    for (const [path, source] of implementationSources()) {
      expect(source, path).not.toMatch(
        /\bProjectSnapshot\b|\bLedgerEvent\b|\bValidationRule\b|\bFindingSeverity\b|\bfingerprint\b|\bSDP00[1-8]\b/,
      );
    }
  });
});
