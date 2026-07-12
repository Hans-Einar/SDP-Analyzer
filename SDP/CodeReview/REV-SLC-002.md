# REV-SLC-002 - Project source, provenance and discovery

Review ID: `REV-SLC-002`
Slice: `SLC-002`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12
Reviewer role: fresh independent SDP Reviewer

## Scope and authority

This review covers exactly `SPR-001 / ITR-001 / SLC-002`. It does not
implement fixes, alter product or traceability state, authorize completion, or
begin `SLC-003`.

The review was re-anchored from repository evidence rather than Worker or
Master summaries. The authoritative read included `AGENTS.md`,
`AGENTS-project.md`, `SDP/AGENT-REMINDERS.md`, `SDP/Framework/README.md`, the
repository-local SDP Reviewer and traceability skills, `CurrentIndex.yaml`,
`Relations.yaml`, `Ledger.ndjson`, `REQSET-001`, `ARC-001`, `DAN-001`,
`DES-001`, `IMP-001`, the complete SLC-001 and SLC-002 records and contracts in
`ScrumIterations.md`, `implementationNotes.md`, `VER-SLC-001.md`,
`REV-SLC-001.md`, `VER-SLC-002.md`, `verification-plan.md`, `Handoff.md`, the
package manifest and lockfile, and the complete current source/test tree.

The complete uncommitted transition and implementation scope was inspected,
including every modified and untracked file, the diff from committed SLC-001
baseline `c83c88a`, and the unchanged SLC-001 source/configuration surrounding
the SLC-002 changes. The tree remains uncommitted on `main`, synchronized with
`origin/main` at the reviewed baseline.

## Evidence inspected and rerun

- `git status --short --branch`, `git diff --stat`, `git diff --name-status`,
  full product/SDP diffs, untracked-file enumeration, and direct line-numbered
  inspection of all files under `src` were completed. No unexpected file was
  found.
- `package.json` and the complete 4,746-line lockfile were parsed and checked.
  The lock has 270 package entries, matches the manifest's exact direct
  dependencies, resolves `SharedUI` from `file:SharedUI-0.1.0.tgz` with an
  integrity hash, and contains no direct parser dependency or package/lock
  diff in SLC-002.
- `npm ci`: passed with exit code 0; added 269 packages, audited 270 packages,
  and reported zero vulnerabilities.
- `npm run typecheck`: passed with exit code 0 and no diagnostics.
- `npm test`: passed with exit code 0 under Vitest `4.1.10`; 4 test files and
  23 tests passed.
- `npm test -- --reporter=verbose`: passed and exposed the individual path,
  fixture, discovery, partial-profile, invalid-path, determinism, provenance,
  no-content-read, and rendered UI cases.
- `npm run build`: passed with exit code 0; TypeScript completed and Vite
  `8.1.4` transformed 1,976 modules. The emitted JavaScript was 510.07 kB
  minified (150.61 kB gzip), with the already-recorded non-failing chunk-size
  warning.
- `npm ls SharedUI --depth=0`: passed and resolved `SharedUI@0.1.0`.
- `git diff --check`: passed with exit code 0; output contained only the
  existing Windows LF-to-CRLF working-copy notices.
- Focused import/scope scans found exactly one `SharedUI/styles.css` import at
  `src/main.tsx:3`; no React, React DOM, or SharedUI import in `src/core`,
  `src/application`, or `src/adapters`; no browser/Node filesystem dependency
  in core; no parser call/dependency; and no entity, relation, snapshot,
  validation-rule, finding, filesystem-adapter, write, execution, or SLC-003
  implementation.
- Read-only unique-key YAML validation passed for `CurrentIndex.yaml` and
  `Relations.yaml`. Semantic assertions confirmed SLC-001 completed, SLC-002
  active with the exact 13 contract requirement IDs and `VER-SLC-002`, and
  SLC-003 planned.
- All 18 nonblank ledger lines parsed as JSON with unique event IDs. A direct
  comparison with `HEAD` confirmed that committed events 001-015 are unchanged
  and current events 016-018 are append-only.
- The in-app browser surface was unavailable to this Reviewer. The independent
  rendered jsdom test passed, and the Master browser evidence in
  `VER-SLC-002.md` was inspected for the visible 14-file, 3/3 core,
  `supported`, zero-diagnostic smoke state. No claim of a second live browser
  run is made.
