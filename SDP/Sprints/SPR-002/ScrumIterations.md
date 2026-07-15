# SPR-002 — Explicit Local Project Acquisition

Status: active
Sprint ID: `SPR-002`
Tier: `TIER-002`
Date opened: 2026-07-14

## Sprint goal

Allow an explicitly user-authorized browser directory to supply the same
canonical project evidence as the accepted Tier 1 fixtures, without changing
discovery, parsing, normalization or validation semantics and without adding
write, upload or execution capability.

## Scope and accepted transition

The supervising architect accepted `SLC-007`, `ITR-001`, `SPR-001` and
`TIER-001` at committed state
`afb1d97cf537d80cb3ff7b84b17a807a591b104e`. Tier 1 remains the completed
fixture-only structured-core analyzer.

This Sprint is authorized by `STU-001`, especially `DEC-STU-004` and
`DEC-STU-005`; `REQSET-001`; `ARC-001`; `DAN-001`; `DES-001`; and
`IMP-001`. It must preserve the accepted Tier 1 boundary. Markdown content
analysis remains planned `TIER-003` work.

## Iteration ITR-002 — Browser Directory Source Foundation

Status: active
Iteration ID: `ITR-002`

### Ordered Slice structure

1. `SLC-008 — Browser directory ProjectSource adapter` — completed.
2. `SLC-009 — Explicit folder selection and analysis UI` — planned.
3. `SLC-010 — Tier 2 browser compatibility and integration acceptance` —
   planned.

`SLC-008` is contracted and completed. The later planned Slice names establish
the delivery order; they do not authorize their product work.

---

## SLC-008 — Browser directory ProjectSource adapter

Status: completed
Slice ID: `SLC-008`
Date completed: 2026-07-14

### Goal

Implement a browser-specific, read-only `ProjectSource` adapter backed by an
already-authorized or already-selected File System Access API directory
handle. The adapter safely exposes text files beneath that directory through
the existing framework-independent source contract.

This Slice does not add the final user-facing picker or folder-selection
workflow.

### Why now

Tier 1 proved the complete analyzer over deterministic bundled fixtures.
Tier 2 must next prove that a browser directory explicitly authorized by the
user can supply the same canonical evidence without special cases in
discovery, parsing, normalization or validation. The adapter and permission
boundaries must be correct before a UI owns the user gesture.

### Requirements implemented

Primary adapter foundation (partial until the SLC-009 user gesture):

- `REQ-F-007`
- `REQ-S-004`

Partial/foundation:

- `REQ-M-002`
- `REQ-C-004`
- `REQ-S-002`
- `REQ-S-003`
- `REQ-NF-001`
- `REQ-NF-002`
- `REQ-T-001`
- `REQ-T-003`

This Slice does not claim complete local-project UI acquisition. In
particular, it does not satisfy the user-gesture workflow portion of
`REQ-F-007` or `REQ-S-004` until `SLC-009`.

### Architecture and design references

- `ARC-COMP-001`
- `ARC-COMP-007`
- `ARC-COMP-011`
- `ADR-001`
- `ADR-002`
- `ADR-008`
- `DEC-STU-004`
- `DEC-STU-005`
- `DES-001` source, security, error and test boundaries

### Required implementation

#### 1. Browser capability contract

Create a small presentation-neutral capability API, preferably a
discriminated result or the equivalent of:

~~~ts
interface BrowserDirectoryCapability {
  readonly supported: boolean;
  readonly reason?: string;
}
~~~

Capability detection shall:

- inspect the required browser acquisition surface, including a callable
  directory-picker capability, without invoking it;
- tolerate absent `window`, `navigator` and other browser globals;
- work in tests and server-like runtimes;
- use feature detection rather than user-agent sniffing;
- return a stable unsupported reason when the surface is unavailable; and
- remain distinct from the permission state of an already-selected handle.

No capability check may request permission or open a picker.

