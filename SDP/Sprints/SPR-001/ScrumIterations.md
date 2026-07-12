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

The Iteration executes the ordered Slice contracts below. `SLC-001`,
`SLC-002` and `SLC-003` are completed and accepted. `SLC-004` is completed,
verified and independently approved, and awaits supervising acceptance.

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

The supervising architect accepted committed state
`25418c4a505729f48b8ac5698307e6e3336fed75` on 2026-07-12. The Master then
recorded acceptance and activated `SPR-001 / ITR-001 / SLC-004` before any
SLC-004 product implementation.

## SLC-004 — Normalized traceability snapshot

Status: completed; awaiting supervising acceptance
Slice ID: `SLC-004`

### Goal

Transform successfully parsed raw CurrentIndex, Relations and Ledger records
into one immutable, deterministic and provenance-preserving normalized
`ProjectSnapshot`.

This Slice establishes the canonical domain representation used by future
validation rules. It must not implement validation findings, rule execution,
UI health conclusions or Markdown entity extraction.

### Why now

SLC-003 created trustworthy source-local raw parser outputs. The next required
boundary is normalization: converting supported raw structures into stable
entities, directed relations, ledger events, active declarations, diagnostics
and compatibility metadata without silently inventing missing data. SLC-005
validation must operate on one canonical snapshot rather than raw YAML/NDJSON
shapes.

### Requirements implemented

Primary: `REQ-D-005`, `REQ-D-006`, `REQ-P-001`, `REQ-P-004`,
`REQ-NF-001`, `REQ-NF-002`, `REQ-M-001`, `REQ-M-003`.

Partial/foundation: `REQ-F-003`, `REQ-V-002`, `REQ-V-003`, `REQ-V-005`,
`REQ-V-006`, `REQ-V-007`, `REQ-C-001`, `REQ-C-002`, `REQ-NF-004`,
`REQ-T-001`, `REQ-T-003`.

SLC-004 does not claim validation requirements as fully satisfied. It provides
only the normalized facts required by later rules.

### Architecture and design references

`ARC-COMP-003`, `ARC-COMP-004`, `ARC-COMP-005`, `ARC-COMP-006`,
`ARC-COMP-011`; `ADR-002`, `ADR-003`, `ADR-004`, `ADR-005`, `ADR-008`;
`DEC-STU-006`, `DEC-STU-007`, `DEC-STU-009`, `DEC-STU-010`,
`DEC-STU-011`; `DES-001` sections 2, 3, 4, 7, 8, 12, 13 and 14.

### Required implementation

#### 1. Canonical normalized domain types

Implement the Tier 1 normalized types from `DES-001`, including:

- extensible `EntityKind` with recognized mandate, study, requirement,
  architecture-decision, design-decision, tier, sprint, iteration, slice,
  verification, review and unknown values;
- `Entity` with stable ID, kind, optional status/title, complete raw
  attributes and source provenance;
- directed `Relation` with stable ID, type, from/to IDs and provenance;
- `LedgerEvent` with original sequence, optional safely typed convenience
  fields, raw payload and exact line source;
- `ActiveDeclaration` with explicit string/null values and source;
- `ProjectSnapshot` with profile, discovered sources, diagnostics, entities,
  relations, ledger events and optional active declaration.

Names may be refined only when repository conventions justify it. Types must
remain readonly, serializable and presentation-neutral. Do not introduce a
graph-library type.

#### 2. Normalization input

Create one pure, normally synchronous normalization operation accepting:

- `ProjectDiscoveryManifest`;
- optional parsed CurrentIndex result;
- optional parsed Relations result; and
- optional parsed Ledger result.

A suitable input is `NormalizeTraceabilityInput` and a suitable operation is
`normalizeTraceability(input): ProjectSnapshot`. The normalizer performs no
filesystem read and depends on no source adapter.

#### 3. Source and diagnostics preservation

The snapshot shall include all discovered file provenance, discovery
diagnostics, parser diagnostics, normalization diagnostics, active-declaration
provenance, entity provenance, relation provenance and Ledger line provenance.

Do not replace `SourceRef` with UI IDs or fabricate line/column positions.
Deduplicate identical provenance references deterministically when needed.

#### 4. CurrentIndex normalization

Preserve supported project metadata at snapshot level when practical without
inventing a project stable ID. Normalize only explicit typed active sprint,
refactor, iteration and slice values.

