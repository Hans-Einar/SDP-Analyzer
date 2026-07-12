# REV-SLC-005 — Deterministic validation engine and initial rules

Status: changes required
Review ID: `REV-SLC-005`
Slice: `SLC-005`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

## Review scope

Fresh independent review of the complete SLC-005 contract, linked requirements,
architecture and design, active traceability, implementation notes,
`VER-SLC-005`, every changed or new product/test file, and the surrounding
discovery, parsing and normalization contracts. The review reran typecheck, the
full test suite, production build, dependency inspection and diff checking.

## Findings

### Medium — Required rule and engine regressions are not actually covered

`src/core/validation/validateSnapshot.test.ts:26-28` checks a structural
fingerprint change only when affected IDs change, and its input-immutability
assertion validates with an empty rule list. It does not prove that changing a
source location changes the fingerprint, that canonical severity/source
ordering is enforced, or that executing the built-in rules leaves snapshot and
context unchanged.

`src/core/validation/rules/rules.test.ts:18-25` also consolidates many rule
checks but omits explicit required cases from the Slice contract, including an
unresolved active Iteration, an unresolved active Slice, a review-only completed
Slice, and malformed/non-object Ledger evidence alongside retained valid
neighbors. These are enumerated minimum tests in SLC-005, not optional examples.

Disposition: add permanent focused regressions for the missing contract cases
and rerun the applicable focused and full verification. Until then,
`VER-SLC-005` cannot support the statement that the full active contract was
verified.

### Medium — SDP007 omits the verification entity evidence from failing findings

`src/core/validation/rules/rules.ts:79-80` inspects the target verification
entity's kind and `attributes.outcome` to decide that evidence does not qualify,
but the emitted finding sources contain only the completed Slice and relation
sources. The target entity's definition sources are omitted. This makes a
wrong-kind, missing-outcome or failed-outcome finding cite less evidence than
the rule actually used, contrary to the Slice provenance and explainability
contract that every finding identify the repository evidence supporting the
observation.

Disposition: when a verification target resolves, include its canonical entity
sources in the SDP007 finding, with regression coverage for wrong-kind and
non-passed outcomes. A genuinely missing target can continue to cite the Slice
and relation evidence.

## Verified observations

- The Finding, AnalysisContext and ValidationRule contracts are
  presentation-neutral and remain below the React/SharedUI boundary.
- Fingerprints exclude prose, severity, insertion order and time, and include
  canonical complete source identities plus the stable discriminator.
- Built-in findings canonicalize/deduplicate IDs and sources, and the engine
  isolates unexpected rule exceptions while continuing later rules.
- SDP001-SDP008 are explicitly registered; SDP003 is endpoint-specific;
  SDP006 treats only contradictory explicit hierarchy evidence as a finding;
  SDP007 requires exact `outcome == "passed"`; SDP008 maps all four profile
  support states as contracted.
- No UI, Markdown extraction, filesystem adapter, health score, repair,
  write-back, graph, CLI/CI or SLC-006 implementation was introduced.
- CurrentIndex remains on SLC-005, Relations keeps SLC-005 active and SLC-006
  planned, and Ledger event 037 records only passed verification. No premature
  review or completion state exists.

## Independent verification

- `npm run typecheck`: passed.
- `npm test`: passed, 16 files and 112 tests.
- `npm run build`: passed, 1,976 modules; the existing non-failing chunk-size
  advisory remained.
- `npm ls SharedUI yaml --depth=0`: passed with `SharedUI@0.1.0` and
  `yaml@2.9.0`.
- `git diff --check`: passed with line-ending conversion warnings only.

## Disposition

Changes required. The implementation remains bounded to SLC-005 and the
executed checks pass, but required verification coverage is incomplete and
SDP007 findings do not carry all evidence used to reach their conclusion. A
bounded correction Worker and a fresh independent re-review are required. This
review does not mark SLC-005 complete and does not authorize SLC-006.

## Fresh independent re-review — 2026-07-12

This fresh Reviewer re-anchored from `AGENTS.md`, `AGENTS-project.md`, the SDP
reminders and framework, the Reviewer skill, the complete active SLC-005
contract, linked planning/design/requirements, active traceability,
implementation notes, the original review and the updated verification record.
The re-review inspected the complete current finding, validation, rule,
application-orchestration, fixture and test implementation rather than relying
on the correction summary.

### Resolution of prior findings

The required permanent regressions now directly prove that a canonical source
location change changes a fingerprint; severity and canonical source location
control finding order; the built-in registry is repeatable and leaves both the
snapshot and context unchanged; unresolved active Iteration and Slice values
are independently reported; review-only evidence does not satisfy SDP007; and
malformed plus non-object Ledger records are reported with their original line
provenance while valid neighboring events remain retained.

SDP007 now includes the canonical entity sources of every resolved verification
target whose kind or outcome contributes to non-qualification. The focused
regressions cover wrong-kind, missing-outcome and failed-outcome targets. A
genuinely missing target remains honest: its finding contains only the
completed Slice and explicit verification-relation evidence and does not invent
target provenance.

### Complete reassessment

No remaining actionable finding was identified. SDP001 through SDP008 retain
their contracted evidence mappings and absence semantics. Fingerprints use
canonical structural identity and exclude prose, severity, insertion order,
time and randomness. Findings use the required severity/rule/ID/source/fingerprint
ordering; duplicate fingerprints are suppressed; rule execution is stable by
ID; an unexpected rule exception becomes an analyzer diagnostic and later
rules continue. All built-in findings have non-empty canonical real or stable
synthetic provenance.

The discover → parse → normalize → validate orchestration remains
presentation-neutral and deterministic. The corrected clean bundled fixture
resolves its explicit requirement target and produces no findings. The new
surface contains no React, SharedUI, platform-filesystem, ambient-time/random,
Markdown, health-score, repair or write-back behavior. UI and SLC-006 work were
not introduced. CurrentIndex remains on SPR-001/ITR-001/SLC-005; Relations
keeps SLC-005 active and SLC-006 planned; the Ledger records verification and
the original changes-required review without claiming review approval or Slice
completion prematurely.

### Independent re-verification

- Focused validation/integration suite: passed, 4 files and 25 tests.
- `npm run typecheck`: passed with no diagnostics.
- `npm test`: passed, 16 files and 121 tests.
- `npm run build`: passed, 1,976 modules; the existing non-failing chunk-size
  advisory remained.
- `npm ls SharedUI yaml --depth=0`: passed with `SharedUI@0.1.0` and
  `yaml@2.9.0`.
- `git diff --check`: passed with line-ending conversion warnings only.
- Boundary and active traceability inspections: passed.

## Final disposition after re-review

Approved. Both original medium findings are resolved by the current
implementation and permanent regressions, and the full SLC-005 contract has no
remaining actionable review finding. This approval is evidence for the Master;
it does not itself mark SLC-005 complete, alter traceability, or authorize work
on SLC-006.
