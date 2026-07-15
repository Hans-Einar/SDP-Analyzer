import type { Diagnostic } from "../../core/diagnostics/Diagnostic";
import type {
  ProjectFileEntry,
  ProjectSourceAcquisitionListing,
  ProjectSourceAcquisitionSnapshot,
  ProjectSourceWithAcquisitionListing,
  ProjectTextFile,
} from "../../core/source/ProjectSource";
import {
  compareProjectPaths,
  normalizeProjectPath,
} from "../../core/source/projectPath";
import type {
  BrowserFileSystemDirectoryHandle,
  BrowserFileSystemFileHandle,
  BrowserFileSystemHandle,
} from "./fileSystemAccessTypes";

export const DEFAULT_BROWSER_DIRECTORY_DISPLAY_NAME =
  "Selected local directory";

export const BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES = {
  permissionDenied: "PROJECT_SOURCE_ACQUISITION_PERMISSION_DENIED",
  inaccessibleEntry: "PROJECT_SOURCE_ACQUISITION_ENTRY_INACCESSIBLE",
  invalidEntryName: "PROJECT_SOURCE_ACQUISITION_INVALID_ENTRY_NAME",
  unsupportedEntryKind: "PROJECT_SOURCE_ACQUISITION_UNSUPPORTED_ENTRY_KIND",
  duplicateCanonicalPath:
    "PROJECT_SOURCE_ACQUISITION_DUPLICATE_CANONICAL_PATH",
} as const;

export type BrowserDirectoryPermissionState =
  | "granted"
  | "prompt"
  | "denied"
  | "unknown";

export type BrowserDirectorySourceErrorCode =
  | "permission-denied"
  | "source-list-failed"
  | "unsafe-path"
  | "non-canonical-path"
  | "file-not-found"
  | "file-unavailable"
  | "file-read-failed";

export class BrowserDirectorySourceError extends Error {
  readonly code: BrowserDirectorySourceErrorCode;
  readonly path: string | undefined;
  readonly acquisition: ProjectSourceAcquisitionSnapshot | undefined;

  constructor(
    code: BrowserDirectorySourceErrorCode,
    message: string,
    path?: string,
    acquisition?: ProjectSourceAcquisitionSnapshot,
  ) {
    super(message);
    this.name = "BrowserDirectorySourceError";
    this.code = code;
    this.path = path;
    this.acquisition = acquisition;
  }
}

export interface BrowserDirectoryProjectSourceOptions {
  readonly sourceId: string;
  readonly displayName?: string;
}

interface TraversalCandidate {
  readonly path: string;
  readonly handle: BrowserFileSystemHandle;
}

interface TraversalState {
  readonly diagnostics: Diagnostic[];
  readonly fileHandles: Map<string, BrowserFileSystemFileHandle>;
  completeness: "complete" | "partial";
}

const EMPTY_DIAGNOSTICS: readonly Diagnostic[] = Object.freeze([]);

function compareDiagnostics(left: Diagnostic, right: Diagnostic): number {
  const codeOrder = compareProjectPaths(left.code, right.code);
  return codeOrder === 0
    ? compareProjectPaths(left.message, right.message)
    : codeOrder;
}

function freezeDiagnostics(
  diagnostics: readonly Diagnostic[],
): readonly Diagnostic[] {
  return Object.freeze(
    [...diagnostics]
      .sort(compareDiagnostics)
      .map((diagnostic) => Object.freeze({ ...diagnostic })),
  );
}

function createAcquisitionSnapshot(
  completeness: ProjectSourceAcquisitionSnapshot["completeness"],
  diagnostics: readonly Diagnostic[],
): ProjectSourceAcquisitionSnapshot {
  return Object.freeze({
    completeness,
    diagnostics:
      diagnostics.length === 0
        ? EMPTY_DIAGNOSTICS
        : freezeDiagnostics(diagnostics),
  });
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return (
    (typeof value === "object" && value !== null) ||
    typeof value === "function"
  );
}

