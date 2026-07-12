# REV-SLC-003 — Core traceability parsers

Review ID: `REV-SLC-003`
Slice: `SLC-003`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12
Reviewer role: fresh independent SDP Reviewer

## Scope and authority

This review covers exactly `SPR-001 / ITR-001 / SLC-003`. It does not
implement fixes, change product or traceability state, mark the Slice complete,
authorize a transition, or begin `SLC-004`.

The review was re-anchored from repository evidence, not Worker or Master
summaries. The authoritative read included `AGENTS.md`, `AGENTS-project.md`,
`SDP/AGENT-REMINDERS.md`, `SDP/Framework/README.md`, the repository-local SDP
Reviewer and traceability skills, all three traceability files, the relevant
Study decisions and accepted Requirements, Architecture, Design Analysis,
Design and Implementation documents, the complete `SLC-003` contract,
`implementationNotes.md`, `Handoff.md`, `verification-plan.md`,
`VER-SLC-003.md`, the package manifest and complete lockfile, every current
file under `src`, the unchanged root build/test configuration, and the complete
working-tree diff from accepted baseline
`90bd7b6b0474331e54c5716398ca1bc714b995c2`.

The baseline is the current `main` HEAD. All 13 pre-review untracked files and
every tracked modification were inspected directly. No product, SDP state,
commit, stage, push or pull-request change was made by this Reviewer.

## Evidence inspected and rerun

- `npm ci` passed with exit code 0: 270 packages added, 271 packages audited,
  zero vulnerabilities.
- `npm run typecheck` passed with exit code 0 and no diagnostics.
- `npm test` passed with exit code 0 under Vitest `4.1.10`: 9 test files and
  all 61 tests passed, including the preserved discovery and rendered UI tests.
- `npm run build` passed with exit code 0. Vite `8.1.4` transformed 1,976
  modules and emitted 0.53 kB HTML, 72.88 kB CSS and 510.87 kB JavaScript
  (150.91 kB gzip). The previously recorded greater-than-500-kB warning remains
  non-failing.
- `npm ls SharedUI yaml --depth=0` passed and resolved `SharedUI@0.1.0` and
  `yaml@2.9.0`.
- The focused CurrentIndex/Ledger/boundary command passed: 3 files and all
  24 tests passed. The focused Relations/application command passed: 2 files
  and all 12 tests passed.
- `git diff --check` passed; output was limited to existing Windows LF-to-CRLF
  working-copy notices.
- Corrected implementation-only `rg` scans returned no React, React DOM,
  SharedUI, fixture, browser filesystem, Node filesystem, execution, write,
  Markdown, normalized model, validation-rule, finding, fingerprint or
  `SLC-004` match. The parser-call scan returned exactly the `parseDocument`
  import/call in `yamlSupport.ts` and the one native `JSON.parse` call in
  `parseLedger.ts`.
- `git diff --quiet
  90bd7b6b0474331e54c5716398ca1bc714b995c2 -- src/ui src/main.tsx` returned
  exit code 0. No UI source changed.
- Read-only strict, unique-string-key YAML parsing succeeded for
  `CurrentIndex.yaml` and `Relations.yaml`. All 25 current nonblank ledger
  lines parsed as JSON objects with unique event IDs. The accepted baseline's
  first 22 lines remain byte-for-line unchanged.
- Semantic traceability assertions passed: CurrentIndex and Relations identify
  `SPR-001 / ITR-001 / SLC-003` as active, `SLC-004` is planned,
  `VER-SLC-003` exists and is passed, the Slice and verification relations
  contain the exact 14 contract requirement IDs, and no `REV-SLC-003` relation
  or ledger event existed before this review record.

No lint command is configured. No live browser run was performed or claimed
because UI source is unchanged; the rendered test passed and the recorded
no-diff evidence was independently confirmed.

## Findings

### Medium

