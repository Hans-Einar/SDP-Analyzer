import { describe, expect, it, vi } from "vitest";
import { analyzeProject } from "../../application/analyzeProject";
import { CORE_TRACEABILITY_PATHS, discoverProject } from "../../core/discovery/discoverProject";
import type { ProjectSourceAcquisitionSnapshot } from "../../core/source/ProjectSource";
import { bundledFixtureSource } from "../fixtures/bundledFixtureSource";
import {
  BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES,
  BrowserDirectoryProjectSource,
  DEFAULT_BROWSER_DIRECTORY_DISPLAY_NAME,
} from "./BrowserDirectoryProjectSource";
import {
  BROWSER_DIRECTORY_UNSUPPORTED_REASON,
  detectBrowserDirectoryCapability,
} from "./browserDirectoryCapability";
import type {
  BrowserFileSystemDirectoryHandle,
  BrowserFileSystemFileHandle,
  BrowserFileSystemHandle,
  BrowserReadPermissionDescriptor,
} from "./fileSystemAccessTypes";

type FakeEntry = [string, BrowserFileSystemHandle];

interface FakeFileControl {
  readonly handle: BrowserFileSystemFileHandle;
  readonly getFileCount: () => number;
  readonly textCount: () => number;
  readonly setText: (text: string) => void;
  readonly setGetFileFailure: (cause: unknown) => void;
  readonly setTextFailure: (cause: unknown) => void;
}

interface FakeDirectoryOptions {
  readonly failAfter?: number;
  readonly iterationFailure?: unknown;
  readonly queryPermission?: (
    descriptor: BrowserReadPermissionDescriptor,
  ) => Promise<string>;
}

interface FakeDirectoryControl {
  readonly handle: BrowserFileSystemDirectoryHandle;
  readonly entriesCallCount: () => number;
}

interface Deferred {
  readonly promise: Promise<void>;
  readonly resolve: () => void;
}