function isHandle(value: unknown): value is BrowserFileSystemHandle {
  return (
    isObject(value) &&
    typeof value.kind === "string" &&
    typeof value.name === "string"
  );
}

function isFileHandle(
  handle: BrowserFileSystemHandle,
): handle is BrowserFileSystemFileHandle {
  return (
    handle.kind === "file" &&
    "getFile" in handle &&
    typeof handle.getFile === "function"
  );
}

function isDirectoryHandle(
  handle: BrowserFileSystemHandle,
): handle is BrowserFileSystemDirectoryHandle {
  return (
    handle.kind === "directory" &&
    "entries" in handle &&
    typeof handle.entries === "function"
  );
}

function isValidEntryName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0")
  );
}

function canonicalChildPath(
  parentPath: string,
  entryName: string,
): string | undefined {
  const candidate =
    parentPath.length === 0 ? entryName : `${parentPath}/${entryName}`;
  const normalized = normalizeProjectPath(candidate);

  return normalized.ok && normalized.path === candidate
    ? normalized.path
    : undefined;
}

function parentLabel(parentPath: string): string {
  return parentPath.length === 0 ? "the selected root" : parentPath;
}

function errorName(cause: unknown): string | undefined {
  if (!isObject(cause)) {
    return undefined;
  }

  try {
    return typeof cause.name === "string" ? cause.name : undefined;
  } catch {
    return undefined;
  }
}

function isPermissionDenied(cause: unknown): boolean {
  return errorName(cause) === "NotAllowedError";
}

function isFileUnavailable(cause: unknown): boolean {
  return errorName(cause) === "NotFoundError";
}

function permissionDeniedDiagnostic(path: string): Diagnostic {
  return {
    code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.permissionDenied,
    severity: "error",
    message:
      path.length === 0
        ? "Read permission for the selected directory is denied."
        : `Read permission is denied for directory evidence at ${path}.`,
  };
}

function inaccessibleEntryDiagnostic(path: string): Diagnostic {
  return {
    code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.inaccessibleEntry,
    severity: "error",
    message:
      path.length === 0
        ? "The selected directory could not be fully enumerated."
        : `Directory evidence could not be fully enumerated at ${path}.`,
  };
}

function invalidEntryNameDiagnostic(parentPath: string): Diagnostic {
  return {
    code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
    severity: "warning",
    message: `Skipped an entry with an invalid name beneath ${parentLabel(parentPath)}.`,
  };
}

function unsupportedEntryDiagnostic(path: string): Diagnostic {
  return {
    code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.unsupportedEntryKind,
    severity: "warning",
    message: `Skipped an unsupported directory entry at ${path}.`,
  };
}

function duplicatePathDiagnostic(path: string): Diagnostic {
  return {
    code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.duplicateCanonicalPath,
    severity: "warning",
    message: `Skipped duplicate directory entries at canonical path ${path}.`,
  };
}

function permissionDeniedError(
  path?: string,
  acquisition?: ProjectSourceAcquisitionSnapshot,
): BrowserDirectorySourceError {
  return new BrowserDirectorySourceError(
    "permission-denied",
    "Read permission for the selected browser directory is denied.",
    path,
    acquisition,
  );
}

function sourceListError(
  acquisition?: ProjectSourceAcquisitionSnapshot,
): BrowserDirectorySourceError {
  return new BrowserDirectorySourceError(
    "source-list-failed",
    "The selected browser directory could not be listed.",
    undefined,
    acquisition,
  );
}

function mapReadError(
  cause: unknown,
  path: string,
): BrowserDirectorySourceError {
  if (isPermissionDenied(cause)) {
    return permissionDeniedError(path);
  }

  if (isFileUnavailable(cause)) {
    return new BrowserDirectorySourceError(
      "file-unavailable",
      "The selected project file is no longer available.",
      path,
    );
  }

  return new BrowserDirectorySourceError(
    "file-read-failed",
    "The selected project file could not be read as text.",
    path,
  );
}

