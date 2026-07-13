# REV-SLC-006 — Application workflow and read-only findings UI

Status: approved after final fresh post-completion re-review
Review ID: `REV-SLC-006`
Slice: `SLC-006`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12
Role: fresh independent Reviewer

## Scope reviewed

Reviewed the complete expanded SLC-006 contract, linked requirements,
architecture/design, implementation notes, handoff, active traceability,
`VER-SLC-006`, all changed and untracked files, and relevant surrounding
application/core/UI code. Re-ran typecheck, the full test suite, production
build and `git diff --check`.

## Findings

### Medium — The authoritative handoff contradicts completed verification evidence

`SDP/Sprints/SPR-001/Handoff.md:3` still says SLC-006 is pending Master
verification. Lines 24-27 say Master verification is still required and that no
`VER-SLC-006` record exists. In the same repository state,
`SDP/Verification/VER-SLC-006.md:3-4` records passed verification,
`SDP/Sprints/SPR-001/implementationNotes.md` contains the Master verification
entry, `SDP/Traceability/Relations.yaml` links `VER-SLC-006` with outcome
`passed`, and Ledger event 044 records it. This leaves the designated fresh-agent
handoff surface stale and violates the repository-source-of-truth requirement.

Required correction: update the SLC-006 handoff status/current-handoff section
to reflect passed Master verification and pending independent review, while
keeping SLC-006 active and SLC-007 planned. Do not claim review approval or Slice
completion until re-review.

### Low — The Enter/Space regression does not test keyboard activation

`src/ui/App.test.tsx:116-118` dispatches keydown/keyup and then unconditionally
calls `fireEvent.click(button)`. The assertion therefore passes even if the key
sequence never activates the finding. This does not substantiate the claim in
`SDP/Verification/VER-SLC-006.md:43-46` that tests cover Enter/Space activation.
The production control is a native button, so this is an evidence/test-quality
gap rather than a demonstrated accessibility defect.

Required correction: use an interaction that models actual keyboard activation
(for example the testing-library user-event keyboard flow on the focused
button), and assert detail selection without injecting a separate click; or
revise the verification claim to cite real manual keyboard evidence instead of
this test.

## Verification rerun

- `npm run typecheck`: passed.
- `npm test -- --run`: passed; 17 files, 132 tests.
- `npm run build`: passed; 2,067 modules, with the recorded non-failing chunk
  size advisory.
- `git diff --check`: passed with line-ending conversion warnings only.

## Review disposition

Changes required. The product implementation otherwise preserves the
application-owned lifecycle and supersession behavior, SharedUI dashboard and
baseline reuse, exactly-one stylesheet import, diagnostic/finding separation,
canonical finding presentation, full provenance fields, truthful compatibility
and empty/loading/failure states, explicit non-color severity text, core/UI
boundaries, prohibited-scope exclusions and the SLC-007 boundary. A bounded
correction and fresh independent re-review are required before approval.

## Fresh independent re-review — 2026-07-12

Role: second fresh independent Reviewer

### Scope and evidence inspected

Re-read the complete active SLC-006 contract, linked requirements, Study,
architecture and design decisions, all current application/UI implementation
and tests, `implementationNotes.md`, `Handoff.md`, the complete
`VER-SLC-006` including post-review evidence, the original review above,
`CurrentIndex.yaml`, `Relations.yaml`, and the immutable Ledger tail. Inspected
the explicit `@testing-library/user-event@14.6.1` manifest and lockfile entries.
No product or traceability file was changed by this review.

### Original finding reassessment

1. **Handoff consistency — resolved.**
   `SDP/Sprints/SPR-001/Handoff.md:3` now states that SLC-006 is active, Master
   verification passed and independent-review changes were required. Lines
   25-30 identify `VER-SLC-006`, the first review's two corrections, the need
   for this fresh re-review, the absence of a completion claim and the SLC-007
   stop. This is consistent with `VER-SLC-006.md:3`, CurrentIndex remaining on
   SLC-006, `Relations.yaml:104-115` keeping SLC-006 active with
   `VER-SLC-006`, and Ledger events 044-045 recording passed and updated
   verification. The handoff correctly does not pre-claim this re-review's
   disposition or Slice completion.

2. **Actual Enter/Space activation — resolved.**
   `src/ui/App.test.tsx:110-122` parameterizes Enter and Space, finds the
   production control by button role, asserts its native `BUTTON` element,
   focuses it, invokes `userEvent.keyboard(key)`, and then asserts
   `aria-pressed="true"` plus the selected finding detail. There is no
   `fireEvent.click` in this keyboard test. The separate click at line 63
   belongs to the pointer-selection/filter test and cannot make the keyboard
   assertions pass. The focused rerun passed 2 files/12 tests, including both
   key cases. `package.json:22` and lockfile lines 20 and 2563-2575 pin and lock
   `@testing-library/user-event@14.6.1` as a dev dependency with resolved
   package metadata.