1. **Multi-document YAML is silently truncated after the first document.**

   `src/core/parsing/yamlSupport.ts:29`-`42` sets `logLevel: "silent"` and
   `parseYamlMapping` calls `parseDocument` at lines 178-215. In
   `yaml@2.9.0`, `parseDocument` only adds its `MULTIPLE_DOCS` error when the
   document log level is not `silent`. The chosen option therefore removes the
   parser's only multiple-document diagnostic while `toJS` materializes the
   first document only.

   A read-only Vite module probe supplied these inputs:

   - CurrentIndex: first document declares `SLC-FIRST`, then a `---` separator
     and a second document declares `SLC-DISCARDED`.
   - Relations: first document contains `SLC-FIRST`, then a `---` separator and
     a second document contains `SLC-DISCARDED`.

   The current parsers returned empty diagnostic arrays and only the first
   document:

   `currentDiagnostics=[]`, `currentSlice="SLC-FIRST"`,
   `relationsDiagnostics=[]`, with only `SLC-FIRST` in the raw Relations
   fields. A direct installed-package probe on `a: 1\n---\nb: 2` corroborated
   the cause: `logLevel="silent"` returned no errors and `{a:1}`, while
   `logLevel="error"` returned parser error `MULTIPLE_DOCS` at offsets
   `[5,14]`.

   This silently discards repository bytes and unknown/raw structure instead
   of preserving or diagnosing them, contrary to `REQ-D-004`, the raw
   CurrentIndex/Relations contracts, and the completion requirement that
   unsupported input not become silent success. Reject a multi-document stream
   with a stable sourced parser diagnostic (or explicitly parse and then reject
   a document count other than one), and add permanent CurrentIndex and
   Relations regression cases.

2. **Finite but unsafe integers are silently rounded in raw YAML and Ledger
   output.**

   `src/core/parsing/yamlSupport.ts:31` configures `intAsBigInt: false`.
   `src/core/parsing/RawValue.ts:87`-`95` accepts every finite JavaScript number
   and checks neither safe-integer range nor exactness. Ledger follows the same
   conversion after native `JSON.parse` at
   `src/core/parsing/parseLedger.ts:63`-`95`.

   An independent probe parsed the integer literal `9007199254740993` in an
   unknown CurrentIndex extension, an invalid numeric `active.slice`, and a
   Ledger object. The raw output in all three places was
   `9007199254740992`. `Number.isSafeInteger` was false for the YAML and Ledger
   results. The unknown YAML extension and Ledger line produced no diagnostic;
   the active field produced only the expected invalid-type diagnostic while
   its preserved raw value was still changed.

   This is silent data corruption rather than raw preservation or explicit
   unsupported-data reporting, violating `REQ-D-004` and the Slice's
   no-coercion/raw-fidelity contract. Preserve exact supported integers or
   diagnose values that cannot be represented safely while retaining native
   `JSON.parse` for NDJSON. Add YAML and Ledger regression cases that assert no
   rounded raw value is exposed without a sourced diagnostic.

### Low

3. **The root README still describes the pre-parser SLC-002 repository.**

   `README.md:3` says `SLC-002` is active and that the application contains no
   SDP parsing. Lines 43 and 47 still label the command/behavior documentation
   as SLC-002, line 52 calls all 14 fixture bodies placeholders, and line 53
   omits `loadCoreTraceability`. CurrentIndex, the Sprint contract and Handoff
   identify SLC-003 as active; the three core fixtures are no longer
   placeholders; and the new parser/application modules are present.

   Update the top-level repository description and boundary summary to describe
   the current raw parser capability without claiming normalization,
   validation, findings or SLC-004 work.

No other actionable dependency, boundary, fixture-size, provenance, location,
NDJSON-recovery, application-isolation, test-gate, UI or traceability finding
was identified.

## Dependency and lock assessment

- `package.json` pins `yaml` exactly at `2.9.0` as a direct runtime dependency.
  The 4,763-line lockfile parses as lockfile version 3 with 271 package entries.
  Its YAML entry resolves the registry tarball with integrity
  `sha512-2AvhNX3mb8zd6Zy7INTtSpl1F15HW6Wnqj0srWlkKLcpYl/gMIMJiyuGq2KeI2YFxUPjdlB+3Lc10seMLtL4cA==`.
- A semantic lock comparison with the accepted baseline found exactly one new
  package key, `node_modules/yaml`, and no removed package key. Baseline
  transitive plugin/schema packages are unchanged; no alternative YAML,
  Markdown, graph, schema or parser-plugin dependency was added by SLC-003.
