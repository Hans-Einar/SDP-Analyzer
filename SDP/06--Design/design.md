# SDP-Analyzer Design

Status: accepted for Tier 1 planning  
ID: `DES-001`  
Date: 2026-07-11

## 1. Design goal

Define Tier 1 precisely enough that Codex implements contracts rather than redesigning the system.

## 2. Source and provenance types

```ts
type SourceKind = 'yaml' | 'json' | 'ndjson' | 'markdown' | 'synthetic';

interface SourceRef {
  sourceId: string;
  path: string;
  kind: SourceKind;
  lineStart?: number;
  columnStart?: number;
  lineEnd?: number;
  columnEnd?: number;
  pointer?: string;
}

interface ProjectFileEntry {
  path: string;
  kind: 'file';
}

interface ProjectTextFile {
  path: string;
  text: string;
}

interface ProjectSource {
  readonly sourceId: string;
  readonly displayName: string;
  listFiles(): Promise<readonly ProjectFileEntry[]>;
  readText(path: string): Promise<ProjectTextFile>;
}
```

Paths are repository-relative, slash-normalized, have no leading slash, `.` or `..` segment.

## 3. Diagnostics and parsed records

```ts
type DiagnosticSeverity = 'error' | 'warning' | 'info';

interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  source?: SourceRef;
}

interface ParsedSource<T> {
  value?: T;
  diagnostics: readonly Diagnostic[];
  source: SourceRef;
}
```

Parser functions return diagnostics rather than throwing for malformed project input.

## 4. Normalized domain

```ts
type EntityKind =
  | 'mandate' | 'study' | 'requirement' | 'architecture-decision'
  | 'design-decision' | 'tier' | 'sprint' | 'iteration' | 'slice'
  | 'verification' | 'review' | 'unknown';

interface Entity {
  id: string;
  kind: EntityKind;
  status?: string;
  title?: string;
  attributes: Readonly<Record<string, unknown>>;
  sources: readonly SourceRef[];
}

interface Relation {
  id: string;
  type: string;
  from: string;
  to: string;
  sources: readonly SourceRef[];
}

interface LedgerEvent {
  sequence: number;
  eventType?: string;
  subjectId?: string;
  timestamp?: string;
  payload: Readonly<Record<string, unknown>>;
  source: SourceRef;
}

interface ActiveDeclaration {
  sprint?: string | null;
  refactor?: string | null;
  iteration?: string | null;
  slice?: string | null;
  source: SourceRef;
}

interface ProjectSnapshot {
  profile: { id: string; support: 'supported' | 'partial' | 'unsupported' | 'unknown' };
  sources: readonly SourceRef[];
  diagnostics: readonly Diagnostic[];
  entities: readonly Entity[];
  relations: readonly Relation[];
  ledger: readonly LedgerEvent[];
  active?: ActiveDeclaration;
}
```

Collections are canonically sorted except ledger events, which preserve line order.

## 5. Findings and rules

```ts
type FindingSeverity = 'error' | 'warning' | 'info' | 'unknown';

interface Finding {
  fingerprint: string;
  ruleId: string;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  affectedEntityIds: readonly string[];
  sources: readonly SourceRef[];
  recommendation?: string;
}

interface AnalysisContext {
  analyzerVersion: string;
  profileId: string;
  analysisTime: string;
}

interface ValidationRule {
  readonly id: string;
  evaluate(snapshot: ProjectSnapshot, context: AnalysisContext): readonly Finding[];
}
```

Rules execute in ascending stable rule ID. Findings sort by severity rank, rule ID, affected IDs and fingerprint. Fingerprints derive from rule ID, canonical affected IDs and canonical source locations; prose is excluded.

Initial rule IDs:

- `SDP001` required core source missing/unparseable;
- `SDP002` duplicate entity ID;
- `SDP003` dangling relation endpoint;
- `SDP004` malformed ledger line;
- `SDP005` unresolved active declaration;
- `SDP006` contradictory active hierarchy;
- `SDP007` completed Slice without qualifying verification;
- `SDP008` unsupported/partial profile.

Rules not yet implementable from Tier 1 normalized inputs may be registered later; they must not emit guessed findings.

## 6. Parsing interfaces

```ts
interface TraceabilityParser {
  parseCurrentIndex(file: ProjectTextFile): ParsedSource<unknown>;
  parseRelations(file: ProjectTextFile): ParsedSource<unknown>;
  parseLedger(file: ProjectTextFile): ParsedSource<readonly unknown[]>;
}
```

Concrete parser results may use internal typed raw structures. YAML parsing uses strict duplicate-key behavior. NDJSON parsing continues after malformed lines and emits line-specific diagnostics.

## 7. Discovery and normalization

Discovery returns a manifest containing exact matches for the three core traceability paths plus standard directory presence. Tier 1 normalization:

1. creates project and work entities only from explicit IDs/keys present in structured files;
2. preserves unresolved references as relations/declarations so rules can report them;
3. does not infer entity existence from a relation target;
4. maps malformed values to diagnostics rather than invented defaults;
5. records profile support as `partial` when required conventions are absent or unknown.

## 8. Error and unsupported behavior

- Missing file: diagnostic plus rule finding.
- Invalid YAML: retain source and parser diagnostic; other files continue.
- Invalid NDJSON line: diagnostic for that line; valid lines remain.
- Unsupported field/shape: compatibility diagnostic and preserved raw attribute where safe.
- Adapter read failure: source-level diagnostic.
- Internal invariant failure: fail analysis with an analyzer error clearly distinguished from project findings.

## 9. Fixture organization

```text
fixtures/
  minimal-valid/
    project/SDP/Traceability/...
    expected.json
  malformed-ledger/
  missing-reference/
  ...
```

`expected.json` contains canonical diagnostics/findings, not copied implementation output. Fixture loading is text-only.

## 10. Application workflow and state

```ts
type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading'; sourceName: string }
  | { status: 'ready'; result: AnalysisResult }
  | { status: 'failed'; message: string };
```

One controller/hook owns the selected source and current analysis result. Core analysis is invoked through an application service. UI filters and selected finding are local derivations.

## 11. Initial page structure

1. Header/product identity.
2. Source panel: bundled fixture selector and analyze action.
3. Compatibility and parse-status summary.
4. Declared active-work card.
5. Diagnostics summary.
6. Findings list with severity, rule ID, title and affected IDs.
7. Finding detail/provenance panel.

SharedUI is used only where already available and suitable. SLC-001 must not block on SharedUI integration if the dependency or usage contract is not installed; a thin local UI shell is acceptable and recorded as a discovery.

## 12. Exact Tier 1 boundary

Tier 1 analyzes bundled fixtures and the three core traceability files. It may discover standard Markdown documents but does not need comprehensive Markdown entity parsing. It does not include local folder selection, graphing, write-back, CLI, CI, report download, stale-time policy or automated verification execution.

## 13. Test design

- Core tests run without DOM/browser globals.
- Adapter contract tests cover path normalization and deterministic listing.
- Parser tests cover valid, missing, duplicate-key and malformed-line cases.
- Normalization tests compare canonical snapshots.
- Rule tests assert both emitted and absent findings.
- UI tests assert state rendering and finding provenance presentation.
- Every implementation Slice runs typecheck, tests and build; UI Slices add rendered checks.

## 14. Design invariants

- No React/SharedUI import below `src/ui` or an explicit UI adapter.
- No source mutation.
- Every finding is explainable and sourced.
- Unsupported data never becomes silent success.
- Analysis does not depend on ambient current time.
- Ledger ordering is preserved.
- One application owner for current analysis state.