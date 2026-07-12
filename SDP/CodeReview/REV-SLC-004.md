# REV-SLC-004 — Normalized traceability snapshot

Review ID: `REV-SLC-004`
Slice: `SLC-004`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12
Reviewer role: fresh independent SDP Reviewer

## Scope and authority

This review covers exactly `SPR-001 / ITR-001 / SLC-004` in the current
uncommitted working tree. It does not implement a fix, change product or
Master-owned traceability state, mark the Slice complete, authorize a
transition, commit, stage, push, create a pull request or begin `SLC-005`.

The review was independently re-anchored from repository evidence rather than
Worker or Master summaries. The authoritative read included `AGENTS.md`,
`AGENTS-project.md`, `SDP/AGENT-REMINDERS.md`, `SDP/Framework/README.md`, the
repository-local SDP Reviewer and traceability skills, all three traceability
files, the relevant Study decisions, accepted Requirements, Architecture,
Design, Implementation and verification-plan documents, the complete SLC-004
contract in `ScrumIterations.md`, the complete `implementationNotes.md` and
`Handoff.md`, `VER-SLC-004.md`, `README.md`, the package/configuration surface,
the relevant surrounding discovery/parser/application contracts, and every
changed or new domain, normalization, application and test file.

The accepted baseline is current `main` HEAD
`25418c4a505729f48b8ac5698307e6e3336fed75`. The complete latest shared-tree
delta was inspected after the Master integrated `VER-SLC-004`, relation and
ledger event 032 evidence and corrected the current Handoff wording. No
product or test file changed during this review.

## Independent evidence reproduced

- `npm ci` passed with exit code 0: 270 packages were added, 271 packages were
  audited in 8 seconds and zero vulnerabilities were reported.
- `npm run typecheck` passed with exit code 0 and no TypeScript diagnostics.
- The exact focused command
  `npm test -- src/core/normalization/normalizeTraceability.test.ts src/core/normalization/bundledFixtureSnapshot.test.ts src/core/normalization/normalizationBoundaries.test.ts src/application/loadProjectSnapshot.test.ts --reporter=verbose`
  passed under Vitest `4.1.10`: 4 files and all 32 tests passed. The verbose
  output exposed every normalization/application case rather than only the
  aggregate count.
- `npm test` passed with exit code 0: 13 files and all 97 tests passed,
  including preserved source, discovery and parser coverage plus the unchanged
  jsdom SharedUI rendered smoke.
- `npm run build` passed with exit code 0. TypeScript completed first; Vite
  `8.1.4` transformed 1,976 modules and emitted 0.53 kB HTML, 72.91 kB CSS and
  510.87 kB JavaScript (150.91 kB gzip). The existing greater-than-500-kB
  chunk warning remains non-failing.
- `npm ls SharedUI yaml --depth=0` passed and resolved direct
  `SharedUI@0.1.0` and `yaml@2.9.0`.
- `git diff --check` passed with exit code 0. Output contained only the
  repository's Windows LF-to-CRLF working-copy notices.
- Implementation-only scans over `src/core/domain`,
  `src/core/normalization` and `src/application/loadProjectSnapshot.ts`
  returned no match for React, React DOM, SharedUI, fixture imports,
  browser/Node filesystem APIs, analyzed-code execution, write/repair APIs,
  ambient time/random identity, Markdown parsing, validation rules,
  findings/fingerprints, `SDP001` through `SDP008`, rule registries, health
  scores, graph/report surfaces or `SLC-005`. A global implementation-only
  boundary scan likewise found no React/SharedUI import in core, application or
  adapters.
- Baseline comparisons returned exit code 0 for UI (`src/ui`, `src/main.tsx`),
  dependency/lock (`package.json`, `package-lock.json`), bundled fixture, and
  the complete SLC-001-through-SLC-003 product paths. The current untracked
  product set is confined to the expected SLC-004 domain, normalization and
  `loadProjectSnapshot` files/tests.
- Strict unique-key, single-document YAML parsing passed for
  `CurrentIndex.yaml` and `Relations.yaml`. Semantic assertions confirmed the
  exact 19 SLC-004 requirement IDs, 10 architecture/ADR IDs, 5 Study decisions,
  `DES-001` sections 2, 3, 4, 7, 8, 12, 13 and 14, `VER-PLAN-001` and passed
  `VER-SLC-004`. SLC-001 through SLC-003 remain completed; SLC-004 is active;
  SLC-005 through SLC-007 remain planned.
- All 32 nonblank Ledger lines parsed as JSON objects with 32 unique event
  IDs. Direct comparison with the accepted baseline confirmed that its first
  29 lines remain line-content identical. Events 030, 031 and 032 are
  append-only and ordered as SLC-003 acceptance, SLC-004 activation and
  SLC-004 passed verification.

No lint command is configured, so lint was not run. No new live-browser check
was performed or claimed because UI source is unchanged; the rendered test
passed in the full suite and UI no-diff was independently confirmed.

