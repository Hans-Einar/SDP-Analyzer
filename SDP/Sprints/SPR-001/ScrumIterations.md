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

The Iteration executes the ordered Slice contracts below. SLC-001 through
SLC-006 are completed and accepted. SLC-007 was activated for final Tier 1
integration and is blocked pending supervising requirement/architecture
direction recorded in its blocking discovery.

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

Status: completed
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

## SLC-005 — Deterministic validation engine and initial rules

Status: completed

## Goal

Implement the framework-independent validation engine, canonical `Finding` model, deterministic finding fingerprints and the first bounded SDP validation rules over `ProjectSnapshot`.

This Slice turns normalized repository facts into explainable project-level findings.

It must not implement UI findings presentation, graph visualization, Markdown extraction, local-folder acquisition, repair or write-back.

## Why now

SLC-004 established one deterministic normalized snapshot.

Validation can now operate over stable facts without coupling rule logic to YAML shapes, filesystem access or React components.

SLC-006 will consume findings through the application/UI layer. Therefore SLC-005 must make rule behavior, provenance, ordering and fingerprints trustworthy first.

# Requirements implemented

Primary:

* `REQ-F-004`
* `REQ-F-005`
* `REQ-V-001`
* `REQ-V-002`
* `REQ-V-003`
* `REQ-V-004`
* `REQ-V-005`
* `REQ-V-006`
* `REQ-V-007`
* `REQ-V-008`
* `REQ-P-003`
* `REQ-M-003`
* `REQ-M-005`
* `REQ-NF-001`
* `REQ-NF-004`
* `REQ-T-001`
* `REQ-T-002`

Partial/foundation:

* `REQ-UI-001`
* `REQ-UI-003`
* `REQ-T-003`
* `REQ-T-005`
* `REQ-C-002`
* `REQ-NF-002`

Do not claim UI rendering requirements as complete.

# Architecture and design references

* `ARC-COMP-004`
* `ARC-COMP-005`
* `ARC-COMP-006`
* `ARC-COMP-007`
* `ARC-COMP-011`
* `ADR-002`
* `ADR-003`
* `ADR-005`
* `ADR-008`
* `DEC-STU-008`
* `DEC-STU-009`
* `DEC-STU-010`
* `DEC-STU-011`
* `DES-001` sections 4, 5, 8, 12, 13 and 14

# Required implementation

## 1. Finding model

Implement the accepted finding contract:

```ts
type FindingSeverity =
  | "error"
  | "warning"
  | "info"
  | "unknown";

interface Finding {
  readonly fingerprint: string;
  readonly ruleId: string;
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly explanation: string;
  readonly affectedEntityIds: readonly string[];
  readonly sources: readonly SourceRef[];
  readonly recommendation?: string;
}
```

Findings are presentation-neutral.

They must not contain React nodes, SharedUI data, callbacks, filesystem handles or mutable state.

## 2. Analysis context

Implement:

```ts
interface AnalysisContext {
  readonly analyzerVersion: string;
  readonly profileId: string;
  readonly analysisTime: string;
}
```

Rules must not read ambient time.

SLC-005 rules should use `analysisTime` only if genuinely required. The initial rule set should not introduce stale-work thresholds.

## 3. Validation rule contract

Implement:

```ts
interface ValidationRule {
  readonly id: string;
  evaluate(
    snapshot: ProjectSnapshot,
    context: AnalysisContext
  ): readonly Finding[];
}
```

Rules must:

* be pure;
* not mutate snapshot or context;
* not perform file reads;
* not import React or SharedUI;
* not depend on rule execution order;
* emit deterministic output.

## 4. Explicit rule registry

Implement an explicit Tier 1 registry.

No runtime plugin discovery, dependency injection framework or dynamic repository code loading.

A suitable shape:

```ts
const TIER_1_RULES: readonly ValidationRule[] = [
  requiredCoreSourcesRule,
  duplicateEntityDefinitionsRule,
  danglingRelationsRule,
  malformedLedgerRule,
  unresolvedActiveDeclarationsRule,
  contradictoryActiveHierarchyRule,
  completedSliceWithoutVerificationRule,
  compatibilitySupportRule,
];
```

The engine shall execute rules in ascending stable rule ID order, regardless of registry declaration order.

## 5. Rule execution engine

Implement one validation operation:

```ts
interface ValidationResult {
  readonly findings: readonly Finding[];
  readonly diagnostics: readonly Diagnostic[];
}

function validateSnapshot(
  snapshot: ProjectSnapshot,
  context: AnalysisContext,
  rules?: readonly ValidationRule[]
): ValidationResult;
```

Requirements:

* canonical rule ordering;
* canonical finding ordering;
* deterministic output;
* duplicate finding suppression by fingerprint;
* one rule failure must not prevent remaining rules from running;
* an unexpected rule exception becomes an analyzer diagnostic identifying the rule;
* the snapshot remains unchanged.