- Native `JSON.parse` is used once per nonblank Ledger line. No alternate JSON
  parser exists.

## Parser and provenance assessment

- `ParsedSource<T>` is presentation-neutral and supports successful value/no
  diagnostics, partial value/diagnostics and failed no-value/diagnostics
  results. Every parser returns the supplied file-level `SourceRef`.
- CurrentIndex preserves complete raw root/active fields, unknown fields,
  missing supported properties and null values. Invalid supported active types
  remain raw, produce sourced diagnostics and are not copied into typed active
  properties. No ID default, hierarchy check or resolution exists. The unsafe
  integer exception is finding 2.
- Relations preserves installed-profile sections, unknown top-level values,
  stable keys, raw targets, pointers and parser-derived ranges where its AST
  supplies them. Invalid known-section shapes remain raw and receive
  `PARSE_RELATIONS_INVALID_SECTION`. No endpoint or completion interpretation
  exists. The multi-document exception is finding 1.
- Ledger ignores blank lines, parses each nonblank line independently, rejects
  every JSON non-object kind, preserves valid neighbors around malformed
  lines, uses 1-based original-line sequence, accepts a final unterminated
  line, and returns deterministic repeated output. Event type, timestamp,
  duplicate IDs and state are not interpreted. The unsafe integer exception is
  finding 2.
- The documented location convention is implemented for exercised inputs:
  1-based line/column, start-inclusive and end-exclusive. YAML locations derive
  from `LineCounter` and AST/error offsets. Ledger ranges cover the exact
  non-newline line from column 1 through `line.length + 1`. Missing YAML node
  ranges fall back truthfully to structured pointers/file provenance rather
  than fabricated coordinates.

## YAML safety assessment

- Options are frozen and explicitly select YAML 1.2 core, strict parsing,
  unique string keys, merge off, no custom tags and no known extension tags.
  `document.toJS` uses `mapAsMap: false` and alias bound 32 with no reviver.
- Permanent tests reproduced duplicate-key rejection, custom-tag non-execution,
  excessive-alias rejection and cyclic-alias rejection.
- Additional read-only probes confirmed:
  - `!future`, `!!timestamp` and `!!binary` return
    `PARSE_YAML_UNSUPPORTED_TAG`;
  - `!!str` remains an allowed core string tag;
  - a non-string mapping key returns a sourced syntax diagnostic;
  - `merge: false` retains `<<` as a raw key rather than applying a merge;
  - prototype-named keys are retained as ordinary own data properties;
  - non-finite numbers return `PARSE_YAML_NON_SERIALIZABLE_VALUE`.
- No executable constructor, `eval`, Function constructor, dynamic import or
  target-module import exists. Findings 1 and 2 are the remaining safety/raw
  fidelity gaps.

## Application, fixture and boundary assessment

- `loadCoreTraceability` reuses `discoverProject` once, reads the three
  discovered core paths in deterministic CurrentIndex/Relations/Ledger order,
  calls the matching parsers and aggregates discovery, read and parser
  diagnostics. A failed read or malformed source does not erase successful
  neighboring results. It creates no `ProjectSnapshot` and imports no UI or
  fixture module.
- The three core fixture examples are compact and valid: CurrentIndex is 198
  bytes/11 nonblank lines, Relations is 268 bytes/15 nonblank lines, and Ledger
  is 256 bytes/3 nonblank lines. The other 11 fixture paths retain their prior
  small bodies. No live project file was duplicated.
- Core parsing imports no React, React DOM, SharedUI, fixture adapter, browser
  API or Node filesystem API. There is no Markdown parser, normalized
  `Entity`/`Relation`/`LedgerEvent`/`ProjectSnapshot`, cross-file resolution,
  validation rule, finding/fingerprint, filesystem adapter, execution or write
  surface.
- UI source is byte-diff unchanged from accepted SLC-002. Presentation remains
  on the prior discovery preview and does not claim parser health, normalized
  entities or findings.

## Test-contract assessment

The passing 61-test suite represents all 27 minimum cases named by the
SLC-003 contract:

