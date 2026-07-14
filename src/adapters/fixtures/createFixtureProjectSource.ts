import type { ProjectSource } from "../../core/source/ProjectSource";
import {
  compareProjectPaths,
  normalizeProjectPath,
} from "../../core/source/projectPath";

export type FixtureSourceReadErrorCode =
  | "unsafe-path"
  | "non-canonical-path"
  | "file-not-found";

export class FixtureSourceReadError extends Error {
  readonly code: FixtureSourceReadErrorCode;
  readonly path: string;

  constructor(code: FixtureSourceReadErrorCode, path: string, message: string) {
    super(message);
    this.name = "FixtureSourceReadError";
    this.code = code;
    this.path = path;
  }
}

interface FixtureProjectSourceOptions {
  readonly sourceId: string;
  readonly displayName: string;
  readonly textByPath: Readonly<Record<string, string>>;
}

/**
 * Creates a deterministic read-only ProjectSource for small bundled fixtures.
 * The copied path/text map is never exposed to analysis consumers.
 */
export function createFixtureProjectSource({
  sourceId,
  displayName,
  textByPath,
}: FixtureProjectSourceOptions): ProjectSource & {
  readonly paths: readonly string[];
} {
  const copiedTextByPath = Object.freeze({ ...textByPath });
  const paths = Object.freeze(
    Object.keys(copiedTextByPath).sort(compareProjectPaths),
  );

  return Object.freeze({
    sourceId,
    displayName,
    paths,
    async listFiles() {
      return paths.map((path) => ({ kind: "file" as const, path }));
    },
    async readText(path: string) {
      const normalized = normalizeProjectPath(path);

      if (!normalized.ok) {
        throw new FixtureSourceReadError(
          "unsafe-path",
          path,
          `Unsafe fixture path: ${normalized.error.message}`,
        );
      }

      if (normalized.path !== path) {
        throw new FixtureSourceReadError(
          "non-canonical-path",
          path,
          `Fixture reads require a canonical path: ${normalized.path}`,
        );
      }

      const text = copiedTextByPath[path];

      if (text === undefined) {
        throw new FixtureSourceReadError(
          "file-not-found",
          path,
          `Fixture file not found: ${path}`,
        );
      }

      return { path, text };
    },
  });
}