Do not convert expected project problems into thrown exceptions.

## 6. Fingerprint policy

Fingerprints must be stable across presentation-text changes.

Derive each fingerprint from canonical structural identity, such as:

```text
rule ID
canonical affected entity IDs
canonical source locations
optional stable discriminator
```

Do not include:

* title;
* explanation;
* recommendation;
* current array insertion order;
* random UUID;
* wall-clock time.

A deterministic JSON tuple is acceptable.

Document the exact policy.

## 7. Canonical finding ordering

Sort findings deterministically by:

1. severity rank:

   * error
   * warning
   * unknown
   * info
2. rule ID;
3. canonical affected entity IDs;
4. canonical source references;
5. fingerprint.

Do not depend on locale-sensitive sorting.

## 8. Initial rule set

Implement the following stable rule IDs exactly:

```text
SDP001
SDP002
SDP003
SDP004
SDP005
SDP006
SDP007
SDP008
```

Do not renumber them.

---

# SDP001 — Required core source unavailable

## Purpose

Report missing, unreadable or unparseable required core traceability evidence.

## Input evidence

Use snapshot diagnostics and compatibility/provenance from discovery, parsing and normalization.

Recognize the established stable diagnostic classes for:

* missing CurrentIndex;
* missing Relations;
* missing Ledger;
* source listing/read failure;
* required parser result unavailable;
* unusable supported root structure.

## Behavior

Emit one finding per unavailable core source when the affected source can be distinguished.

Use a project-level synthetic finding only when the source itself cannot be identified, such as complete source-list failure.

Suggested severity:

* `error` for unreadable/unparseable required source;
* `warning` for structurally missing required source;
* `unknown` when acquisition evidence is insufficient to determine presence.

Do not emit duplicate findings for multiple diagnostics describing the same source failure.

---

# SDP002 — Duplicate stable entity definitions

## Purpose

Report an entity ID with more than one explicit definition.

## Input evidence

Use SLC-004 duplicate-definition normalization diagnostics and preserved entity source locations.

## Behavior

Emit one finding per duplicated entity ID.

The finding must:

* identify the duplicated ID;
* include every definition source known;
* explain that one canonical entity view exists but definitions disagree or overlap;
* not claim which definition is semantically correct.

Suggested severity: `error`.

Do not report duplicate relation targets or repeated Ledger subjects as duplicate entity definitions.

---

# SDP003 — Dangling relation endpoint

## Purpose

Report explicit normalized relations whose source or target entity does not exist.

## Behavior

For each normalized relation:

* check `from` against normalized entity IDs;
* check `to` against normalized entity IDs;
* emit a finding for each missing endpoint condition;
* preserve the relation source;
* identify the relation type and unresolved ID.

A single relation missing both endpoints may produce either:

* one finding containing both unresolved IDs; or
* two endpoint-specific findings.

Choose one deterministic policy and document it.

Suggested severity: `error`.

Do not create entities to satisfy relations.

---

# SDP004 — Malformed Ledger evidence

## Purpose

Surface malformed or unsupported Ledger lines as project findings.

## Input evidence

Use parser diagnostics retained in the snapshot for:

* invalid JSON;
* non-object Ledger values;
* unsafe numeric values;
* other source-local Ledger record rejection.

## Behavior

Emit one finding per malformed original Ledger line where line provenance exists.

Multiple diagnostics for the same line may be deterministically grouped when they describe one rejected record.

Suggested severity: `error`.

Do not treat valid Ledger records with unknown event fields as malformed.

Do not validate duplicate event IDs or chronology in this Slice.

---

# SDP005 — Unresolved active declaration

## Purpose

Report explicit active Sprint, Refactor, Iteration or Slice IDs that do not resolve to normalized entities.

## Behavior

For every active field whose value is a non-empty string:

* locate the entity by ID;
* verify the expected entity kind where the kind is recognized;
* emit a finding when no entity resolves;
* emit a finding when the ID resolves only to a clearly incompatible recognized kind.

Missing and explicit `null` active fields are not errors.

Suggested severity: `error`.

Do not infer active work from Ledger.

---

# SDP006 — Contradictory active hierarchy

## Purpose

Report disagreement between active Sprint, Iteration and Slice declarations and explicit normalized hierarchy relations.

## Minimum supported hierarchy

Check only relationships that are explicit and representable from the installed profile:

```text
Iteration → Sprint
Slice → Iteration
Slice → Sprint, when explicitly present
```

## Behavior

When both active IDs resolve:

* active Iteration must explicitly relate to active Sprint when a supported `sprint` relation exists for that Iteration;
* active Slice must explicitly relate to active Iteration when a supported `iteration` relation exists for that Slice;
* if the active Slice explicitly has a `sprint` relation, it must match active Sprint.

Important:

* absence of an optional hierarchy relation is not automatically a contradiction;
* contradictory explicit relations are findings;
* multiple conflicting hierarchy targets are findings;
* do not guess hierarchy from ID names or Ledger order.