function namedError(name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

function deferred(): Deferred {
  let resolvePromise = (): void => {
    throw new Error("Deferred promise resolved before initialization.");
  };
  const promise = new Promise<void>((resolve) => {
    resolvePromise = () => resolve();
  });

  return { promise, resolve: resolvePromise };
}

function acquisitionFromError(
  cause: unknown,
): ProjectSourceAcquisitionSnapshot {
  return (cause as { readonly acquisition: ProjectSourceAcquisitionSnapshot })
    .acquisition;
}

function fakeFile(name: string, initialText: string): FakeFileControl {
  let text = initialText;
  let getFileCalls = 0;
  let textCalls = 0;
  let getFileFailure: unknown;
  let textFailure: unknown;

  const handle: BrowserFileSystemFileHandle = {
    kind: "file",
    name,
    async getFile() {
      getFileCalls += 1;

      if (getFileFailure !== undefined) {
        throw getFileFailure;
      }

      return {
        async text() {
          textCalls += 1;

          if (textFailure !== undefined) {
            throw textFailure;
          }

          return text;
        },
      };
    },
  };

  return {
    handle,
    getFileCount: () => getFileCalls,
    textCount: () => textCalls,
    setText(nextText) {
      text = nextText;
    },
    setGetFileFailure(cause) {
      getFileFailure = cause;
    },
    setTextFailure(cause) {
      textFailure = cause;
    },
  };
}

function fakeDirectory(
  name: string,
  entrySource: readonly FakeEntry[] | (() => readonly FakeEntry[]),
  options: FakeDirectoryOptions = {},
): FakeDirectoryControl {
  let entriesCalls = 0;
  const handle: BrowserFileSystemDirectoryHandle = {
    kind: "directory",
    name,
    entries() {
      entriesCalls += 1;
      const entries =
        typeof entrySource === "function" ? entrySource() : entrySource;

      return (async function* () {
        for (let index = 0; index < entries.length; index += 1) {
          if (
            options.iterationFailure !== undefined &&
            options.failAfter === index
          ) {
            throw options.iterationFailure;
          }

          const entry = entries[index];

          if (entry !== undefined) {
            yield entry;
          }
        }

        if (
          options.iterationFailure !== undefined &&
          options.failAfter !== undefined &&
          options.failAfter >= entries.length
        ) {
          throw options.iterationFailure;
        }
      })();
    },
  };

  if (options.queryPermission !== undefined) {
    handle.queryPermission = options.queryPermission;
  }

  return { handle, entriesCallCount: () => entriesCalls };
}

function fileEntry(file: FakeFileControl): FakeEntry {
  return [file.handle.name, file.handle];
}

function directoryEntry(directory: FakeDirectoryControl): FakeEntry {
  return [directory.handle.name, directory.handle];
}

let sourceSequence = 0;

function browserSource(
  rootHandle: BrowserFileSystemDirectoryHandle,
  sourceId = `browser:test-${(sourceSequence += 1)}`,
): BrowserDirectoryProjectSource {
  return new BrowserDirectoryProjectSource(rootHandle, { sourceId });
}

function diagnosticCodes(
  diagnostics: readonly { readonly code: string }[],
): string[] {
  return diagnostics.map((diagnostic) => diagnostic.code);
}

describe("BrowserDirectoryProjectSource", () => {
  it("uses deterministic privacy-safe metadata and lists an empty root", async () => {
    const root = fakeDirectory("private-project-name", []);
    const source = browserSource(root.handle, "browser:privacy-test");

    const listing = await source.listFilesWithAcquisition();

    expect(listing.entries).toEqual([]);
    await expect(source.listFiles()).resolves.toEqual([]);
    expect(source.sourceId).toBe("browser:privacy-test");
    expect(source.displayName).toBe(DEFAULT_BROWSER_DIRECTORY_DISPLAY_NAME);
    expect(source.displayName).not.toContain(root.handle.name);
    expect(listing.acquisition).toEqual({
      completeness: "complete",
      diagnostics: [],
    });
    expect(Object.isFrozen(listing)).toBe(true);
    expect(Object.isFrozen(listing.entries)).toBe(true);
    expect(Object.isFrozen(listing.acquisition)).toBe(true);
    expect(Object.isFrozen(listing.acquisition.diagnostics)).toBe(true);
  });

  it("requires a non-empty opaque caller-supplied sourceId", () => {
    const root = fakeDirectory("private-project-name", []);

    for (const sourceId of ["", "   "]) {
      expect(
        () => new BrowserDirectoryProjectSource(root.handle, { sourceId }),
      ).toThrowError(
        "Browser directory sourceId must be a non-empty opaque identifier.",
      );
    }
  });

  it("recurses into nested directories and sorts independently of iteration order without reading files", async () => {
    const currentIndex = fakeFile("CurrentIndex.yaml", "current");
    const relations = fakeFile("Relations.yaml", "relations");
    const readme = fakeFile("README.md", "readme");
    let traceabilityOrder = 0;
    const traceability = fakeDirectory("Traceability", () => {
      traceabilityOrder += 1;
      const entries = [fileEntry(relations), fileEntry(currentIndex)];
      return traceabilityOrder % 2 === 0 ? entries : [...entries].reverse();
    });
    const sdp = fakeDirectory("SDP", [directoryEntry(traceability)]);
    let rootOrder = 0;
    const root = fakeDirectory("root", () => {
      rootOrder += 1;
      const entries = [directoryEntry(sdp), fileEntry(readme)];
      return rootOrder % 2 === 0 ? entries : [...entries].reverse();
    });
    const source = browserSource(root.handle, "browser:test-project");

    const first = await source.listFiles();
    const second = await source.listFiles();

    expect(second).toEqual(first);
    expect(first).toEqual([
      { kind: "file", path: "README.md" },
      { kind: "file", path: "SDP/Traceability/CurrentIndex.yaml" },
      { kind: "file", path: "SDP/Traceability/Relations.yaml" },
    ]);
    for (const file of [currentIndex, relations, readme]) {
      expect(file.getFileCount()).toBe(0);
      expect(file.textCount()).toBe(0);
    }
  });

  it("lazily lists once, reads only indexed canonical paths, and rejects escapes or repairs", async () => {
    const file = fakeFile("CurrentIndex.yaml", "active: {}\n");
    const traceability = fakeDirectory("Traceability", [fileEntry(file)]);
    const sdp = fakeDirectory("SDP", [directoryEntry(traceability)]);
    const root = fakeDirectory("root", [directoryEntry(sdp)]);
    const source = browserSource(root.handle);
    const validPath = "SDP/Traceability/CurrentIndex.yaml";

    await expect(source.readText(validPath)).resolves.toEqual({
      path: validPath,
      text: "active: {}\n",
    });
    expect(root.entriesCallCount()).toBe(1);

    for (const unsafePath of [
      "../outside.md",
      "/absolute.md",
      "C:\\private\\file.md",
    ]) {
      await expect(source.readText(unsafePath)).rejects.toMatchObject({
        name: "BrowserDirectorySourceError",
        code: "unsafe-path",
      });
    }

    for (const nonCanonicalPath of [
      "SDP\\Traceability\\CurrentIndex.yaml",
      "SDP//Traceability/CurrentIndex.yaml",
      "SDP/Traceability/CurrentIndex.yaml/",
    ]) {
      await expect(source.readText(nonCanonicalPath)).rejects.toMatchObject({
        name: "BrowserDirectorySourceError",
        code: "non-canonical-path",
      });
    }

    await expect(source.readText("SDP/Unknown.yaml")).rejects.toMatchObject({
      code: "file-not-found",
      path: "SDP/Unknown.yaml",
    });
    expect(root.entriesCallCount()).toBe(1);
  });

  it("reads mutable file text afresh without caching or relisting", async () => {
    const file = fakeFile("notes.txt", "first");
    const root = fakeDirectory("root", [fileEntry(file)]);
    const source = browserSource(root.handle);

    await expect(source.readText("notes.txt")).resolves.toEqual({
      path: "notes.txt",
      text: "first",
    });
    file.setText("second");
    await expect(source.readText("notes.txt")).resolves.toEqual({
      path: "notes.txt",
      text: "second",
    });

    expect(root.entriesCallCount()).toBe(1);
    expect(file.getFileCount()).toBe(2);
    expect(file.textCount()).toBe(2);
  });

  it("preserves accessible siblings around nested and root iterator failures", async () => {
    const publicFile = fakeFile("public.md", "public");
    const siblingFile = fakeFile("sibling.md", "sibling");
    const hiddenFile = fakeFile("hidden.md", "hidden");
    const inaccessible = fakeDirectory("private", [fileEntry(hiddenFile)], {
      failAfter: 0,
      iterationFailure: new Error("C:\\Users\\person\\private"),
    });
    const sdp = fakeDirectory("SDP", [
      directoryEntry(inaccessible),
      fileEntry(publicFile),
    ]);
    const root = fakeDirectory("root", [
      directoryEntry(sdp),
      fileEntry(siblingFile),
    ]);
    const source = browserSource(root.handle);

    const listing = await source.listFilesWithAcquisition();

    expect(listing.entries).toEqual([
      { kind: "file", path: "SDP/public.md" },
      { kind: "file", path: "sibling.md" },
    ]);
    expect(listing.acquisition.completeness).toBe("partial");
    expect(listing.acquisition.diagnostics).toContainEqual({
      code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.inaccessibleEntry,
      severity: "error",
      message: "Directory evidence could not be fully enumerated at SDP/private.",
    });
    expect(JSON.stringify(listing.acquisition.diagnostics)).not.toContain(
      "C:\\Users",
    );

    const observed = fakeFile("observed.md", "observed");
    const unseen = fakeFile("unseen.md", "unseen");
    const partialRoot = fakeDirectory(
      "root",
      [fileEntry(observed), fileEntry(unseen)],
      {
        failAfter: 1,
        iterationFailure: new Error("raw iterator detail"),
      },
    );
    const partialSource = browserSource(partialRoot.handle);

    const partialListing = await partialSource.listFilesWithAcquisition();
    expect(partialListing.entries).toEqual([
      { kind: "file", path: "observed.md" },
    ]);
    expect(partialListing.acquisition.completeness).toBe("partial");
    await expect(partialSource.readText("unseen.md")).rejects.toMatchObject({
      code: "file-not-found",
    });
  });

  it("distinguishes a failed root listing from a successfully empty root", async () => {
    const failedRoot = fakeDirectory("root", [], {
      failAfter: 0,
      iterationFailure: new Error("C:\\Users\\person\\secret"),
    });
    const emptyRoot = fakeDirectory("root", []);
    const failedSource = browserSource(failedRoot.handle);
    const emptySource = browserSource(emptyRoot.handle);

    const rootError = await failedSource
      .listFilesWithAcquisition()
      .catch((cause: unknown) => cause);
    const emptyListing = await emptySource.listFilesWithAcquisition();
    const failed = await discoverProject(failedSource);
    const empty = await discoverProject(emptySource);

    expect(rootError).toMatchObject({
      code: "source-list-failed",
      acquisition: { completeness: "failed" },
    });
    expect(Object.isFrozen(acquisitionFromError(rootError))).toBe(true);
    expect(
      Object.isFrozen(acquisitionFromError(rootError).diagnostics),
    ).toBe(true);
    expect(failed.profile.support).toBe("unknown");
    expect(failed.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "DISCOVERY_SOURCE_LIST_FAILED",
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.inaccessibleEntry,
    ]);
    expect(failed.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "DISCOVERY_MISSING_CORE_SOURCE" }),
    );
    expect(JSON.stringify(failed.diagnostics)).not.toContain("C:\\Users");

    expect(empty.profile.support).toBe("partial");
    expect(
      empty.diagnostics.every(
        (diagnostic) => diagnostic.code === "DISCOVERY_MISSING_CORE_SOURCE",
      ),
    ).toBe(true);
    expect(emptyListing.acquisition.completeness).toBe("complete");
  });

  it("reports exact permission states without requesting permission", async () => {
    for (const state of ["granted", "prompt", "denied"] as const) {
      const queryPermission = vi.fn(async () => state);
      const root = fakeDirectory("root", [], { queryPermission });
      const source = browserSource(root.handle);

      await expect(source.inspectPermissionState()).resolves.toBe(state);
      expect(queryPermission).toHaveBeenCalledWith({ mode: "read" });
    }

    const absentQuery = browserSource(fakeDirectory("root", []).handle);
    const throwingQuery = browserSource(
      fakeDirectory("root", [], {
        queryPermission() {
          throw new Error("raw browser permission detail");
        },
      }).handle,
    );
    const invalidQuery = browserSource(
      fakeDirectory("root", [], {
        queryPermission: async () => "future-state",
      }).handle,
    );

    await expect(absentQuery.inspectPermissionState()).resolves.toBe("unknown");
    await expect(throwingQuery.inspectPermissionState()).resolves.toBe(
      "unknown",
    );
    await expect(invalidQuery.inspectPermissionState()).resolves.toBe(
      "unknown",
    );
  });

  it("keeps denied handle permission distinct from unsupported capability", async () => {
    const queryPermission = vi.fn(async () => "denied");
    const root = fakeDirectory("root", [], { queryPermission });
    const requestPermission = vi.fn();
    Object.assign(root.handle, { requestPermission });
    const source = browserSource(root.handle);

    expect(detectBrowserDirectoryCapability({})).toEqual({
      supported: false,
      reason: BROWSER_DIRECTORY_UNSUPPORTED_REASON,
    });
    const deniedError = await source
      .listFilesWithAcquisition()
      .catch((cause: unknown) => cause);
    const discovery = await discoverProject(source);

    expect(deniedError).toMatchObject({
      code: "permission-denied",
      acquisition: {
        completeness: "failed",
        diagnostics: [
          expect.objectContaining({
            code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES
              .permissionDenied,
          }),
        ],
      },
    });
    expect(discovery.profile.support).toBe("unknown");
    expect(discovery.diagnostics).toContainEqual({
      code: BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.permissionDenied,
      severity: "error",
      message: "Read permission for the selected directory is denied.",
    });
    expect(discovery.diagnostics).toContainEqual(
      expect.objectContaining({ code: "DISCOVERY_SOURCE_LIST_FAILED" }),
    );
    expect(discovery.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "DISCOVERY_MISSING_CORE_SOURCE" }),
    );
    expect(root.entriesCallCount()).toBe(0);
    expect(requestPermission).not.toHaveBeenCalled();
    expect("requestPermission" in source).toBe(false);
    expect("createWritable" in source).toBe(false);
    expect("getAcquisitionSnapshot" in source).toBe(false);
    expect("rootHandle" in source).toBe(false);
    expect(Object.values(source)).not.toContain(root.handle);
  });

  it("skips invalid names, unsupported kinds, and every ambiguous duplicate while retaining safe neighbors", async () => {
    const safe = fakeFile("safe.txt", "safe");
    const duplicateOne = fakeFile("duplicate.txt", "one");
    const duplicateTwo = fakeFile("duplicate.txt", "two");
    const invalid = fakeFile("ignored.txt", "ignored");
    const unsupported: BrowserFileSystemHandle = {
      kind: "symbolic-link",
      name: "link",
    };
    const root = fakeDirectory("root", [
      fileEntry(safe),
      ["", invalid.handle],
      [".", invalid.handle],
      ["..", invalid.handle],
      ["nested/file", invalid.handle],
      ["nested\\file", invalid.handle],
      ["C:notes", invalid.handle],
      ["link", unsupported],
      ["duplicate.txt", duplicateOne.handle],
      ["duplicate.txt", duplicateTwo.handle],
    ]);
    const source = browserSource(root.handle);

    const listing = await source.listFilesWithAcquisition();
    expect(listing.entries).toEqual([
      { kind: "file", path: "safe.txt" },
    ]);
    expect(listing.acquisition.completeness).toBe("partial");
    expect(diagnosticCodes(listing.acquisition.diagnostics)).toEqual([
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.duplicateCanonicalPath,
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
      BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.unsupportedEntryKind,
    ]);
    await expect(source.readText("duplicate.txt")).rejects.toMatchObject({
      code: "file-not-found",
    });
    await expect(source.readText("safe.txt")).resolves.toEqual({
      path: "safe.txt",
      text: "safe",
    });

    const reversedRoot = fakeDirectory("root", [
      ["duplicate.txt", duplicateTwo.handle],
      fileEntry(safe),
      ["duplicate.txt", duplicateOne.handle],
      ["link", unsupported],
      ["C:notes", invalid.handle],
      ["nested\\file", invalid.handle],
      ["nested/file", invalid.handle],
      ["..", invalid.handle],
      [".", invalid.handle],
      ["", invalid.handle],
    ]);
    const reversedSource = browserSource(reversedRoot.handle);
    const reversedListing = await reversedSource.listFilesWithAcquisition();

    expect(reversedListing).toEqual(listing);
    await expect(
      reversedSource.readText("duplicate.txt"),
    ).rejects.toMatchObject({ code: "file-not-found" });
  });

  it("propagates every incomplete-entry category without claiming unobserved core files are missing", async () => {
    const invalidFile = fakeFile("ignored.txt", "ignored");
    const unsupported: BrowserFileSystemHandle = {
      kind: "symbolic-link",
      name: "link",
    };
    const duplicateOne = fakeFile("duplicate.txt", "one");
    const duplicateTwo = fakeFile("duplicate.txt", "two");
    const inaccessible = fakeDirectory("inaccessible", [], {
      failAfter: 0,
      iterationFailure: new Error("raw nested iterator detail"),
    });
    const cases = [
      {
        label: "invalid canonical child path",
        source: browserSource(
          fakeDirectory("root", [["C:notes", invalidFile.handle]]).handle,
        ),
        diagnosticCode:
          BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.invalidEntryName,
      },
      {
        label: "unsupported entry kind",
        source: browserSource(
          fakeDirectory("root", [["link", unsupported]]).handle,
        ),
        diagnosticCode:
          BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.unsupportedEntryKind,
      },
      {
        label: "duplicate canonical path",
        source: browserSource(
          fakeDirectory("root", [
            ["duplicate.txt", duplicateOne.handle],
            ["duplicate.txt", duplicateTwo.handle],
          ]).handle,
        ),
        diagnosticCode:
          BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES
            .duplicateCanonicalPath,
      },
      {
        label: "nested iterator failure",
        source: browserSource(
          fakeDirectory("root", [directoryEntry(inaccessible)]).handle,
        ),
        diagnosticCode:
          BROWSER_DIRECTORY_ACQUISITION_DIAGNOSTIC_CODES.inaccessibleEntry,
      },
    ] as const;
    const context = {
      analyzerVersion: "0.1.0",
      profileId: "sdp-tier-1",
      analysisTime: "2026-07-14T00:00:00Z",
    } as const;

    for (const testCase of cases) {
      const listing = await testCase.source.listFilesWithAcquisition();
      const discovery = await discoverProject(testCase.source);
      const analysis = await analyzeProject(testCase.source, context);

      expect(
        listing.acquisition.completeness,
        `${testCase.label} listing completeness`,
      ).toBe("partial");
      expect(
        diagnosticCodes(listing.acquisition.diagnostics),
        `${testCase.label} listing diagnostics`,
      ).toContain(testCase.diagnosticCode);

      for (const manifest of [discovery, analysis.discovery]) {
        expect(
          manifest.profile.support,
          `${testCase.label} discovery support`,
        ).toBe("unknown");
        expect(
          diagnosticCodes(manifest.diagnostics),
          `${testCase.label} propagated diagnostics`,
        ).toContain(testCase.diagnosticCode);
        expect(
          manifest.diagnostics,
          `${testCase.label} missing-core suppression`,
        ).not.toContainEqual(
          expect.objectContaining({ code: "DISCOVERY_MISSING_CORE_SOURCE" }),
        );
      }

      expect(
        analysis.snapshot.profile.support,
        `${testCase.label} normalized support`,
      ).toBe("unknown");
    }
  });

  it("replaces diagnostics and the file index on every successful listing", async () => {
    const oldFile = fakeFile("old.txt", "old");
    const newFile = fakeFile("new.txt", "new");
    let attempt = 0;
    const root = fakeDirectory("root", () => {
      attempt += 1;
      return attempt === 1
        ? [fileEntry(oldFile), ["..", oldFile.handle]]
        : [fileEntry(newFile)];
    });
    const source = browserSource(root.handle);

    const firstListing = await source.listFilesWithAcquisition();
    const firstSnapshot = firstListing.acquisition;
    expect(firstSnapshot.completeness).toBe("partial");
    expect(firstSnapshot.diagnostics).toHaveLength(1);

    const secondListing = await source.listFilesWithAcquisition();
    expect(secondListing.entries).toEqual([
      { kind: "file", path: "new.txt" },
    ]);
    expect(secondListing.acquisition).toEqual({
      completeness: "complete",
      diagnostics: [],
    });
    expect(firstSnapshot.diagnostics).toHaveLength(1);
    await expect(source.readText("old.txt")).rejects.toMatchObject({
      code: "file-not-found",
    });
  });

  it("clears a previously successful file index when a later root listing fails", async () => {
    const oldFile = fakeFile("old.txt", "old");
    let fail = false;
    const rootHandle: BrowserFileSystemDirectoryHandle = {
      kind: "directory",
      name: "root",
      entries() {
        return (async function* () {
          if (fail) {
            throw new Error("raw second-attempt failure");
          }

          yield fileEntry(oldFile);
        })();
      },
    };
    const source = browserSource(rootHandle);

    await expect(source.listFiles()).resolves.toEqual([
      { kind: "file", path: "old.txt" },
    ]);
    fail = true;
    const failedListingError = await source
      .listFilesWithAcquisition()
      .catch((cause: unknown) => cause);
    expect(failedListingError).toMatchObject({
      code: "source-list-failed",
      acquisition: { completeness: "failed" },
    });
    await expect(source.readText("old.txt")).rejects.toMatchObject({
      code: "file-not-found",
    });
    expect(oldFile.getFileCount()).toBe(0);
  });

  it("does not let an older late failure clear a newer settled successful index", async () => {
    const newerFile = fakeFile("newer.txt", "newer");
    const firstStarted = deferred();
    const releaseFirst = deferred();
    let attempt = 0;
    const rootHandle: BrowserFileSystemDirectoryHandle = {
      kind: "directory",
      name: "root",
      entries() {
        attempt += 1;
        const currentAttempt = attempt;

        return (async function* () {
          if (currentAttempt === 1) {
            firstStarted.resolve();
            await releaseFirst.promise;
            throw new Error("older raw failure");
          }

          yield fileEntry(newerFile);
        })();
      },
    };
    const source = browserSource(rootHandle);

    const olderResultPromise = source
      .listFilesWithAcquisition()
      .catch((cause: unknown) => cause);
    await firstStarted.promise;
    const newerResult = await source.listFilesWithAcquisition();
    releaseFirst.resolve();
    const olderError = await olderResultPromise;

    expect(newerResult.entries).toEqual([
      { kind: "file", path: "newer.txt" },
    ]);
    expect(acquisitionFromError(olderError).completeness).toBe("failed");
    await expect(source.readText("newer.txt")).resolves.toEqual({
      path: "newer.txt",
      text: "newer",
    });
    expect(attempt).toBe(2);
  });

  it("does not let an older late success restore paths after a newer settled failure", async () => {
    const olderFile = fakeFile("older.txt", "older");
    const firstStarted = deferred();
    const releaseFirst = deferred();
    let attempt = 0;
    const rootHandle: BrowserFileSystemDirectoryHandle = {
      kind: "directory",
      name: "root",
      entries() {
        attempt += 1;
        const currentAttempt = attempt;

        return (async function* () {
          if (currentAttempt === 1) {
            firstStarted.resolve();
            await releaseFirst.promise;
            yield fileEntry(olderFile);
            return;
          }

          throw new Error("newer raw failure");
        })();
      },
    };
    const source = browserSource(rootHandle);

    const olderResultPromise = source.listFilesWithAcquisition();
    await firstStarted.promise;
    const newerError = await source
      .listFilesWithAcquisition()
      .catch((cause: unknown) => cause);
    releaseFirst.resolve();
    const olderResult = await olderResultPromise;

    expect(acquisitionFromError(newerError).completeness).toBe("failed");
    expect(olderResult.entries).toEqual([
      { kind: "file", path: "older.txt" },
    ]);
    await expect(source.readText("older.txt")).rejects.toMatchObject({
      code: "file-not-found",
    });
    expect(olderFile.getFileCount()).toBe(0);
    expect(attempt).toBe(2);
  });

  it("keeps overlapping analyzeProject calls deterministic when an older listing settles late", async () => {
    const currentIndexText = await bundledFixtureSource.readText(
      CORE_TRACEABILITY_PATHS.currentIndex,
    );
    const relationsText = await bundledFixtureSource.readText(
      CORE_TRACEABILITY_PATHS.relations,
    );
    const ledgerText = await bundledFixtureSource.readText(
      CORE_TRACEABILITY_PATHS.ledger,
    );
    const olderCurrentIndex = fakeFile("CurrentIndex.yaml", "invalid older yaml");
    const olderRelations = fakeFile("Relations.yaml", "invalid older yaml");
    const olderLedger = fakeFile("Ledger.ndjson", "invalid older json");
    const newerCurrentIndex = fakeFile(
      "CurrentIndex.yaml",
      currentIndexText.text,
    );
    const newerRelations = fakeFile("Relations.yaml", relationsText.text);
    const newerLedger = fakeFile("Ledger.ndjson", ledgerText.text);
    const olderTraceability = fakeDirectory("Traceability", [
      fileEntry(olderCurrentIndex),
      fileEntry(olderRelations),
      fileEntry(olderLedger),
    ]);
    const newerTraceability = fakeDirectory("Traceability", [
      fileEntry(newerCurrentIndex),
      fileEntry(newerRelations),
      fileEntry(newerLedger),
    ]);
    const olderSdp = fakeDirectory("SDP", [
      directoryEntry(olderTraceability),
    ]);
    const newerSdp = fakeDirectory("SDP", [
      directoryEntry(newerTraceability),
    ]);
    const olderStarted = deferred();
    const releaseOlder = deferred();
    let listingAttempt = 0;
    const rootHandle: BrowserFileSystemDirectoryHandle = {
      kind: "directory",
      name: "root",
      entries() {
        listingAttempt += 1;
        const currentAttempt = listingAttempt;

        return (async function* () {
          if (currentAttempt === 1) {
            olderStarted.resolve();
            await releaseOlder.promise;
            yield directoryEntry(olderSdp);
            return;
          }

          yield directoryEntry(newerSdp);
        })();
      },
    };
    const source = browserSource(rootHandle, "browser:overlapping-analysis");
    const context = {
      analyzerVersion: "0.1.0",
      profileId: "sdp-tier-1",
      analysisTime: "2026-07-14T00:00:00Z",
    } as const;

    const olderAnalysisPromise = analyzeProject(source, context);
    await olderStarted.promise;
    const newerAnalysis = await analyzeProject(source, context);
    releaseOlder.resolve();
    const olderAnalysis = await olderAnalysisPromise;

    expect(olderAnalysis).toEqual(newerAnalysis);
    for (const analysis of [olderAnalysis, newerAnalysis]) {
      expect(analysis.discovery.profile.support).toBe("supported");
      expect(analysis.findings).toEqual([]);
    }
    for (const staleFile of [
      olderCurrentIndex,
      olderRelations,
      olderLedger,
    ]) {
      expect(staleFile.getFileCount()).toBe(0);
      expect(staleFile.textCount()).toBe(0);
    }
    for (const currentFile of [
      newerCurrentIndex,
      newerRelations,
      newerLedger,
    ]) {
      expect(currentFile.getFileCount()).toBe(2);
      expect(currentFile.textCount()).toBe(2);
    }
    expect(listingAttempt).toBe(2);
  });

  it("maps disappearance, permission, and read failures to sanitized stable errors", async () => {
    const unavailable = fakeFile("unavailable.txt", "unused");
    const unreadable = fakeFile("unreadable.txt", "unused");
    const denied = fakeFile("denied.txt", "unused");
    unavailable.setGetFileFailure(
      namedError("NotFoundError", "C:\\Users\\person\\gone.txt"),
    );
    unreadable.setTextFailure(
      new Error("C:\\Users\\person\\confidential contents"),
    );
    denied.setGetFileFailure(
      namedError("NotAllowedError", "private browser permission detail"),
    );
    const root = fakeDirectory("root", [
      fileEntry(unavailable),
      fileEntry(unreadable),
      fileEntry(denied),
    ]);
    const source = browserSource(root.handle);
    await source.listFiles();

    const unavailableError = await source
      .readText("unavailable.txt")
      .catch((cause: unknown) => cause);
    const unreadableError = await source
      .readText("unreadable.txt")
      .catch((cause: unknown) => cause);
    const deniedError = await source
      .readText("denied.txt")
      .catch((cause: unknown) => cause);

    expect(unavailableError).toMatchObject({ code: "file-unavailable" });
    expect(unreadableError).toMatchObject({ code: "file-read-failed" });
    expect(deniedError).toMatchObject({ code: "permission-denied" });
    expect(
      [unavailableError, unreadableError, deniedError]
        .map((error) => String(error))
        .join("\n"),
    ).not.toMatch(/C:\\Users|confidential contents|private browser detail/);
  });

  it("flows through discovery and analyzeProject without browser special cases", async () => {
    const currentIndexText = await bundledFixtureSource.readText(
      CORE_TRACEABILITY_PATHS.currentIndex,
    );
    const relationsText = await bundledFixtureSource.readText(
      CORE_TRACEABILITY_PATHS.relations,
    );
    const ledgerText = await bundledFixtureSource.readText(
      CORE_TRACEABILITY_PATHS.ledger,
    );
    const currentIndex = fakeFile("CurrentIndex.yaml", currentIndexText.text);
    const relations = fakeFile("Relations.yaml", relationsText.text);
    const ledger = fakeFile("Ledger.ndjson", ledgerText.text);
    const targetScript = fakeFile("postinstall.js", "throw new Error('never execute');");
    const traceability = fakeDirectory("Traceability", [
      fileEntry(ledger),
      fileEntry(currentIndex),
      fileEntry(relations),
    ]);
    const sdp = fakeDirectory("SDP", [directoryEntry(traceability)]);
    const root = fakeDirectory("root", [
      fileEntry(targetScript),
      directoryEntry(sdp),
    ]);
    const source = browserSource(root.handle, "browser:integration");

    const result = await analyzeProject(source, {
      analyzerVersion: "0.1.0",
      profileId: "sdp-tier-1",
      analysisTime: "2026-07-14T00:00:00Z",
    });

    expect(result.discovery.sourceId).toBe("browser:integration");
    expect(result.discovery.profile.support).toBe("supported");
    expect(result.discovery.coreTraceability.currentIndex).toBeDefined();
    expect(result.snapshot.entities.length).toBeGreaterThan(0);
    expect(result.findings).toEqual([]);
    for (const coreFile of [currentIndex, relations, ledger]) {
      expect(coreFile.getFileCount()).toBe(1);
      expect(coreFile.textCount()).toBe(1);
    }
    expect(targetScript.getFileCount()).toBe(0);
    expect(targetScript.textCount()).toBe(0);
  });
});