## Findings

No actionable finding was identified.

## Domain, entity and attribute assessment

- `src/core/domain/Entity.ts`, `Relation.ts`, `LedgerEvent.ts`,
  `ActiveDeclaration.ts` and `ProjectSnapshot.ts` define readonly,
  serializable, presentation-neutral contracts. `EntityKind` contains the
  accepted recognized values while remaining extensible. No graph, React,
  SharedUI or validation type entered the domain.
- `normalizeRelations.ts` creates definitions only from non-empty explicit
  keys in the supported `documents`, `tiers`, `sprints`, `iterations`,
  `slices`, `reviews`, `verification` and possible `refactors` sections.
  Active IDs, relation targets, Ledger subjects, project metadata, filenames
  and prose have no entity-creation path. The permanent tests and the
  independent adverse probe both confirmed that reference-only IDs remain
  absent.
- Fixed section mappings produce tier, sprint, iteration, slice, review and
  verification kinds. Document subtypes require accepted explicit `kind`
  metadata and otherwise remain `unknown`; refactor requires its accepted
  extension value. There is no ID-prefix inference.
- Complete raw entity attributes are cloned and retained. String-only
  `status`, `title` and `path` conveniences never remove their raw fields;
  invalid typed metadata remains raw and receives a sourced `NORMALIZE_*`
  diagnostic. CurrentIndex project metadata follows the same factual pattern
  without creating a project entity.
- Prototype-named raw keys remain ordinary own data properties. The
  independent probe retained `__proto__` in project and nested Ledger payload
  data without prototype mutation or data loss.

## Duplicate-definition and relation assessment

- Duplicate IDs use the documented one-canonical-entity policy. Definitions
  sort by kind and canonical source; the first valid definition supplies the
  canonical attributes. Every explicit definition occurrence is captured
  before invalid-record rejection, every source remains on the canonical
  entity when a valid definition exists, each definition location receives
  `NORMALIZE_DUPLICATE_ENTITY_DEFINITION`, and relations from every valid
  definition remain. Invalid records also receive their structural diagnostic.
  No future duplicate-ID finding is emitted.
- The deliberately documented relationship-field set is exactly
  `derives_from`, `decisions`, `tier`, `sprint`, `iteration`, `slice`,
  `slices`, `requirements`, `architecture`, `study_decisions`, `design`,
  `verification_plan`, `verification` and `review`. Metadata such as `path`,
  `status`, `title`, `outcome`, `disposition` and `design_sections` does not
  become a relation.
- Non-empty scalar strings and non-empty string array elements become directed
  relations from the explicit definition ID to the explicit target. Invalid
  values are diagnosed independently, valid array neighbors survive,
  unresolved targets remain represented, no endpoint lookup is performed and
  no reverse edge is invented.
- Relation provenance identifies the escaped field or array-element pointer.
  It is intentionally pointer-only because the accepted SLC-003 parser does
  not expose reliable nested field ranges; no line or column is fabricated.
- Each relation ID is the JSON encoding of its from/type/to tuple plus the full
  canonical source occurrence. It is deterministic, presentation-independent
  and collision-free for distinct pointers. The independent probe produced two
  separate same-target array occurrences plus an edge from the duplicate
  definition, with three distinct stable IDs and all three pointers retained.

## CurrentIndex, compatibility and diagnostics assessment

- CurrentIndex normalization retains explicit string/null active sprint,
  refactor, iteration and slice values in fixed property order. Missing values
  remain missing; invalid raw values remain absent from typed fields; active
  and per-field source evidence is retained; and no active reference creates
  an entity or triggers existence/hierarchy judgment.
- Discovery support is the starting support value. Only `supported` can reduce
  to `partial` when a required parsed result/value or usable supported
  Relations structure is unavailable. `partial`, `unsupported` and `unknown`
  cannot be upgraded. The permanent suite covers every support value.
- Discovery diagnostics, all present parser diagnostics, optional application
  diagnostics and normalization diagnostics are additive. Identical complete
  diagnostics are canonically deduplicated only after composition, so an
  application aggregate cannot suppress parser evidence.
- A separate application probe made `listFiles()` reject. The resulting
  snapshot correctly retained `unknown` support, zero invented sources,
  entities, relations or Ledger events, the one discovery access error and
  three truthful parser-input-unavailable normalization diagnostics. It did not
  regress SLC-002 into a false partial/missing-file conclusion.

## Ledger, ordering, determinism and ownership assessment

- Every valid raw Ledger object becomes one event in raw record order with its
  original sequence and exact line source. Only string `type`, `subject_id`
  and `timestamp` values become conveniences; invalid convenience types are
  diagnosed without erasing the event. The complete payload is cloned and
  retained.
- Malformed source lines remain parser diagnostics only. No event is invented
  for them, and sequence gaps remain factual. Duplicate event IDs, timestamps,
  chronology, completion and reconstructed repository state are not
  interpreted.