- CurrentIndex cases 1-8 are covered by valid/raw unknown preservation,
  missing, null, invalid type, duplicate key, syntax location and unsupported
  root tests.
- Relations cases 9-14 are covered by valid raw sections, unknown sections,
  malformed source, duplicate key, unsupported root, invalid known section and
  unresolved-target assertions.
- Ledger cases 15-22 are covered by object ordering, blank lines, malformed
  neighbor recovery, all non-object kinds, exact provenance, original-line
  sequence, no-final-newline and repeated determinism.
- Application/boundary cases 23-25 cover read and parse isolation, one discovery
  pass, exactly the three discovered reads, platform/UI/fixture boundaries and
  absence of SLC-004 types.
- Cases 26-27 remain covered by the passing SLC-002 discovery and rendered
  SharedUI tests.

Those minimum cases do not cover multi-document YAML or unsafe integer
fidelity, so their passing result does not resolve findings 1 and 2.

## Verification and traceability assessment

`VER-SLC-003.md` exists, is scoped to SLC-003, records the accepted baseline,
complete uncommitted scope, exact commands, 61-test and focused-test counts,
parser options, location convention, boundary scans, limitations and no-browser
rationale. Every executable gate was independently reproduced.

CurrentIndex, Relations, Scrum, Handoff and implementation notes consistently
keep SLC-003 active pending review and SLC-004 planned. `VER-SLC-003` is related
and ledger event 025 records its passing result. No review relation or event was
pre-created. The ledger is append-only from the accepted baseline.

The verification record accurately reports the commands that passed, but those
commands do not include the failing multi-document and unsafe-integer probes.
Passing command evidence therefore does not override the actionable parser
findings.

## Disposition

**Changes required.** Correct the two medium raw-parser defects, add focused
regression coverage, update the stale README, rerun applicable gates and use a
fresh independent re-review. SLC-003 must remain active and SLC-004 planned.
This review stops at SLC-003.

---

## Correction re-review — 2026-07-12

Reviewer role: second fresh independent SDP Reviewer

### Scope, re-anchoring and state

This correction re-review covers only the corrected current tree for
`SPR-001 / ITR-001 / SLC-003`. It preserves the original findings and
changes-required disposition above as historical evidence. It does not
implement a fix, change product or traceability state, mark the Slice complete,
authorize a transition, commit, stage, push, create a pull request or begin
`SLC-004`.

The re-review independently read the repository instructions and Reviewer and
traceability skills; all current traceability; the linked Study, Requirements,
Architecture, Design Analysis, Design, Implementation and verification-plan
documents; the complete SLC-003 contract; README; the SLC-003 implementation
notes and complete Handoff; the complete original review and correction-bearing
verification record; the package manifest and lock; every implementation and
test file under `src`; and the complete 25-file current delta from accepted
baseline `90bd7b6b0474331e54c5716398ca1bc714b995c2` (11 tracked
modifications plus 14 untracked files, each inspected directly).

Before review, semantic traceability validation confirmed:

- `CurrentIndex.yaml`, Scrum and Relations keep `SPR-001 / ITR-001 / SLC-003`
  active;
- `SLC-004` remains planned;
- the `REV-SLC-003` relation remains `changes_required`, correctly preserving
  the original disposition pending this fresh re-review;
- `VER-SLC-003` remains passed with the exact 14 contract requirement IDs; and
- append-only event `EVT-2026-07-12-027` exists after the original review event
  026 and records the bounded implementation correction.

### Current findings

No remaining actionable finding was identified. No new dependency, parser,
raw-fidelity, provenance, safety, application-isolation, fixture, boundary,
documentation, test, verification or traceability defect was found within the
SLC-003 contract.

### Resolution of the original findings

