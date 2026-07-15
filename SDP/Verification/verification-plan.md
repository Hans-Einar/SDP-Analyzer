# SDP-Analyzer Verification Plan

Status: active  
ID: `VER-PLAN-001`  
Applies to: `TIER-001`, `SPR-001`, `TIER-002`, `SPR-002`
Amended: 2026-07-14 (Tier 2 browser-directory acquisition)

## Purpose

Define evidence required before any Slice or Tier is marked complete. This plan is not itself execution evidence.

## Required evidence per Slice

- exact dependency-install command and outcome when dependencies change;
- strict TypeScript typecheck command and outcome;
- unit/component test command, test count and outcome;
- production Vite build command and outcome;
- lint command and outcome when configured;
- rendered/manual check for user-visible changes;
- known limitations and skipped checks;
- commit/tree state or changed-file scope being verified;
- independent Reviewer disposition.

## Evidence rules

1. Record actual output; do not infer success from implementation summaries.
2. A verification record names exactly one Slice unless it is an explicit Tier integration record.
3. Failed checks remain recorded; later success is appended in a new record or section.
4. A completed Slice must relate to a qualifying verification record in `Relations.yaml`.
5. Documentation-only planning does not claim product verification.
6. Fixture expected results must be authored from the contract, not copied blindly from current output.
7. Determinism tests use an explicit fixed `analysisTime`.

## Tier 1 verification matrix

| Concern | Method |
|---|---|
| Module boundaries | Reviewer inspection plus import/boundary tests or lint rules where practical |
| Source adapter | contract tests for deterministic listing, text reading and path rejection |
| YAML/NDJSON parsing | valid and malformed fixtures with line/range assertions |
| Normalization | canonical snapshot comparison |
| Validation | positive/negative rule tests and stable fingerprint checks |
| Partial failure | fixture containing both valid and malformed sources |
| Security | tests/inspection confirming no code execution and no write interface |
| UI | rendered tests for loading, ready, failure, empty and provenance detail states |
| Static delivery | production Vite build |
| Accessibility | semantic labels, keyboard reachability and non-color severity cues |

## Planned records

- `VER-SLC-001` through `VER-SLC-007` and `VER-TIER-001` contain the accepted
  Tier 1 evidence.
- `VER-SLC-008`: passed browser-adapter verification.
- `REV-SLC-008`: approved fresh independent review with no actionable finding.
- `VER-SLC-009`, `VER-SLC-010` and `VER-TIER-002` remain planned and are not
  evidence.

No planned ID is evidence until its record exists and contains actual results.

## Tier 2 SLC-008 verification matrix

| Concern | Method |
|---|---|
| Capability detection | Tests with and without browser globals; prove no picker invocation |
| Permission semantics | Fake-handle tests distinguish unsupported, prompt, granted and denied without requesting permission |
| Recursive traversal | Empty, nested, shuffled-order and inaccessible-entry fake handles |
| Path safety | Traversal, backslash, absolute, duplicate and unknown-read rejection |
| Read-only behavior | Static and runtime scans for write handles, permission requests, picker calls, telemetry and execution |
| Partial failure | Atomic entries/evidence, complete/partial/failed honesty, missing-core suppression, duplicate exclusion and overlapping-attempt safety |
| Integration | Existing discovery and `analyzeProject` accept the browser adapter unchanged |
| Architecture | Browser types stay under `src/adapters/browser`; no React, SharedUI or Node filesystem use |
| Regression | Complete Tier 1 fixture suite remains passing |
