# SPR-002 Implementation Notes

Status: active Sprint; SLC-008 completed
Sprint: `SPR-002`
Iteration: `ITR-002`
CurrentIndex Slice: `SLC-008` (completed; retained)
Date opened: 2026-07-14

## Tier 1 acceptance transition

The supervising architect accepted `SLC-007`, `ITR-001`, `SPR-001` and
`TIER-001` at committed state
`afb1d97cf537d80cb3ff7b84b17a807a591b104e`. The Master confirmed:

- repository HEAD exactly matches the accepted commit;
- the worktree was clean before the Tier 2 transition;
- `VER-TIER-001` is passed;
- `REV-TIER-001` is approved;
- Relations records Tier, Sprint, Iteration and final Slice completed; and
- immutable Ledger event 065 closes Tier 1.

Tier 1 history and accepted product semantics remain unchanged.

## Administrative opening

Before product work, the Master:

- created `SPR-002 / ITR-002 / SLC-008` documentation;
- recorded `SLC-009` and `SLC-010` as planned only;
- amended `IMP-001` and `VER-PLAN-001` for the authorized Tier 2 boundary;
- advanced CurrentIndex to `TIER-002 / SPR-002 / ITR-002 / SLC-008`;
- added planned Tier 2 relations; and
- appended immutable acceptance/opening/activation Ledger events.

No product source, dependency, lockfile, test, verification record or review
record was changed by this administrative transition. No Tier 2 verification
or completion is claimed.

The opening audit found `REQ-V-009`, `REQ-UI-005` and `REQ-S-005` carry T2
tags in `REQSET-001` but are not part of the authorized local-directory
acquisition Sprint. They remain unallocated planning work and were not placed
in the TIER-002/SPR-002 Relations requirement lists. Their ownership or
retiering must be decided before SLC-010 or Tier 2 closure.

## Contract decisions

- SLC-008 receives an already-selected directory handle and adds no picker UI.
- Capability detection is feature-based, prompt-free and separate from the
  adapter's mandatory `inspectPermissionState()` result.
- Recursive listing is best effort: accessible evidence survives nested
  failures and each additive listing returns entries plus one atomic
  complete/partial/failed acquisition snapshot. Only a clean exhaustive
  listing may claim an absent core file is missing.
- Root denial/failure is distinct from an empty project.
- Candidate indexes commit atomically by ordered attempt identity. Newer
  settled failure clears stale readable handles; older late completions cannot
  overwrite newer settled state.
- The constructor requires an opaque caller-supplied non-empty source ID;
  directory names and randomness are not used for identity.
- File contents are read afresh through `getFile().text()`; listing reads no
  contents.
- Browser handle types remain inside `src/adapters/browser`.
- The adapter exposes no write, upload, execution, telemetry, persistence or
  permission-request behavior.

## Evidence state

`VER-SLC-008` and `REV-SLC-008` do not exist at activation time. They may be
created only from real Master verification and a fresh independent review.

Implementation, correction and verification notes shall be appended below
without rewriting this opening record.

## SLC-008 Worker implementation pass

Date: 2026-07-14
Role: fresh bounded Worker; evidence is pending Master verification and fresh
independent review.

### Implemented decisions

- Added a browser capability probe that requires browser globals plus a
  callable directory-picker surface, never invokes that surface, never
  inspects a user agent and returns one stable unsupported reason.
- Added adapter-local structural handle types containing only `kind`, `name`,
  async directory entries, `getFile()`, `text()` and optional read-only
  `queryPermission({ mode: "read" })`.
- `BrowserDirectoryProjectSource` requires a non-empty opaque caller-supplied
  `sourceId`, defaults only its privacy-safe display label and keeps the root
  and indexed native handles in ECMAScript-private fields so hidden native
  write members are not exposed by the adapter.
- Added the framework-neutral atomic
  `ProjectSourceWithAcquisitionListing.listFilesWithAcquisition()` extension.
  `listFiles()` delegates to it. Each caller receives immutable entries and an
  immutable `complete`, `partial` or `failed` acquisition snapshot from the
  same attempt; sanitized root errors carry their immutable failed snapshot.
- Traversal validates each child as one segment and then validates every joined
  candidate through exact `normalizeProjectPath` equality. It sorts paths,
  excludes every ambiguous duplicate path, reads no file contents while
  listing and records stable diagnostics for permission denial, inaccessible
  entries, invalid names, unsupported kinds and duplicates.