Suggested severity: `error`.

---

# SDP007 — Completed Slice without qualifying verification

## Purpose

Report a Slice declared completed without explicit verification evidence.

## Completion source

A Slice is considered declared completed only when its normalized entity has:

```text
status == "completed"
```

Use exact documented profile status matching. Do not infer completion from Ledger events alone.

## Qualifying verification evidence

A completed Slice qualifies only when:

1. it has an explicit normalized `verification` relation;
2. the target resolves to an entity of kind `verification`;
3. the verification entity has explicit evidence of an acceptable outcome, initially:

   * `outcome == "passed"` in preserved attributes, or
   * another exact installed-profile field documented by current repository evidence.

A `verification_plan` relation is not completion evidence.

A review relation alone is not completion evidence.

## Behavior

Emit one finding per completed Slice lacking qualifying verification.

Suggested severity: `warning`.

Do not execute verification commands.

Do not infer successful verification from Ledger prose.

---

# SDP008 — Unsupported or partial compatibility

## Purpose

Make compatibility limitations explicit.

## Behavior

Use `snapshot.profile.support`:

* `supported`: emit no finding;
* `partial`: emit a `warning`;
* `unsupported`: emit an `error`;
* `unknown`: emit an `unknown` finding.

Include relevant project-level provenance and compatibility diagnostics where available.

Do not describe partial support as total analysis failure.

Do not emit a health score.

---

# 9. Finding explanations

Each finding must explain:

* what was observed;
* why it matters;
* which repository evidence supports it;
* what the analyzer did not infer.

Recommendations must be concrete and read-only, for example:

```text
Add or correct the explicit Relations entry for SLC-004.
```

Avoid opaque language such as:

```text
Project health is low.
```

## 10. Source provenance

Every finding must include:

* one or more real `SourceRef` values when evidence has provenance; or
* one explicit synthetic/project-level `SourceRef` when the condition has no file-level evidence.

Synthetic references must use a stable source ID/path/pointer convention.

Do not emit findings with an empty `sources` array.

Canonicalize and deduplicate finding sources.

## 11. Affected entity IDs

Use only IDs directly involved in the condition.

Examples:

* duplicate definition: duplicated ID;
* dangling relation: source and unresolved target IDs;
* unresolved active Slice: active Slice ID;
* compatibility finding: empty affected-ID array is acceptable;
* malformed Ledger line: subject ID only if present in valid retained evidence; otherwise empty.

Canonicalize and deduplicate IDs.

## 12. Rule-specific diagnostics versus findings

Use diagnostics only for analyzer execution defects, such as a rule throwing unexpectedly.

Expected repository problems become findings.

Do not convert every parser diagnostic blindly into a finding. Map only those covered by the explicit rules above.

## 13. Application orchestration

Extend or add a presentation-neutral application operation:

```text
discover
→ parse
→ normalize
→ validate
```

A suitable result:

```ts
interface ProjectAnalysis {
  readonly discovery: ProjectDiscoveryManifest;
  readonly snapshot: ProjectSnapshot;
  readonly findings: readonly Finding[];
  readonly validationDiagnostics: readonly Diagnostic[];
}
```

Do not introduce UI state or SharedUI types.

## 14. Fixture strategy

Add deterministic broken fixture variants or in-memory snapshot builders for:

* missing core source;
* duplicate entity definition;
* dangling relation;
* malformed Ledger line;
* unresolved active declaration;
* contradictory active hierarchy;
* completed Slice without passed verification;
* partial compatibility;
* clean supported snapshot.

Keep expected findings separate from fixture inputs where practical.

Do not copy entire live repository files.

## 15. UI boundary

Do not build the findings UI in SLC-005.

The existing UI may remain unchanged.

No fake findings preview.

No project-health score.

No graph.

SLC-006 owns UI presentation and interaction.

# Expected modules

A reasonable layout is:

```text
src/core/findings/
  Finding.ts
  findingFingerprint.ts
  findingOrdering.ts

src/core/validation/
  AnalysisContext.ts
  ValidationRule.ts
  validateSnapshot.ts
  rules/
    SDP001RequiredCoreSources.ts
    SDP002DuplicateDefinitions.ts
    SDP003DanglingRelations.ts
    SDP004MalformedLedger.ts
    SDP005UnresolvedActive.ts
    SDP006ActiveHierarchy.ts
    SDP007MissingVerification.ts
    SDP008Compatibility.ts

src/application/
  analyzeProject.ts
```

Exact filenames may differ, but responsibilities must remain cohesive.

# Invariants

* No React or SharedUI imports in findings, validation, application, core or adapters.
* No filesystem reads in rules.
* No source mutation.
* No project mutation.
* No analyzed code execution.
* No ambient time.
* No random IDs.
* No dynamic rule loading.
* Rule order does not affect final output.
* Rule failure does not stop later rules.
* Every finding has provenance.
* Finding fingerprints exclude prose.
* No Markdown parsing.
* No health score.
* No repair/write-back.
* Existing SLC-001–004 behavior remains functional.
* SLC-006 UI work is not started.

