# VER-SLC-008 — Browser directory ProjectSource adapter

Status: passed; fresh independent review approved
Verification ID: `VER-SLC-008`
Tier: `TIER-002`
Sprint: `SPR-002`
Iteration: `ITR-002`
Slice: `SLC-008`
Date: 2026-07-14

## Verified boundary

SLC-008 adds a read-only browser `ProjectSource` over an already-selected
File System Access API directory handle. It includes prompt-free capability
and permission inspection, deterministic recursive enumeration, canonical
root-relative paths, fresh text reads, atomic acquisition evidence and safe
concurrent listing commits. Existing discovery and `analyzeProject` consume
the source through presentation-neutral contracts.

This record does not verify or authorize a directory picker, folder-selection
UI, permission request, persisted handle, broad native-browser compatibility
acceptance or Tier 3 Markdown analysis. `REQ-F-007` and `REQ-S-004` remain
partial until the explicit SLC-009 user gesture is implemented and verified.

## Baseline and environment

- Accepted Tier 1 commit:
  `afb1d97cf537d80cb3ff7b84b17a807a591b104e`.
- Verification tree: that commit plus the intentional uncommitted SLC-008
  product, test and SDP changes listed below.
- Operating system: Microsoft Windows.
- Shell: PowerShell.
- Node: `v24.11.0`.
- npm: `11.6.1`.
- Date: 2026-07-14, Europe/Budapest.

The Master confirmed HEAD still matched the accepted Tier 1 commit before
opening Tier 2 and that the worktree was clean at that transition. The
committed 65-event Tier 1 Ledger prefix remains unchanged.

## Changed scope inspected

Product and permanent test scope:

- `src/adapters/browser/BrowserDirectoryProjectSource.ts`;
- `src/adapters/browser/browserDirectoryCapability.ts`;
- `src/adapters/browser/fileSystemAccessTypes.ts`;
- their focused capability, adapter and boundary tests;
- the additive acquisition-listing contract in
  `src/core/source/ProjectSource.ts`;
- acquisition-aware discovery in
  `src/core/discovery/discoverProject.ts` and its regression tests;
- the existing application boundary test; and
- `README.md`, whose former statement that no browser adapter existed was no
  longer true.

Master-owned SDP scope includes the Tier 2 implementation and verification
plans, SPR-002 contract/notes/handoff and traceability opening/evidence
records. Package files, lockfile, `src/ui`, `src/main.tsx`, SharedUI
configuration and all SPR-001 documents are unchanged.

No SLC-009 or SLC-010 product behavior is present.

## Contract evidence

### Capability and permission separation

- Capability detection requires browser globals and a callable
  `showDirectoryPicker` property but never invokes it.
- Absent browser globals and an unavailable or non-callable picker surface
  produce one stable unsupported result without user-agent sniffing.
- `inspectPermissionState()` performs only
  `queryPermission({ mode: "read" })` and returns exactly `granted`, `prompt`,
  `denied` or `unknown`.
- Missing inspection support, unsupported values and thrown inspection errors
  map to `unknown`; no raw exception text escapes.
- Denied handle access remains a permission-specific diagnostic alongside the
  generic discovery listing failure. It is not collapsed into unsupported
  capability or missing-core evidence.

### Traversal, paths and reading

- Recursive enumeration follows only directory handles yielded beneath the
  selected root, validates every entry as one segment and revalidates each
  joined path by exact canonical normalization.
- Empty, dot, parent, slash, backslash and drive-like `C:notes` names are
  rejected rather than repaired.
- Results are sorted independently of browser iteration order.
- Duplicate canonical paths are all excluded; reversing their iteration order
  cannot select a different handle.
- Listing never calls `getFile()` or `text()`.
- `readText` accepts only an unchanged canonical indexed path, lazily lists
  only when no current index exists and calls `getFile().text()` afresh for
  every read. Unknown, unsafe, disappeared and denied reads produce stable
  sanitized adapter errors.
- The source ID is a mandatory non-empty caller-supplied opaque value. The
  default display label does not expose the directory name.