### Independent verification rerun

- Two consecutive `npm ci` attempts stopped during Windows cleanup with
  `ENOTEMPTY`, first at `node_modules/@types/react-dom` and then at
  `node_modules/lucide-react/dist/esm/icons`; neither reached a product test.
- `npm install --ignore-scripts=false` restored the manifest/lockfile-defined
  tree without adding an unplanned manifest or lockfile change: 256 packages
  added, 15 changed, 272 audited, zero vulnerabilities.
- Focused UI/controller run: passed, 2 files and 12 tests.
- `npm run typecheck`: passed with no diagnostics.
- `npm test`: passed, 17 files and 132 tests.
- `npm run build`: passed, 2,067 modules; only the non-failing chunk-size
  advisory remained.
- Exact dependency listing passed with `SharedUI@0.1.0`, `yaml@2.9.0` and
  `@testing-library/user-event@14.6.1`.
- `git diff --check`: passed with line-ending conversion warnings only.
- Scans reconfirmed exactly one `SharedUI/styles.css` import, no React/React DOM/
  SharedUI imports in core/application/adapters, and no SLC-007 product work.

The repeated clean-install cleanup error is transparently recorded as an
environmental verification limitation. It does not contradict the existing
successful post-review clean-install evidence, the internally complete
lockfile entry, the exact installed dependency listing, or the passing focused
and full checks after restoration.

### Re-review findings and disposition

No remaining actionable findings. Both original findings are resolved, and
the full Slice remains consistent with its lifecycle, presentation,
accessibility, architecture, prohibited-scope, verification and traceability
contract.

**Approved.** SLC-006 remains active; this review does not update traceability,
mark the Slice complete or authorize SLC-007. The Master must integrate this
disposition into the SDP completion records.

## Post-completion fresh independent audit — 2026-07-12

Role: third fresh independent Reviewer

The Reviewer re-read the complete SLC-006 contract and linked planning, all
current changed/untracked product, test and package files, surrounding core and
application code, SharedUI contracts, verification, review, handoff and active
traceability. Focused controller/UI tests passed 2 files/12 tests; the full
17-file/132-test suite, typecheck, build, dependency listing, boundary scans,
YAML/NDJSON validation and diff check also passed.

### Findings

1. **Medium — selected-source ownership and source-selection surface.** The
   application controller owns lifecycle/result but not selected source;
   `App` supplies the authoritative source while SharedUI config stores a
   second inert `selectedSource`. The page has only a summary row, not the
   required clearly labeled fixture source selector/panel. One application
   owner must hold selected source, lifecycle and result, and the duplicate
   SharedUI source state must be removed.
2. **Low — incomplete permanent UI evidence.** Tests do not assert all required
   summary/profile/declared values, partial compatibility, or every finding
   provenance field and range/pointer. Production code renders most of these,
   but `VER-SLC-006` overstates permanent coverage.
3. **Low — handoff and Ledger review transition.** Handoff mixes present-tense
   correction-pending wording with a later completion section. Ledger records
   approval without first preserving the original changes-required review
   disposition. The history must be clarified append-only.

### Disposition

Changes required. The completed state is reopened for bounded correction,
re-verification and another fresh independent review. CurrentIndex remains on
SLC-006 and SLC-007 remains planned.

## Final fresh post-completion re-review — 2026-07-12

Role: fourth fresh independent Reviewer

The Reviewer independently re-read the complete Slice, correction, tests,
SharedUI contracts, verification, handoff and append-only traceability. It
confirmed one application controller owns selected `ProjectSource` in every
lifecycle state and the single result; React only initializes, subscribes and
invokes it; SharedUI dashboard state/statePolicy/validators are empty; and the
registered fixture source panel is visible, truthful and explicit about local
folder unavailability.

Permanent coverage now includes all required summary/profile/counts, declared
Sprint/Refactor/Iteration/Slice and null-versus-missing values,
partial/unknown/unsupported compatibility, diagnostic separation, canonical
finding order, real Enter/Space activation, immutable filtering and complete
provenance source ID/path/kind/ranges/pointer.

Independent reruns passed focused controller/UI 2 files/15 tests, strict
typecheck, the full 17-file/135-test suite, the 2,067-module production build,
exact dependency resolution and `git diff --check`. Boundary, UI-core,
raw-shadcn, prohibited-scope, SLC-007 and traceability syntax/history checks
also passed.

### Final disposition

Approved with no actionable findings. SLC-006 may be marked completed again.
CurrentIndex must remain on SLC-006 and SLC-007 must remain planned.