# Explicit non-goals

Do not implement:

* findings UI;
* filtering or navigation UI;
* graph visualization;
* Markdown document discovery beyond existing structural discovery;
* Markdown stable-ID extraction;
* stale or unfinished-work time thresholds;
* duplicate Ledger event-ID validation;
* Ledger chronology validation;
* command execution;
* File System Access API;
* Node filesystem adapter;
* report export;
* CLI or CI integration;
* automatic repair;
* write-back;
* SharedUI package changes;
* SLC-006 work.

# Required tests

At minimum:

## Engine

1. rules execute in canonical ID order;
2. registry declaration order does not affect output;
3. finding ordering is deterministic;
4. duplicate fingerprints are suppressed;
5. fingerprints remain unchanged when title/explanation text changes;
6. fingerprint changes when structural identity changes;
7. rule exception becomes analyzer diagnostic;
8. later rules still execute after one rule throws;
9. snapshot and context remain unchanged;
10. repeated validation is deep-equal.

## SDP001

11. missing core source finding;
12. unreadable/unparseable source finding;
13. unknown acquisition state is not misreported as missing;
14. duplicate diagnostics for one source collapse deterministically.

## SDP002

15. duplicated entity ID produces one finding;
16. all known definition sources are present;
17. repeated relation target does not trigger SDP002.

## SDP003

18. missing target endpoint finding;
19. missing source endpoint finding;
20. valid relation emits no finding;
21. unresolved target is not silently converted to an entity.

## SDP004

22. malformed Ledger JSON line produces one sourced finding;
23. non-object Ledger line produces one sourced finding;
24. valid neighboring records do not generate findings;
25. line provenance is retained.

## SDP005

26. unresolved active Sprint finding;
27. unresolved active Iteration finding;
28. unresolved active Slice finding;
29. explicit null emits no finding;
30. compatible resolved active entity emits no finding;
31. clearly incompatible recognized kind produces a finding.

## SDP006

32. active Iteration explicitly linked to another Sprint produces a finding;
33. active Slice explicitly linked to another Iteration produces a finding;
34. active Slice explicit Sprint mismatch produces a finding;
35. coherent explicit hierarchy emits no finding;
36. absent optional relation alone emits no finding;
37. multiple conflicting hierarchy targets produce deterministic findings.

## SDP007

38. completed Slice with no verification relation produces a finding;
39. verification_plan alone does not qualify;
40. review alone does not qualify;
41. verification target missing produces a finding;
42. verification target wrong kind produces a finding;
43. verification entity without passed outcome produces a finding;
44. explicit passed verification suppresses the finding;
45. non-completed Slice emits no finding.

## SDP008

46. supported emits no compatibility finding;
47. partial emits warning;
48. unsupported emits error;
49. unknown emits unknown severity.

## Integration and boundaries

50. discover → parse → normalize → validate succeeds;
51. clean bundled fixture has the exact expected findings;
52. broken fixture findings are deterministic;
53. no React/SharedUI/platform filesystem imports;
54. no UI implementation;
55. no Markdown parsing;
56. existing SLC-001–004 tests remain passing.

# Verification

Run and record exact outcomes for:

```text
npm ci
npm run typecheck
npm test
npm run build
npm ls SharedUI yaml --depth=0
git diff --check
```

Run lint only if configured.

Also perform focused checks for:

* stable fingerprints;
* rule-order independence;
* rule failure isolation;
* finding provenance;
* active hierarchy semantics;
* verification qualification semantics;
* no UI changes;
* no SLC-006 work.

Create `VER-SLC-005` only after real checks run.

# Independent review

Use a fresh independent Reviewer context.

The Reviewer must inspect:

* the full SLC-005 contract;
* Finding model;
* fingerprint inputs;
* canonical ordering;
* rule exception isolation;
* every rule’s exact evidence mapping;
* duplicate diagnostic grouping;
* active hierarchy semantics;
* verification qualification;
* provenance completeness;
* absence of UI and repair work;
* actual verification evidence;
* traceability consistency.

Create `REV-SLC-005` only after independent review.

If changes are required, delegate a bounded correction Worker and repeat relevant verification and fresh review.

# Completion signal

SLC-005 is complete when:

* the rule engine runs deterministic pure rules over `ProjectSnapshot`;
* all eight stable rule IDs exist;
* finding fingerprints are structural and stable;
* findings are canonically ordered;
* rule failures are isolated;
* initial project problems produce explainable sourced findings;
* clean supported evidence avoids false findings;
* no findings UI or repair behavior exists;
* verification passes;
* fresh independent review approves;
* traceability records real evidence;
* `CurrentIndex.yaml` remains on SLC-005;
* SLC-006 remains planned and untouched.