- A read-only Vite module probe exercised branches not covered by the permanent
  suite. It confirmed deterministic duplicate canonical-path handling and
  reproduced the source-list failure described below from the current source.

## Findings

### Medium

1. **A failed source listing is misreported as a partial current profile with
   three invented missing-file diagnostics.**

   `src/core/discovery/discoverProject.ts:123`-`132` catches a rejected
   `listFiles()` call by invoking `createManifest(sourceId, [], diagnostics)`.
   `createManifest` then treats that synthetic empty array as a successful
   observation at lines 82-92 and reports all three core files missing; lines
   107-113 label the installed profile `sdp-toolkit-current / partial`.

   The focused execution against a source whose `listFiles()` throws
   `listing unavailable` returned four diagnostics: three
   `DISCOVERY_MISSING_CORE_SOURCE` warnings followed by the actual
   `DISCOVERY_SOURCE_LIST_FAILED` error, with profile support `partial`. A
   listing failure provides no evidence that any core source is absent and no
   evidence that the selected project is a partial instance of the current
   profile. The result therefore converts an access failure into unsupported
   repository facts, contrary to the Slice's honest diagnostic/profile
   contract, `ARC-001` source-access error strategy, `ADR-008`, and the
   explicit `unknown` support state in the manifest contract.

   The permanent discovery tests at
   `src/core/discovery/discoverProject.test.ts:34`-`178` cover a successfully
   listed source with a genuinely missing core file, but do not cover a
   rejected `listFiles()` call. Correct the failure path so unobserved structure
   is not described as missing or partial (normally `support: "unknown"` plus
   the source-list diagnostic), and add a deterministic test that distinguishes
   listing failure from a successful empty/partial listing.

No other actionable finding was identified.

## Path-safety assessment

- `SourceKind`, `SourceRef`, `DiagnosticSeverity`, and `Diagnostic` match the
  readonly `DES-001` contracts. No parser AST, parsed-record, entity, relation,
  snapshot, rule, or finding model was introduced.
- `normalizeProjectPath` is pure and returns a discriminated success/error
  result with the original input, stable code, and message. It imports no Node
  or browser API.
- Canonical repository-relative input is retained. Backslashes convert to `/`,
  and redundant separators collapse deterministically to one canonical path.
- Empty and separator-only paths, leading slash/backslash and UNC-like input,
  drive-letter paths including drive-relative forms, exact `.` segments, and
  exact `..` traversal segments all fail explicitly. Unsafe traversal is not
  silently collapsed.
- The tests directly cover canonical input, Windows separators, rooted and UNC
  forms, drive letters, empty input, dot segments, parent traversal, and
  Windows-form traversal. Fixture reads additionally reject a safe but
  non-canonical Windows-form path rather than silently accepting it.
- `compareProjectPaths` uses locale-independent code-unit ordering, producing
  the same order in the Node tests and browser bundle.

## Fixture, discovery, and provenance assessment

- `ProjectSource` remains the minimal readonly source boundary: two readonly
  identity fields, `listFiles()`, and `readText()`. It has no handle, platform
  type, write API, parser method, plugin abstraction, or streaming surface.
- The bundled fixture contains exactly the 14 contract paths. A direct read
  measured 601 total placeholder characters, with each file between 35 and 56
  characters, so it represents structure without duplicating the live
  repository.
- Fixture ordering is deterministic and canonical. `readText()` accepts only a
  known exact canonical path and throws typed `FixtureSourceReadError` codes for
  unsafe, non-canonical, and unknown reads. Internal text/path collections are
  frozen, returned listings are detached, and no mutation or execution API
  exists.
- On successful listing, `discoverProject` calls only `listFiles()` and never
  `readText()`. It normalizes and code-point sorts paths, classifies the known
  YAML/JSON/NDJSON/Markdown extensions, preserves unknown extensions as
  `synthetic` with an informational diagnostic, and locates only the three exact
  Tier 1 core paths.
- Every accepted file has matching `sourceId`, canonical `path`, and
  `SourceKind` provenance. Line/column/pointer fields remain absent because
  parsing is correctly deferred.
- All seven lifecycle directory paths and the Sprint, Verification, CodeReview,
  and Traceability presence flags are derived only from listed paths. No ID,
  status, active work, YAML, Relations, Ledger, or Markdown content is inferred.