#### 2. Browser directory source

Implement a browser adapter such as:

~~~ts
class BrowserDirectoryProjectSource implements ProjectSource
~~~

The constructor receives an already-selected directory handle. The adapter
does not render UI and does not own the user gesture.

It shall:

- require a non-empty opaque caller-supplied `sourceId`; it must not derive
  from the directory name and must not be generated randomly;
- use a privacy-safe display label, with a generic default such as
  “Selected local directory” rather than requiring the raw directory name;
- recursively enumerate regular files;
- emit canonical repository-relative `/` paths;
- sort file results deterministically independent of browser iteration order;
- expose file contents only through `readText(path)`;
- reject unknown, unsafe and non-canonical paths explicitly;
- remain read-only and remain rooted in handles obtained beneath the selected
  directory;
- execute no target content; and
- map access failures to stable sanitized adapter errors.

#### 3. Handle abstraction and browser typing

Create only the adapter-local structural interfaces required for fake handles
and the browser boundary. Production native handles may satisfy those
interfaces structurally.

If the configured TypeScript DOM libraries do not declare every required File
System Access API member, add one small adapter-local declaration/type module
that declares only the members used:

- handle `kind` and `name`;
- directory async entry iteration;
- file-handle `getFile()`;
- file `text()`; and
- optional read-only `queryPermission`.

Do not declare or use write handles, writable streams, `requestPermission`,
`showDirectoryPicker()` invocation or a generic virtual filesystem. Browser
types must not leak into `src/core`, normalization, parsing, validation or
findings.

#### 4. Recursive enumeration and canonical paths

Enumeration shall:

- recurse only through directory handles explicitly yielded beneath the
  selected root;
- validate each entry name as one path segment before joining it to its
  parent;
- reject empty, `.`, `..`, slash-containing and backslash-containing entry
  names rather than repairing them;
- never synthesize absolute or parent paths;
- include only regular file handles;
- ignore unsupported kinds under the explicit diagnostic policy below;
- avoid `getFile()` and `text()` during listing;
- handle empty roots and nested standard SDP folders; and
- rebuild its file-handle index from each completed listing without caching
  file text.

Every joined candidate path must also pass the accepted
`normalizeProjectPath` policy with exact input/output equality. This includes
drive-letter-like first segments such as `C:notes`, even if a fake or host
filesystem can expose such a name.

Duplicate canonical paths in fake or malformed handle input shall not silently
overwrite one another. They must produce a deterministic diagnostic or a
stable explicit error while preserving safe neighboring entries. The
ambiguous path itself must be excluded so reversed iteration order cannot
choose a different “first” handle.

#### 5. Partial-failure and diagnostic policy

SLC-008 uses best-effort recursive listing:

- a denial or failure before the root can be enumerated is a sanitized
  source-list failure and must remain distinguishable from an empty project;
- entries observed before an iterator failure remain usable;
- failure while entering or iterating one nested directory records a stable
  acquisition diagnostic and does not erase already observed files or
  accessible siblings at higher levels;
- invalid or unsupported child entries are skipped with stable diagnostics;
- an iterator failure that prevents observing later children is reported
  honestly; unseen children are not invented; and
- repeated listings replace, rather than accumulate, prior acquisition state;
  and
- traversal builds a private candidate index and commits it atomically when
  that attempt settles; a newer failed attempt clears the prior index, while
  an older late completion may not overwrite state from a newer settled
  attempt.

To carry listing evidence through the existing analysis pipeline, add only the
smallest additive framework-neutral acquisition-state surface:

~~~ts
interface ProjectSourceAcquisitionSnapshot {
  readonly completeness: "complete" | "partial" | "failed";
  readonly diagnostics: readonly Diagnostic[];
}

interface ProjectSourceAcquisitionListing {
  readonly entries: readonly ProjectFileEntry[];
  readonly acquisition: ProjectSourceAcquisitionSnapshot;
}