Missing active values remain missing; explicit null remains null; invalid raw
values do not become typed active IDs; active references do not create entities;
and this Slice does not assess existence, validity or hierarchy consistency.
Active provenance retains the CurrentIndex source and useful structured
pointers.

#### 5. Relations entity normalization

Normalize explicit stable keyed records in supported installed-profile
sections such as `documents`, `tiers`, `sprints`, `iterations`, `slices`,
`reviews`, `verification` and possible `refactors`.

An entity may be created only from an explicit stable definition key in a
supported Relations section. Do not create entities from relation targets,
CurrentIndex active IDs, Ledger subject IDs, Markdown filenames or prose.

Section mapping rules:

- `documents`: infer a subtype only when explicitly and reliably encoded;
  otherwise use `unknown` without ID-prefix guessing;
- `tiers`: `tier`;
- `sprints`: `sprint`;
- `iterations`: `iteration`;
- `slices`: `slice`;
- `reviews`: `review`;
- `verification`: `verification`;
- `refactors`: use an accepted extension or `unknown`.

Preserve unknown raw fields in `attributes`. Extract status, title or path only
when the source shape is explicitly supported and type-safe, without removing
the raw field from attributes.

#### 6. Directed relation extraction

Create normalized directed relations only from explicit supported relationship
fields in the current profile, including fields such as `derives_from`,
`tier`, `sprint`, `iteration`, `slice`, `slices`, `requirements`,
`architecture`, `study_decisions`, `design`, `verification_plan`,
`verification`, `review` and other deliberately documented current-profile
fields.

Every relation has a deterministic presentation-independent ID, explicit type,
from ID, to ID and provenance for its field/value. Preserve unresolved target
IDs without requiring endpoints to exist or emitting findings. Never infer a
reverse relation. Arrays produce one relation per explicit string target;
supported scalar target fields produce one relation. Invalid relation values
produce normalization diagnostics, not guessed relations.

Duplicate explicit relations may remain distinguishable through canonical
source pointers or be canonically deduplicated under one documented
deterministic policy. Relation IDs may derive from source ID, relation type,
target ID and canonical source pointer. Random IDs are prohibited.

#### 7. Ledger normalization

Convert every valid raw Ledger object to `LedgerEvent`. Safely extract optional
string convenience fields from `type`, `subject_id` and `timestamp`; missing or
invalid fields remain absent while the complete raw payload is preserved.

Retain the original source-line sequence and ordering. Do not validate event
IDs or timestamps, sort chronologically, reconstruct state, infer completion or
create events from malformed lines. Malformed-line parser diagnostics remain
diagnostics only.

#### 8. Compatibility normalization

Use discovery profile support as the initial status. Normalization may reduce
`supported` to `partial` when required parsed input is missing, failed or lacks
a usable value. It must never upgrade `partial`, `unsupported` or `unknown` to
`supported`.

Document and test this monotonic support rule. Do not claim a historical
profile is supported merely because some fields normalize.

#### 9. Normalization diagnostics and duplicate IDs

Use stable `NORMALIZE_*` codes separate from parser diagnostics and future
`SDP001` through `SDP008` rule IDs. Applicable codes include required-source
unavailable, invalid entity record, invalid relation value, duplicate entity
definition, unsupported section, invalid Ledger convenience field and active
field unavailable.

Diagnostics describe inability to normalize input; future findings describe
semantic project problems. Do not emit findings in this Slice.

When the same explicit entity ID is defined more than once, do not collapse it
silently. Choose and document one deterministic policy:

1. expose one canonical entity and diagnostics preserving every definition
   source; or
2. retain explicit multiple definitions while exposing a canonical entity
   view.

Do not emit the future duplicate-ID validation finding. Every definition
location must remain recoverable.

#### 10. Canonical ordering and stable identity

Canonical deterministic ordering is mandatory:

- sources by canonical path and source location;
- diagnostics by stable code and provenance;
- entities by kind, ID and canonical source location;
- relations by type, from, to and source location;
- Ledger events in original source line order; and
- active fields in fixed serialized property order.

Repeated normalization of identical input must be deep-equal. No ambient time
may participate. Relation IDs must remain stable across repeated runs.

#### 11. Immutability

