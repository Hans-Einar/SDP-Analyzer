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

## SLC-001 — Project skeleton and SharedUI boundary enforcement

Status: active  
Slice ID: `SLC-001`

### Goal

Create the minimal Vite + React + TypeScript repository skeleton, deterministic test/build commands, architectural folders, SharedUI dashboard shell and one fixture-source smoke path without implementing SDP parsing or validation.

### Why now

All later work depends on stable commands, import boundaries and a correct SharedUI integration pattern. Establishing reuse now prevents generic UI primitives from being reimplemented locally as the product grows.

### Requirements implemented

Primary: `REQ-M-001`, `REQ-M-004`, `REQ-NF-005`, `REQ-UI-004`.  
Foundation only: `REQ-T-003`, `REQ-F-001`, `REQ-M-002`, `REQ-UI-001`.

SLC-001 does not claim full acceptance of foundation-only requirements.

### Architecture/design references

`ARC-COMP-001`, `ARC-COMP-007`, `ARC-COMP-008`, `ARC-COMP-009`, `ARC-COMP-011`; `ADR-001`, `ADR-002`, `ADR-007`; `DES-001` sections 2, 9, 10, 11 and 14; `AGENTS-project.md` SharedUI policy.

### Expected files or modules

- package manifest and one lockfile;
- repository-relative dependency on `SharedUI-0.1.0.tgz`;
- Vite/TypeScript configuration;
- application entry importing `SharedUI/styles.css` once;
- minimal SharedUI `defineDashboardConfig`, validator registry, state policy, component registry and `DashboardRenderer` composition;
- `src/core`, `src/application`, `src/adapters/fixtures`, `src/ui` boundaries;
- one tiny bundled fixture or in-memory fixture source;
- one smoke test proving fixture text can be listed/read through a minimal source contract;
- one rendered test or manual smoke check proving the SharedUI shell renders and identifies the fixture/source;
- README and `AGENTS-project.md` command section updated with the selected package manager;
- Slice implementation notes and verification record.

Exact conventional filenames may follow the selected Vite template.

### Mandatory SharedUI reuse

Codex shall read the installed package README, package installation guide and baseline component contracts before authoring the UI.

The SLC-001 shell shall normally use:

- `DashboardRenderer`;
- `defineDashboardConfig`;
- `baselineComponentRegistry`;
- `TopNav` or another documented baseline header component;
- `PageHeader`, `Section`, `Badge`, `EmptyState`, `AlertBanner` or other baseline components where their contracts fit.

A local custom component is allowed only for the narrow fixture/source smoke content that cannot be represented correctly by a baseline component. It must be registered by stable key and documented as domain-specific.

Do not recreate local buttons, cards, badges, headers, sections, alerts, empty states, skeletons, tables, detail panels, navigation primitives, theme tokens or copied shadcn primitives when SharedUI already provides the semantic capability.

### Invariants

- strict TypeScript;
- application builds as static Vite output;
- core files import neither React nor SharedUI;
- application/adapters do not depend on SharedUI;
- SharedUI imports remain in `src/ui` or the composition entry;
- no analyzed content is executed;
- fixture access is read-only and deterministic;
- UI contains no SDP parsing or validation logic;
- SharedUI state keys have validators and explicit state policies;
- no global state library or published package structure;
- no unpacking or copying source from the SharedUI tarball.

### Non-goals

- YAML/JSON/NDJSON/Markdown parser dependencies;
- traceability normalization;
- validation rules or findings semantics;
- File System Access API;
- graph visualization;
- comprehensive dashboard styling;
- auditing or changing SharedUI itself;
- broad analysis of SharedUI usage in other projects;
- CI, CLI, Node service, Electron or Tauri;
- work from `SLC-002` or later.

### Verification

Run and record the exact project commands for:

1. dependency installation from the lockfile, including successful installation of `file:./SharedUI-0.1.0.tgz`;
2. strict typecheck;
3. unit/smoke tests;
4. production build;
5. lint, only if configured;
6. rendered smoke check that the SharedUI application opens and identifies the bundled fixture/source;
7. inspection that `SharedUI/styles.css` is imported once;
8. inspection that core/application/adapters contain no SharedUI imports;
9. inspection that no generic baseline component was duplicated locally.

A fresh Reviewer shall inspect changed files, dependency direction, SharedUI component reuse, scope and actual verification output.

### Completion signal

The repository has reproducible install/test/typecheck/build commands; SharedUI is installed from the local tarball; a minimal SharedUI-rendered application identifies the fixture/source; a smoke test reads deterministic fixture text through the source boundary; no parser/validator product logic or duplicate local design-system primitives exist; verification is recorded; independent review approves; traceability is updated; Codex stops.

### Discoveries policy

Record package-manager conflicts, a broken tarball/export, or a genuinely missing generic SharedUI capability in `implementationNotes.md`. Do not solve the latter by creating an unplanned generic local component. Narrow domain-specific composition needed for the smoke path is allowed. Architecture, requirement or SharedUI-package changes return to the supervising architect.

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

Goal: orchestrate fixture analysis and display summary, active work, diagnostics, findings and provenance through SharedUI, using narrowly domain-specific registered components only where baseline contracts are insufficient.

## SLC-007 — Tier integration and acceptance

Status: planned

Goal: close fixture coverage, rendered/accessibility checks, SharedUI reuse review, documentation, full independent review and Tier 1 verification.