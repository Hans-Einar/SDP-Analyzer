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

The Iteration executes the ordered Slice contracts below. `SLC-001` and
`SLC-002` are completed and accepted. `SLC-003` is completed with final
independent approval and awaits supervising acceptance.

---

## SLC-001 — Project skeleton and SharedUI boundary enforcement

Status: completed
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

### Completion record

Completed on 2026-07-11 after `VER-SLC-001` passed and the final
`REV-SLC-001` disposition was approved following a bounded traceability
correction. `CurrentIndex.yaml` remained pointed at `SLC-001` until
supervising architect acceptance was recorded on 2026-07-11. `SLC-002` was
then activated through the required traceability transition.

---

## SLC-002 — Project source, provenance and discovery

Status: completed
Slice ID: `SLC-002`

### Goal

Implement the framework-independent project-source, path-normalization,
source-provenance and deterministic discovery foundation required before
traceability parsing begins.

The Slice shall prove that SDP-Analyzer can inspect an abstract project source,
normalize and validate repository-relative paths, discover the Tier 1 SDP
structure, and report a deterministic manifest without parsing YAML, NDJSON or
Markdown content.

### Why now

SLC-001 established the project and SharedUI boundaries. Before parser
implementation, the system needs one stable source/discovery contract so
fixtures, future browser directory access and future Node adapters can supply
identical project evidence without parser or UI coupling.

### Requirements implemented

Primary: `REQ-F-002`, `REQ-P-001`, `REQ-M-002`.

Partial/foundation: `REQ-P-002`, `REQ-D-005`, `REQ-C-001`,
`REQ-C-002`, `REQ-NF-001`, `REQ-NF-002`, `REQ-T-001`,
`REQ-T-003`, `REQ-S-001` and `REQ-S-003`.

SLC-002 does not claim full acceptance of requirements whose later behavior
depends on parsing, normalization or validation.

### Architecture and design references

`ARC-COMP-001`, `ARC-COMP-003`, `ARC-COMP-004`,
`ARC-COMP-011`; `ADR-001`, `ADR-002`, `ADR-003`,
`ADR-004`, `ADR-008`; `DES-001` sections 2, 3, 7, 8, 9, 12,
13 and 14.

### Required implementation

#### 1. Source provenance types

Add the Tier 1 source types defined by `DES-001`, including:

```ts
type SourceKind =
  | "yaml"
  | "json"
  | "ndjson"
  | "markdown"
  | "synthetic";

interface SourceRef {
  readonly sourceId: string;
  readonly path: string;
  readonly kind: SourceKind;
  readonly lineStart?: number;
  readonly columnStart?: number;
  readonly lineEnd?: number;
  readonly columnEnd?: number;
  readonly pointer?: string;
}
```

Use readonly fields where appropriate. Do not introduce parser-specific AST
types.

#### 2. Repository-relative path normalization

Create a small pure path module that:

- converts backslashes to `/`;
- rejects absolute paths and drive-letter paths;
- rejects empty paths and leading `/`;
- rejects `.` and `..` path segments;
- rejects attempts to escape the source root;
- produces one canonical repository-relative path;
- depends on no Node filesystem API; and
- behaves deterministically in browser and Node test runtimes.

Unsafe traversal paths must fail explicitly rather than be silently repaired.
Expose an explicit result or typed error suitable for adapters and diagnostics.

#### 3. ProjectSource contract refinement

Retain the minimal read-only source boundary from SLC-001. Refine it only where
required to support safe canonical paths and discovery.

Do not add write methods, filesystem handles, browser-specific types,
Node-specific types, parser methods, generic plugin frameworks or speculative
streaming APIs.

#### 4. Fixture source

Refine the bundled fixture adapter so that:

- all fixture paths are canonical and deterministic;
- `listFiles()` returns stable canonical ordering;
- `readText()` accepts only a known canonical file path;
- unknown or unsafe paths fail explicitly;
- no target-project code is executed; and
- no source mutation is possible.