### Partial, failed and concurrent acquisition

- Each additive listing returns immutable entries and its own immutable
  `complete`, `partial` or `failed` acquisition evidence atomically.
- Root denial/failure rejects with a sanitized error carrying the failed
  snapshot and remains distinct from a complete empty directory.
- Invalid entries, unsupported kinds, duplicates and nested iterator failures
  each produce `partial`, preserve unambiguous observed neighbors and emit a
  stable category diagnostic.
- Permanent composition tests prove each of those four incomplete categories
  yields unknown discovery/normalized support when core sources were not
  observed and emits no `DISCOVERY_MISSING_CORE_SOURCE` conclusion.
- Partial acquisition may remain supported only when all three structured-core
  paths were observed. Failed acquisition remains unknown.
- Listing attempts use local candidate indexes and monotonically ordered
  settlement. Older late success/failure cannot overwrite a newer settled
  state, and a newer failed relist clears prior readable handles.
- A permanent end-to-end overlap test runs two concurrent `analyzeProject`
  calls on one source. A delayed older listing cannot restore stale handles;
  both analyses return the same supported, finding-free result and only the
  newer current file handles are read.

### Architecture, privacy and security

- Browser handle types remain under `src/adapters/browser`; core and
  application contracts contain no browser type.
- The adapter has no React, SharedUI or UI dependency and `analyzeProject`
  contains no browser-source branch.
- The public adapter and narrowed structural handle types expose no write or
  writable-permission operation. Native handles are held in ECMAScript-private
  fields.
- Production scans found no picker invocation, permission request, write or
  writable API, Node filesystem access, fetch/network/telemetry, persistence,
  dynamic execution or Markdown parsing in the new boundary.
- Target content is read as data only. No upload, execution, repair or
  write-back behavior was introduced.

## Master command evidence

All commands were run from the repository root.

### Install and dependencies

~~~text
npm ci
~~~

Passed: 271 packages added, 272 packages audited, 0 vulnerabilities.

~~~text
npm ls SharedUI yaml --depth=0
~~~

Passed with exactly `SharedUI@0.1.0` and `yaml@2.9.0` at the project root.

### Focused SLC-008 checks

~~~text
npm test -- --run src/adapters/browser/browserDirectoryCapability.test.ts src/adapters/browser/BrowserDirectoryProjectSource.test.ts src/adapters/browser/browserBoundaries.test.ts src/core/discovery/discoverProject.test.ts
~~~

Passed after the bounded evidence-correction pass: 4 files and 34 tests.
These tests cover supported/unsupported capability without invoking a picker,
permission states without prompting, empty/nested/shuffled enumeration,
canonical-path rejection, duplicate reversal, fresh reads, sanitized errors,
partial/failed acquisition, diagnostic reset, concurrent settlement,
discovery and full `analyzeProject` integration.

### Typecheck, full regression and production build

~~~text
npm run typecheck
~~~

Passed with TypeScript `--noEmit`.

~~~text
npm test
~~~

Passed: 23 files and 183 tests.

~~~text
npm run build
~~~

Passed: Vite `8.1.4`, 2,070 modules transformed, producing 0.53 kB HTML,
72.91 kB CSS and 650.04 kB JavaScript (192.56 kB gzip). The existing
non-failing warning for a minified chunk above 500 kB remains.

### Focused Tier 1 regression

~~~text
npm test -- --run src/application/tier1Acceptance.test.ts src/application/tier1Boundaries.test.ts src/application/analyzeProject.test.ts src/adapters/fixtures/bundledFixtureSource.test.ts src/core/normalization/bundledFixtureSnapshot.test.ts
~~~

Passed: 5 files and 14 tests. The complete 183-test suite also preserves the
accepted fixture, parsing, normalization, validation, lifecycle and UI
behavior.

### Diff, scope and static checks

~~~text
git diff --check
~~~