- Only clean exhaustive traversal is `complete`. Skipped, ambiguous or
  inaccessible evidence makes a successful attempt `partial`; safe observed
  neighbors remain usable. Discovery suppresses missing-core conclusions for
  incomplete listings, retains `supported` when a partial listing still
  observed all three core sources, and remains `unknown` on rejected listing.
- Listing attempts build private candidate indexes and settle under monotonic
  attempt IDs. A newer settled failure clears prior readable handles; an older
  late success or failure cannot overwrite a newer settled result, while each
  caller still receives its own atomic attempt evidence.
- Reads accept only unchanged canonical indexed paths, lazily list once when no
  index exists, call `getFile().text()` for every read, do not cache text and
  map permission, disappearance and other read failures to sanitized stable
  adapter errors.
- Proved the adapter through unchanged discovery, parsing, normalization,
  validation and `analyzeProject` orchestration with fake selected handles.
  No React, SharedUI, picker call, permission request, write surface, Node
  filesystem, upload, telemetry, persistence, execution or Markdown parsing
  was added.

### Worker changed scope

- Added `src/adapters/browser/BrowserDirectoryProjectSource.ts` and its focused
  fake-handle/integration tests.
- Added `src/adapters/browser/browserDirectoryCapability.ts` and capability
  tests.
- Added `src/adapters/browser/fileSystemAccessTypes.ts`.
- Added `src/adapters/browser/browserBoundaries.test.ts`.
- Extended the framework-neutral source contract and discovery consumption in
  `src/core/source/ProjectSource.ts` and
  `src/core/discovery/discoverProject.ts`, with discovery regression tests.
- Updated the existing application boundary test for the authorized
  adapter-local browser acquisition surface.
- Updated `README.md` because its previous claim that no browser adapter
  existed became false; it still states that the UI and picker workflow are
  not implemented.
- No dependency, lockfile, UI component, SharedUI configuration, verification
  record, review record, traceability index/relation/ledger or handoff record
  was changed by the Worker.

### Worker command evidence

Environment: Microsoft Windows `10.0.26200`, PowerShell
`5.1.26100.8655`, Node `v24.11.0`, npm `11.6.1`.

- `npm ci` passed: 271 packages added, 272 audited, 0 vulnerabilities.
- Focused capability/adapter/boundary/discovery checks were rerun as the Master
  resolved contract contradictions. The earlier bounded set passed 29/29; the
  final atomic/concurrency set passed 32/32 across 4 files.
- `npm run typecheck` passed with TypeScript `--noEmit`.
- `npm test` passed: 23 files and 181 tests.
- `npm run build` passed: 2,070 modules transformed. Vite emitted the existing
  non-failing large-chunk advisory for the 650.04 kB minified application
  bundle.
- `npm ls SharedUI yaml --depth=0` passed with `SharedUI@0.1.0` and
  `yaml@2.9.0`.
- `git diff --check` passed. Git reported only the repository's LF-to-CRLF
  working-copy warnings and no whitespace error.
- Explicit production scans passed for picker invocation, permission request,
  write/writable APIs, network/telemetry, persistence, execution, Markdown
  parsing, Node filesystem use, UI dependencies and browser-type leakage.
- Path-policy and atomic-listing scans located the exact normalization,
  non-canonical read, duplicate, partial/failure and overlap coverage.
- Traceability syntax validation passed for 2 strict/duplicate-key YAML files,
  72 NDJSON object lines and active `SLC-008`.
- No configured lint command exists. No product, typecheck, test or build
  command failed. Focused and full commands were rerun after the final
  contract corrections rather than treating pre-correction success as final
  evidence.
- The first untracked-file whitespace scan invocation failed because a
  PowerShell interpolated path followed immediately by `:` needed braces. The
  corrected scan then found this note's intentional Markdown hard-break spaces
  on its date line. Those spaces were removed and the corrected scan was rerun;
  its final result is recorded below.
- The final corrected untracked-file scan passed for all 9 untracked files:
  no trailing whitespace and every non-empty file ended with a newline.

### Limitations and residual risk