## SLC-006 — Application workflow and read-only findings UI

Status: completed; supervising architect accepted

### Goal

Connect the complete `discover → parse → normalize → validate` pipeline to the
React/SharedUI application and present a truthful, accessible, read-only project
summary, active-work declaration, diagnostics summary, findings list and
finding-detail provenance view. React displays domain results without
reimplementing discovery, parsing, normalization or validation.

### Requirements and references

Primary requirements: `REQ-F-003`, `REQ-F-004`, `REQ-F-005`, `REQ-UI-001`,
`REQ-UI-002`, `REQ-UI-003`, `REQ-UI-004`, `REQ-T-004`, `REQ-NF-003`,
`REQ-NF-004`.

Partial/foundation requirements: `REQ-F-001`, `REQ-F-006`, `REQ-P-003`,
`REQ-P-004`, `REQ-T-003`, `REQ-T-005`, `REQ-C-001`, `REQ-C-002`, `REQ-C-003`,
`REQ-NF-002`, `REQ-NF-005`. This Slice does not claim local-directory
acquisition or broader navigation requirements.

Architecture/design: `ARC-COMP-006`, `ARC-COMP-007`, `ARC-COMP-008`,
`ARC-COMP-009`, `ARC-COMP-011`, `ADR-001`, `ADR-002`, `ADR-003`, `ADR-007`,
`ADR-008`, `DEC-STU-008`, `DEC-STU-012`, `DEC-STU-013`, and `DES-001` sections
5, 8, 10, 11, 12, 13 and 14.

### Required implementation

1. One application-level owner controls selected fixture source, analysis
   lifecycle and the single current result. Lifecycle states are explicit:
   idle if used, loading with source name, ready with `ProjectAnalysis`, and
   failed with a safe message. It invokes existing `analyzeProject`, never
   rebuilds pipeline stages in React, replaces stale success on failure and
   does not rerun analysis for finding selection/filter changes.
2. The page contains product header, fixture source panel, compatibility and
   parse-status summary, declared active-work summary, diagnostics summary,
   findings list, finding detail/provenance, and clear empty/loading/
   unsupported/failed states. No graph is added.
3. Continue `DashboardRenderer`, `defineDashboardConfig`,
   `baselineComponentRegistry`, explicit validators and `statePolicy`, stable
   trusted component keys, and exactly one `SharedUI/styles.css` import. Reuse
   `TopNav`, `PageHeader`, `Section`, `Badge`, `AlertBanner`, `EmptyState`,
   `CardSkeleton`, `TableSkeleton`, `DataTable`, `DetailPanel`, and
   `ErrorFallback` when semantically suitable. Do not recreate generic SharedUI
   primitives.
4. Local registered components are restricted to SDP-Analyzer-specific content
   such as `SourceSelector`, `ProjectSummary`, `ActiveWorkSummary`,
   `DiagnosticsSummary`, `FindingsList`, `FindingDetail`, and `ProvenanceList`.
   They consume typed view/domain data and do not parse YAML/NDJSON, normalize,
   validate, infer correctness, or form a separate design system.
5. Project summary truthfully shows source name, discovered file count, profile
   ID/support, entity/relation/Ledger counts, parser/normalization diagnostic
   count, and finding count. No health score or unsupported “healthy” claim.
6. Active summary labels Sprint, Refactor, Iteration, and Slice as declared
   values. Missing and explicit null remain distinguishable where practical.
   SDP005/SDP006 findings remain separate; the UI does not recompute validity.
7. Discovery/parser/normalization diagnostics remain separate from validation
   findings and expose severity, stable code, message, source path and available
   line/column/pointer. No-diagnostics copy is honest.
8. Findings retain canonical domain order by default and expose severity, rule
   ID, title, affected IDs, concise explanation and keyboard-selectable detail.
   Optional severity/rule filters do not mutate domain arrays.
9. Finding detail exposes rule ID, severity, title, full explanation, optional
   recommendation, affected IDs, fingerprint and every canonical SourceRef,
   including available source ID, path, kind, line/column ranges and pointer.
   No raw unsafe HTML, callbacks or vague hidden-provenance label.
10. Severity uses canonical semantics, explicit text and non-color cues.
    Controls have accessible names; selected findings are clearly indicated;
    lists/tables have meaningful labels; loading/errors are announced;
    provenance remains selectable; focus is not trapped.
11. Distinct honest states exist for no diagnostics, no findings, no active
    declaration, unknown/unsupported compatibility, analysis failure, loading,
    and no selected finding. “No findings” does not claim total correctness.
12. Failure renders through explicit failed state or `ErrorFallback`, hides
    stack traces and never leaves stale success current. Diagnostics returned
    in partial successful results remain visible.
13. Tier 1 stays fixture-only and clearly says local-folder selection is not
    available. No File System Access API, drag/drop, path input or Node
    filesystem. The default fixture remains clean/supported; deterministic
    injected/broken test inputs demonstrate findings without hardcoded fakes.
