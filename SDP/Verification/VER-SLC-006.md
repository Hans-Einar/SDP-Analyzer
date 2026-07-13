# VER-SLC-006 — Application workflow and read-only findings UI

Status: passed after post-completion source-ownership correction; final fresh review approved
Verification ID: `VER-SLC-006`
Slice: `SLC-006`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

## Scope verified

This record verifies the active SLC-006 implementation against its complete
contract: application-owned analysis lifecycle, full fixture pipeline,
SharedUI composition, truthful summaries, separate diagnostics/findings,
complete provenance, compatibility and lifecycle states, accessibility,
preserved boundaries and the SLC-007 stop.

## Environment and tree

- Windows; branch `main`; accepted baseline/current HEAD
  `f27541559a3b5103fbafa97fca4d9830d9b0f5ff`.
- Work remains uncommitted by explicit instruction.

## Exact command evidence

- `npm ci`: passed; 270 packages added, 271 audited, zero vulnerabilities.
- `npm run typecheck`: passed with no diagnostics.
- `npm test`: passed; 17 files, 132 tests.
- `npm run build`: passed; 2,067 modules; 0.53 kB HTML, 72.91 kB CSS and
  643.49 kB JavaScript (191.03 kB gzip). The existing non-failing chunk-size
  advisory remained.
- `npm ls SharedUI yaml --depth=0`: passed; `SharedUI@0.1.0`, `yaml@2.9.0`.
- `git diff --check`: passed; line-ending conversion warnings only.
- No lint command is configured.

## Rendered and accessibility evidence

- A real in-app browser smoke against Vite rendered the complete clean bundled
  fixture analysis, supported compatibility, summary counts, declared Sprint/
  Refactor/Iteration/Slice and distinct honest diagnostic/finding empty states.
- Browser inspection found one stylesheet, no horizontal overflow and no
  console warning/error.
- Loading uses a polite busy live region; failure uses an alert and removes
  stale success. Findings are native buttons with accessible names and selected
  state. Tests cover Enter/Space activation, detail opening and immutable
  filters. Severity always has explicit text in addition to Badge tone.

## Behavioral evidence

- The presentation-neutral controller represents idle/loading/ready/failed,
  retains one result, clears stale success, hides failure details and ignores
  late completion from superseded runs.
- Tests cover partial/unknown/unsupported compatibility, missing versus null
  declarations, diagnostic code/severity/location/pointer, canonical finding
  order, affected IDs, explanation, recommendation, fingerprint and all
  provenance. Snapshot diagnostics render once; validation-engine diagnostics
  stay distinct; findings remain separate and canonically ordered.

## Boundary and scope evidence

- `SharedUI/styles.css` has exactly one import at `src/main.tsx:3`.
- Core, application and adapters import no React/React DOM/SharedUI. UI contains
  no parser, normalizer or validator implementation calls.
- No filesystem acquisition, graph, report/export, health score, repair,
  write-back, routing, persistence, mutation or analyzed-code execution was
  added. SharedUI is unchanged; SLC-001 through SLC-005 remain passing;
  SLC-007 remains planned and untouched.
- CurrentIndex remains on SLC-006. YAML and NDJSON syntax passed.

## Result

All Master verification gates pass. SLC-006 remains active pending fresh
independent review. This record does not mark the Slice complete.

## Post-review correction verification

The first independent review required a current handoff and real keyboard
activation evidence. Handoff now reflects passed Master verification and the
changes-required review. The focused regression now uses
`@testing-library/user-event@14.6.1` to activate the focused native finding
button with Enter and Space without injecting a click.

The first clean-install attempt after this correction completed `npm ci` but
Vitest startup failed because `node_modules/convert-source-map/index.js` was
transiently absent. No product assertion ran in that failed attempt. A second
lockfile-clean `npm ci` restored the dependency tree and the complete sequence
then passed:

- `npm ci`: passed; 271 packages added, 272 audited, zero vulnerabilities;
- `npm run typecheck`: passed;
- `npm test`: passed; 17 files, 132 tests, including user-event Enter and Space
  activation with no separate click;
- `npm run build`: passed; 2,067 modules with the same chunk advisory;
- dependency listing passed with `SharedUI@0.1.0`, `yaml@2.9.0` and
  `@testing-library/user-event@14.6.1`;
- `git diff --check`: passed with line-ending warnings only.

The successful rerun supersedes the transient dependency-tree failure but does
not erase it. SLC-006 remains active pending fresh re-review.

## Post-completion source-ownership correction verification

The third fresh audit reopened SLC-006 because selected source was not owned
with lifecycle/result by the application controller, SharedUI retained an inert
duplicate source value, the fixture panel was insufficient and permanent UI
evidence did not assert all required summary/declaration/compatibility and
provenance fields. A fresh bounded Worker corrected only those findings.

Master verification of the corrected tree passed:

- `npm ci`: passed cleanly; 271 packages added, 272 audited, zero
  vulnerabilities;
- focused controller/UI command: passed, 2 files and 15 tests;
- `npm run typecheck`: passed with no diagnostics;
- `npm test`: passed, 17 files and 135 tests;
- `npm run build`: passed, 2,067 modules, 0.53 kB HTML, 72.91 kB CSS and
  644.70 kB JavaScript (191.31 kB gzip); the existing non-failing chunk-size
  advisory remained;
- `npm ls SharedUI yaml @testing-library/user-event --depth=0`: passed with
  `SharedUI@0.1.0`, `yaml@2.9.0` and exact
  `@testing-library/user-event@14.6.1`;
- `git diff --check`: passed with line-ending warnings only;
- stylesheet, boundary, UI-core, raw-shadcn, prohibited-scope and SLC-007 scans
  passed; SharedUI dashboard state/statePolicy are empty and selected source is
  present only in the application controller lifecycle;
- YAML/NDJSON syntax and the immutable 41-line Ledger prefix passed;
- a real rendered browser smoke showed one visible Fixture source region with
  bundled name/source ID and local-folder limitation, supported summary,
  declared values and honest empty states; one stylesheet, no horizontal
  overflow and no console warning/error were observed.

CurrentIndex remains on SLC-006. Relations keeps SLC-006 active and
`REV-SLC-006` changes required pending a new fresh independent review. SLC-007
remains planned and untouched.