Use readonly types and avoid exposing mutable internal arrays or maps. The
normalizer must not mutate discovery or parser inputs. Do not add an elaborate
deep-freeze framework without demonstrated need. Add a permanent test proving
inputs are unchanged.

#### 12. Application orchestration

Add a presentation-neutral operation, such as `loadProjectSnapshot`, that
performs:

```text
discover -> read/parse three core files -> normalize
```

It returns discovery, useful raw parser results and the normalized snapshot.
It does not run validation rules.

#### 13. Fixture evolution

Change the bundled fixture only as needed to exercise explicit entities,
directed relations, active declarations, valid Ledger events, provenance and
unresolved relation targets. Keep duplicate/broken definitions in separate
test inputs. Do not copy live repository files or add fake verification claims.

The default bundled fixture shall remain internally coherent enough for a clean
normalization smoke result.

#### 14. UI boundary

UI change is optional. If changed, display only truthful normalized facts such
as entity/relation/Ledger counts, declared active IDs, compatibility and
diagnostic count. Do not display semantic findings, dangling-reference
warnings, completion conclusions, a health score, recommendations or a graph.

Reuse SharedUI baseline components and the existing registry/config. Do not
create generic local UI primitives.

### Expected modules

A cohesive implementation will normally use:

```text
src/core/domain/
  Entity.ts
  Relation.ts
  LedgerEvent.ts
  ActiveDeclaration.ts
  ProjectSnapshot.ts

src/core/normalization/
  normalizeTraceability.ts
  normalizeCurrentIndex.ts
  normalizeRelations.ts
  normalizeLedger.ts
  normalizationDiagnostics.ts
  canonicalOrdering.ts

src/application/
  loadProjectSnapshot.ts
```

Exact filenames may differ, but domain, normalization and application
responsibilities must remain clear.

### Invariants

- No React or SharedUI import in core, normalization, application or adapters.
- No browser or Node filesystem import in core normalization.
- No source or parser/discovery input mutation.
- No analyzed-code execution or Markdown parsing.
- No entity creation from unresolved targets, CurrentIndex references or
  Ledger references alone.
- No cross-file validation findings, rule registry or finding model.
- No relation-endpoint or active-hierarchy validation.
- No completion interpretation or health score.
- Provenance is preserved.
- Compatibility support cannot be upgraded.
- Ledger order is preserved.
- Snapshot output and IDs are deterministic.
- Existing SLC-001 through SLC-003 behavior remains functional.

### Explicit non-goals

- validation rules or `Finding`;
- finding fingerprints or `SDP001` through `SDP008`;
- dangling-reference, duplicate-ID, active hierarchy,
  completion-without-verification or stale-work findings;
- Markdown entity/stable-ID extraction;
- verification-record interpretation beyond raw normalization;
- File System Access API or Node filesystem adapter;
- graph visualization, JSON report export, CLI or CI;
- automatic repair or write-back;
- broad SharedUI changes;
- any SLC-005 work.

### Required tests

At minimum, tests shall cover:

1. complete valid parser inputs produce a snapshot;
2. parser diagnostics are retained;
3. discovery diagnostics are retained;
4. a missing parser result reduces compatibility support;
5. normalization never upgrades compatibility support;
6. repeated normalization is deep-equal;
7. input objects remain unchanged;
8. explicit Relations section keys produce entities;
9. active IDs alone do not create entities;
10. relation targets alone do not create entities;
11. Ledger subject IDs alone do not create entities;
12. unknown entity attributes remain preserved;
13. typed status/title extraction does not discard raw attributes;
14. entity provenance identifies the explicit definition;
15. duplicate entity definitions preserve all sources and diagnose;
16. entity ordering is deterministic;
17. scalar explicit relationship fields produce directed relations;
18. array fields produce one relation per explicit target;
19. unresolved targets remain represented;
20. no reverse relation is invented;
21. invalid relation values produce diagnostics;
22. relation provenance identifies the field/value;
23. relation IDs are stable across repeated runs;
24. relation ordering is deterministic;
25. explicit active values normalize;
26. null remains null;
27. missing remains missing;
28. invalid raw fields remain absent from typed active values;
29. no active hierarchy validation occurs;
30. valid raw records become Ledger events;
31. original Ledger sequence/order is preserved;
32. supported convenience fields are extracted safely;
33. raw Ledger payload remains preserved;
34. invalid convenience-field types do not erase an event;
35. malformed source lines remain diagnostics only;
36. no duplicate-ID or chronology validation occurs;
37. discover/read/parse/normalize application flow succeeds;
38. one unavailable parsed source preserves neighboring results;
39. normalization/application import no React, SharedUI or platform filesystem;
40. no validation rule or finding implementation exists;
41. existing parser/discovery tests remain passing; and
42. rendered UI smoke remains passing if UI changes.

