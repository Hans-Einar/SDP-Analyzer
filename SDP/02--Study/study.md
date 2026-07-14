# SDP-Analyzer Study

Status: accepted for initial planning  
ID: `STU-001`  
Date: 2026-07-11
Amended: 2026-07-13 (`DEC-STU-015`, `DEC-STU-016`)

## 1. Purpose

Resolve the mandate's open technical and compatibility questions before requirements and architecture are fixed. This Study governs Tier 1 unless superseded by a traceable later decision.

## 2. Repository Evidence

The installed SDP structure uses lifecycle Markdown documents plus:

- `SDP/Traceability/CurrentIndex.yaml` for current active work;
- `SDP/Traceability/Relations.yaml` for explicit ID relationships;
- `SDP/Traceability/Ledger.ndjson` as append-only event history;
- Sprint folders containing iteration and Slice contracts;
- verification and independent review records.

The installed templates are intentionally permissive and do not define a formal schema version. Therefore SDP-Analyzer must distinguish supported conventions from inferred or unsupported variants.

## 3. Compatibility Decision

### DEC-STU-001 — Initial supported SDP profile

Tier 1 supports the currently installed SDP Toolkit profile in this repository:

1. root `AGENTS.md` and optional `AGENTS-project.md`;
2. `SDP/01--Mandate` through `SDP/07--Implementation` Markdown documents;
3. `SDP/Traceability/CurrentIndex.yaml`, `Relations.yaml`, and `Ledger.ndjson`;
4. Sprint, Iteration, Slice, Verification and CodeReview Markdown documents discovered under their standard directories;
5. stable IDs explicitly written in structured traceability files or Markdown text.

Historical variants are accepted only when an explicit compatibility adapter exists. Unknown files remain discoverable evidence but do not silently become canonical entities.

### DEC-STU-002 — Core traceability formats

Tier 1 expects:

- YAML parsed as YAML 1.2-compatible data with duplicate-key detection enabled;
- `Ledger.ndjson` containing exactly one JSON object per non-blank line;
- Markdown treated as text plus structural headings and explicit ID tokens, not arbitrary executable metadata;
- unknown fields preserved where practical and reported, not discarded as validation success.

`CurrentIndex.yaml` is interpreted as declared current state, not proof that referenced entities exist. `Relations.yaml` is an explicit relation registry. Ledger events are historical claims and are never rewritten by the analyzer.

### DEC-STU-003 — Parser choices

Use maintained, deterministic JavaScript/TypeScript libraries:

- `yaml` for YAML parsing with source ranges and strict duplicate-key behavior;
- native `JSON.parse` per NDJSON line;
- `remark-parse`/mdast for Markdown structure when structural parsing is needed;
- no MDX execution, YAML custom tags, schema coercion with side effects, or arbitrary JavaScript evaluation.

Library versions shall be pinned through the lockfile.

### DEC-STU-004 — Project acquisition

Tier 1 development starts fixture-first. The first user-facing local-project path uses the browser File System Access API only behind an adapter and only after explicit user selection.

Limitations must be visible:

- support is strongest in Chromium-derived desktop browsers;
- permission is user-mediated and may need to be renewed;
- ordinary browsers cannot scan arbitrary local directories;
- unsupported browsers shall retain fixture/demo mode and explain why folder selection is unavailable.

A local Node service is the preferred later fallback for broad browser compatibility and automation. Electron and Tauri remain deployment alternatives, not Tier 1 dependencies. Tauri is attractive for a later desktop distribution; Electron is easier for all-JavaScript teams but heavier.

### DEC-STU-005 — Privacy and security

Tier 1 is local and read-only:

- repository contents are processed in memory in the browser;
- no repository content is uploaded by default;
- no project scripts, hooks, binaries or embedded code are executed;
- symbolic-link traversal and filesystem escape are prohibited in non-browser adapters;
- export is explicit;
- errors must not leak complete sensitive file contents into telemetry;
- telemetry is absent unless separately designed and consented to.

