# SDP-Analyzer Design Analysis

Status: accepted for Tier 1 planning  
ID: `DAN-001`  
Date: 2026-07-11
Amended: 2026-07-13 (Tier 1/Tier 3 content boundary)

## 1. Purpose

Translate `ARC-001` into horizontal layer contracts, compare meaningful alternatives, then fan the work into vertical Tiers that leave the application runnable and reviewable.

## 2. Horizontal layer analysis

| Layer | Inputs | Outputs | Must not own |
|---|---|---|---|
| Project source | selected fixture/handle/path | repository-relative files and text | SDP semantics |
| Discovery/profile | file manifest | discovered sources, path-classified Markdown, profile status | content parsing or UI |
| Parsing | structured-core source text in Tier 1 | typed raw records and diagnostics | cross-file policy or Markdown content |
| Normalization | parsed records | immutable `ProjectSnapshot` | rendering state |
| Validation | snapshot + explicit context | deterministic findings | source mutation |
| Application/query | analysis result | summaries and view models | parser internals |
| React/SharedUI | view models and actions | accessible read-only UI | validation decisions |
| Report/export | analysis result | versioned serialized report | UI state |

## 3. Alternatives and decisions

### Acquisition

1. **Fixture-only permanently** — safest but not useful enough as a product.
2. **Browser File System Access API first** — direct and private, but browser-specific and adds permission complexity before core correctness.
3. **Local Node service first** — broad filesystem support, but introduces service lifecycle, transport and security design.
4. **Electron/Tauri first** — strong filesystem access, but prematurely fixes deployment packaging.

**Decision:** fixture-first core, then browser directory adapter. Preserve Node/Tauri options through `ProjectSource`.

### Package structure

1. Single React application with folders.
2. Monorepo/workspace with separate packages immediately.
3. Vite application with strict internal module boundaries, extract packages only when CLI/CI becomes a real consumer.

**Decision:** start with one Vite TypeScript project and top-level `src/core`, `src/application`, `src/adapters`, `src/ui`; configure import boundaries and avoid publishing packages prematurely.

### Markdown IDs

1. Infer IDs from headings and filenames.
2. Require front matter everywhere.
3. Extract explicit ID tokens using documented patterns and preserve unresolved documents.

**Decision:** option 3 for TIER-003. Under `DEC-STU-015`, Tier 1 stops at canonical Markdown path discovery/classification and does not read Markdown content. Inference from prose would create false confidence.

### Validation execution

1. Rules mutate a graph and accumulate state.
2. Pure ordered rules over an immutable snapshot.
3. One large validator function.

**Decision:** option 2. It supports isolated tests, deterministic output and later CLI reuse without introducing a plugin framework.

### Graph model

1. Adopt a graph library as canonical storage.
2. Store serializable entities/relations and derive graph views later.

**Decision:** option 2. Tier 1 needs integrity checks, not visual graph complexity.

### UI state

1. Global state framework immediately.
2. React component-local state everywhere.
3. One application analysis controller/hook with immutable results; local UI state for filters/selections.

**Decision:** option 3. No external state library is justified for Tier 1.

## 4. Vertical Tiers

### `TIER-001` — Deterministic fixture analysis core and thin UI

Load one bundled fixture, discover/classify standard Markdown paths, parse only the three structured traceability files, normalize active declarations/entities/relations/ledger events, run the bounded initial rules, and display summary, diagnostics and findings with provenance. Compatibility is explicitly the structured-core profile defined by `DEC-STU-015`.

Excluded: browser folder access, Markdown content reads or entity/ID extraction, graph, report download, stale-time policy and project mutation. Tier 1 verification qualification uses only structured relations and attributes under `DEC-STU-016`.

### `TIER-002` — Explicit local directory acquisition

Add File System Access API capability detection, permission flow and a browser source adapter. Reuse the Tier 1 analysis pipeline unchanged. Expand source navigation and compatibility reporting.

### `TIER-003` — Lifecycle and work-document coverage

Parse Markdown headings and documented structure; extract explicit stable IDs and statuses from lifecycle, Sprint, Iteration, Slice, Verification and Review Markdown documents; and add richer verification-record interpretation plus hierarchy, completion and evidence rules against representative fixtures.

### `TIER-004` — Machine-readable reports and automation boundary

Versioned JSON report, CLI package, CI exit policy and local Node source adapter. Prepare integration contracts for `sdp-auditor` and `sdp-verifier` skills.

### `TIER-005` — Traceability exploration

Entity detail, relation navigation and optional derived graph visualization. Add query performance work only when representative project size demands it.

### `TIER-006` — Repair assistance

Explicit suggested patches and reviewed write-back only after read-only findings are trusted. This Tier requires a new mandate/security study.

## 5. Tier 1 Slice fan-out

- `SLC-001`: Establish Vite/React/TypeScript shell, module boundaries, test/build tooling and one fixture-source smoke path. No SDP parsing yet.
- `SLC-002`: Implement core source/provenance types, fixture adapter and discovery manifest.
- `SLC-003`: Implement strict YAML and NDJSON parsers with diagnostics and provenance.
- `SLC-004`: Normalize CurrentIndex, Relations and Ledger into `ProjectSnapshot`.
- `SLC-005`: Implement rule registry and initial structural rules with fixtures.
- `SLC-006`: Add application orchestration and read-only summary/findings UI.
- `SLC-007`: Complete Tier 1 integration verification, accessibility checks, documentation and independent review.

Each Slice must preserve a buildable application and stop before the next Slice.

## 6. First Slice rationale

`SLC-001` creates only the execution/test skeleton and enforces architectural boundaries. It is intentionally smaller than “implement the parser.” This prevents Codex from inventing package layout, testing conventions or UI architecture while simultaneously solving domain parsing.

## 7. Verification strategy

- TypeScript strict typecheck.
- Unit tests with Vitest in a DOM-free environment for core modules.
- React component/browser-like tests only for UI behavior.
- Production Vite build every Slice.
- Fixture expected-results tests from `SLC-003` onward.
- Independent Reviewer checks architecture imports, scope and actual command output.
- Verification records are Slice-specific and never pre-claimed.

## 8. Design-analysis completion signal

The analysis is complete when `DES-001` defines Tier 1 types/workflows and `IMP-001` provides Slice contracts whose requirements and verification are traceable.