14. Presentation view models may format labels, counts, ranges, rows and source
    references but cannot rerun validation, reinterpret semantics, create
    findings, infer entity validity or mutate domain objects.
15. UI-local state may own selected fingerprint, severity/rule filters and
    expansion. Do not add Redux/Zustand, routing, URL sync or persistence.

### Expected modules

Responsibilities may be organized as application lifecycle/controller/view
model modules and `src/ui/App.tsx`, `dashboardConfig.ts` plus domain-specific
components. Exact filenames may vary; responsibility boundaries may not.

### Invariants and non-goals

* No parser, normalizer or validator logic in React; no React/SharedUI below UI.
* No generic SharedUI duplication, local token system, fake findings, health
  score, local filesystem acquisition, graph, report/export, repair/write-back,
  project mutation, analyzed-code execution, Markdown extraction, CLI/CI,
  stale-work policy, routing, persistent filters or SharedUI package changes.
* One authoritative immutable analysis result; canonical finding order remains
  default; diagnostics and findings stay separate.
* SLC-001 through SLC-005 remain functional; SLC-007 stays untouched.

### Required tests

Cover lifecycle/loading/success/failure/stale-result behavior and lack of
reanalysis for local UI changes; all truthful summary counts and no health
score; declared values with null/missing behavior; diagnostics content,
location, separation and empty state; canonical finding order, severity/rule/
affected IDs, keyboard detail selection, explanation/recommendation/fingerprint
and every provenance source; honest no-findings and immutable filters; partial,
unknown and unsupported compatibility; distinct loading/error; SharedUI shell,
registry and exact-one CSS import; accessible labels/non-color severity; import
boundaries and prohibited-scope scans. Existing 121 tests remain passing.

### Verification and independent review

Run and record `npm ci`, `npm run typecheck`, `npm test`, `npm run build`,
`npm ls SharedUI yaml --depth=0`, and `git diff --check`; lint only if configured.
Also perform rendered browser smoke, keyboard selection, non-color severity,
loading/ready/failed and stale-result checks, exact-one stylesheet scan,
boundary/core-logic/prohibited-scope scans and confirmation of no SLC-007 work.
Create `VER-SLC-006` only from real evidence.

A fresh independent Reviewer inspects the full contract, lifecycle ownership,
SharedUI reuse/config, diagnostics/findings separation, truthful declaration
labels, finding order and provenance, failure/stale-result behavior,
accessibility, boundaries, prohibited scope, verification and traceability.
Create `REV-SLC-006` only after review. Corrections require a bounded Worker,
applicable re-verification and fresh re-review.

### Completion signal and discoveries policy

Complete only when the bundled fixture traverses the full pipeline; lifecycle,
summaries, declared work, diagnostics, findings and complete provenance render
truthfully; all states and accessibility checks pass; SharedUI is reused; React
makes no domain decisions; verification passes; fresh review approves; and
traceability records evidence while CurrentIndex remains SLC-006 and SLC-007
remains planned. Record rather than implement future SharedUI enhancements,
local-folder acquisition, Markdown coverage, graphs, export, stale policy,
repair/write-back or CLI/CI. Stop at the SLC-006 boundary.

### Completion record — 2026-07-12

The complete bundled fixture now runs through discover, parse, normalize and
validate under one presentation-neutral lifecycle controller. SharedUI renders
truthful summary, declared work, separate diagnostics/findings and full finding
detail/provenance with explicit loading, failure, compatibility and empty
states. Accessibility coverage includes non-color severity and real Enter/Space
activation of native finding buttons.

Master verification passed clean install, typecheck, 17 files/132 tests, build,
dependency inspection, diff hygiene, rendered browser smoke and boundary/
prohibited-scope scans. The first independent review required a current Handoff
and non-synthetic keyboard evidence. Both were corrected, re-verified and
approved by a second fresh independent Reviewer with no remaining actionable
finding. `VER-SLC-006`, `REV-SLC-006` and immutable events 044-047 record the
evidence, correction, approval and completion. CurrentIndex remains on SLC-006.
SLC-007 remains planned and untouched.

### Post-completion audit rework — 2026-07-12

A later fresh independent audit found that the prematurely completed record did
not yet satisfy the selected-source ownership/source-panel contract, several
explicit UI evidence assertions, or fully reconstructable review handoff and
Ledger history. SLC-006 is reopened for bounded correction and re-verification.
CurrentIndex remains on SLC-006; SLC-007 remains planned and untouched.

### Final re-completion record — 2026-07-12

The bounded correction placed selected source, lifecycle and the single result
under one application controller; removed the inert SharedUI source mirror;
added the visible fixture source panel; and completed permanent assertions for
summary, declarations, compatibility and full provenance. Master verification
passed clean install, 15 focused and 135 full tests, typecheck, build, exact
dependencies, browser smoke, boundary/scope scans and diff hygiene. A new fresh
independent Reviewer approved with no actionable finding. Final traceability
leaves CurrentIndex on SLC-006 and SLC-007 planned.

