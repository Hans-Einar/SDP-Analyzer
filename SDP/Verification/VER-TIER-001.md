# VER-TIER-001 — Structured-core analyzer Tier acceptance

Status: passed; fresh independent Tier review approved and closure integrated
Verification ID: `VER-TIER-001`
Tier: `TIER-001`
Sprint: `SPR-001`
Iteration: `ITR-001`
Slices: `SLC-001` through `SLC-007`
Date: 2026-07-13

## Accepted Tier boundary

Tier 1 is the `sdp-toolkit-structured-core-v1` analyzer profile defined by
`DEC-STU-015`. It analyzes CurrentIndex, Relations and Ledger content and
discovers/classifies standard Markdown paths without reading Markdown content.
This is not complete analysis of every installed SDP document.

The accepted Tier boundary explicitly excludes Markdown heading/structure
parsing, Markdown stable-ID extraction, lifecycle/work-document content and
verification/review document interpretation. Those capabilities are planned
for `TIER-003` under stable `REQ-D-003`.

## Baseline and integrated rerun

- Committed verification anchor:
  `4e2018a45614f76a3ed207272a86badc366d1fac`.
- Accepted SLC-006 product baseline:
  `d08e097f2813231ca29c13293459697aace2e706`.
- Current work is intentionally uncommitted.
- Master rerun environment: Windows, Node `v24.11.0`, npm `11.6.1`.

The final integrated rerun passed clean `npm ci`, strict typecheck, 20 test
files/155 tests, the 2,069-module static production build, exact SharedUI/YAML
dependency inspection and diff hygiene. Focused reruns passed 27 `SDP007`
tests, 25 fixture/boundary tests and 18 UI/controller tests. A separate
repository-only isolated copy reproduced install, typecheck, all tests, build
and dependency resolution.

## Evidence across SLC-001 through SLC-007

- `SLC-001` established deterministic npm/Vite/TypeScript commands, the
  read-only source boundary and SharedUI shell/import constraints.
- `SLC-002` established canonical path discovery and structured-core source
  location with supported/partial/unknown acquisition evidence.
- `SLC-003` established strict safe CurrentIndex, Relations and independent
  NDJSON-line parsing with neighboring-record preservation.
- `SLC-004` established immutable deterministic normalization, explicit entity
  and relation policy, active declarations and complete provenance.
- `SLC-005` established the presentation-neutral Finding model, stable
  fingerprints, canonical ordering, exception isolation and rules
  `SDP001`–`SDP008`.
- `SLC-006` established the application lifecycle/controller and SharedUI
  presentation of summary, active work, separate diagnostics/findings,
  compatibility and complete finding detail.
- `SLC-007` integrated the complete pipeline, corrected `SDP007` to
  `DEC-STU-016`, added non-vacuous clean and real broken inputs, proved exact
  three-file reads, hardened stale/filter behavior, made the structured-core
  limitation visible and reproduced the whole Tier from a clean isolated
  copy.

Prior passed Slice verification and approved review records remain linked for
SLC-001 through SLC-006. `VER-SLC-007` contains the complete current integrated
command, browser, static, traceability and isolated-copy evidence rather than
relying only on those historical records.

## Tier 1 requirement coverage

The integrated Tier accepts:

- functional requirements `REQ-F-001` through `REQ-F-006`;
- data/parsing requirements `REQ-D-001`, `REQ-D-002` and `REQ-D-004` through
  `REQ-D-007`;
- validation requirements `REQ-V-001` through `REQ-V-008`;
- provenance requirements `REQ-P-001` through `REQ-P-004`;
- UI requirements `REQ-UI-001` through `REQ-UI-004`;
- verification requirements `REQ-T-001` through `REQ-T-005`;
- security/privacy requirements `REQ-S-001` through `REQ-S-003`;
- compatibility requirements `REQ-C-001` through `REQ-C-003`;
- maintainability requirements `REQ-M-001` through `REQ-M-005`; and
- non-functional requirements `REQ-NF-001` through `REQ-NF-005`.

`REQ-D-003` is deliberately not claimed. `REQ-D-007` is satisfied by
canonical path-only Markdown discovery/classification and permanent proof that
no Markdown content read occurs.

## Product acceptance evidence

The clean shipped workflow is non-vacuous and finding-free. It contains a past
completed Slice with an explicit verification relation to a verification
entity that has a truthful synthetic check description and exact passed
outcome. The broken shipped workflow produces real safe diagnostics and
canonical explainable findings through the same discovery → parse → normalize
→ validate → lifecycle → SharedUI path.

Repeated clean and broken analyses are deterministic. Fingerprints, ordering,
complete SourceRefs and immutable results cross the application/UI boundary.
Partial acquisition preserves neighboring evidence. Loading, ready, empty,
failed, partial, unknown and unsupported presentation states are covered;
unsupported is presentation-only because current discovery does not emit it.
Source switches, failures, filters and repeated actions do not retain or
duplicate stale state.

Real browser workflows verified the shipped clean and broken selector paths,
structured-core disclosure, clean empty states, broken diagnostics/findings,
full `SDP007` provenance, repeat behavior and stale-selection reset with no
console warning/error or horizontal overflow. Native Enter/Space behavior is
covered by permanent rendered user-event tests.

## Security, privacy and architectural result

The Tier is read-only and fixture-only. Analyzed content is never executed,
uploaded, written back or repaired. Recorded verification commands are treated
as data and are not run by the analyzer. Missing entities and provenance are
not invented. Strict parsing rejects or isolates unsafe/malformed input while
preserving usable neighbors.

Core/application/adapter boundaries remain independent of React and SharedUI;
presentation does not interpret verification semantics. SharedUI remains the
single UI baseline, its stylesheet is imported once, and no filesystem,
graph, report, CLI/CI, stale-work, repair or write-back feature has begun.

## Traceability and history result

The planning correction is coherent across Study, Requirements, Architecture,
Design Analysis, Design, Implementation and the SLC-007 contract. Immutable
block event 056 is preserved and event 057 records the supervising resolution.
CurrentIndex remains on SLC-007. The 56-event committed prefix is byte-for-line
unchanged, all current Ledger IDs are unique, and YAML/NDJSON syntax and
requirement/decision links pass.

## Known Tier 1 limitations

- acquisition is limited to shipped in-memory fixtures; local-folder access is
  Tier 2 work;
- Markdown is path-discovered only; content, headings, stable IDs, statuses,
  lifecycle text and verification/review records are not analyzed;
- there is no graph view, report export, CLI/CI integration, stale-work policy,
  automatic repair or write-back; and
- the existing production bundle retains a non-failing size advisory.

## Result

The complete structured-core Tier 1 verification passes. Fresh independent
`REV-SLC-007` and `REV-TIER-001` reviews reproduced the applicable evidence and
approved with no actionable finding. The Master linked those records and
completed SLC-007, ITR-001, SPR-001 and TIER-001 through immutable events
060-065. The project remains `active-development`, CurrentIndex remains on
SLC-007, and no Tier 2 or Tier 3 implementation is authorized by this record.