1. **Multi-document YAML — resolved.**

   `yamlSupport.ts` now uses `logLevel: "error"` and maps package error
   `MULTIPLE_DOCS` to stable `PARSE_YAML_MULTIPLE_DOCUMENTS`. Inspection of the
   installed `yaml@2.9.0` implementation confirmed that `parseDocument` omits
   this structural error only for `silent`; `error` retains it while suppressing
   package warning emission. A direct package probe on
   `a: 1\n---\nb: 2` returned no errors and the first value under `silent`, but
   returned `MULTIPLE_DOCS` at offsets `[5,14]` under `error`.

   A separate no-file Vite module probe supplied distinct first and discarded
   second documents to both CurrentIndex and Relations. Each result had no
   value and exactly one sourced `PARSE_YAML_MULTIPLE_DOCUMENTS` diagnostic
   beginning at the second document marker. No second-document bytes became
   silent success. Permanent regressions assert the same behavior and
   parser-derived ranges.

2. **Unsafe integer rounding — resolved.**

   Shared `toRawValue` now accepts finite numbers, accepts integers only when
   `Number.isSafeInteger` is true, and continues to reject non-finite numbers,
   cycles and unsupported/non-plain values. Direct conversion probes confirmed
   acceptance of `9007199254740991` and `0.5`; rejection of
   `9007199254740992` as `unsafe-integer`; rejection of `Infinity` as
   `non-finite-number`; rejection of `BigInt` and `Map` as unsupported; and
   rejection of a cyclic object as `cyclic-value`.

   The literal `9007199254740993` in YAML now returns no value plus sourced
   `PARSE_YAML_UNSAFE_INTEGER`, and serialized output does not expose rounded
   `9007199254740992`. Ledger still invokes native `JSON.parse` once per
   nonblank line. The same literal on line 2 returns exact-line
   `PARSE_LEDGER_UNSAFE_INTEGER`, omits only line 2, retains neighboring records
   at original sequences 1 and 3 and exposes no rounded value. The permanent
   YAML and Ledger regressions passed.

3. **README — resolved.**

   README now identifies active SLC-003 raw CurrentIndex, Relations and Ledger
   parsing; describes the exact three valid compact core fixture examples;
   identifies `loadCoreTraceability`; truthfully states that the UI remains the
   unchanged discovery preview; and explicitly excludes Markdown parsing,
   normalization, active/relation resolution, state reconstruction,
   validation, findings/fingerprints and SLC-004 behavior. The stale-text scan
   found no remaining SLC-002/no-parser/all-placeholder claim.

### Full SLC-003 contract assessment

- `package.json` pins direct runtime `yaml` exactly at `2.9.0`. The lock parses
  as version 3 with 271 package entries, the expected registry URL and integrity
  hash. Relative to the accepted baseline, `node_modules/yaml` is the only
  added package key and no key is removed. The only common-package metadata
  movement is npm peer marking for existing `jiti` and `picomatch`; their
  versions and resolved artifacts are unchanged. No alternative YAML/JSON,
  Markdown, schema, graph or parser-plugin dependency was added.
- `ParsedSource<T>` remains framework-neutral and distinguishes success,
  diagnostic-bearing partial output and failure without a value. Every parser
  retains the supplied file-level source.
- CurrentIndex preserves raw project/planning/active/unknown values, missing
  fields and nulls. Invalid supported active types remain raw, are not coerced
  into typed declarations and receive sourced diagnostics. No identifier,
  hierarchy or existence resolution occurs.
- Relations preserves top-level order, known and unknown sections, stable keys,
  raw targets, structured pointers and reliable AST-derived ranges. Invalid
  known section shapes remain raw with diagnostics. No endpoint, completion or
  cross-file interpretation occurs.
- Ledger parses every nonblank line independently with native `JSON.parse`,
  rejects non-object values, preserves valid neighbors, uses original 1-based
  source-line sequence, accepts a final unterminated line and remains
  deterministic. It does not interpret event types, timestamps, duplicate IDs
  or repository state.
- The documented 1-based, start-inclusive/end-exclusive convention is retained.
  YAML locations derive from package offsets; Ledger ranges cover exact source
  lines; pointer-only fallbacks do not fabricate coordinates.
- `logLevel: "error"` does not weaken other safety. Independent probes still
  returned `PARSE_YAML_DUPLICATE_KEY`, `PARSE_YAML_UNSUPPORTED_TAG`,
  `PARSE_YAML_ALIAS_LIMIT` and `PARSE_YAML_NON_SERIALIZABLE_VALUE` for duplicate
  keys, a known extension tag, excessive aliases, a cyclic alias and non-finite
  YAML respectively. The options remain YAML 1.2/core, strict, unique string
  keys, merge disabled, frozen empty custom tags, known extension tags disabled
  and alias expansion bounded at 32. No target module import or evaluation
  surface exists.