- Tests use deterministic structural fake handles in Node. Real-browser picker
  invocation and user-gesture UX are deliberately deferred to `SLC-009`; broad
  native browser compatibility acceptance remains `SLC-010` work.
- Cloud-backed or provider-managed filesystem behavior is outside application
  control even though adapter exceptions are sanitized.
- External filesystem mutation can occur between or during operations, so a
  listing is not a transactional filesystem snapshot; each text read is
  intentionally fresh.
- Large/deep directory traversal limits, file-size limits and cancellation are
  future hardening discoveries, not SLC-008 scope.
- The Vite large-chunk advisory remains non-blocking and unrelated to the
  adapter boundary.

The Worker stopped at the SLC-008 boundary. No `SLC-009` or `SLC-010` product
behavior, completion claim, commit, push or pull request was created.

## SLC-008 bounded evidence-correction pass

Date: 2026-07-14
Role: fresh bounded Worker; test evidence remains subject to Master verification
and fresh independent review.

- Added test-only composition coverage proving that an invalid canonical child
  path, unsupported entry kind, duplicate canonical path and nested iterator
  failure each yield `partial` acquisition evidence. For every category,
  direct discovery and full `analyzeProject` retain `unknown` profile support,
  propagate the category diagnostic and emit no
  `DISCOVERY_MISSING_CORE_SOURCE` claim for unobserved core paths.
- Added an end-to-end overlap test using two concurrent `analyzeProject` calls
  on the same browser source. The older listing is deferred and exposes invalid
  stale file contents; the newer listing settles and supplies valid fixture
  handles. Both analyses produce the same supported result, the stale handles
  are never read and the current handles are read once per analysis.
- No product source or Master-owned planning, traceability, handoff,
  verification or review record was changed by this correction.
- Focused browser/discovery tests passed: 4 files and 34 tests.
- `npm run typecheck` passed.
- `npm test` passed: 23 files and 183 tests.
- A build was not rerun by this Worker because the correction changed tests
  only; the Master retains responsibility for final Slice verification.

The correction Worker stopped at the SLC-008 boundary. No commit, push or pull
request was created.

## SLC-008 Master verification

Date: 2026-07-14
Status: passed; fresh independent review pending.

The Master inspected the implementation and the bounded evidence correction,
then recorded the complete evidence in `VER-SLC-008`. Final reruns passed:

- clean dependency installation with 0 vulnerabilities;
- focused browser/discovery checks: 4 files and 34 tests;
- strict typecheck;
- complete regression: 23 files and 183 tests;
- focused Tier 1 regression: 5 files and 14 tests;
- production build: 2,070 transformed modules;
- exact `SharedUI@0.1.0` and `yaml@2.9.0` resolution;
- diff and untracked-file hygiene;
- package, UI and accepted SPR-001 preservation;
- prohibited picker/request/write/network/persistence/execution scans;
- adapter/core browser-type boundaries; and
- strict YAML, NDJSON and stable-ID traceability validation.

Evidence-harness mistakes and their corrected reruns are preserved in the
verification record. No product command failed. `VER-SLC-008` is now linked
with passed outcome, but no review or completion is claimed until a fresh
independent Reviewer approves the verified tree.

## SLC-008 independent review and completion

Date: 2026-07-14
Disposition: approved; no actionable findings.

A fresh SDP Reviewer independently read the complete contract, traceability,
implementation, tests and verification record. The Reviewer reproduced 4
focused files/34 tests, 23 total files/183 tests, 5 Tier 1 regression files/14
tests, strict typecheck, the 2,070-module production build, exact dependency
versions, diff/untracked hygiene, prohibited-surface and boundary scans, strict
YAML/73-event Ledger validation and the unchanged 65-event Tier 1 prefix.

The Master created and linked `REV-SLC-008`, linked the review from
`VER-SLC-008`, appended immutable review/completion events 074-075 and marked
only SLC-008 completed. Tier 2, SPR-002 and ITR-002 remain active. CurrentIndex
remains on SLC-008. SLC-009 and SLC-010 remain planned; no later-Slice product
work, commit, push or pull request was created.

During integration, one broad status patch initially matched `TIER-002`
instead of `SLC-008`. The Master caught it in the immediate status inspection,
restored Tier 2 to active, marked only SLC-008 completed and then ran the final
post-review traceability validation. No review evidence or product file was
affected.
