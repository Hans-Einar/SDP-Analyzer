# SDP-Analyzer Requirements

Status: accepted for Tier 1 planning  
ID: `REQSET-001`  
Date: 2026-07-11
Amended: 2026-07-13 (Tier 1 structured-core boundary)

## Scope notation

- **T1**: first vertical Tier and initial implementation programme.
- **T2**: later local-project and navigation expansion.
- **T3**: lifecycle and work-document content coverage.
- **Future**: explicitly outside the initial programme.

## Functional requirements

- `REQ-F-001` [T1]: The analyzer shall load a deterministic bundled project fixture through a project-source interface.
- `REQ-F-002` [T1]: The analyzer shall discover the core SDP traceability files and standard lifecycle/Sprint directories in a supplied project source.
- `REQ-F-003` [T1]: The analyzer shall display project identity, compatibility status, parse status and declared active Sprint, Iteration and Slice.
- `REQ-F-004` [T1]: The analyzer shall run a bounded deterministic rule set and display findings grouped or filterable by severity.
- `REQ-F-005` [T1]: The user shall be able to inspect each finding's explanation, affected IDs and source provenance.
- `REQ-F-006` [T1]: The application shall remain read-only and shall not mutate the analyzed project.
- `REQ-F-007` [T2]: In supported browsers, the user shall be able to explicitly select a local project directory using the File System Access API.
- `REQ-F-008` [Future]: The core shall be consumable by CLI, CI, local-service and SDP skill integrations.

## Data and parsing requirements

- `REQ-D-001` [T1]: YAML shall be parsed without executing custom tags and duplicate mapping keys shall produce diagnostics.
- `REQ-D-002` [T1]: Each non-blank `Ledger.ndjson` line shall be parsed independently as one JSON object, preserving line order and line provenance.
- `REQ-D-003` [T3]: Markdown structural discovery shall use standard directory conventions and extract only explicit stable-ID tokens and documented structure from Markdown content. Its original Tier 1 assignment is corrected by `DEC-STU-015`; it is not a Tier 1 completion requirement.
- `REQ-D-004` [T1]: The parser shall preserve unknown fields or report them; it shall not silently reinterpret unsupported data as valid canonical data.
- `REQ-D-005` [T1]: The normalized snapshot shall contain sources, diagnostics, entities, relations, ledger events, active declarations and compatibility metadata.
- `REQ-D-006` [T1]: Entity and relation ordering in serialized results shall be canonical and deterministic.
- `REQ-D-007` [T1]: The analyzer shall discover and classify standard SDP Markdown files and directories by canonical repository-relative path without parsing their content or treating them as normalized entities.

## Validation requirements

- `REQ-V-001` [T1]: Report missing or unparseable core traceability files.
- `REQ-V-002` [T1]: Report duplicate stable IDs among normalized structured-core definitions with every known structured definition location. Markdown-wide duplicate detection belongs to TIER-003.
- `REQ-V-003` [T1]: Report relation endpoints that do not resolve to normalized entities.
- `REQ-V-004` [T1]: Report malformed ledger lines without preventing valid lines from being analyzed.
- `REQ-V-005` [T1]: Report active Sprint, Iteration or Slice references that do not resolve.
- `REQ-V-006` [T1]: Report contradictory active hierarchy relationships.
- `REQ-V-007` [T1]: Report a Slice declared complete when no qualifying verification entity is related to it. “Qualifying verification” follows `DEC-STU-016`: an explicit `verification` relation must resolve to a verification entity with exact `outcome: passed` and a non-empty string `check` or `command` attribute.
- `REQ-V-008` [T1]: Report unsupported or ambiguous compatibility as `unknown` or an explicit compatibility finding, never silent success.
- `REQ-V-009` [T2]: Detect stale or unfinished work only from explicit status and timestamp policy supplied to the rule engine.

## Provenance requirements

- `REQ-P-001` [T1]: Every parsed fact used by a finding shall retain a source path and source kind.
- `REQ-P-002` [T1]: Provenance shall include line/column range or structured pointer when the parser can provide it.
- `REQ-P-003` [T1]: Every finding shall cite one or more provenance records or explicitly identify itself as synthetic/project-level.
- `REQ-P-004` [T1]: Normalization shall not replace original source references with UI-only identifiers.

## UI and navigation requirements