- Sources, diagnostics, entities and relations use explicit total comparators;
  Ledger events deliberately retain input source order and active properties
  use fixed construction order. Relation IDs contain no clock, random or UI
  input.
- Raw attributes/payloads and every output collection/source reference are
  cloned into snapshot ownership and frozen. The normalizer sorts copies rather
  than input arrays. Permanent coverage and the independent adverse probe both
  confirmed byte-equivalent repeated serialization, unchanged inputs and deep
  ownership after hostile mutation attempts.

The no-file adverse probe combined a numeric invalid active field, explicit
null, two valid duplicate definitions, a separate invalid definition,
repeated unresolved targets, an unsupported section, malformed Ledger input,
invalid Ledger convenience data and prototype-named nested values. It retained
one explicit canonical entity with both duplicate-definition sources, three
directed relation occurrences, Ledger sequences 2 and 3, active
null-versus-invalid distinctions, every expected diagnostic, unchanged inputs
and frozen repeatable output.

Two initial stdin probe-launch attempts failed before importing a product
module because plain Node ESM could not resolve the repository's
bundler-style extensionless TypeScript imports. A read-only Node
`registerHooks` resolver then ran the same no-file probes successfully. These
were harness failures, not product failures, and no temporary repository file
was created.

## Application, boundary and later-Slice assessment

- `loadProjectSnapshot.ts` composes the existing one-pass
  `loadCoreTraceability` discover/read/parse operation with the pure synchronous
  normalizer. It returns discovery, useful raw parser results, aggregate
  diagnostics and the snapshot. A failed source preserves neighboring results.
- The application operation does not run validation, infer active work,
  interpret verification, import the fixture or depend on a source adapter.
- No validation registry, `Finding`, fingerprint, endpoint/hierarchy rule,
  completion check, Markdown parser, health score, graph/report/repair surface,
  browser/Node filesystem adapter, write-back API, CLI or CI behavior exists.
  The duplicate-definition output is normalization evidence only, not the
  future `SDP002` finding.
- No UI source changed. The unchanged screen remains a truthful discovery
  preview and does not claim normalized health or findings. No dependency,
  lockfile or fixture change occurred.

## Test-contract and verification-record assessment

The focused 32-test suite materially represents all 40 new numbered
normalization/application/boundary cases in the SLC-004 contract. It covers the
complete contract-authored fixture snapshot; all diagnostic sources;
compatibility monotonicity; repeatability, non-mutation and ownership;
explicit-only entities; typed/raw attributes; valid/invalid duplicates; every
documented relation field; direction, unresolved targets, invalid neighbors,
pointer escaping, occurrence identity and ordering; active
string/null/missing/invalid distinctions; Ledger payload/order/recovery; and
application partial failure. The full 97-test suite supplies required cases 41
and 42 by retaining all prior source/discovery/parser behavior and the rendered
UI smoke.

`VER-SLC-004.md` exists, is scoped to this Slice, records the accepted baseline,
complete product scope, exact commands, counts, build warning, limitations,
boundary/no-diff evidence and pending-review state. This review independently
reproduced every executable gate. Its traceability subsection accurately
records the 31-line pre-event-032 checkpoint; the current 32-line append-only
state, including the verification-recorded event itself, was independently
validated during this review and is reflected in the later Master checkpoint
and Handoff.

## Traceability assessment

- `CurrentIndex.yaml`, Scrum, Relations, implementation notes and Handoff agree
  that `SPR-001 / ITR-001 / SLC-004` is active and awaiting independent review.
- The SLC-004 and `VER-SLC-004` relations contain the exact contract requirement
  set. Architecture, Study, Design and verification-plan links likewise match
  the active contract, and the verification outcome is passed.
- SLC-001 through SLC-003 remain completed and accepted. SLC-005 remains
  planned and no SLC-005 product surface exists.
- Ledger history is append-only through verification event 032, with all 29
  accepted baseline lines unchanged and unique IDs throughout.
- No SLC-004 review relation or review ledger event existed before this review
  record, which is the correct pre-integration state. This approved record does
  not itself change active/completion state; the Master must integrate the
  actual review evidence and make the Slice decision from the complete record.

## Residual limitations and discoveries

- Relation field/value provenance is pointer-only for the accepted parser
  reason documented above. It remains sufficient and truthful for SLC-004.
- Compatibility is structural profile metadata. Semantic compatibility
  findings, endpoint resolution, hierarchy, verification qualification,
  completion and chronology remain deliberately deferred to later Slices.
- No lint command exists. The unchanged SharedUI bundle-size warning remains
  non-failing. UI no-diff made a new live-browser run unnecessary; the rendered
  automated check is the current independent UI evidence.

## Disposition

**Approved.** The current uncommitted tree satisfies the complete SLC-004
contract with no remaining actionable finding. SLC-004 remains active until
the Master integrates this review and makes the traceability/completion
decision. `CurrentIndex.yaml` must remain on SLC-004 and SLC-005 must remain
planned and untouched. This review stops at SLC-004.
