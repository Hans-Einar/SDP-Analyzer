import { describe, expect, it } from "vitest";

const normalizationSources = import.meta.glob("./*.ts", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const domainSources = import.meta.glob("../domain/*.ts", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const applicationSources = import.meta.glob(
  ["../../application/loadProjectSnapshot.ts"],
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
) as Record<string, string>;

function implementations(): readonly [string, string][] {
  return [
    ...Object.entries(normalizationSources),
    ...Object.entries(domainSources),
    ...Object.entries(applicationSources),
  ].filter(([path]) => !path.endsWith(".test.ts"));
}

describe("SLC-004 normalization boundaries", () => {
  it("imports no UI framework, fixture or platform filesystem surface (case 39)", () => {
    const modules = implementations();
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

  it("contains no validation, findings, graph, repair or ambient identity/time behavior (case 40)", () => {
    for (const [path, source] of implementations()) {
      expect(source, path).not.toMatch(
        /\bValidationRule\b|\bFindingSeverity\b|\bfingerprint\b|\bSDP00[1-8]\b|ruleRegistry|healthScore|graphlib|reactflow|cytoscape/,
      );
      expect(source, path).not.toMatch(
        /Date\.now\s*\(|new\s+Date\s*\(|Math\.random\s*\(|randomUUID\s*\(|writeFile|appendFile|createWriteStream/,
      );
    }
  });
});
