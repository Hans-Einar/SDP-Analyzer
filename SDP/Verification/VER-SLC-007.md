# VER-SLC-007 — Tier 1 integration, acceptance and handoff

Status: passed; fresh independent review approved and closure integrated
Verification ID: `VER-SLC-007`
Slice: `SLC-007`
Sprint: `SPR-001`
Iteration: `ITR-001`
Tier: `TIER-001`
Date: 2026-07-13

## Scope verified

This record verifies the complete amended SLC-007 contract: the Tier 1
structured-core boundary, the `DEC-STU-016` correction to `SDP007`, clean and
broken end-to-end fixtures, deterministic and partial-failure behavior,
rendered provenance and accessibility, documentation, security/read-only
boundaries, traceability consistency and isolated clean-install
reproducibility.

Tier 1 analyzes content only from:

- `SDP/Traceability/CurrentIndex.yaml`;
- `SDP/Traceability/Relations.yaml`; and
- `SDP/Traceability/Ledger.ndjson`.

Standard Markdown paths are discovered and classified, but Markdown content,
stable IDs, document statuses and verification-document contents are not
analyzed.

## Environment and tree

- Windows; branch `main`; Node `v24.11.0`; npm `11.6.1`.
- Committed verification anchor:
  `4e2018a45614f76a3ed207272a86badc366d1fac`.
- The accepted SLC-006 product baseline is
  `d08e097f2813231ca29c13293459697aace2e706`; the intervening committed change
  contains only SDP planning/traceability records.
- SLC-007 work remains uncommitted by explicit instruction.
- `package.json` and `package-lock.json` are unchanged.

## Exact command evidence

- `npm ci`: passed; 271 packages added, 272 audited, zero vulnerabilities.
- Focused `SDP007` command: 2 files, 27 tests passed. This includes all ten
  `DEC-STU-016` qualification regressions.
- Focused integrated fixture/boundary command: 7 files, 25 tests passed.
- Focused application/UI/controller command: 2 files, 18 tests passed.
- `npm run typecheck`: passed with no diagnostics.
- `npm test`: passed; 20 files, 155 tests.
- `npm run build`: passed; 2,069 modules transformed; output was 0.53 kB HTML,
  72.91 kB CSS and 649.19 kB JavaScript (192.29 kB gzip). The existing
  non-failing over-500-kB chunk advisory remained.
- `npm ls SharedUI yaml --depth=0`: passed with `SharedUI@0.1.0` and
  `yaml@2.9.0`.
- `git diff --check`: passed with line-ending conversion warnings only.
- No lint command is configured.

## SDP007 correction evidence

The focused tests prove that:

1. exact `outcome: passed` without `check` or `command` does not qualify;
2. an empty `check` does not qualify;
3. a whitespace-only `command` does not qualify;
4. a described check with a non-passed outcome does not qualify;
5. a non-empty `command` with exact passed outcome qualifies;
6. a non-empty `check` with exact passed outcome qualifies;
7. one qualifying target suppresses `SDP007` despite an incomplete peer;
8. failing evidence cites every resolved target while inventing no missing
   target provenance;
9. the clean fixture has a real completed Slice plus synthetic structured
   verification evidence and remains finding-free; and
10. analysis reads exactly the three structured traceability sources and no
    Markdown content.

No verification command is executed and no new rule ID was added. The
production registry remains exactly `SDP001` through `SDP008`.

## Integrated behavior evidence

- The clean fixture discovers 16 paths, including standard Markdown paths;
  reads the three structured sources; normalizes 7 entities, 10 relations and
  5 Ledger events; renders project identity and active work; and produces zero
  diagnostics and zero findings.
- An independent complete snapshot oracle locks every clean source, project
  and active declaration, entity, relation ID, Ledger payload and provenance
  coordinate. Repeated analysis is equal and frozen.
- The broken fixture traverses the same real pipeline. It retains Ledger lines
  1 and 3 around malformed line 2, reports duplicate definitions, dangling
  relations, contradictory active hierarchy and non-qualifying completed-Slice
  verification, and produces canonically ordered stable findings with source
  evidence.
- A simulated Relations read failure retains CurrentIndex and Ledger facts,
  reports partial compatibility and exposes the appropriate diagnostics and
  findings.