The fixture represents this minimal standard SDP project structure:

```text
AGENTS.md
AGENTS-project.md
SDP/01--Mandate/mandate.md
SDP/02--Study/study.md
SDP/03--Requirements/requirements.md
SDP/04--Architecture/architecture.md
SDP/05--DesignAnalysis/design-analysis.md
SDP/06--Design/design.md
SDP/07--Implementation/implementation-plan.md
SDP/Sprints/SPR-001/ScrumIterations.md
SDP/Verification/verification-plan.md
SDP/Traceability/CurrentIndex.yaml
SDP/Traceability/Relations.yaml
SDP/Traceability/Ledger.ndjson
```

Fixture contents may remain minimal text placeholders where content parsing
belongs to later Slices. Do not duplicate the live repository into the fixture.

#### 5. Discovery manifest

Implement a pure discovery operation that consumes only `ProjectSource`. It
returns a deterministic manifest containing at least:

```ts
interface DiscoveredSource {
  readonly path: string;
  readonly kind: SourceKind;
  readonly source: SourceRef;
}

interface CoreTraceabilityDiscovery {
  readonly currentIndex?: DiscoveredSource;
  readonly relations?: DiscoveredSource;
  readonly ledger?: DiscoveredSource;
}

interface ProjectDiscoveryManifest {
  readonly sourceId: string;
  readonly files: readonly DiscoveredSource[];
  readonly coreTraceability: CoreTraceabilityDiscovery;
  readonly standardDirectories: {
    readonly lifecycle: readonly string[];
    readonly sprintsPresent: boolean;
    readonly verificationPresent: boolean;
    readonly codeReviewPresent: boolean;
    readonly traceabilityPresent: boolean;
  };
  readonly profile: {
    readonly id: string;
    readonly support: "supported" | "partial" | "unsupported" | "unknown";
  };
  readonly diagnostics: readonly Diagnostic[];
}
```

The exact shape may follow repository conventions, but it must preserve these
responsibilities. Discovery must:

- locate exact Tier 1 core paths;
- classify source kind from known extensions and conventions;
- identify standard SDP directory presence;
- distinguish complete supported structure from partial structure;
- preserve provenance;
- return deterministic canonical ordering;
- avoid reading or interpreting YAML/NDJSON contents; and
- avoid inferring entity IDs or work status.

#### 6. Diagnostics

Add the framework-neutral diagnostic type from `DES-001`:

```ts
type DiagnosticSeverity = "error" | "warning" | "info";

interface Diagnostic {
  readonly code: string;
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly source?: SourceRef;
}
```

Only discovery, path and source diagnostics belong in this Slice. Do not
implement validation findings or the `SDP001`–`SDP008` rule model.

#### 7. Application and UI boundary

The existing UI may be adjusted minimally to display discovery smoke
information such as discovered file count, core traceability files present,
profile support and discovery diagnostic count. Use existing SharedUI
components and dashboard configuration.

Do not add generic UI primitives, a findings view, parser status or fake health
results. A UI change is optional if discovery behavior is sufficiently proven
through application tests. Keep UI work subordinate to source/discovery core.

### Expected modules

A reasonable layout is:

```text
src/core/source/
  ProjectSource.ts
  SourceRef.ts
  projectPath.ts

src/core/discovery/
  ProjectDiscoveryManifest.ts
  discoverProject.ts

src/core/diagnostics/
  Diagnostic.ts

src/adapters/fixtures/
  bundledFixtureSource.ts
  bundledFixtureSource.test.ts

src/application/
  loadSourcePreview.ts
```

Names may vary, but responsibility boundaries shall remain explicit.

### Invariants

- No React or SharedUI imports in `src/core`, `src/application` or
  `src/adapters`.
