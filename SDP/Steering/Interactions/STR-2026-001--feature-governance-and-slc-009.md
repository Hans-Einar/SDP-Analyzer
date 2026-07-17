# STR-2026-001 — Register governance visualization before SLC-009

Interaction ID: `STR-2026-001`  
Project: `SDP-ANALYZER`  
Repository: `Hans-Einar/SDP-Analyzer`  
Created: 2026-07-17  
Steering role: supervising architect / Steering Group  
Target role: repository-local Codex Master  
Expected base commit: `48388cb40faedc4391bc42aa1758ce6ef1cbf75e`  
Related Feature: to be allocated by repository evidence  
Related Tier: `TIER-002`  
Related Sprint: `SPR-002`  
Related Iteration: `ITR-002`  
Next implementation Slice: `SLC-009`  
Interaction status: `prompt-issued`  
Prompt status: `recorded`  
Response status: `pending`  
Assessment status: `pending`

## Steering prompt

You are the repository-local SDP Master for:

`C:\Users\hanse\GIT\SDP-Analyzer`

Repository:

`Hans-Einar/SDP-Analyzer`

Work directly in the local repository.

Do not create a pull request.  
Do not commit or push unless the human explicitly asks.

The supervising Steering Group has confirmed that committed repository state
`48388cb40faedc4391bc42aa1758ce6ef1cbf75e` contains completed and approved
`SLC-008` work. Any earlier report saying SLC-008 remained uncommitted is
historical and must not be treated as current repository state.

This assignment has two strictly ordered parts:

1. register and study a new Product Governance Visualization Feature;
2. only after that planning record is coherent, activate and implement the
   already-planned `SLC-009` folder-selection and analysis UI.

Do not implement the new visualization Feature in this assignment.

# Re-anchor

Before changing anything, read:

1. `AGENTS.md`;
2. `AGENTS-project.md`;
3. `SDP/AGENT-REMINDERS.md`;
4. `SDP/Framework/README.md`;
5. relevant installed SDP skills;
6. all accepted planning documents;
7. `SDP/Traceability/CurrentIndex.yaml`;
8. `SDP/Traceability/Relations.yaml`;
9. the complete `SDP/Traceability/Ledger.ndjson`;
10. `SDP/Verification/VER-SLC-008.md`;
11. `SDP/CodeReview/REV-SLC-008.md`;
12. `SDP/Sprints/SPR-002/ScrumIterations.md`;
13. `SDP/Sprints/SPR-002/implementationNotes.md`;
14. `SDP/Sprints/SPR-002/Handoff.md`;
15. `SDP/Steering/README.md`;
16. this interaction record;
17. current production code and tests.

Verify from Git and repository evidence that:

- `48388cb` is present in history;
- SLC-008 is completed;
- TIER-002, SPR-002 and ITR-002 remain active;
- SLC-009 and SLC-010 remain planned;
- CurrentIndex remains at the completed SLC-008 boundary before this task.

If local state conflicts with committed repository evidence, stop and record a
truthful blocker. Do not redo SLC-008.

# Part A — Register the Feature first

Create a repository-local Feature proposal for:

`Project Governance Visualization`

Allocate the next valid Feature ID from repository evidence. Do not assume the
ID supplied by chat examples is available.

The Feature exists to make SDP Analyzer useful as a visual project-control
surface while preserving repository evidence as the source of truth.

## Intended SDP Analyzer 1.x capability

The proposed Feature should cover, at product level:

- overview and filtering of Releases, Features, Sprints, Iterations, Slices,
  Refactors and Fixes;
- declared status from structured project records;
- observed lifecycle reconstructed from Ledger events;
- comparison of declared and observed state without silently choosing one;
- sortable/filterable entity listings;
- a Gantt-style project timeline using real Ledger timestamps on the x-axis;
- rows or grouped rows for Releases, Features, Sprints, Iterations, Slices,
  Refactors and Fixes;
- lifecycle segments whose extent and presentation reflect actual state
  transitions;