/**
 * Read-only ProjectSource over a directory handle that was selected before
 * construction. It never owns the picker or a permission request.
 */
export class BrowserDirectoryProjectSource
  implements ProjectSourceWithAcquisitionListing
{
  readonly sourceId: string;
  readonly displayName: string;

  readonly #rootHandle: BrowserFileSystemDirectoryHandle;
  #fileHandleIndex:
    | ReadonlyMap<string, BrowserFileSystemFileHandle>
    | undefined;
  #nextListingAttemptId = 0;
  #latestSettledListingAttemptId = 0;

  constructor(
    rootHandle: BrowserFileSystemDirectoryHandle,
    options: BrowserDirectoryProjectSourceOptions,
  ) {
    if (
      typeof options.sourceId !== "string" ||
      options.sourceId.trim().length === 0
    ) {
      throw new TypeError(
        "Browser directory sourceId must be a non-empty opaque identifier.",
      );
    }

    this.#rootHandle = rootHandle;
    this.sourceId = options.sourceId;
    this.displayName =
      options.displayName ?? DEFAULT_BROWSER_DIRECTORY_DISPLAY_NAME;
  }

  async inspectPermissionState(): Promise<BrowserDirectoryPermissionState> {
    try {
      const queryPermission = this.#rootHandle.queryPermission;

      if (typeof queryPermission !== "function") {
        return "unknown";
      }

      const state = await queryPermission.call(this.#rootHandle, {
        mode: "read",
      });

      return state === "granted" || state === "prompt" || state === "denied"
        ? state
        : "unknown";
    } catch {
      return "unknown";
    }
  }

  async listFiles(): Promise<readonly ProjectFileEntry[]> {
    return (await this.listFilesWithAcquisition()).entries;
  }

  async listFilesWithAcquisition(): Promise<ProjectSourceAcquisitionListing> {
    const attemptId = (this.#nextListingAttemptId += 1);

    const state: TraversalState = {
      diagnostics: [],
      fileHandles: new Map(),
      completeness: "complete",
    };

    try {
      if ((await this.inspectPermissionState()) === "denied") {
        state.diagnostics.push(permissionDeniedDiagnostic(""));
        throw permissionDeniedError();
      }

      await this.#traverseDirectory(this.#rootHandle, "", true, state);
    } catch (cause: unknown) {
      if (!(cause instanceof BrowserDirectorySourceError)) {
        state.diagnostics.push(inaccessibleEntryDiagnostic(""));
      }

      const acquisition = createAcquisitionSnapshot(
        "failed",
        state.diagnostics,
      );
      this.#commitListingAttempt(attemptId, new Map());

      throw cause instanceof BrowserDirectorySourceError &&
        cause.code === "permission-denied"
        ? permissionDeniedError(undefined, acquisition)
        : sourceListError(acquisition);
    }

    const entries = Object.freeze(
      [...state.fileHandles.keys()].sort(compareProjectPaths).map((path) =>
        Object.freeze({ kind: "file" as const, path }),
      ),
    );
    const acquisition = createAcquisitionSnapshot(
      state.completeness,
      state.diagnostics,
    );
    this.#commitListingAttempt(attemptId, state.fileHandles);

    return Object.freeze({ entries, acquisition });
  }

  async readText(path: string): Promise<ProjectTextFile> {
    const normalized = normalizeProjectPath(path);

    if (!normalized.ok) {
      throw new BrowserDirectorySourceError(
        "unsafe-path",
        "Browser directory reads require a safe repository-relative path.",
      );
    }

    if (normalized.path !== path) {
      throw new BrowserDirectorySourceError(
        "non-canonical-path",
        "Browser directory reads require an unchanged canonical slash-separated path.",
      );
    }

    if (this.#fileHandleIndex === undefined) {
      await this.listFiles();
    }

    const handle = this.#fileHandleIndex?.get(path);

    if (handle === undefined) {
      throw new BrowserDirectorySourceError(
        "file-not-found",
        "The requested project file was not present in the latest browser directory listing.",
        path,
      );
    }

    if ((await this.inspectPermissionState()) === "denied") {
      throw permissionDeniedError(path);
    }

    try {
      const file = await handle.getFile();
      const text = await file.text();

      if (typeof text !== "string") {
        throw new TypeError("Browser file text was not a string.");
      }

      return Object.freeze({ path, text });
    } catch (cause: unknown) {
      throw mapReadError(cause, path);
    }
  }

  #commitListingAttempt(
    attemptId: number,
    fileHandles: ReadonlyMap<string, BrowserFileSystemFileHandle>,
  ): void {
    if (attemptId < this.#latestSettledListingAttemptId) {
      return;
    }

    this.#latestSettledListingAttemptId = attemptId;
    this.#fileHandleIndex = fileHandles;
  }

  async #traverseDirectory(
    directory: BrowserFileSystemDirectoryHandle,
    parentPath: string,
    isRoot: boolean,
    state: TraversalState,
  ): Promise<void> {
    const observedEntries: unknown[] = [];
    let iterationFailure: unknown;

    try {
      for await (const entry of directory.entries()) {
        observedEntries.push(entry);
      }
    } catch (cause: unknown) {
      iterationFailure = cause;
    }

    if (iterationFailure !== undefined) {
      state.completeness = "partial";

      if (isPermissionDenied(iterationFailure)) {
        state.diagnostics.push(permissionDeniedDiagnostic(parentPath));
      } else {
        state.diagnostics.push(inaccessibleEntryDiagnostic(parentPath));
      }

      if (isRoot && observedEntries.length === 0) {
        throw isPermissionDenied(iterationFailure)
          ? permissionDeniedError()
          : sourceListError();
      }
    }

    const candidates: TraversalCandidate[] = [];

    for (const entry of observedEntries) {
      if (!Array.isArray(entry) || !isValidEntryName(entry[0])) {
        state.completeness = "partial";
        state.diagnostics.push(invalidEntryNameDiagnostic(parentPath));
        continue;
      }

      const path = canonicalChildPath(parentPath, entry[0]);

      if (path === undefined) {
        state.completeness = "partial";
        state.diagnostics.push(invalidEntryNameDiagnostic(parentPath));
        continue;
      }

      const handle = entry[1];

      if (!isHandle(handle)) {
        state.completeness = "partial";
        state.diagnostics.push(unsupportedEntryDiagnostic(path));
        continue;
      }

      candidates.push({ path, handle });
    }

    candidates.sort((left, right) => {
      const pathOrder = compareProjectPaths(left.path, right.path);
      return pathOrder === 0
        ? compareProjectPaths(left.handle.kind, right.handle.kind)
        : pathOrder;
    });

    for (let index = 0; index < candidates.length; ) {
      const candidate = candidates[index];

      if (candidate === undefined) {
        break;
      }

      let nextIndex = index + 1;

      while (candidates[nextIndex]?.path === candidate.path) {
        nextIndex += 1;
      }

      if (nextIndex - index > 1) {
        state.completeness = "partial";
        state.diagnostics.push(duplicatePathDiagnostic(candidate.path));
        index = nextIndex;
        continue;
      }

      if (isFileHandle(candidate.handle)) {
        state.fileHandles.set(candidate.path, candidate.handle);
      } else if (isDirectoryHandle(candidate.handle)) {
        await this.#traverseDirectory(
          candidate.handle,
          candidate.path,
          false,
          state,
        );
      } else {
        state.completeness = "partial";
        state.diagnostics.push(unsupportedEntryDiagnostic(candidate.path));
      }

      index = nextIndex;
    }
  }
}