interface ProjectSourceWithAcquisitionListing extends ProjectSource {
  listFilesWithAcquisition(): Promise<ProjectSourceAcquisitionListing>;
}
~~~

The browser source shall implement this interface. `listFiles()` delegates to
the additive method and returns only its entries for base-contract consumers.
The additive method returns entries and immutable acquisition evidence from
the same attempt. An expected root failure rejects with a sanitized adapter
error carrying the immutable `failed` acquisition snapshot; the core uses a
framework-neutral type guard and no browser handle type.

`discoverProject` shall prefer the additive method when present and consume
the atomic listing or failure evidence:

- after a `complete` success, merge and canonically sort acquisition
  diagnostics with discovery diagnostics; absent core paths use the existing
  missing-core warnings and `partial` profile support;
- after a `partial` success, preserve every observed file and merge/sort the
  acquisition diagnostics; when all three core paths were observed the
  structured-core profile may remain `supported`, but when any core path was
  not observed profile support is `unknown` and no
  `DISCOVERY_MISSING_CORE_SOURCE` warning is emitted;
- after rejection, retain profile support `unknown`, add the generic
  `DISCOVERY_SOURCE_LIST_FAILED` diagnostic, merge and sort the acquisition
  diagnostics, and do not invent missing-core warnings.

Existing fixture sources need no behavioral change and are not required to
implement the additive interface.

Overlapping listing attempts must be safe. Each traversal uses local candidate
state. Settled attempts use monotonically ordered identity so a late older
success or failure cannot overwrite a newer settled file index. A newer
settled failure clears any prior readable index. The atomic result returned to
each caller remains that caller's evidence even when another attempt starts.

The diagnostic surface must contain no browser handle types. At minimum it
shall distinguish permission denial, inaccessible nested entry, invalid entry
name, unsupported entry kind and duplicate canonical path. Sanitized messages
may identify the canonical relative entry or parent path needed for action,
but must not expose raw browser exception details or absolute local paths.

Only a complete listing may establish that a core file is missing. An
incomplete listing means the unseen path is unknown, not missing.

`complete` means clean exhaustive traversal with no skipped, ambiguous or
unobserved entry. Invalid names, unsupported kinds, duplicate canonical paths
and nested iterator failures all make the listing `partial`. `failed` means
root acquisition produced no trustworthy listing; `partial` preserves every
unambiguous safe observed neighbor.

#### 6. Text reading

`readText(path)` shall:

1. normalize and validate the requested path;
2. reject the request when normalization changes it, including backslashes;
3. resolve only a file handle indexed from enumeration beneath the selected
   root;
4. perform an initial lazy listing only if the adapter has no current index;
5. call `getFile()` and then `text()` for each read;
6. return the same canonical path with the text; and
7. map permission, disappearance and read failures to stable sanitized errors.

Unknown paths are rejected. File text is never cached as authoritative, so a
later read may observe a changed browser `File`. Listing itself must not read
contents.

#### 7. Permission semantics

Capability support and handle permission are separate states.

- Capability detection reports whether the browser acquisition API is
  available; it never reports a selected handle as denied.
- The adapter shall expose a mandatory explicit read-only
  `inspectPermissionState()` method using
  `queryPermission({ mode: "read" })` when supported.
- The method returns exactly `granted`, `prompt`, `denied` or `unknown`.
  Missing `queryPermission`, an unsupported return value or a thrown
  inspection error maps to `unknown` without leaking raw browser details.
- No permission request may occur in construction, capability detection,
  listing, reading, analysis or a background effect.
- A denied handle produces a stable permission-specific adapter
  error/diagnostic. On root listing rejection that diagnostic must remain
  present beside `DISCOVERY_SOURCE_LIST_FAILED`, not collapse into an
  unsupported-browser result or only a missing-SDP-file result.
- The picker and any future permission request belong to an explicit
  `SLC-009` user action.

#### 8. Privacy and security

