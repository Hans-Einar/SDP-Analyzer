import { describe, expect, it } from "vitest";

const belowUiSources = import.meta.glob(
  ["../core/**/*.ts", "./**/*.ts", "../adapters/**/*.ts"],
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>;

const uiSources = import.meta.glob(["../ui/**/*.ts", "../ui/**/*.tsx"], {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const productSources = import.meta.glob(
  [
    "../core/**/*.ts",
    "./**/*.ts",
    "../adapters/**/*.ts",
    "../ui/**/*.ts",
    "../ui/**/*.tsx",
    "../main.tsx",
  ],
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>;

function implementationEntries(sources: Record<string, string>) {
  return Object.entries(sources).filter(
    ([path]) => !/\.test\.(?:ts|tsx)$/.test(path),
  );
}

describe("Tier 1 production boundaries", () => {
  it("imports the SharedUI stylesheet exactly once from the application entry", () => {
    const imports = implementationEntries(productSources).flatMap(
      ([path, source]) =>
        /import\s+["']SharedUI\/styles\.css["']/.test(source) ? [path] : [],
    );

    expect(imports).toEqual(["../main.tsx"]);
  });

  it("keeps React and SharedUI absent below the UI boundary", () => {
    for (const [path, source] of implementationEntries(belowUiSources)) {
      expect(source, path).not.toMatch(
        /(?:from\s+["'](?:react|react-dom|SharedUI)(?:\/[^"']*)?["']|import\s+["']SharedUI(?:\/[^"']*)?["'])/,
      );
    }
  });

  it("keeps parsing, normalization and validation decisions outside React", () => {
    for (const [path, source] of implementationEntries(uiSources)) {
      expect(source, path).not.toMatch(
        /\bparseCurrentIndex\b|\bparseRelations\b|\bparseLedger\b|\bnormalizeTraceability\b|\bvalidateSnapshot\b|\bJSON\.parse\s*\(/,
      );
    }
  });

  it("contains no filesystem acquisition, graph, report-export or write-back implementation", () => {
    for (const [path, source] of implementationEntries(productSources)) {
      expect(source, path).not.toMatch(
        /FileSystemDirectoryHandle|showDirectoryPicker|(?:from\s+["'](?:node:fs|fs)["'])|\bwriteFile\b|\bappendFile\b|\bcreateWriteStream\b|\breactflow\b|\bcytoscape\b|\bgraphlib\b|\bexportReport\b|\bdownloadReport\b/,
      );
    }
  });
});