- `loadCoreTraceability` reuses one SLC-002 discovery pass, reads only the three
  discovered core paths in deterministic CurrentIndex/Relations/Ledger order,
  aggregates diagnostics and preserves successful neighboring parse results
  across read or parse failure. It creates no normalized snapshot.
- The fixture still contains exactly 14 deterministic small files. Only the
  three core bodies are compact valid profile examples; the other 11 remain
  placeholders. Deliberately malformed cases remain in tests.
- Implementation-only scans found no React, React DOM, SharedUI, fixture,
  browser/Node filesystem, execution, write, Markdown parser, normalized model,
  validation rule, finding/fingerprint or `SDP001`-`SDP008` surface in parsing
  or `loadCoreTraceability`. The parser-call scan found only `parseDocument`
  and native `JSON.parse`.
- All 27 minimum contract cases remain represented by the passing test suite,
  with the four correction regressions added. Existing SLC-001/SLC-002 and
  rendered SharedUI coverage remain passing.

### Independent command and probe evidence

- `npm ci`: passed; 270 packages added, 271 audited, zero vulnerabilities.
- `npm run typecheck`: passed with no diagnostics.
- Corrected focused command
  `npm test -- src/core/parsing/parseCurrentIndex.test.ts src/core/parsing/parseRelations.test.ts src/core/parsing/parseLedger.test.ts src/core/parsing/parserBoundaries.test.ts --reporter=verbose`:
  passed, 4 files and all 36 tests. Verbose output explicitly showed both
  multi-document, both unsafe-integer and all retained safety/provenance cases.
- Supplemental fixture/application focused command: passed, 2 files and all 9
  tests, including exact core examples, one discovery pass and read/parse
  failure isolation.
- `npm test`: passed, 9 files and all 65 tests.
- `npm run build`: passed; TypeScript completed, Vite `8.1.4` transformed 1,976
  modules and emitted 0.53 kB HTML, 72.91 kB CSS and 510.87 kB JavaScript
  (150.91 kB gzip). The existing non-failing chunk-size warning remains.
- `npm ls SharedUI yaml --depth=0`: passed with `SharedUI@0.1.0` and
  `yaml@2.9.0`.
- `git diff --check`: passed; output contained only Windows LF-to-CRLF notices.
- `git diff --quiet 90bd7b6b0474331e54c5716398ca1bc714b995c2 -- src/ui src/main.tsx`:
  passed with no UI source difference. Root UI/build configuration is likewise
  unchanged.
- Corrected implementation-only boundary scans and the README stale-text scan
  passed. One initial broad scan matched local TypeScript identifiers named
  `node`/`document`; narrowing it to actual Node/DOM API patterns removed that
  scan-design false positive.
- Strict unique-string-key YAML validation passed for CurrentIndex and
  Relations. All 27 nonblank Ledger lines parsed as JSON objects with 27 unique
  event IDs, and the accepted baseline's first 22 lines remain byte-for-line
  unchanged. All active/planned/review/verification/correction semantic
  assertions passed.

Two initial inline adverse-probe launch attempts failed before importing any
product module because of Windows native-argument quoting and module-eval
mechanics. The corrected no-file Vite harness then ran successfully and
produced the parser evidence recorded above; these were probe-harness failures,
not product failures.

No lint command is configured, so lint was not run. No live browser check was
performed or claimed because UI source is unchanged; the rendered jsdom test
passed within the 65-test suite and UI no-diff was independently confirmed.

### Final correction re-review disposition

**Approved.** The corrected current tree satisfies the SLC-003 contract and
has no remaining actionable finding. This approval supersedes the historical
changes-required disposition only for the current corrected tree; the original
review evidence above remains intact. SLC-003 remains active and SLC-004
remains planned until the Master integrates this result into traceability and
makes any completion decision from the full evidence. This re-review stops at
SLC-003.