- explicit handling of events with known order but missing exact timestamps;
- selection of an item to open a detail view containing metadata, relations,
  related Ledger events, findings, verification, review and provenance;
- optional Feature support when a repository contains the future additive SDP
  1.x Feature contracts;
- backward compatibility with current SDP repositories that have no Features.

The Feature must not require Steering/Codex chat-log rendering for Analyzer 1.x.
Raw interaction browsing and richer Steering communication views belong to a
later SDP/Analyzer 2.0 capability.

## Feature metadata assumptions to study

The Integration Study must assess, but not prematurely lock incompatible local
schemas for, at least:

- stable Feature ID and title;
- declared Feature status;
- planned Release;
- one or more planned Sprints;
- related Integration Study;
- related Slices;
- related Refactors;
- superseding or replacement Features;
- removal relation when delivered functionality is later removed;
- priority and timestamps where the governing SDP contract supports them.

Candidate Feature lifecycle values to evaluate:

- `proposal`;
- `study`;
- `backlog`;
- `planned`;
- `active-development`;
- `blocked`;
- `on-hold`;
- `delivered`;
- `canceled`;
- `removed`;
- `superseded`.

Distinguish at minimum:

- canceled before delivery;
- removed after delivery;
- superseded by another Feature;
- blocked by an external condition;
- intentionally placed on hold.

## Integration Study questions

Study:

1. how the Feature fits the current source, discovery, parsing, normalization,
   validation, application and SharedUI boundaries;
2. which current Ledger events already support useful lifecycle visualization;
3. what can be delivered for existing SDP 1.x repositories before Feature
   records formally exist;
4. how optional future Feature records can be added without breaking old
   repositories;
5. whether timeline reconstruction needs a new framework-independent lifecycle
   projection in core;
6. how declared state and observed state should coexist;
7. deterministic interval reconstruction rules;
8. behavior for duplicate, contradictory, missing-timestamp and out-of-order
   events;
9. performance and readability for long histories;
10. accessibility and non-color status cues;
11. what belongs in Analyzer 1.x versus Analyzer 2.0;
12. likely vertical Slices and their dependencies;
13. whether any prerequisite Refactor is required;
14. conflicts with the currently active Tier 2 delivery path.

## Part A boundaries

Part A is planning only.

Do not:

- implement Feature parsing;
- implement lifecycle projection;
- implement tables, Gantt or detail pages;
- change current Tier 2 requirements merely to absorb this Feature;
- activate a Feature implementation Slice;
- renumber existing Tier/Sprint/Iteration/Slice IDs;
- invent a final SDP Feature schema before the upstream SDP contract is
  accepted.

Record the Feature as proposal/study/backlog according to the best supported
current repository convention. If the installed SDP version lacks a formal
Feature directory, create the smallest project-owned additive structure that
is clearly marked provisional and compatible with the Steering design, rather
than pretending it is already a Toolkit standard.

Relate the Feature and Integration Study through `Relations.yaml` where the
current relation model can represent them safely. Append truthful Ledger events
for proposal, study and backlog transitions only when event naming is supported
or clearly project-local and documented.

Update this Steering interaction only by adding repository references if the
local workflow explicitly assigns that responsibility to the Master. Do not
rewrite the original prompt.

# Part B — Continue Tier 2 with SLC-009

After Part A planning is internally coherent, continue the existing Tier 2
sequence.

Activate and implement:

`SLC-009 — Explicit folder selection and analysis UI`

Do not merge the governance visualization Feature into SLC-009.

## SLC-009 goal

Provide an explicit, user-initiated browser folder-selection workflow that:

- invokes the browser directory picker only from a clear user gesture;
- creates the already-implemented `BrowserDirectoryProjectSource` from the
  selected handle;
- analyzes that source through the existing `analyzeProject` pipeline;
- presents loading, unsupported, permission, canceled-selection, partial,
  failed and ready states truthfully;
- preserves the bundled fixture workflow;
- remains read-only and local;
- uses SharedUI rather than recreating generic components.

## Required SLC-009 planning