## SLC-007 — Tier 1 integration, acceptance and handoff

Status: blocked; supervising requirement/architecture direction required
Slice ID: SLC-007

### Goal

Verify Tier 1 as one integrated product increment, close documentation and
traceability gaps, test representative clean and broken fixture workflows, and
produce the final Sprint/Tier acceptance evidence.

This Slice is primarily integration, hardening and evidence. It must not add
new product capabilities unless a defect prevents an accepted Tier 1
requirement from working.

### Why now

The complete Tier 1 path exists:

    ProjectSource
    → discovery
    → parsing
    → normalization
    → validation
    → application lifecycle
    → SharedUI presentation

Before the Sprint can close, this path must be verified as one coherent product
rather than only as individually approved Slices.

### Requirements and references

SLC-007 verifies the complete Tier 1 acceptance set without reclassifying
Tier 2 or Future requirements as complete:

- functional: REQ-F-001 through REQ-F-006;
- data/parsing: REQ-D-001 through REQ-D-006;
- validation: REQ-V-001 through REQ-V-008;
- provenance: REQ-P-001 through REQ-P-004;
- UI: REQ-UI-001 through REQ-UI-004;
- verification: REQ-T-001 through REQ-T-005;
- security/privacy: REQ-S-001 through REQ-S-003;
- compatibility: REQ-C-001 through REQ-C-003;
- maintainability: REQ-M-001 through REQ-M-005; and
- non-functional: REQ-NF-001 through REQ-NF-005.

Authoritative references are STU-001 and DEC-STU-001 through DEC-STU-014;
ARC-COMP-001 through ARC-COMP-009 and ARC-COMP-011; ADR-001 through ADR-008;
DES-001 sections 1 through 14; IMP-001; and VER-PLAN-001.

At minimum, final acceptance must confirm bundled fixture loading, core
discovery, strict YAML and NDJSON parsing, partial-failure preservation, the
normalized snapshot, provenance preservation, deterministic rules/findings,
read-only behavior, SharedUI presentation, loading/ready/empty/failed states,
diagnostics/findings separation, accessible findings/provenance, compatibility
reporting, no analyzed-code execution, no project mutation, a static Vite
build and clean-install reproducibility.

### Authorized scope

- integration defects that prevent Tier 1 acceptance;
- missing acceptance tests;
- deterministic fixture coverage;
- documentation corrections;
- accessibility corrections;
- traceability consistency;
- final SLC-007 and Tier 1 verification;
- final independent SLC and Tier review; and
- Sprint/Iteration closure preparation.

### Explicitly unauthorized scope

Do not implement File System Access API, local directory selection, a Node
service, Electron/Tauri, Markdown parsing or ID extraction, graph
visualization, report export, CLI/CI, stale-work policy, new rules beyond
SDP001-SDP008, repair/write-back, broad UI redesign, SharedUI package changes or
any Tier 2 work.

### Required integration fixtures

Maintain or add small deterministic inputs representing:

1. a clean supported project;
2. a missing core source;
3. malformed CurrentIndex or Relations YAML;
4. a malformed Ledger line with valid neighboring records;
5. a duplicate entity definition;
6. a dangling relation;
7. unresolved active work;
8. contradictory active hierarchy;
9. a completed Slice without passed verification; and
10. partial or unknown compatibility.

Fixtures may be in memory or repository fixture directories. Keep inputs
separate from expected results where practical and do not duplicate the live
repository.

### Required end-to-end acceptance behavior

The clean supported fixture must discover all core files, parse without
diagnostics, normalize deterministically, produce no Tier 1 findings, render
supported compatibility and declared active work, and show honest
no-diagnostics/no-findings states.

At least one deterministic broken fixture must traverse the real complete
application pipeline and render compatibility or input diagnostics, one or
more validation findings, affected IDs, recommendation and complete source
provenance without crashing or leaving a stale prior result. UI tests must not
hardcode fake findings.

### Final acceptance tests

Add or consolidate permanent tests proving:

1. the complete clean fixture pipeline;
2. the complete broken fixture pipeline;
3. repeated analysis is deterministic;
4. one source failure does not erase usable neighboring evidence;
5. findings preserve canonical ordering through the UI;
6. fingerprints remain stable through the application boundary;
7. provenance survives parser → snapshot → finding → rendered detail;
8. switching source clears prior finding selection and stale UI state;
9. failed analysis clears the prior successful result;
10. repeated Analyze action does not create duplicate state;
11. fixture inputs and analysis results are not mutated;
12. exactly one stylesheet import remains;
13. React and SharedUI remain absent below the UI boundary;
14. parsing, normalization and validation logic remain outside React;
15. filesystem, graph, report and write-back behavior remain absent; and
16. the production build is static and reproducible.

