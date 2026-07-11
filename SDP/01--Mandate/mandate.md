# SDP-Analyzer Mandate

Status: draft for project initiation  
Date: 2026-07-11  
Repository: `Hans-Einar/SDP-Analyzer`

## 1. Purpose

SDP-Analyzer shall provide a practical, read-first analysis environment for
projects that use the Standard Document Procedure (SDP).

The tool shall help humans and AI agents understand whether an SDP project is
internally coherent, traceable, verified, current and ready for the next piece
of work.

Its core purpose is to reduce the manual effort required to answer questions
such as:

- What Sprint, Refactor, Iteration and Slice is currently active?
- Which requirements, architecture decisions, designs and implementation slices
  are connected?
- Which referenced IDs or files are missing, duplicated, stale or orphaned?
- Which tasks appear unfinished, blocked, forgotten or inconsistent?
- Does verification evidence exist for work marked complete?
- Does the append-only ledger agree with the current index and relation graph?
- Which documents or statuses require attention before implementation continues?
- Can a human navigate the project's traceability and verification history
  without manually opening many files?

SDP-Analyzer is not initially an autonomous project editor. The first product
must favour trustworthy inspection, diagnostics and explanation over automatic
mutation.

## 2. Problem Statement

SDP stores project intent and execution state in repository-local documents.
This creates strong traceability, but larger projects accumulate many related
files, stable IDs, status fields, ledger entries, verification records and
cross-references.

Manual review becomes increasingly difficult as the number of Sprints,
Refactors and slices grows. AI agents may also miss stale or contradictory
state when they depend only on local document reading and long chat context.

A dedicated analyzer is needed to:

1. discover and parse an SDP project consistently;
2. normalize different document and traceability formats into one internal
   model;
3. validate structural and semantic relationships;
4. surface actionable findings with evidence;
5. provide clear navigation through work status and history;
6. later expose the same analysis engine to SDP skills and automation.

## 3. Product Vision

A user should be able to open SDP-Analyzer, select or configure a local project,
and immediately receive a clear project health view.

The intended experience is:

```text
Select project
    ↓
Discover SDP structure
    ↓
Parse documents and traceability
    ↓
Build normalized project graph
    ↓
Run validation rules
    ↓
View status, findings, evidence and navigation
```

The application should make a complex SDP repository feel inspectable rather
than opaque.

A mature version may support multiple projects, comparisons, history,
repair suggestions, machine-readable reports and integration with agent skills.

## 4. Primary Users

### 4.1 Human project owner

Needs a concise overview of project state, forgotten work, blocked items,
verification gaps and next actions.

### 4.2 SDP Master agent

Needs reliable machine-readable evidence before deciding whether work is ready,
complete, blocked or safe to advance.

### 4.3 Reviewer or Architect

Needs navigation from requirements and decisions to implementation,
verification and unresolved findings.

### 4.4 Maintainer of the SDP method

Needs examples of incompatible or incomplete project structures in order to
improve schemas, skills, templates and migration tooling.

## 5. Core Capabilities

The product is expected to evolve toward the following capabilities.

### 5.1 Project discovery

- select or configure a local repository/project root;
- locate the project `SDP/` directory and relevant root instruction files;
- detect available traceability, verification, Sprint and Refactor structures;
- report unsupported, absent or ambiguous structures explicitly.

### 5.2 Parsing and normalization

- parse YAML, NDJSON, JSON and Markdown-based SDP records where required;
- normalize documents, stable IDs, states, relations and evidence into a typed
  internal model;
- preserve source file and source-location provenance for every parsed fact;
- tolerate partial projects without silently inventing missing data.

### 5.3 Traceability analysis

- navigate from mandate and requirements through architecture, design, slices,
  review and verification;
- identify missing references, dangling references and orphaned records;
- detect duplicate IDs and conflicting definitions;
- compare current index, relation graph and ledger state;
- distinguish errors, warnings, information and uncertain findings.

### 5.4 Work-state analysis

- identify active, planned, blocked, completed and abandoned work;
- detect likely forgotten or unfinished tasks;
- flag work marked complete without required evidence;
- flag stale active work and contradictory status declarations;
- show the basis for each conclusion rather than only a score.

### 5.5 Verification exploration

- list verification records by Slice, requirement, commit or date where data is
  available;
- expose exact commands, results, timestamps, limitations and evidence links;
- identify missing or stale verification;
- avoid treating a summary statement as equivalent to real evidence.

### 5.6 User interface

- provide a project health dashboard;
- provide list and graph navigation for traceability;
- provide findings with severity, evidence, explanation and suggested next step;
- provide document and entity detail views;
- use SharedUI where it fits without allowing the UI library to dictate domain
  architecture.

### 5.7 Machine integration

Later versions may:

- expose validation as a CLI or library;
- produce JSON reports for CI and agent consumption;
- support an `sdp-auditor` skill backed by the same engine;
- suggest safe repairs while keeping project mutation explicit and reviewable.

## 6. Initial Product Boundary

The first implementation tier shall be deliberately small and read-only.

A suitable first vertical capability is:

> Load one local SDP project fixture or configured project path, parse its core
> traceability files, run a bounded set of validation rules and display a
> read-only project summary and findings list in a Vite/React application.