- No Node or browser filesystem dependency in core.
- No project mutation or analyzed-code execution.
- No YAML, JSON, NDJSON or Markdown parsing.
- No entity normalization, validation rules or findings.
- Every discovered source has provenance.
- File ordering is deterministic.
- Unsafe paths fail explicitly.
- `ProjectSource` remains read-only.
- SharedUI remains presentation-only.
- Existing SLC-001 behavior remains functional.

### Explicit non-goals

Do not implement:

- YAML parser dependencies, NDJSON parsing or Markdown AST parsing;
- CurrentIndex field interpretation, Relations interpretation or Ledger event
  parsing;
- normalized entities or relations;
- active Sprint/Iteration/Slice resolution;
- validation rule registry, findings or finding fingerprints;
- completed-without-verification or stale-work detection;
- File System Access API, browser directory permissions or a Node filesystem
  adapter;
- graph visualization, report export, CLI or CI;
- automatic repair or write-back;
- broad SharedUI improvements; or
- SLC-003 work.

### Required tests

At minimum:

1. canonical path normalization;
2. Windows separator normalization;
3. rejection of absolute paths;
4. rejection of drive-letter paths;
5. rejection of `.` and `..` segments;
6. rejection of unknown fixture reads;
7. deterministic fixture file ordering;
8. discovery of all three core traceability files;
9. partial-profile result when a core source is missing;
10. provenance on every discovered file;
11. deterministic repeated discovery output; and
12. existing rendered application smoke behavior.

Core and adapter tests must not rely on browser directory APIs.

### Verification

Run and record exact outcomes for:

```text
npm ci
npm run typecheck
npm test
npm run build
npm ls SharedUI --depth=0
git diff --check
```

Run lint only if a lint command is introduced or already exists. Perform a
rendered smoke check if the UI changes.

Create `VER-SLC-002` only after real checks run. Record exact commands,
outcomes, test counts, deterministic discovery evidence, limitations and the
working-tree scope verified.

### Independent review

Use a fresh independent Reviewer after implementation. The Reviewer must inspect
the complete contract, path safety, deterministic ordering, provenance coverage,
`ProjectSource` minimality, discovery/profile logic, absence of parser behavior,
absence of React/SharedUI imports outside UI, fixture size and purpose, actual
verification evidence and traceability correctness.

Create `REV-SLC-002` only after review occurs. If changes are required,
delegate a bounded correction Worker and repeat applicable checks and review.

### Completion signal

SLC-002 is complete when safe canonical project paths are implemented and
tested; the fixture satisfies the refined read-only contract; deterministic
discovery returns the Tier 1 source manifest; all discovered facts retain
provenance; complete and partial fixture structures are distinguished; no
source content parsing exists; verification passes; fresh review approves; and
traceability accurately records real evidence.

`CurrentIndex.yaml` must remain on `SLC-002` after completion. `SLC-003`
must remain planned and untouched.

### Discoveries policy

Resolve only discoveries necessary for this Slice that do not alter accepted
requirements or architecture. Record, but do not implement, SharedUI package
improvements, browser directory acquisition, Node adapter needs, historical SDP
profile variants, parser schema questions, stale-work policies, report or graph
requirements.

If implementation requires changing architecture, requirements or Tier
boundaries, stop and return the conflict to the supervising architect.

### Stop condition

Stop immediately after SLC-002 verification, review and traceability updates.
Do not begin `SLC-003`.

### Completion record

Completed on 2026-07-12 after `VER-SLC-002` passed. The first
`REV-SLC-002` disposition required a bounded source-list failure correction;
the correction passed 24 tests and a second fresh Reviewer approved the current
tree with no remaining actionable finding.

The supervising architect accepted the committed result at
`90bd7b6b0474331e54c5716398ca1bc714b995c2` on 2026-07-12. The Master then
recorded acceptance and activated `SPR-001 / ITR-001 / SLC-003` before any
SLC-003 product implementation.

## SLC-003 — Core traceability parsers