- Real `ProjectSource`-through-controller rendered tests cover `partial` and
  `unknown`. The `unsupported` presentation state is separately injected
  because current Tier 1 discovery does not produce that value.
- Source switching and failure remove stale success/finding detail. Repeated
  Analyze actions produce one summary and one result surface. Filtering a
  selected finding now clears the selection when that finding is hidden.
- Fixture listings, source text, snapshots and findings remain unmutated.

## Rendered browser and accessibility evidence

A real in-app Browser session against Vite verified both shipped workflows.

Clean workflow:

- the selected source was `fixture:minimal`;
- the structured-core profile and Markdown limitation were visible;
- project identity, 16 files, 7 entities, 10 relations, 5 Ledger events and
  declared Sprint/Refactor/Iteration/Slice rendered correctly;
- exactly one summary, no-diagnostics state and no-findings state remained
  after repeat Analyze; and
- no horizontal overflow or console warning/error was present.

Broken workflow:

- switching selected `fixture:broken` and rendered 3 diagnostics and 8
  canonical findings without a stale clean result;
- `SDP007` detail rendered explanation, recommendation, affected IDs,
  fingerprint and four real provenance sources, including unavailable and
  concrete line/column ranges;
- the missing target had relation evidence but no invented entity pointer;
- filtering away the selected warning left zero pressed findings and no stale
  detail;
- a broken → clean → broken round trip reset both filters and finding
  selection; and
- repeat Analyze retained the same 8-finding order, with no console
  warning/error or horizontal overflow.

Finding controls are native buttons with explicit severity text and
`aria-pressed`; loading uses a polite busy live region and failure uses an
alert. Permanent rendered tests use real `@testing-library/user-event`
Enter/Space activation and pass both cases. The in-app Browser transport could
focus the native button but did not synthesize its native click from the
transport keypress command, so this record does not overstate that transport
attempt as a separate browser-keyboard pass.

## Boundary and security evidence

- `SharedUI/styles.css` is imported exactly once at `src/main.tsx:3`.
- Core, application and adapters import no React, React DOM or SharedUI.
- UI contains no parser, normalizer or validator implementation calls.
- Raw/local generic UI primitive imports are absent; SharedUI dashboard state
  and state policy remain empty, while the application controller owns source,
  lifecycle and the single result.
- No filesystem acquisition, graph, report/export, repair/write-back or
  analyzed-code execution implementation exists.
- No Markdown parser dependency or Markdown analysis branch was added.
- The only production `readText` analysis call is the generic core-source read
  in `loadCoreTraceability`; permanent instrumentation proves its exact three
  runtime paths.

## Traceability evidence

- Requirements contain 59 stable IDs and Study contains 16 decisions.
- `REQ-D-003` belongs to planned `TIER-003` and is absent from SLC-007.
- `REQ-D-007`, `DEC-STU-015` and `DEC-STU-016` are linked to SLC-007.
- CurrentIndex remains `SPR-001 / ITR-001 / SLC-007`.
- SLC-001 through SLC-007 are completed after fresh independent approval.
- All 57 pre-verification Ledger events parse and have unique IDs. The exact
  committed 56-line prefix is unchanged; historical block event 056 remains
  and unblock event 057 follows it.
- CurrentIndex and Relations YAML parse with unique keys; Ledger NDJSON parses
  line by line.

## Isolated clean-install evidence

A repository-owned copy excluding `.git`, `node_modules` and `dist` was made at:

`C:\Users\hanse\AppData\Local\Temp\SDP-Analyzer-SLC007-Master-20260713-231900`

All 113 repository-owned files and SHA-256 contents matched the working tree.
Inside that isolated copy, `npm ci`, typecheck, all 20 files/155 tests, build
and exact dependency listing passed. The isolated evidence directory is
preserved for review.

## Result

All Master SLC-007 verification gates pass. The fresh independent
`REV-SLC-007` review reproduced the focused, full, build, dependency, boundary,
traceability and isolated-copy gates and approved with no actionable finding.
The Master linked that real disposition and completed SLC-007 through immutable
events 060 and 062. CurrentIndex remains on SLC-007.
