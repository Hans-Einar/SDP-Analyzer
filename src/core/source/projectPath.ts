export type ProjectPathErrorCode =
  | "empty-path"
  | "absolute-path"
  | "drive-letter-path"
  | "dot-segment"
  | "parent-segment";

export interface ProjectPathError {
  readonly code: ProjectPathErrorCode;
  readonly input: string;
  readonly message: string;
}

export type ProjectPathNormalizationResult =
  | { readonly ok: true; readonly path: string }
  | { readonly ok: false; readonly error: ProjectPathError };

function pathError(
  code: ProjectPathErrorCode,
  input: string,
  message: string,
): ProjectPathNormalizationResult {
  return { ok: false, error: { code, input, message } };
}

export function normalizeProjectPath(
  input: string,
): ProjectPathNormalizationResult {
  if (input.length === 0) {
    return pathError("empty-path", input, "Project paths must not be empty.");
  }

  const slashNormalized = input.replaceAll("\\", "/");

  if (/^[A-Za-z]:/.test(slashNormalized)) {
    return pathError(
      "drive-letter-path",
      input,
      "Project paths must not use a drive letter.",
    );
  }

  if (slashNormalized.startsWith("/")) {
    return pathError(
      "absolute-path",
      input,
      "Project paths must be relative to the source root.",
    );
  }

  const segments = slashNormalized.split("/");

  if (segments.includes(".")) {
    return pathError(
      "dot-segment",
      input,
      'Project paths must not contain a "." segment.',
    );
  }

  if (segments.includes("..")) {
    return pathError(
      "parent-segment",
      input,
      'Project paths must not contain a ".." segment or escape the source root.',
    );
  }

  const path = segments.filter((segment) => segment.length > 0).join("/");

  if (path.length === 0) {
    return pathError("empty-path", input, "Project paths must not be empty.");
  }

  return { ok: true, path };
}

export function compareProjectPaths(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