### Verification

Run and record exact outcomes for:

1. `npm ci`;
2. `npm run typecheck`;
3. `npm test`;
4. `npm run build`;
5. `npm ls SharedUI yaml --depth=0`;
6. `git diff --check`.

Run lint only if configured. Also perform focused checks for input immutability,
stable relation IDs, canonical ordering, Ledger source order, no entity creation
from references alone, no validation/finding imports or behavior and no
SLC-005 work. Perform a rendered smoke check only if UI changes.

Create `VER-SLC-004` only after real checks run.

### Independent review

Use a fresh independent Reviewer after implementation and Master verification.
The Reviewer must inspect normalized domain boundaries, entity-creation rules,
relation extraction, duplicate-definition preservation, provenance,
compatibility monotonicity, Ledger ordering/payload fidelity, canonical
ordering, deterministic IDs, input immutability, absence of semantic
validation/findings, actual verification evidence and traceability.

Create `REV-SLC-004` only after independent review. If changes are required,
delegate a bounded correction Worker, repeat applicable verification and use a
fresh independent review context.

### Completion signal

SLC-004 is complete when parsed core inputs normalize into one deterministic
`ProjectSnapshot`; explicit definitions produce entities; explicit relationship
fields produce directed relations; unresolved references remain represented
but unjudged; active declarations retain explicit unresolved values; valid
Ledger objects become ordered events; diagnostics and provenance are preserved;
duplicate definitions are not silently lost; compatibility is monotonic; no
validation findings or rule engine exists; verification passes; fresh review
approves; and traceability records real evidence.

`CurrentIndex.yaml` must remain on `SLC-004` after completion. `SLC-005`
must remain planned and untouched.

### Discoveries policy

Resolve only discoveries needed for normalization that do not alter accepted
architecture, requirements or Tier boundaries. Record, but do not implement,
Markdown entity extraction, validation-rule design changes, stale-work policy,
graph/report needs, browser or Node adapters, repair/write-back and SharedUI
package improvements.

If implementation requires changing accepted architecture or domain contracts,
stop and return the exact conflict to the supervising architect.

### Stop condition

Stop immediately after SLC-004 verification, review and traceability updates.
Do not begin `SLC-005`.

### Master verification checkpoint — 2026-07-12

The bounded Worker completed the authorized normalization implementation. The
Master inspected the complete product/test tree and created `VER-SLC-004` only
after independently passing a clean install, strict typecheck, the focused
4-file/32-test suite, the full 13-file/97-test suite, production build, exact
dependency resolution, whitespace check, implementation-boundary scans and
append-only traceability validation. No UI, dependency, fixture or SLC-001
through SLC-003 product source changed. At that checkpoint, SLC-004 remained
active pending fresh independent review; SLC-005 remained planned and
untouched.

### Completion record — 2026-07-12

Fresh independent `REV-SLC-004` reproduced the clean install, typecheck,
focused 32-test suite, full 97-test suite, production build, dependency and
whitespace gates, boundary/no-diff scans, strict append-only traceability and
adversarial runtime probes. The Reviewer approved the exact uncommitted tree
with no actionable finding. Relations and ledger events 033-034 record the
approved review and SLC-004 completion. `CurrentIndex.yaml` intentionally
remains on SLC-004 for supervising acceptance; SLC-005 remains planned and
untouched.

## SLC-005 — Deterministic validation

Status: planned

Goal: implement ordered pure rules needed by Tier 1 and deterministic finding fingerprints using broken fixtures.

## SLC-006 — Application workflow and UI

Status: planned

Goal: orchestrate fixture analysis and display summary, active work, diagnostics, findings and provenance through SharedUI, using narrowly domain-specific registered components only where baseline contracts are insufficient.

## SLC-007 — Tier integration and acceptance

Status: planned

Goal: close fixture coverage, rendered/accessibility checks, SharedUI reuse review, documentation, full independent review and Tier 1 verification.
