# REV-SLC-008 — Browser directory ProjectSource adapter

Status: approved
Review ID: `REV-SLC-008`
Tier: `TIER-002`
Sprint: `SPR-002`
Iteration: `ITR-002`
Slice: `SLC-008`
Date: 2026-07-14
Role: fresh independent SDP Reviewer

## Review scope

The Reviewer independently assessed the complete SLC-008 contract and the
uncommitted implementation based on accepted Tier 1 commit
`afb1d97cf537d80cb3ff7b84b17a807a591b104e`.

The review read the governing SDP instructions, active traceability and full
Ledger, SPR-002 contract, implementation notes, handoff, verification plan,
`VER-SLC-008`, every changed/new production module and every permanent focused
test. It did not rely on Worker or Master conclusions as its disposition.

The Reviewer made no repository change and did not pre-create this record.

## Findings

No actionable finding was identified.

## Contract assessment

### Capability and permission

- Capability detection is feature-based, server-safe and distinct from
  selected-handle permission. It observes but never invokes the callable
  picker surface.
- Permission inspection is prompt-free, uses read mode only and maps all
  outcomes to the four stable states.
- A denied selected handle remains distinguishable from unsupported browser
  capability, empty acquisition and missing core evidence.
- No constructor, capability, listing, read, analysis or background path
  requests permission.

### Source, paths and traversal

- The constructor requires a caller-owned non-empty opaque source ID and uses
  a generic privacy-safe display label by default.
- Recursive traversal is rooted in yielded child handles, validates one path
  segment at a time and revalidates every joined path by exact canonical
  normalization.
- Shuffled browser order yields deterministic sorted paths. Invalid names,
  drive-like names, unsupported kinds and duplicate canonical paths are
  excluded without selecting an ambiguous first handle.
- Listing performs no file-content read. `readText` accepts only canonical
  indexed paths and fetches text afresh for each call.
- Unknown, unavailable, denied and other read failures use stable sanitized
  adapter errors without raw local paths or exception details.

### Acquisition and concurrency

- Entries and immutable acquisition diagnostics are returned from one listing
  attempt with explicit complete, partial or failed completeness.
- Safe observed neighbors survive nested failures. Root failure remains
  distinct from a complete empty root.
- Each required skipped/ambiguous/unobserved category is permanently tested as
  partial and suppresses false missing-core claims when a core path was not
  observed.
- Partial acquisition remains supported only if all three core sources were
  observed; otherwise support is unknown. Failed acquisition is unknown and
  retains its stable diagnostic beside the generic listing failure.
- Monotonic attempt settlement prevents an older late attempt from replacing
  newer state. A newer failure clears stale readable handles.
- Full overlapping `analyzeProject` calls are covered: stale older handles are
  not restored or read and both calls produce the same supported result.

### Architecture, regression and scope

- Browser handle types remain adapter-local. Core and application receive only
  the additive presentation-neutral acquisition contract.
- Discovery, loading, normalization, validation and `analyzeProject` contain
  no browser-specific branch.
- The adapter exposes no write surface and adds no picker invocation,
  permission request, UI/SharedUI change, upload, network/telemetry,
  persistence, target execution, Node filesystem behavior or Markdown
  parsing.
- Accepted Tier 1 fixture and analyzer behavior remains passing.
- SLC-009, SLC-010 and Tier 3 remain outside the implementation.

## Independent evidence

The Reviewer reproduced:

- focused capability/adapter/boundary/discovery tests: 4 files/34 tests;
- strict typecheck: passed;
- complete suite: 23 files/183 tests;
- focused Tier 1 regression: 5 files/14 tests;
- production build: passed, 2,070 modules transformed, with only the known
  non-failing bundle-size advisory;
- exact `SharedUI@0.1.0` and `yaml@2.9.0` dependency resolution;
- `git diff --check`: passed with only LF/CRLF working-copy notices;
- explicit trailing-whitespace/final-newline checks: 10 untracked files;
- prohibited-surface and architecture-boundary scans;
- package, UI/composition and SPR-001 preservation;
- strict CurrentIndex/Relations parsing and all related path checks;
- 73 unique Ledger events and an unchanged accepted 65-line Tier 1 prefix;
  and
- resolution of all 18 linked requirement, architecture and study-decision
  IDs.

The independently reproduced counts and dependency versions agree with
`VER-SLC-008`. The verification record accurately preserves its harness
corrections and accepted residual risks.

## Traceability assessment

Before this review was integrated:

- CurrentIndex remained `TIER-002 / SPR-002 / ITR-002 / SLC-008`;
- SLC-008 remained active with passed `VER-SLC-008` only;
- SLC-009 and SLC-010 remained planned;
- no review or completion event was pre-claimed;
- `REQ-F-007` and `REQ-S-004` remained explicitly partial; and
- the unrelated T2-tagged `REQ-V-009`, `REQ-UI-005` and `REQ-S-005` remained
  explicitly unallocated.

That state is coherent. The Master may now link this review and complete only
SLC-008 while retaining CurrentIndex on it. Tier 2, SPR-002 and ITR-002 must
remain active; later Slices must remain planned.

## Accepted residual risks

- Native browser compatibility and the picker/user gesture are SLC-009 and
  SLC-010 acceptance work.
- A selected filesystem provider may be cloud-backed independently of the
  analyzer.
- External filesystem mutation means listing and later fresh reads are not a
  filesystem transaction.
- Very large/deep traversal, cancellation and file-size limits remain future
  hardening discoveries.
- The existing production bundle-size advisory remains non-blocking.

These limitations are truthful, visible and do not contradict the SLC-008
contract.

## Disposition

**Approved.** SLC-008 satisfies its contracted browser-directory adapter
boundary with no actionable finding. The Master may relate `REV-SLC-008`,
append the review/completion events and mark SLC-008 completed if final
post-review traceability and diff hygiene remain clean. This review does not
authorize or activate SLC-009, SLC-010 or Tier 3 work.
