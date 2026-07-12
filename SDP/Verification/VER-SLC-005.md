# VER-SLC-005 — Deterministic validation engine and initial rules

Status: passed; final independent review approved
Verification ID: `VER-SLC-005`
Slice: `SLC-005`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

## Scope verified

This record verifies the uncommitted SLC-005 implementation against the full
active contract. It covers the presentation-neutral Finding/context/rule
contracts, structural fingerprints, canonical ordering, failure-isolated
engine, explicit SDP001-SDP008 registry, application orchestration, fixtures,
tests, preserved earlier behavior and the SLC-006 boundary.

## Environment and tree

- Windows, Node.js `v24.11.0`, npm `11.6.1`.
- Branch `main`; accepted baseline/current HEAD
  `2023db3541cb3f3bd54d44027b843bf7ba70ea57`.
- Work remains uncommitted by explicit instruction.

## Commands and outcomes

- `npm ci`: passed; 270 packages added, 271 audited, zero vulnerabilities.
- `npm run typecheck`: passed with no diagnostics.
- Focused verbose validation/integration command: passed; 4 files, 16 tests.
- `npm test`: passed; 16 files, 112 tests.
- `npm run build`: passed; 1,976 modules, 0.53 kB HTML, 72.91 kB CSS and
  510.87 kB JavaScript (150.91 kB gzip). The existing non-failing chunk-size
  advisory remains.
- `npm ls SharedUI yaml --depth=0`: passed; `SharedUI@0.1.0`, `yaml@2.9.0`.
- `git diff --check`: passed; line-ending notices only.
- Boundary scan found no React, SharedUI, Node filesystem, ambient-time/random,
  Markdown, health-score or write API in the new core/application surface.
- UI diff check passed; UI is unchanged.
- Strict CurrentIndex/Relations/Ledger assertions passed through event 036.

No lint command exists. No live browser check was required because UI is
unchanged; the rendered application coverage remains in the full suite.

## Policy inspection

Fingerprints encode rule ID, canonical affected IDs, canonical complete source
identities and an optional stable discriminator. Prose, severity, insertion
order, randomness and time are excluded. Findings sort by severity rank
error/warning/unknown/info, rule ID, canonical IDs, canonical sources and
fingerprint. Rules execute by stable ID. Duplicate fingerprints are suppressed;
unexpected exceptions become diagnostics and later rules continue.

SDP003 is endpoint-specific. SDP001 groups by core source, SDP004 by Ledger
line, SDP006 judges contradictory explicit hierarchy only, and SDP007 requires
an explicit verification relation to a verification entity with exact passed
outcome. Every built-in finding has real or stable synthetic provenance.

## Result and boundary

All Master verification gates pass. SLC-005 remains active pending fresh
independent review. CurrentIndex remains on SLC-005; SLC-006 remains planned and
untouched. This record does not mark the Slice complete.

## Post-review correction verification

After `REV-SLC-005` required changes, a bounded correction added the missing
permanent regressions and included resolved verification-target entity sources
in failing SDP007 findings. The Master inspected the correction and reran:

- focused verbose suite: passed, 4 files and 25 tests;
- `npm run typecheck`: passed;
- `npm test`: passed, 16 files and 121 tests;
- `npm run build`: passed with the same existing chunk advisory;
- `npm ls SharedUI yaml --depth=0`: passed with the same exact versions;
- `git diff --check`: passed with line-ending notices only;
- boundary and strict YAML/NDJSON traceability checks: passed.

The added regressions explicitly cover source-location fingerprint changes,
severity/source ordering, built-in-rule immutability and repeatability,
unresolved active Iteration and Slice, review-only SDP007 evidence,
wrong-kind/missing/failed verification-target provenance, missing-target
provenance, and malformed/non-object Ledger evidence beside retained valid
neighbors. SLC-005 remains active pending fresh re-review.