- Invalid paths produce an error diagnostic and are excluded without erasing
  valid entries. Canonical collisions are deterministically reduced to one
  file and produce `DISCOVERY_DUPLICATE_PROJECT_PATH`; the focused runtime probe
  confirmed that behavior. A successfully listed source missing a core file
  correctly returns `partial` with a stable missing-core diagnostic.
- The sole exception is the failed-listing behavior in the finding above; that
  prevents approval despite the correct complete/partial happy paths.

## Application, UI, and architecture-boundary assessment

- The application preview remains presentation-neutral. It consumes the
  discovery result and retains the original known canonical text read without
  moving content parsing into discovery.
- The UI change is subordinate and truthful for the bundled smoke state: it
  labels SLC-002 as read-only discovery without parsing, then displays file
  count, 3/3 core presence, structural profile support, diagnostic count, and a
  sample placeholder read.
- `DashboardRenderer`, `defineDashboardConfig`, and the registry spread from
  `baselineComponentRegistry` remain intact. The existing semantic `TopNav`,
  `PageHeader`, `Section`, `Badge`, `CardSkeleton`, `AlertBanner`, and
  `DetailPanel` keys are reused. No local component, CSS file, generic
  primitive, token system, or raw shadcn import was added.
- SharedUI appears only in `src/ui` and the allowed composition entry;
  `SharedUI/styles.css` is imported once. Core, application, and adapters have
  no React/SharedUI dependency.
- Core has no browser or Node filesystem dependency. The package and source
  scans found no YAML/NDJSON/Markdown parser, `JSON.parse` content path,
  normalization beyond project paths, entity/status model, validation/finding
  model, browser/Node filesystem adapter, repair/write-back, code execution,
  CLI/CI, graph, or SLC-003 work.

## Test-contract assessment

The 23-test suite genuinely covers each of the 12 minimum SLC-002 cases:

1. canonical normalization;
2. Windows separator normalization;
3. absolute/leading-slash/UNC rejection;
4. drive-letter rejection;
5. `.` and `..` rejection;
6. unknown fixture-read rejection;
7. exact deterministic 14-file ordering;
8. all three core discoveries;
9. successful-listing partial support when a core file is absent;
10. provenance on all 14 discovered files;
11. repeated manifest equality with zero content reads; and
12. the rendered SharedUI application smoke.

Additional cases cover typed unsafe/non-canonical fixture reads, recognized
extension classification, standard directories, and invalid-path continuation.
The missing source-list failure test is material because the implemented catch
branch currently returns the false facts described in the finding.

## Verification and traceability assessment

- `VER-SLC-002.md` exists, is scoped to SLC-002, records the complete
  uncommitted product/transition scope, exact commands, 23-test count, build
  warning, browser evidence, limitations, and append-only transition state.
  This review independently reproduced every executable gate. Its passing
  command evidence remains accurate, but command success does not override the
  failure-path finding.
- `CurrentIndex.yaml`, the Sprint contract, Handoff, and `Relations.yaml` agree
  that `SPR-001 / ITR-001 / SLC-002` is active. SLC-001 is completed and ledger
  event 016 records supervising acceptance. SLC-003 remains planned and no
  later-Slice product code was found.
- `Relations.yaml` maps SLC-002 and `VER-SLC-002` to the exact 13 requirement
  IDs in the contract and the stated architecture/design references. YAML
  syntax and duplicate-key checks passed.
- `Ledger.ndjson` remains append-only through event 018. The first 15 committed
  events are byte-for-line unchanged; events 016-018 record SLC-001 acceptance,
  SLC-002 activation, and SLC-002 verification respectively.
- No SLC-002 review relation or review ledger event existed before this record,
  which is the correct pre-integration state. The Master must integrate actual
  review/rework evidence without marking the Slice complete while the finding
  remains open.

## Residual risks and discoveries

- Structural `supported` status in SLC-002 means only that the three exact core
  paths were listed. Schema/content compatibility remains deferred and must not
  be silently upgraded during parsing work.
- Unknown extensions map to `synthetic` with an informational diagnostic
  because the accepted `SourceKind` union has no `unknown` member. This is
  explicit rather than silent, but later profile work should preserve the
  distinction.
- Canonical duplicate handling was directly exercised during review but does
  not yet have a permanent unit case. The current implementation is
  deterministic and diagnostic-bearing; a future hardening test would be
  useful but is not a second blocking finding.
