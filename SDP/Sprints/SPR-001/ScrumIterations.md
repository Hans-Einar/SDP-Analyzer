# SPR-001 — Deterministic Read-Only Analysis Foundation

Status: active  
Sprint ID: `SPR-001`  
Tier: `TIER-001`  
Date opened: 2026-07-11

## Sprint goal

Deliver a verified, deterministic vertical workflow that loads a bundled SDP fixture, parses core traceability evidence, builds a normalized snapshot, runs bounded validation rules and displays explainable read-only findings with provenance.

## Scope

Authorized by `STU-001`, `REQSET-001`, `ARC-001`, `DAN-001`, `DES-001` and `IMP-001`.

## Iteration ITR-001 — Foundation and core traceability

Status: active  
Iteration ID: `ITR-001`

The Iteration executes the ordered Slice contracts below. Only `SLC-001` is active initially.

---

## SLC-001 — Project skeleton and boundary enforcement

Status: active  
Slice ID: `SLC-001`

### Goal

Create the minimal Vite + React + TypeScript repository skeleton, deterministic test/build commands, architectural folders and one fixture-source smoke path without implementing SDP parsing or validation.

### Why now

All later work depends on stable commands and import boundaries. Combining scaffolding with parsing would force Codex to redesign project structure while solving domain logic.

### Requirements implemented

Primary: `REQ-M-001`, `REQ-M-004`, `REQ-NF-005`.  
Foundation only: `REQ-T-003`, `REQ-F-001`, `REQ-M-002`.

SLC-001 does not claim full acceptance of foundation-only requirements.

### Architecture/design references

`ARC-COMP-001`, `ARC-COMP-007`, `ARC-COMP-008`, `ARC-COMP-009`, `ARC-COMP-011`; `ADR-001`, `ADR-002`, `ADR-007`; `DES-001` sections 2, 9, 10, 11 and 14.

### Expected files or modules

- package manifest and lockfile;
- Vite/TypeScript configuration;
- application entry point;
- `src/core`, `src/application`, `src/adapters/fixtures`, `src/ui` boundaries;
- one tiny bundled fixture or in-memory fixture source;
- one smoke test proving fixture text can be listed/read through a minimal source contract;
- README command section if absent;
- Slice implementation notes and verification record.

Exact conventional filenames may follow the selected Vite template.

### Invariants

- strict TypeScript;
- application builds as static Vite output;
- core files import neither React nor SharedUI;
- no analyzed content is executed;
- fixture access is read-only and deterministic;
- UI contains no SDP parsing or validation logic;
- no global state library or published package structure.

### Non-goals

- YAML/JSON/NDJSON/Markdown parser dependencies;
- traceability normalization;
- validation rules or findings semantics;
- File System Access API;
- graph visualization;
- comprehensive dashboard styling;
- SharedUI integration when the dependency/contract is not already available;
- CI, CLI, Node service, Electron or Tauri;
- work from `SLC-002` or later.

### Verification

Run and record the exact project commands for:

1. dependency installation from the lockfile;
2. strict typecheck;
3. unit/smoke tests;
4. production build;
5. lint, only if configured;
6. a rendered smoke check that the application opens and identifies the bundled fixture/source.

A fresh Reviewer shall inspect changed files, dependency direction, scope and actual verification output.

### Completion signal

The repository has reproducible install/test/typecheck/build commands; a minimal application renders; a smoke test reads deterministic fixture text through the source boundary; no parser/validator product logic exists; verification is recorded; independent review approves; traceability is updated; Codex stops.

### Discoveries policy

Record missing SharedUI installation details, tooling constraints or package-manager conflicts in `implementationNotes.md`. Resolve only what is essential to this Slice. Architecture or requirement changes return to the supervising architect.

### Stop condition

Stop immediately after SLC-001 verification, review and traceability updates. Do not begin `SLC-002`.

---

## SLC-002 — Project source, provenance and discovery

Status: planned

Goal: implement the detailed `ProjectSource`, path normalization, `SourceRef`, fixture adapter and deterministic discovery manifest. No YAML/NDJSON parsing.

## SLC-003 — Core traceability parsers

Status: planned

Goal: parse strict CurrentIndex/Relations YAML and line-isolated Ledger NDJSON with source diagnostics and provenance. No cross-file normalization rules.

## SLC-004 — Normalized traceability snapshot

Status: planned

Goal: map parsed structured files into canonical entities, relations, ledger events, active declarations and profile metadata.

## SLC-005 — Deterministic validation

Status: planned

Goal: implement ordered pure rules needed by Tier 1 and deterministic finding fingerprints using broken fixtures.

## SLC-006 — Application workflow and UI

Status: planned

Goal: orchestrate fixture analysis and display summary, active work, diagnostics, findings and provenance in a read-only UI.

## SLC-007 — Tier integration and acceptance

Status: planned

Goal: close fixture coverage, rendered/accessibility checks, documentation, full independent review and Tier 1 verification.