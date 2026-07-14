# SDP-Analyzer Architecture

Status: accepted for Tier 1 planning  
ID: `ARC-001`  
Date: 2026-07-11
Amended: 2026-07-13 (Tier 1 structured-core boundary)

## 1. Context

SDP-Analyzer is a read-only analyzer for repository-local SDP evidence. It must support a browser UI now and reuse its analysis core later from CLI, CI, a local Node bridge and SDP skills.

## 2. Architectural principles

- Repository bytes are input evidence; no source is trusted merely because it is named canonically.
- Acquisition, parsing, normalization, validation, querying and presentation are separate responsibilities.
- Provenance crosses every boundary.
- The core is deterministic and framework-independent.
- React owns presentation state, not project meaning.
- Compatibility is explicit and versioned.
- No abstraction is introduced without a real boundary or demonstrated second consumer.

## 3. Boundaries and dependency direction

```text
React UI / SharedUI adapter
          |
          v
Application/query layer
          |
          v
Analysis orchestration
   |       |       |
   v       v       v
Discovery Parser  Rule engine
   \       |       /
    v      v      v
 Normalized domain model
          ^
          |
ProjectSource adapters

Report/export adapter reads application/core output only.
Future CLI/CI/skills call orchestration/core, never React.
```

Dependencies point inward toward domain contracts. Domain modules import no browser, Node, React or SharedUI modules.

## 4. Components

### `ARC-COMP-001` Project acquisition and discovery

Responsibilities:

- expose project files through `ProjectSource`;
- normalize repository-relative POSIX paths;
- list/read only within the selected source root;
- discover known SDP files and directories;
- classify standard Markdown paths without reading their contents in Tier 1;
- report absent, ambiguous and unsupported structures.

Initial adapter: `FixtureProjectSource`. Later adapters: browser directory handle and Node filesystem.

### `ARC-COMP-002` Parser layer

Responsibilities:

- parse `CurrentIndex.yaml`, `Relations.yaml` and `Ledger.ndjson` in Tier 1;
- retain parser diagnostics and exact source references;
- return syntax-level records without applying project policy;
- never execute repository content.

Each parser is separately testable. Parser errors are data, not thrown application crashes, except for programming defects. Markdown content parsing is a future profile/parser adapter owned by TIER-003; Tier 1 does not read Markdown content or extract Markdown stable IDs.

### `ARC-COMP-003` Compatibility/profile layer

Responsibilities:

- identify the Tier 1 structured-core SDP profile defined by `DEC-STU-015`;
- map known file conventions and fields to normalization inputs;
- mark unknown, partial or ambiguous structures;
- isolate future historical adapters.

This layer does not hide unsupported data by coercing it into the current profile. It keeps path-only Markdown coverage visible rather than presenting structured-core compatibility as complete installed-document analysis.

### `ARC-COMP-004` Normalized SDP domain model

Responsibilities:

- represent sources, diagnostics, entities, relations, ledger events, active declarations and profile metadata;
- preserve provenance;
- provide immutable analysis snapshots;
- use stable serializable types.

The model is not a graph-library object and contains no UI component state.

### `ARC-COMP-005` Validation/rule engine

Responsibilities:

- run an explicit ordered rule registry;
- accept a snapshot plus explicit analysis context;
- emit deterministic findings;
- isolate rule failure and convert it to an analyzer diagnostic;
- avoid mutation of the snapshot.

Rules query normalized facts, not React state or raw DOM/UI data. Tier 1 verification qualification is evaluated from explicit normalized relations plus verification entity attributes under `DEC-STU-016`; React components do not interpret verification evidence.

### `ARC-COMP-006` Findings model

A finding contains stable rule ID, severity, deterministic fingerprint, title, explanation, affected entity IDs, provenance and optional recommendation. Findings remain presentation-neutral.

### `ARC-COMP-007` Application/query layer

Responsibilities:

- orchestrate load → discover → parse → normalize → validate;
- expose use-case results and derived summaries;
- own analysis lifecycle state (`idle/loading/ready/failed`);
- select and filter findings;
- prepare view models without changing domain facts.