- No lint command is configured. The 510.07 kB SharedUI bundle warning remains
  non-failing and already documented.
- An independent live browser check could not be performed because the in-app
  browser surface was unavailable. The rendered jsdom check, production build,
  and inspected Master browser record are the available UI evidence.

## Disposition

**Changes required.** Correct the source-list failure semantics and add the
focused regression test, rerun applicable gates, and obtain fresh independent
re-review. Review stops at SLC-002.

---

## Correction re-review — 2026-07-12

Reviewer role: second fresh independent SDP Reviewer

This re-review covers only the corrected current tree for
`SPR-001 / ITR-001 / SLC-002`. The original finding and original
changes-required disposition above remain unchanged as historical evidence.
Repository evidence was re-read independently, including the complete Slice
contract, implementation notes, correction verification, traceability state,
current source/test tree and full uncommitted SLC-002 diff.

### Correction evidence rerun

- `npm test -- src/core/discovery/discoverProject.test.ts --reporter=verbose`
  passed with exit code 0: 1 test file and all 6 discovery tests passed. The
  focused regression executed the rejected-listing, successful empty-listing,
  complete supported-profile, partial-profile, deterministic-ordering,
  provenance, invalid-path and zero-content-read behavior.
- `npm run typecheck` passed with exit code 0 and no diagnostics.
- `npm test` passed with exit code 0 under Vitest `4.1.10`: 4 test files and
  all 24 tests passed, including the unchanged rendered SharedUI smoke.
- `npm run build` passed with exit code 0. Vite `8.1.4` transformed 1,976
  modules and emitted 72.88 kB CSS and 510.26 kB JavaScript (150.65 kB gzip).
  The previously recorded greater-than-500-kB warning remains non-failing.
- `git diff --check` passed with exit code 0; output was limited to the
  existing Windows LF-to-CRLF working-copy notices.
- `npm ls SharedUI --depth=0` passed and resolved `SharedUI@0.1.0`.
- Read-only unique-key YAML and NDJSON validation passed. Semantic assertions
  confirmed `SLC-001` completed, `SLC-002` active with the exact 13 contract
  requirements plus `VER-SLC-002` and `REV-SLC-002`, and `SLC-003` planned.
  All 20 ledger events parsed as unique JSON objects; the committed events
  001-015 remain line-for-line unchanged, and events 019-020 are append-only
  review/correction evidence.
- Focused scans found exactly one `SharedUI/styles.css` import; no React,
  React DOM or SharedUI import below the UI boundary; no browser/Node platform
  dependency in core; no parser call or dependency; no entity, rule, finding,
  filesystem adapter, write, execution or later-Slice implementation; no
  package/lock diff; and no `readText` reference in `discoverProject.ts`.

### Correction assessment

The rejected `listFiles()` branch now returns an unobserved manifest with
`sdp-toolkit-current / unknown`, empty discovered structure and exactly one
`DISCOVERY_SOURCE_LIST_FAILED` error. It no longer routes unobserved evidence
through `createManifest`, so it does not invent missing-core warnings or claim
partial structural support.

The permanent regression executes the failed source twice and compares the
complete manifests, asserts the exact unknown/error result, then separately
executes a successfully observed empty source and confirms the prior `partial`
result with three `DISCOVERY_MISSING_CORE_SOURCE` warnings. Both sources retain
zero `readText()` calls. Existing tests independently preserve the complete
fixture's `supported` result and the non-empty missing-core source's `partial`
result. Canonical sorting, provenance and successful discovery logic are
unchanged.

The product correction is confined to the source-list failure branch in
`src/core/discovery/discoverProject.ts` and its focused regression in
`src/core/discovery/discoverProject.test.ts`; implementation notes append the
correction evidence. Master verification and append-only ledger event 020
record the correction. No unrelated product, UI, fixture, path, application,
package, transition or `SLC-003` behavior was introduced.

The UI did not change during correction. The passing rendered application test
and the existing Master live-browser evidence in `VER-SLC-002.md` therefore
remain applicable; this Reviewer makes no claim of an additional live-browser
run.

### Remaining findings

None. The sole original medium finding is resolved, and no new actionable
issue was identified in the corrected current tree.

## Final disposition after correction re-review

**Approved.** The corrected SLC-002 tree satisfies its contract and may proceed
to Master traceability integration and the Slice completion decision. This
review stops at SLC-002; SLC-003 remains planned and was not begun.