Status: completed
Slice ID: `SLC-003`

### Goal

Implement strict, deterministic, provenance-preserving parsers for
`SDP/Traceability/CurrentIndex.yaml`, `SDP/Traceability/Relations.yaml` and
`SDP/Traceability/Ledger.ndjson`.

This Slice parses syntax and supported raw structure only. It does not
normalize cross-file project entities, resolve relations, derive active work,
run validation rules or create findings.

### Why now

SLC-002 established safe project-source acquisition, canonical paths,
provenance and discovery. The next architectural boundary is syntax parsing.
Parsing must be independently testable and preserve malformed input evidence
before SLC-004 introduces cross-file normalization.

### Requirements implemented

Primary: `REQ-D-001`, `REQ-D-002`, `REQ-D-004`, `REQ-P-002`,
`REQ-NF-002`.

Partial/foundation: `REQ-D-005`, `REQ-D-006`, `REQ-P-001`, `REQ-P-003`,
`REQ-T-001`, `REQ-T-003`, `REQ-S-001`, `REQ-C-002`, `REQ-NF-001`.

SLC-003 does not claim requirements related to cross-file validation, entity
resolution or UI findings.

### Architecture and design references

`ARC-COMP-002`, `ARC-COMP-003`, `ARC-COMP-004`, `ARC-COMP-011`;
`ADR-002`, `ADR-003`, `ADR-004`, `ADR-008`; `DEC-STU-002`,
`DEC-STU-003`, `DEC-STU-006`, `DEC-STU-009`; `DES-001` sections 2, 3,
6, 8, 9, 12, 13 and 14.

### Required implementation

#### 1. Parser dependency

Add the maintained `yaml` package as an exact dependency and pin it in
`package.json` and `package-lock.json`. Use native `JSON.parse` for NDJSON
lines.

Do not add an alternative YAML parser, Markdown parser, graph library, schema
framework or generic parser-plugin system.

#### 2. Parsed source contract

Implement or refine a presentation-neutral `ParsedSource<T>` contract that
exposes the source-level `SourceRef`, diagnostics and an optional value. It
must distinguish successful parsing, partial parsing with diagnostics and
failed parsing with no value.

Malformed repository content returns sourced diagnostics rather than causing
an application crash. Programming errors and violated internal invariants may
still throw.

#### 3. Raw CurrentIndex model

Create a parser-local raw model that preserves supported `project`, `active`
and `planning` structure plus unknown top-level fields. Active sprint,
refactor, iteration and slice values may be strings or null only.

Parsed scalars must not be coerced. Invalid active value types produce sourced
diagnostics; missing fields remain missing; no entity existence or hierarchy
validation occurs; no default active identifiers are invented.

#### 4. Raw Relations model

Parse Relations into a raw serializable representation preserving top-level
sections, stable keys, unknown sections, raw relation values and source
provenance or structured pointers for parsed sections where practical.

Do not transform this into the normalized `Relation` domain model, verify that
IDs exist or interpret completion evidence.

#### 5. Raw Ledger model

Parse Ledger line by line. Every nonblank line is one independent JSON record.
Blank lines are ignored deterministically. Valid lines before and after a
malformed line remain available. Arrays, strings, numbers, booleans and null
produce line diagnostics rather than records.

Record sequence reflects original source line order rather than valid-record
count. Every valid record and malformed-line diagnostic identifies the exact
original line. Do not interpret event semantics or timestamps, validate
duplicate event IDs or reconstruct state.

#### 6. Source locations and pointers

Use reliable YAML parser range/location information for line and column
locations and structured pointers where practical. Every parsed source has a
file-level `SourceRef`; every Ledger record and malformed line has exact line
provenance; YAML syntax diagnostics carry parser-derived positions.

Document one line/column indexing convention and assert it in tests. Do not
invent exact locations where the parser cannot supply them reliably.

#### 7. YAML safety