Ensure:

- project data stays in the local runtime;
- no upload, fetch, telemetry or persistence is added;
- no scripts, hooks, modules, binaries, MDX or commands are executed;
- no write method, writable-handle request or mutation surface exists;
- directory names and browser errors are exposed only to the minimum
  application need;
- raw absolute local paths are neither constructed nor reported; and
- every readable handle originates from traversal beneath the selected root.

#### 9. Application integration boundary

Add no browser-source special case to `analyzeProject`. Prove that the adapter
works through:

~~~text
BrowserDirectoryProjectSource
  -> discoverProject
  -> loadCoreTraceability
  -> normalizeTraceability
  -> validateSnapshot
  -> analyzeProject
~~~

Only presentation-neutral support for an already-created source is allowed.
No React component, SharedUI config, folder button or picker integration may
be added.

### Expected modules

A cohesive implementation is expected under:

~~~text
src/adapters/browser/
  BrowserDirectoryProjectSource.ts
  browserDirectoryCapability.ts
  fileSystemAccessTypes.ts
  BrowserDirectoryProjectSource.test.ts
  browserDirectoryCapability.test.ts
~~~

A small framework-neutral acquisition-diagnostic interface and focused
discovery test may be added under `src/core/source` or `src/core/discovery`.
Exact filenames may vary, but browser handles remain adapter-local.

### Invariants

- No React or SharedUI import in the browser adapter.
- No browser filesystem type below the adapter boundary.
- No File System Access API use in core.
- No Node filesystem use.
- No write operation or writable permission mode.
- No adapter/public structural type or call exposes write operations; native
  handles may contain platform members outside the adapter's narrowed type.
- No permission request without a future explicit user action.
- No picker invocation.
- No Markdown content parsing.
- No change to Tier 1 rule semantics.
- Paths are deterministic, canonical and root-relative.
- Partial access failures remain distinguishable from missing evidence.
- Fixture behavior and Tier 1 analysis remain unchanged.
- No `SLC-009` UI work begins.

### Explicit non-goals

Do not implement:

- `showDirectoryPicker()` invocation or its UI workflow;
- folder-selection button;
- persistent handles or IndexedDB;
- drag/drop;
- Node filesystem adapter;
- Electron or Tauri;
- Markdown parsing or stable-ID extraction;
- graph;
- report export;
- CLI/CI;
- repair or write-back;
- SharedUI modifications;
- Tier 3 work; or
- any `SLC-009` or `SLC-010` product behavior.

### Required tests

At minimum:

1. capability supported result;
2. capability unsupported result without browser globals;
3. capability detection does not invoke the picker;
4. empty root lists no files;
5. nested files use canonical relative paths;
6. browser iteration order does not affect listing order;
7. backslash, absolute and traversal requests are rejected;
8. unknown path reads are rejected;
9. valid file text is returned;
10. listing calls neither `getFile()` nor `text()`;
11. an inaccessible sibling or nested directory preserves accessible entries
    according to the documented partial policy;
12. permission denied is distinct from unsupported capability;
13. no write-capable method, write permission or permission request exists;
14. the source works with existing discovery;
15. the source works with existing `analyzeProject` using a fake selected
    directory;
16. existing fixture and Tier 1 tests remain passing;
17. no browser types leak into core; and
18. no UI or picker implementation exists.

Also cover invalid child names, unsupported kinds, duplicate paths, diagnostic
reset between repeated listings, root failure versus empty root, mutable file
text across repeated reads, and sanitized read failures. Assert that every
skipped, ambiguous or unobserved category produces `partial` completeness and
suppresses missing-core claims when a core path was not observed. Reverse
duplicate iteration order and prove the ambiguous path remains unreadable.
Cover a drive-letter-like listed name and overlapping listing/analysis
attempts, including an older late completion and a newer failed relist that
clears stale readable state.

### Verification

Run and record:

~~~text
npm ci
npm run typecheck
npm test
npm run build
npm ls SharedUI yaml --depth=0
git diff --check
~~~

Also perform and record:

- focused browser-adapter tests;
- capability checks without browser globals;
- deterministic traversal checks;
- partial access-failure and acquisition-diagnostic propagation checks;
- path-escape and non-canonical-read scans;
- write-operation and writable-permission scans;
- permission-request and picker-invocation scans;
- network/telemetry/persistence scans;
- architecture boundary and browser-type leak scans;
- Tier 1 regression checks; and
- YAML/NDJSON traceability validation.

Create `VER-SLC-008` only after real verification. Record the exact command
output, test counts, environment, changed scope, failures, reruns, limitations
and residual risk.

### Independent review

Use a fresh independent Reviewer after Worker implementation and Master
verification. The Reviewer must inspect:

- this complete contract;
- the browser API and typing boundary;
- capability detection;
- path safety and root confinement;
- recursive deterministic traversal;
- partial-failure and diagnostic semantics;
- permission-state behavior;
- read-only/privacy/security behavior;
- fake-handle test quality;
- absence of UI/picker work;
- absence of browser types in core;
- actual verification evidence; and
- traceability consistency.

Create `REV-SLC-008` only after review occurs. If changes are required,
preserve the original disposition, delegate a bounded correction Worker,
rerun applicable checks and use a fresh re-review.

### Completion signal

SLC-008 is complete only when:

- an already-selected browser directory acts as a read-only `ProjectSource`;
- capability support is detectable without prompting;
- permission denial is distinct from unsupported capability;
- enumeration and reads are canonical, deterministic and root-confined;
- accessible neighbors survive bounded nested failures with explicit evidence;
- no write, upload, execution, picker or permission-request capability exists;
- existing discovery and `analyzeProject` accept the source without browser
  special cases;
- tests, typecheck and build pass;
- fresh independent review approves;
- traceability records real evidence;
- CurrentIndex remains on `SLC-008`; and
- `SLC-009` and `SLC-010` remain planned and untouched.

### Discoveries and stop condition

Resolve only discoveries required to satisfy this contract without altering
accepted architecture or Tier boundaries. Record browser compatibility gaps,
picker/gesture UX, handle persistence, broader filesystem adapters, navigation
and Tier 3 document analysis for later work.

Stop after SLC-008 verification, independent approval and traceability
integration. Do not activate or implement SLC-009.

### Completion record

`VER-SLC-008` passed with 4 focused files/34 tests, 23 total files/183 tests,
strict typecheck, a 2,070-module build, exact dependency inspection, Tier 1
regression, security/boundary scans and traceability validation.
`REV-SLC-008` independently reproduced the evidence and approved with no
actionable finding. Ledger events 074 and 075 record review and completion.
CurrentIndex remains on SLC-008. Tier 2, SPR-002 and ITR-002 remain active;
SLC-009 and SLC-010 remain planned and untouched.

---

## SLC-009 — Explicit folder selection and analysis UI

Status: planned
Slice ID: `SLC-009`

Planned boundary only: add the explicit user gesture, picker invocation,
permission UX, unsupported-browser state and source selection/application
integration. This Slice is not contracted or authorized by the SLC-008
activation.

## SLC-010 — Tier 2 browser compatibility and integration acceptance

Status: planned
Slice ID: `SLC-010`

Planned boundary only: verify the complete Tier 2 browser acquisition workflow,
compatibility messaging, regression behavior and final Tier handoff. This Slice
is not contracted or authorized by the SLC-008 activation.

Before SLC-010 is contracted, planning must explicitly reconcile the
requirement-level T2 tags on `REQ-V-009` (stale-work policy), `REQ-UI-005`
(broader entity/relation navigation) and `REQ-S-005` (non-browser adapter
traversal). They are not owned by SPR-002 or any current Slice and must not be
silently accepted by an integration record.
