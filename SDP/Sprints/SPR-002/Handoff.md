# Handoff — SLC-008

Status: SLC-008 completed; stopped at Slice boundary
Tier: `TIER-002`
Sprint: `SPR-002`
Iteration: `ITR-002`
CurrentIndex Slice: `SLC-008` (completed; retained)
Date: 2026-07-14

## Accepted baseline

The supervising architect accepted the complete structured-core Tier 1 at
`afb1d97cf537d80cb3ff7b84b17a807a591b104e`. Repository evidence confirms:

- `SLC-007`, `ITR-001`, `SPR-001` and `TIER-001` are completed;
- `VER-TIER-001` passed;
- `REV-TIER-001` approved with no actionable finding;
- the accepted Tier 1 fixture, discovery, parsing, normalization, validation,
  application and SharedUI behavior must remain unchanged; and
- Markdown content and stable-ID analysis remain planned `TIER-003` work.

## Completed work

CurrentIndex points to `TIER-002 / SPR-002 / ITR-002 / SLC-008` and is
intentionally retained there after completion. `VER-SLC-008` passed and the
fresh independent `REV-SLC-008` review approved with no actionable finding.
The complete accepted Slice boundary remains in `ScrumIterations.md`.

Key policies:

- handle already selected; no picker or UI;
- feature detection only; no user-agent sniffing;
- mandatory prompt-free `inspectPermissionState()` with four stable results;
- no permission request;
- denied permission distinct from unsupported API;
- deterministic canonical recursive listing;
- accessible siblings survive bounded nested failure;
- the additive listing returns entries plus atomic complete/partial/failed
  acquisition evidence; expected root errors carry the failed evidence;
- only a complete listing may produce missing-core warnings; an unobserved
  core path under partial acquisition yields unknown support;
- ordered atomic commits prevent older late attempts from overwriting newer
  state, and a newer failed relist clears stale readable handles;
- source ID is mandatory, opaque, caller-supplied and non-empty;
- ambiguous duplicate paths are excluded and every joined path passes the
  accepted exact canonical path policy;
- read contents only through `readText` and never during listing;
- no write, upload, execution, persistence or telemetry;
- browser types stay under `src/adapters/browser`; and
- discovery and `analyzeProject` remain source-agnostic.

## Planned next work

`SLC-009` and `SLC-010` are planned only. Do not add a folder button, invoke
`showDirectoryPicker()`, persist handles, change SharedUI, begin Markdown
analysis or activate either planned Slice.

`REQ-V-009`, `REQ-UI-005` and `REQ-S-005` retain requirement-level T2 tags
but are unallocated and outside SPR-002. Do not treat SLC-008 or a future
integration summary as satisfying them; planning must assign or retier them
explicitly before Tier 2 closure.

## Evidence and stop boundary

`VER-SLC-008` records passed Master evidence for the implemented adapter and
permanent tests. `REV-SLC-008` records the fresh independent approval. Ledger
events 074 and 075 record review and completion. CurrentIndex remains on
SLC-008. Tier 2, SPR-002 and ITR-002 remain active; SLC-009 and SLC-010 remain
planned and are not authorized by this handoff. Work is stopped at the SLC-008
boundary.

No commit, push or pull request is authorized.