Configure YAML parsing so duplicate mapping keys produce diagnostics or parse
failure, custom tags cannot execute constructors, aliases cannot cause
unbounded expansion, arbitrary JavaScript is never evaluated, target
repository modules are never imported and supported parsing is deterministic.
Document the selected options and their security rationale in implementation
notes.

#### 8. Parser interfaces and boundaries

Keep parser functions cohesive, pure and framework-neutral. They consume text
and provenance supplied by the application boundary. Parser modules must not
depend on React, SharedUI, browser handles, Node filesystem APIs or the fixture
adapter.

#### 9. Parser diagnostics

Use stable parser-specific codes such as
`PARSE_YAML_SYNTAX_ERROR`, `PARSE_YAML_DUPLICATE_KEY`,
`PARSE_YAML_UNSUPPORTED_ROOT`, `PARSE_CURRENT_INDEX_INVALID_FIELD`,
`PARSE_RELATIONS_INVALID_SECTION`, `PARSE_LEDGER_INVALID_JSON`,
`PARSE_LEDGER_NON_OBJECT` and `PARSE_SOURCE_KIND_MISMATCH`.

Do not use `SDP001` through `SDP008`; those identifiers belong to later
validation rules.

#### 10. Application integration

Add a small presentation-neutral operation that reuses SLC-002 discovery,
reads the three discovered core files through `ProjectSource`, calls the
matching parser and returns parser results plus diagnostics. A read failure for
one file must not erase successful results from the other two.

Do not construct a normalized `ProjectSnapshot`.

#### 11. Fixture contents

Replace the three core fixture placeholders with small valid examples matching
the installed project profile: CurrentIndex project/active declarations,
Relations stable sections and references, and several Ledger JSON-object
lines. Keep deliberately broken inputs in tests or separate tiny fixtures; do
not duplicate the full live project files.

#### 12. UI boundary

The SharedUI preview may be updated minimally to show truthful parser smoke
data such as CurrentIndex and Relations parse status, valid Ledger record count
and parser diagnostic count. UI changes are secondary to parser correctness
and must reuse SharedUI baseline components.

Do not present project health, resolved active work, normalized entities,
dangling references, completion-without-verification findings or fake
validation results. Do not create a local generic parser-status design system.

### Expected modules

A cohesive implementation will normally place parsed-source/raw models and
CurrentIndex, Relations, Ledger and YAML-location parsing under
`src/core/parsing`, the discovery/read/parse operation under `src/application`,
and the valid small examples in the existing fixture adapter. Exact filenames
may vary without moving responsibility across boundaries.

### Invariants

- Core parsing imports no React or SharedUI.
- Core parsing imports no browser or Node filesystem API.
- No arbitrary code execution or custom YAML constructor execution occurs.
- Duplicate YAML keys are not silently accepted.
- Valid NDJSON lines survive malformed neighboring lines.
- Every diagnostic has source provenance when determinable.
- Every valid Ledger record has exact line provenance.
- Missing values remain missing.
- No relation resolution or active hierarchy resolution occurs.
- No normalized entities, validation rules or findings are introduced.
- Source input is not mutated.
- Existing SLC-001 and SLC-002 behavior remains functional.
- Output ordering is deterministic.

### Explicit non-goals

- Markdown parsing or stable-ID extraction;
- normalized `Entity`, `Relation` or `LedgerEvent` records;
- `ProjectSnapshot`;
- relation endpoint, active hierarchy or contradictory-hierarchy resolution;
- duplicate stable-ID or completion-without-verification validation;
- validation-rule registry, finding fingerprints or stale-work detection;
- File System Access API or Node filesystem adapter;
- graph visualization, report export, CLI or CI;
- repair or write-back;
- broad SharedUI changes;
- any SLC-004 work.

### Required tests

At minimum, tests shall cover:

1. valid CurrentIndex parsing;
2. missing optional CurrentIndex fields remain missing;
3. null active values remain null;
4. non-string active IDs diagnose without coercion;
5. CurrentIndex duplicate keys are rejected or diagnosed;
6. malformed CurrentIndex YAML includes source location;
7. non-object CurrentIndex root is diagnosed;
8. unknown CurrentIndex fields are preserved or explicitly diagnosed;
9. valid Relations parsing;
10. unknown Relations top-level sections are preserved;
11. malformed Relations YAML is isolated to that source;
12. duplicate Relations stable keys are rejected or diagnosed;
13. non-object Relations root is diagnosed;
14. relation targets are not resolved or validated;
15. valid Ledger object lines parse in order;
16. blank Ledger lines are handled deterministically;
17. a malformed middle Ledger line does not remove valid neighbors;
18. non-object Ledger values are diagnosed;
19. exact Ledger line provenance is asserted;
20. Ledger sequence reflects original source order;
21. a final Ledger line without a newline parses;
22. repeated Ledger parse output is deterministic;
23. one failed core-file read does not erase other parse results;
24. SLC-002 discovery is reused rather than duplicated;
25. parser modules contain no React, SharedUI or platform filesystem dependency;
26. existing SLC-002 discovery tests remain passing; and
27. rendered UI smoke remains passing if UI changes.

### Verification

Run and record exact outcomes for:

1. `npm ci`;
2. `npm run typecheck`;
3. `npm test`;
4. `npm run build`;
5. `npm ls SharedUI yaml --depth=0`;
6. `git diff --check`.

Run lint only if configured. Also inspect duplicate-key behavior, YAML
custom-tag safety, malformed NDJSON recovery, the location convention, parser
import boundaries and absence of SLC-004 normalization. Perform a rendered
smoke check if the UI changes.

Create `VER-SLC-003` only after real verification.

### Independent review

Use a fresh independent Reviewer after implementation and Master verification.
The Reviewer must inspect the complete contract, exact parser dependency and
options, duplicate-key handling, custom-tag and alias safety, YAML and NDJSON
provenance accuracy, malformed-line recovery, raw-model fidelity, unknown-data
preservation, absence of normalization/validation, failure isolation, actual
verification evidence and traceability consistency.

Create `REV-SLC-003` only after independent review. If changes are required,
delegate a bounded correction Worker, repeat applicable verification and use a
fresh review context.

### Completion signal

SLC-003 is complete when all three core traceability formats parse into raw
typed records; malformed repository input becomes sourced diagnostics; valid
Ledger records survive malformed lines; duplicate YAML keys are not silently
accepted; output is deterministic; unknown data is not silently discarded or
reinterpreted; no cross-file normalization or validation exists; verification
passes; fresh independent review approves; and traceability records real
evidence.

`CurrentIndex.yaml` must remain on `SLC-003` after completion. `SLC-004`
must remain planned and untouched.

### Discoveries policy

Resolve only discoveries essential to parser correctness that do not alter
accepted architecture or requirements. Record, but do not implement, Markdown
entity extraction, historical SDP schema adapters, normalized entity design
changes, rule-engine concerns, browser or Node acquisition, stale-work policy,
graph/report/repair features and SharedUI package improvements.

If implementation requires changing architecture, requirements or Tier
boundaries, stop and return the conflict to the supervising architect.

### Stop condition

Stop immediately after SLC-003 verification, review and traceability updates.
Do not begin `SLC-004`.

### Completion record

Completed on 2026-07-12 after `VER-SLC-003` passed and the initial
`REV-SLC-003` changes-required findings were corrected by a fresh bounded
Worker. Master correction verification passed 36 focused and 65 full tests;
the second fresh independent Reviewer approved the corrected tree with no
remaining actionable finding.

`CurrentIndex.yaml` intentionally remains pointed at
`SPR-001 / ITR-001 / SLC-003` for supervising acceptance. `SLC-004` remains
planned, untouched and unauthorized.

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