- `REQ-UI-001` [T1]: The initial page shall provide source selection, analysis state, project summary, active-work summary, diagnostics and findings.
- `REQ-UI-002` [T1]: Empty, loading, unsupported and failed states shall be distinguishable.
- `REQ-UI-003` [T1]: Severity shall be conveyed by text/iconography in addition to color.
- `REQ-UI-004` [T1]: SharedUI may be used for presentation primitives but shall not own domain state or analysis logic.
- `REQ-UI-005` [T2]: Users shall be able to navigate entities and relations beyond findings detail.
- `REQ-UI-006` [Future]: Graph visualization shall be a derived view, not the canonical data model.

## Verification requirements

- `REQ-T-001` [T1]: Parsers and validators shall have deterministic automated tests using repository fixtures.
- `REQ-T-002` [T1]: Every Tier 1 rule shall have at least one positive and one negative test where meaningful.
- `REQ-T-003` [T1]: Type checking, unit tests and production build shall pass before a Slice can be completed.
- `REQ-T-004` [T1]: UI Slices shall include a rendered or browser-level check of the affected workflow.
- `REQ-T-005` [T1]: Verification records shall state exact commands, outcomes, limitations and the Slice verified.

## Security and privacy requirements

- `REQ-S-001` [T1]: The analyzer shall not execute code, scripts, hooks, binaries, MDX or custom YAML constructors from analyzed repositories.
- `REQ-S-002` [T1]: Repository contents shall not leave the local runtime unless the user explicitly invokes a separately designed export/integration.
- `REQ-S-003` [T1]: Tier 1 shall contain no project mutation, automatic repair or silent write-back.
- `REQ-S-004` [T2]: Local directory access shall require an explicit user gesture and capability/permission checks.
- `REQ-S-005` [T2]: Non-browser filesystem adapters shall prevent traversal outside the selected root.

## Compatibility requirements

- `REQ-C-001` [T1]: The analyzer shall identify the supported Tier 1 structured-core profile defined by `DEC-STU-015`, while reporting that Markdown files are path-discovered but their content is outside Tier 1 analysis.
- `REQ-C-002` [T1]: Partial or historical variants shall produce explicit compatibility metadata and findings.
- `REQ-C-003` [T1]: Fixture mode shall work without File System Access API support.
- `REQ-C-004` [T2]: Folder selection shall degrade gracefully on unsupported browsers.
- `REQ-C-005` [Future]: Machine-readable reports shall include analyzer and supported-profile version identifiers.

## Maintainability requirements

- `REQ-M-001` [T1]: Parsing, normalization and validation modules shall not import React or SharedUI.
- `REQ-M-002` [T1]: Project acquisition shall be behind a minimal interface supporting fixture and future browser/Node adapters.
- `REQ-M-003` [T1]: Validation rules shall be independently testable and registered explicitly.
- `REQ-M-004` [T1]: New abstractions require a demonstrated boundary or multiple consumers; speculative generic frameworks are prohibited.
- `REQ-M-005` [T1]: Stable rule IDs and finding fingerprints shall be preserved across presentation changes.

## Non-functional requirements

- `REQ-NF-001` [T1]: Identical inputs, analyzer version, configuration and analysis timestamp shall produce identical normalized output and findings.
- `REQ-NF-002` [T1]: Failure in one source file shall not erase diagnostics or valid results from other files.
- `REQ-NF-003` [T1]: A minimal fixture analysis shall complete interactively without perceptible blocking on a typical desktop development machine; exact performance budgets are deferred until representative fixtures exist.
- `REQ-NF-004` [T1]: Findings shall be explainable without consulting implementation source code.
- `REQ-NF-005` [T1]: The initial application shall be buildable as a static Vite application.

## Tier 1 acceptance criteria

Tier 1 is accepted when a bundled fixture can be analyzed end-to-end against the structured-core profile; standard Markdown paths are discovered and classified without content reads; the normalized model and initial rules are covered by deterministic tests; the React UI displays summary, active declarations, diagnostics and findings with provenance; typecheck, tests and build pass; and no analyzed repository content is executed or mutated. Acceptance must state that Markdown IDs, document statuses and verification-document content remain outside Tier 1 and are planned for TIER-003.

## Traceability policy

Every requirement implemented by a Slice must be listed in that Slice contract and mapped in `Relations.yaml` to relevant Study decisions, architecture/design IDs and verification evidence.