The exact local-folder access model must be studied before implementation.
Browser security limitations, desktop wrappers, a local service, File System
Access API support and fixture-based development are all candidates.

No solution shall pretend that an ordinary browser can freely scan arbitrary
local folders without an explicit supported mechanism.

## 7. Technology Direction

The expected technology direction is:

- Vite
- React
- TypeScript
- SharedUI for suitable visual primitives and layout patterns
- a domain/parser/validation core that is independent of React
- deterministic validation rules with test fixtures

Technology choices remain subject to Study and Architecture decisions.

The analyzer core should be reusable outside the web UI where practical.

## 8. Governing Principles

### 8.1 Repository evidence over assumptions

Findings must be derived from files and recorded evidence. Missing information
must remain missing rather than being guessed.

### 8.2 Explain every finding

Every error or warning should identify:

- the rule applied;
- the affected entity or file;
- source evidence;
- why it matters;
- an appropriate next action where possible.

### 8.3 Read-only first

Inspection and validation come before editing. Automatic repair is deferred
until the model and rules are trustworthy.

### 8.4 Domain before UI

The order of design is:

```text
SDP domain and schemas
    ↓
Discovery and parsing
    ↓
Normalized model
    ↓
Validation rules
    ↓
Application workflows
    ↓
UI components
```

### 8.5 Deterministic analysis

The same project state and analyzer version should produce the same normalized
model and findings.

### 8.6 Provenance throughout

Parsed values, relations and findings should retain source provenance sufficient
for navigation and review.

### 8.7 Partial compatibility is explicit

SDP projects may have evolved over time. Unsupported variants must be reported
clearly. Compatibility adapters should be versioned and tested rather than
hidden in UI code.

### 8.8 Useful before comprehensive

The first release should provide an honest, useful vertical path. It should not
attempt to model every historical SDP variant before delivering value.

## 9. Non-Goals For The Initial Programme

The initial programme shall not attempt to:

- automatically rewrite project SDP documents;
- act as an autonomous Master agent;
- replace Git, GitHub or the project's normal editor;
- infer successful implementation from documentation alone;
- support every possible ad-hoc Markdown convention;
- provide a universal project-management platform unrelated to SDP;
- execute arbitrary project commands from the browser;
- make a single opaque project-health score the primary output;
- tightly couple parser and validator logic to React components.

## 10. Relationship To The SDP Repository

`Hans-Einar/SDP` defines the reusable method, templates, skills and installation
tooling.

`Hans-Einar/SDP-Analyzer` is a separate product that consumes and validates
project-local SDP data.

The projects should remain separate because:

- the SDP repository is the method and distribution source;
- SDP-Analyzer is executable product code;
- each can evolve and version independently;
- SDP-Analyzer can use SDP to govern its own development without creating a
  circular repository structure.

Findings from SDP-Analyzer may later drive improvements in the central SDP
method, but changes to the method should occur in the SDP repository.

## 11. Delivery Model

SDP-Analyzer shall itself be developed using SDP.

The planning sequence is:

1. Mandate
2. Study
3. Requirements
4. Architecture
5. Design Analysis
6. Design
7. Implementation strategy
8. Traceability initialization
9. Sprint, Iteration and Slice contracts
10. Codex-led implementation under the Master role
11. fresh independent review and recorded verification

The supervising ChatGPT conversation is responsible for long-range product and
architectural oversight, document quality, scope control and review of Codex
outputs.

Codex is responsible for operating as the repository-local SDP Master during
implementation, coordinating bounded Workers and fresh Reviewers according to
`AGENTS.md`, installed skills and active traceability.

## 12. Initial Success Criteria

The first useful release should allow a user to:

1. provide or select one supported SDP project;
2. see whether core traceability files parse successfully;
3. see the currently active work when it is defined;
4. navigate a normalized list of major entities and relations;
5. see clear findings for at least:
   - missing referenced IDs;
   - duplicate IDs;
   - malformed ledger entries;
   - disagreement between current index and known entities;
   - completed work missing required verification references;
6. inspect source provenance for a finding;
7. run deterministic automated tests against project fixtures.

The release is not successful merely because a dashboard renders. The parser,
model and validation results must be testable and explainable.

## 13. Open Questions For Study

The Study phase must resolve or narrow:

- exact SDP variants and schemas supported initially;
- whether the first runtime uses browser folder access, a local Node service,
  Electron/Tauri, static fixtures or a hybrid approach;
- whether YAML and Markdown parsing occur in browser or local backend;
- how source locations are represented;
- the canonical normalized entity and relation model;
- finding severity and rule identity conventions;
- how ledger events reconstruct or validate current state;
- whether graph visualization belongs in the first tier;
- SharedUI integration boundaries;
- privacy and security implications of reading local repositories;
- CI/CLI packaging strategy;
- SDP and skill version compatibility;
- test fixture strategy using real, synthetic and intentionally broken projects.

## 14. Mandate Completion Signal

This mandate is complete enough to begin Study when:

- the purpose and users are accepted;
- read-only analysis is accepted as the initial product boundary;
- the relationship between SDP method and SDP-Analyzer is accepted;
- Vite/React/TypeScript and SharedUI are accepted as the provisional direction;
- the supervising ChatGPT is instructed to create the remaining SDP documents
  before Codex begins product implementation.
