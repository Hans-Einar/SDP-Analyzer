# SDP-Analyzer Implementation Plan

Status: accepted; Tier 1 completed and Tier 2 authorized
ID: `IMP-001`  
Date: 2026-07-11
Amended: 2026-07-13 (Tier 1 structured-core acceptance)
Amended: 2026-07-14 (Tier 2 explicit local-directory acquisition)

## 1. Delivery principle

Design horizontally; implement and verify vertically. Every Slice leaves a buildable repository, records discoveries instead of expanding scope, receives fresh review, updates traceability and stops.

## 2. Tier sequence

- `TIER-001`: bundled-fixture analysis of the structured-core traceability profile, with path-only Markdown discovery and summary/findings UI.
- `TIER-002`: explicit browser local-directory adapter.
- `TIER-003`: Markdown heading/structure parsing, explicit stable-ID extraction, lifecycle/Sprint/Iteration/Slice/Verification/Review content coverage and richer verification-record interpretation.
- `TIER-004`: report, CLI, CI and skill boundaries.
- `TIER-005`: relation navigation and optional graph.
- `TIER-006`: separately mandated repair assistance.

`TIER-001` is completed and accepted. `TIER-002` is now authorized through
`SPR-002 / ITR-002`. `TIER-003` and later Tiers remain planned only.

## 3. Tier 1 Sprint

`SPR-001` — Deterministic read-only analysis foundation.

Goal: deliver one honest end-to-end fixture workflow while proving the core architecture and provenance model.

### Iteration

`ITR-001` — Establish foundation and analyze core traceability.

### Ordered Slices

1. `SLC-001` Project skeleton and boundary enforcement.
2. `SLC-002` ProjectSource, provenance and discovery.
3. `SLC-003` YAML/NDJSON parsing and diagnostics.
4. `SLC-004` normalized traceability snapshot.
5. `SLC-005` deterministic rule registry and initial rules.
6. `SLC-006` application orchestration and read-only UI.
7. `SLC-007` Tier integration, verification and documentation.

Only one Slice is active at a time. Subsequent Slice contracts may be refined from verified discoveries but may not change `STU-001`, `ARC-001` or `DES-001` silently.

## 3A. Tier 2 Sprint

`SPR-002 — Explicit Local Project Acquisition`.

Goal: prove explicit browser-local acquisition incrementally while preserving
the accepted Tier 1 analysis pipeline and read-only security boundary.

### Iteration

`ITR-002 — Browser Directory Source Foundation`.

### Ordered Slices

1. `SLC-008 — Browser directory ProjectSource adapter`.
2. `SLC-009 — Explicit folder selection and analysis UI`.
3. `SLC-010 — Tier 2 browser compatibility and integration acceptance`.

`SLC-008` is completed with passed verification and approved independent
review. It accepts an already-selected directory handle, adds capability and
permission-state inspection without prompting, and proves the adapter through
the existing `ProjectSource` and `analyzeProject` boundaries. CurrentIndex is
retained on SLC-008. `SLC-009` and `SLC-010` remain planned and inactive.

## 4. Repository structure target

```text
src/
  core/
    source/
    discovery/
    parsing/
    domain/
    validation/
  application/
  adapters/
    fixtures/
    browser/ (from SLC-008)
  ui/
fixtures/
tests/ (only if not colocated)
SDP/
```

Exact filenames may follow established Vite conventions. Package extraction is deferred until a second runtime consumer exists.

## 5. Cross-Slice invariants

- read-only analysis;
- no execution of analyzed content;
- provenance retained through findings;
- core independent of React and SharedUI;
- explicit partial/unsupported compatibility;
- deterministic ordering and explicit analysis time;
- no graph-library canonical model;
- no arbitrary cleanup outside the active Slice;
- no completion without actual verification evidence.

## 6. Cross-Slice non-goals

Browser folder access, Node service, Electron/Tauri, graph visualization, Markdown content parsing or stable-ID extraction, richer verification-document interpretation, stale thresholds, automatic repair, CLI/CI and skill implementation are outside `SPR-001` unless SDP is explicitly revised and accepted. Tier 1 may only discover and classify Markdown paths under `REQ-D-007`.

## 7. Verification gates

Each Slice requires:

1. applicable unit/component tests;
2. strict typecheck;
3. production build;
4. lint when configured;
5. fresh independent Reviewer inspection;
6. a Slice-specific verification record containing exact commands and outcomes;
7. traceability and ledger updates based only on real evidence.

SLC-001 may establish the command set. Later Slices must use it consistently unless a traceable change is approved.

## 8. Discoveries policy

A discovery that is necessary to meet the current Slice contract may be resolved within the Slice when it does not alter architecture, requirements or non-goals. Otherwise Codex shall record it in implementation notes/handoff, mark the Slice blocked if necessary, and return it to the supervising architect. No opportunistic next-Slice work.

## 9. Completion signal

`TIER-001` completes only when a bundled project fixture is analyzed end-to-end against the structured-core profile; standard Markdown paths are discovered/classified without content reads; core traceability parsing and initial rules, including `DEC-STU-016` verification qualification, are deterministic and tested; the UI exposes summary, active declarations, diagnostics, findings and provenance; all verification gates pass; independent review approves; traceability accurately records the evidence; and acceptance explicitly records the TIER-003 Markdown limitations.