### Documentation

Inspect and correct README.md, AGENTS-project.md, Handoff.md,
implementationNotes.md and any stale command/behavior description. README must
state the actual completed Tier 1 capabilities, the fixture-only limitation,
install/test/typecheck/build commands, the SharedUI tarball dependency, no
local-folder access, no repository mutation, no Markdown coverage, and no
graph/report/repair features. Planned Tier 2 behavior must not be described as
implemented.

### SLC-007 verification

Create VER-SLC-007 only after real checks. Run and record:

- npm ci;
- npm run typecheck;
- npm test;
- npm run build;
- npm ls SharedUI yaml --depth=0; and
- git diff --check.

Run lint only if configured. Also record rendered clean and broken browser
smokes, keyboard navigation, screen/state labels, stale-result clearing after
failure/source switch, compatibility states, provenance detail, deterministic
repeat analysis, full boundary scans, append-only Ledger validation,
CurrentIndex/Relations/verification/review cross-reference validation, and an
isolated clean install using repository-owned files.

### Tier 1 verification record

After every SLC-007 gate passes, create VER-TIER-001. It must summarize actual
evidence across SLC-001 through SLC-007 rather than merely linking prior
records. It must state the accepted commit baseline, commands rerun, integrated
fixture workflows, known limitations, Tier 1 requirement coverage,
security/read-only checks, deterministic behavior and final result. It must not
claim future requirements.

### Independent review

After SLC-007 implementation and Master verification, use a fresh independent
Reviewer. The Reviewer must inspect every SLC-007 change, the integrated
application, prior review dispositions, complete Tier 1 requirement coverage,
clean and broken workflows, provenance, deterministic output, accessibility,
read-only/security boundaries, documentation truthfulness, traceability and
the exact verification evidence.

Create REV-SLC-007 and, after the full Tier review, REV-TIER-001 only from real
fresh review. If changes are required, preserve that disposition, delegate a
bounded correction Worker, rerun applicable verification and use a fresh
re-review before closure.

### Traceability and closure

Only after passed verification and approved review:

- mark SLC-007 completed and relate it to VER-SLC-007 and REV-SLC-007;
- relate TIER-001 to VER-TIER-001 and REV-TIER-001;
- append immutable verification, review and completion Ledger events;
- mark ITR-001 and SPR-001 completed in Relations and Sprint documentation;
- set project/Tier status accurately; and
- retain all prior Ledger lines unchanged.

CurrentIndex must remain pointed to SLC-007 after completion while supervising
architect acceptance is pending; do not remove active IDs or invent nulls.

### Completion signal

SLC-007 and Tier 1 are complete only when the clean fixture succeeds, broken
evidence renders truthfully, determinism and end-to-end provenance are proven,
loading/failure/empty/compatibility states and accessibility pass,
documentation matches reality, clean install/typecheck/tests/build pass,
VER-SLC-007 and VER-TIER-001 exist, fresh SLC and Tier reviews approve,
Sprint/Iteration closure and append-only traceability are coherent, CurrentIndex
still points to SLC-007, and no Tier 2 work exists.

### Discoveries policy and stop condition

Fix only defects that prevent Tier 1 acceptance. Record and defer local-folder
acquisition, historical variants, Markdown coverage, stale-work policy,
graph/report, CLI/CI, repair/write-back and SharedUI package improvements. If
Tier 1 cannot be accepted without an architecture or requirement change, stop
and report the exact gap.

Stop after SLC-007/Tier 1 verification, independent approval, closure records
and handoff. Do not begin a new Slice, Sprint or Tier.

### Blocking discovery — 2026-07-13

The Master stopped before product implementation because the complete Tier 1
acceptance set cannot be satisfied under the current authoritative documents:

1. REQ-D-003 and STU-001 require Markdown structural-heading and explicit
   stable-ID extraction as part of the Tier 1 supported profile. The current
   product only classifies Markdown paths and analyzes CurrentIndex, Relations
   and Ledger content. This contract explicitly forbids Markdown parsing or ID
   extraction. REQ-V-002 and REQ-C-001 are consequently only partial because
   duplicate-ID and supported-profile analysis cannot include the required
   Markdown evidence.
2. DEC-STU-011 says qualifying verification must identify its subject and
   contain a command/check description and outcome. The accepted SDP007
   implementation qualifies a related verification entity solely from kind and
   outcome: passed in structured Relations data. Verification Markdown is not
   read, so the Study definition cannot be evaluated.

Supervising direction must either narrow the Tier 1 requirements/profile and
verification qualification semantics to the structured three-file boundary,
or revise the SLC-007 authorization and architecture to permit bounded Markdown
and verification-record extraction. The Master did not choose between those
product/requirements directions.

CurrentIndex remains on SLC-007. SLC-001 through SLC-006 remain completed. No
fixture, test, UI, README, product-code, verification/review record or Tier 2
change was made after this stop condition was identified.