### DEC-STU-006 — Provenance

Every parsed fact that can cause a finding shall retain:

```ts
interface SourceRef {
  sourceId: string;
  path: string;
  kind: 'yaml' | 'json' | 'ndjson' | 'markdown' | 'synthetic';
  lineStart?: number;
  columnStart?: number;
  lineEnd?: number;
  columnEnd?: number;
  pointer?: string;
}
```

A finding may cite multiple `SourceRef` values. Synthetic facts must identify the rule or normalization step that created them.

### DEC-STU-007 — Normalized model

Use one project snapshot containing:

- sources and parse diagnostics;
- entities with stable IDs, kinds, status, attributes and provenance;
- directed typed relations with provenance;
- ledger events in original order;
- declared active work;
- compatibility/profile metadata.

Entity kinds are extensible strings, but Tier 1 recognizes mandate, study, requirement, architecture-decision, design-decision, tier, sprint, iteration, slice, verification and review.

### DEC-STU-008 — Finding and severity model

A finding contains a stable rule ID, severity, title, explanation, affected IDs, provenance, deterministic fingerprint and optional recommended action.

Severities:

- `error`: structurally invalid or contradictory state that prevents reliable interpretation;
- `warning`: likely incomplete, stale or weakly evidenced state;
- `info`: useful compatibility or navigation observation;
- `unknown`: analysis could not decide because evidence or profile support is insufficient.

No single opaque health score is authoritative.

### DEC-STU-009 — Determinism

Given identical project bytes, adapter ordering, analyzer version and rule configuration, normalized output and findings must be byte-stable after canonical sorting. Rules receive no wall-clock time implicitly. Staleness checks receive an explicit analysis timestamp.

### DEC-STU-010 — Initial validation scope

Tier 1 rules cover:

1. required core traceability files missing or unparseable;
2. duplicate stable IDs;
3. dangling relation targets;
4. malformed ledger lines;
5. active Sprint/Iteration/Slice references that do not resolve;
6. contradictory active hierarchy;
7. completed Slice lacking a referenced verification entity;
8. unknown or partially supported profile structures.

For Tier 1, duplicate-ID and compatibility coverage applies to normalized
structured-core definitions. Completed-Slice verification uses the structured
qualification in `DEC-STU-016`. Markdown-wide duplicate, document-status and
verification-document coverage remains TIER-003 work.

Stale unfinished-work detection is deferred until timestamps and status conventions are proven by fixtures. Tier 1 may report missing timestamps as `unknown`, not guess staleness.

### DEC-STU-011 — Verification interpretation

Verification is evidence only when a record identifies its subject and contains at least a command/check description and outcome. A completion statement without a resolvable verification record is not sufficient. Tier 1 validates references and minimum record structure; it does not rerun target-project commands.

### DEC-STU-012 — UI and graphing

Tier 1 provides a project summary, active-work view, parse diagnostics and findings list/detail. Graph visualization is deferred. Later graph options should prefer a derived view over making a graph library part of the domain model; React Flow is suitable for interactive exploration, while Cytoscape is stronger for graph analysis.

### DEC-STU-013 — SharedUI

SharedUI may supply layout, typography, controls, cards, tables, badges and empty/error states. Domain types, rules, source adapters and application queries must not import SharedUI or React.

### DEC-STU-014 — Packaging and reuse

Use a workspace-friendly structure with a framework-independent TypeScript core. The core exposes pure parsing, normalization, validation and report serialization so later CLI, CI, Node service and skills can consume it.

A future machine-readable report shall be versioned and include analyzer version, profile, snapshot identity, findings and provenance. Future `sdp-auditor` and `sdp-verifier` skills shall call this report-producing boundary rather than scrape UI state.

### DEC-STU-015 — Tier 1 structured-core compatibility boundary

Tier 1 content analysis is limited to the structured-core profile formed by:

- `SDP/Traceability/CurrentIndex.yaml`;
- `SDP/Traceability/Relations.yaml`; and
- `SDP/Traceability/Ledger.ndjson`.

Tier 1 discovery also locates and classifies standard SDP Markdown files and
directories by canonical repository-relative path. It does not read or parse
their contents, extract Markdown stable IDs, or treat Markdown documents as
normalized entities.

Markdown heading/structure parsing, explicit stable-ID extraction and
lifecycle/Sprint/Iteration/Slice/Verification/Review document-content analysis
belong to `TIER-003 — Lifecycle and work-document coverage`.

For Tier 1, compatibility means compatibility with this structured-core
profile, not complete analysis of every installed SDP Markdown document.
Documentation, compatibility reporting and acceptance evidence must keep this
partial Markdown coverage visible. This narrows Tier 1 acceptance while
preserving the wider product mandate and its planned document-analysis
capabilities.

For Tier 1, this decision clarifies that `DEC-STU-001` items 1, 2 and 4 are
path discovery/classification only and supersedes the Tier 1 content-analysis
implication of item 5, the Tier 1 Markdown-parser language in `DEC-STU-002`, and
any implication in `DEC-STU-003` that a Markdown parser is required before Tier
1 acceptance. Those earlier decisions continue to describe the wider product
direction and the `TIER-003` boundary.

### DEC-STU-016 — Structured Tier 1 verification evidence

For Tier 1, a completed Slice has qualifying verification evidence only when
all of the following normalized structured evidence exists:

1. the Slice has an explicit `verification` relation;
2. that relation resolves to an entity with kind `verification`;
3. the entity has a non-empty string in either `check` or `command`, after
   trimming whitespace; and
4. the entity has exact `outcome: passed`.

The explicit Slice-to-verification relation identifies the subject. The
`check` or `command` attribute identifies what was performed, and `outcome`
identifies the result. A `verification_plan` relation does not qualify, a
review relation does not qualify, and `outcome: passed` alone does not qualify.
One qualifying related target is sufficient even when another related
verification target is incomplete.

Tier 1 interprets only normalized structured attributes. Markdown
verification-document interpretation and richer record extraction are deferred
to `TIER-003`. Tier 1 records and validates the evidence; it does not execute
the recorded check or command.

This decision makes the minimum structured interpretation required by
`DEC-STU-011` explicit without weakening its subject, check/command and outcome
requirements.

## 4. Fixture Strategy

Create deterministic synthetic fixtures:

- `minimal-valid`;
- `missing-reference`;
- `duplicate-id`;
- `malformed-ledger`;
- `active-state-mismatch`;
- `completed-without-verification`;
- `unsupported-variant`.

Fixtures must be small, human-readable and contain expected normalized snapshots/findings. Real repositories may later be sanitized into compatibility fixtures but shall not be required for Tier 1 tests.

## 5. Risks and Mitigations

- **Underspecified SDP schemas:** define an explicit initial profile and report uncertainty.
- **Markdown ambiguity:** Tier 1 performs path-only discovery; TIER-003 may extract only explicit, documented ID patterns and never infer IDs from prose semantics.
- **Browser support:** fixture mode first; capability detection for folder access.
- **Provenance loss:** make `SourceRef` mandatory at parser boundaries.
- **UI-driven architecture:** keep core packages React-free and test them independently.
- **False completion claims:** distinguish declared status from verified evidence.
- **Version drift:** include analyzer/profile versions in reports and fixtures.

## 6. Deferred Questions

- Canonical SDP Toolkit schema/version marker.
- Precise stale-work thresholds and timestamp semantics.
- Node service transport and authentication.
- Tauri versus Electron packaging.
- Graph visualization and graph-query requirements.
- Automated repair or write-back.

These do not block Tier 1.

## 7. Study Completion Signal

The Study is complete for Tier 1 when Requirements, Architecture and Design trace to `DEC-STU-001` through `DEC-STU-016`, and implementation does not require choosing a different acquisition, parsing, provenance or domain-model direction.