### `ARC-COMP-008` React UI

Responsibilities:

- source selection;
- status and compatibility summary;
- active-work summary;
- diagnostics and findings list/detail;
- accessible loading/error/empty states.

React components do not parse YAML, inspect ledger semantics or decide whether work is verified.

### `ARC-COMP-009` SharedUI boundary

SharedUI is wrapped or imported only by UI modules. It supplies visual primitives and layout. Domain-specific labels and severity semantics remain owned by SDP-Analyzer.

### `ARC-COMP-010` Report/export boundary

A pure serializer will later convert an analysis result to a versioned machine-readable report. Tier 1 defines the boundary and types but need not expose a user export control.

### `ARC-COMP-011` Fixture and test support

Fixtures implement the same `ProjectSource` contract as real sources. Expected findings are stored separately from fixture input to prevent tests from validating themselves.

## 5. Principal contracts

```ts
interface ProjectSource {
  readonly sourceId: string;
  readonly displayName: string;
  listFiles(): Promise<readonly ProjectFileEntry[]>;
  readText(path: string): Promise<ProjectTextFile>;
}

interface AnalyzeProject {
  analyze(source: ProjectSource, context: AnalysisContext): Promise<AnalysisResult>;
}

interface ValidationRule {
  readonly id: string;
  evaluate(snapshot: ProjectSnapshot, context: AnalysisContext): readonly Finding[];
}
```

Detailed types are defined in Design.

## 6. Data flow

1. User chooses a fixture/source.
2. `ProjectSource` exposes file metadata and text.
3. Discovery creates a source manifest, classifies standard Markdown paths and identifies compatibility candidates without reading Markdown content.
4. Tier 1 parsers create syntax records and diagnostics with provenance only for the three structured traceability files.
5. Profile normalization creates one immutable `ProjectSnapshot`.
6. Rule engine runs canonical ordered rules.
7. Application queries derive summary and active-work presentation.
8. UI renders results without altering domain facts.

## 7. Error strategy

- Source access failure: project-level diagnostic; preserve any files already read.
- File parse failure: source diagnostic with range; continue with other sources.
- Unsupported structure: compatibility finding or `unknown` status.
- Rule defect: analyzer-internal diagnostic identifying the rule; remaining rules continue.
- UI rendering defect: normal application error boundary; never rewrite domain results.

## 8. State ownership

- selected source and analysis lifecycle: application shell/store;
- immutable snapshot and findings: one current `AnalysisResult` owner;
- filters and selected finding: UI/application state;
- parser and rule functions: stateless;
- permissions/handles: source adapter only.

No duplicate authoritative active-work state is maintained in React.

## 9. Security boundary

The analyzer reads only the text authorized by the active profile. Tier 1 reads the three structured traceability files and does not read Markdown content. It does not run recorded verification commands, run target commands, import target modules, execute hooks, evaluate MDX, resolve custom YAML constructors, follow filesystem paths outside the selected root or upload content by default.

## 10. Deployment direction

Tier 1 is a static Vite application using fixtures. Browser directory selection is added as an adapter in Tier 2. A local Node service or Tauri application may later supply broader filesystem access. Core packages must remain usable in browser and Node-compatible runtimes where their dependencies permit.

## 11. Architectural decisions

- `ADR-001`: Fixture-first acquisition; browser folder access is adapter-based and deferred from the first Slice.
- `ADR-002`: Framework-independent TypeScript analysis core.
- `ADR-003`: Provenance is mandatory domain data.
- `ADR-004`: Compatibility profiles mediate raw formats and normalized entities.
- `ADR-005`: Validation is an ordered registry of pure rules.
- `ADR-006`: Graph visualization and graph libraries are outside Tier 1.
- `ADR-007`: SharedUI is presentation-only.
- `ADR-008`: Partial analysis is preferable to all-or-nothing failure.

## 12. Fitness checks

Architecture remains valid when:

- core unit tests run without React or browser globals;
- the fixture and future folder adapters satisfy the same source contract;
- every finding can navigate back to source provenance;
- a future CLI can invoke analysis without importing UI modules;
- adding a rule does not require editing React components.