Passed with no whitespace error. Git printed only LF-to-CRLF working-copy
notices. A corrected explicit scan passed all 9 then-untracked implementation
files for trailing whitespace and final newlines; after this verification
record was created, the final post-record scan passed all 10 untracked files.

The following checks also passed:

- package/lockfile, `src/ui`, `src/main.tsx` and SPR-001 preservation;
- no production picker invocation, permission request, writable API,
  network/telemetry, persistence, execution or Node filesystem match;
- no React/SharedUI dependency or prohibited runtime match in the browser
  adapter;
- no browser filesystem type outside `src/adapters/browser` production code;
- permanent boundary tests for no browser-type leakage, no UI/picker work and
  no write-capable surface; and
- exact path-policy, atomic-listing, partial/failure and overlap coverage.

### Traceability checks

Strict duplicate-key parsing of CurrentIndex and Relations passed. Every
non-empty Ledger line parsed as one JSON object, all event IDs were unique and
the committed 65-event prefix was unchanged. Stable requirement and decision
references resolved; Tier 1 remains completed; Tier 2, SPR-002 and ITR-002
remain active; SLC-008 remains the current Slice; SLC-009, SLC-010 and Tier 3
remain planned. This record links only the ten SLC-008 partial/foundation
requirements and does not claim later user-gesture completion.

## Harness corrections and reruns

No product, typecheck, test or build failure occurred. The following evidence
harness issues were corrected and rerun rather than hidden:

- An early Master package-preservation wrapper treated PowerShell native
  command status as a Boolean and falsely reported changed package files. The
  corrected `git diff --exit-code` check passed with no output.
- The Worker first used an unbraced interpolated path followed by `:` in its
  untracked-file scan. Its corrected scan found intentional Markdown hard-break
  spaces, those spaces were removed, and the final scan passed all 9 files.
- A Master untracked-file rerun initially used a single-quoted tab escape and
  misclassified ordinary line endings. The corrected `[\x20\t]+$` scan passed
  all 9 files.
- An initial browser-type leakage glob omitted the leading `src/` and therefore
  reported the intentionally adapter-local types. The corrected exclusion
  produced no outside-adapter match.
- The first focused Tier 1 rerun used verbose output that exceeded the capture
  budget. The same test set was rerun without the verbose reporter and passed
  5 files/14 tests.
- The first post-record Node traceability command lost its JavaScript string
  quotes through shell argument parsing and stopped with a syntax error. The
  same validation was supplied through standard input instead and passed 2
  strict YAML files and 73 unique Ledger events.

## Requirements disposition

This verification passes the SLC-008 foundation evidence for:

- partial: `REQ-F-007`, `REQ-S-004`;
- foundation: `REQ-M-002`, `REQ-C-004`, `REQ-S-002`, `REQ-S-003`,
  `REQ-NF-001`, `REQ-NF-002`, `REQ-T-001`, `REQ-T-003`.

It does not complete the Tier-level user gesture. `REQ-V-009`, `REQ-UI-005`
and `REQ-S-005` retain T2 requirement tags but remain explicitly unallocated
and must be assigned or retiered before Tier 2 closure.

## Limitations and residual risk

- Verification uses deterministic structural fake handles in Node. Native
  picker/user-gesture and broad browser compatibility acceptance are SLC-009
  and SLC-010 work.
- A selected filesystem provider may itself be cloud-backed; the analyzer adds
  no upload or network behavior.
- The browser filesystem is externally mutable, so enumeration and later fresh
  text reads are not one transactional filesystem snapshot.
- Very large/deep traversal, file-size limits and cancellation remain future
  hardening discoveries.
- The existing non-failing production bundle-size advisory remains.

## Result

SLC-008 Master verification passes. The already-selected browser directory is
a deterministic, canonical, read-only source with honest acquisition evidence,
prompt-free permission inspection and no UI/picker/write/network expansion.
Fresh independent `REV-SLC-008` reproduced the applicable evidence and
approved with no actionable finding. The Master completed only SLC-008;
CurrentIndex remains on SLC-008 and SLC-009/SLC-010 remain planned.