Before product changes:

1. read and refine the existing SLC-009 planned contract;
2. allocate exact requirements and coverage without stealing SLC-010 acceptance
   scope;
3. define picker capability and user-gesture behavior;
4. define cancellation as a non-error user outcome;
5. define denied permission separately from unsupported browser capability;
6. define re-selection, repeat analysis and stale-state clearing;
7. define privacy-safe project labels;
8. define keyboard, focus and screen-reader behavior;
9. define fixture fallback and unsupported-browser presentation;
10. preserve the SLC-008 adapter contract unchanged unless a demonstrated defect
    requires a bounded correction.

## SLC-009 implementation constraints

- Picker invocation belongs in UI/application composition, never core.
- No picker invocation on page load, background work or capability detection.
- No write permission or writable handle.
- No upload, telemetry or network transport.
- No persistence/IndexedDB in this Slice.
- No Node filesystem adapter.
- No Markdown content parsing.
- No governance visualization implementation.
- No graph, report, CLI/CI, repair or write-back.
- No SLC-010 acceptance work beyond foundations strictly required by SLC-009.
- Browser-specific types remain at the adapter/UI boundary.
- Existing fixtures and Tier 1 behavior remain available and passing.

## SLC-009 expected behavior

At minimum:

1. a supported browser shows an explicit local-folder action;
2. activating it from a user gesture calls the picker once;
3. canceling selection retains a stable usable screen and does not report a
   project failure;
4. selecting a folder analyzes it through the existing pipeline;
5. selecting a second folder clears stale findings, diagnostics, provenance and
   selection state from the first;
6. permission denial is presented distinctly;
7. unsupported browsers receive a truthful alternative using bundled fixtures;
8. partial acquisition diagnostics remain distinct from validation findings;
9. repeated analysis does not duplicate state;
10. focus is restored or moved predictably after dialogs and result changes.

## Verification and review

Create `VER-SLC-009` only after real checks.

Run and record at least:

```text
npm ci
npm run typecheck
npm test
npm run build
npm ls SharedUI yaml --depth=0
git diff --check
```

Also run focused tests for:

- picker called only by user gesture;
- unsupported capability;
- canceled picker;
- denied permission;
- selected-directory success;
- source re-selection and stale-state clearing;
- fixture preservation;
- accessibility/focus behavior;
- no write permission;
- no network/upload/telemetry;
- no browser API leakage into core;
- no governance visualization scope leakage.

Use a fresh independent Reviewer. Create `REV-SLC-009` only after the review
actually occurs. Preserve original dispositions and use additive corrections
and fresh re-review if changes are required.

## Traceability and stop boundary

Record truthful activation, verification, review and completion events.

At completion:

- SLC-009 may be completed;
- TIER-002, SPR-002 and ITR-002 remain active;
- CurrentIndex remains at the completed SLC-009 boundary;
- SLC-010 remains planned and untouched;
- the new governance visualization Feature remains planning/backlog only;
- no Tier 3 work has begun.

# Final response

Return:

1. re-anchor and committed-state confirmation;
2. allocated Feature ID and files created;
3. Feature status and Integration Study disposition;
4. proposed Analyzer 1.x versus 2.0 boundary;
5. proposed future Slice breakdown for the Feature;
6. confirmation no governance visualization code was implemented;
7. SLC-009 contract and requirement allocation;
8. changed product files;
9. exact folder-picker behavior;
10. exact verification results;
11. independent Reviewer disposition;
12. traceability and CurrentIndex changes;
13. residual risks and discoveries;
14. confirmation SLC-010 remains planned;
15. confirmation work stopped at the completed SLC-009 boundary;
16. the complete raw Master report suitable for insertion under this Steering
    interaction's `Raw Master response` section.

Begin now.

## Raw Master response

Status: `pending`

The exact Codex Master response will be inserted here verbatim after it is
received.

## Steering assessment

Status: `pending`

The supervising Steering Group will assess committed repository evidence after
the raw Master response is received. The assessment will not rely on the Master
summary alone.
