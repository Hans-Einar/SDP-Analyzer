# VER-SLC-003 — Core traceability parsers

Status: passed; final independent review approved
Verification ID: `VER-SLC-003`
Slice: `SLC-003`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

## Scope verified

This record verifies the complete uncommitted SLC-003 transition and product
tree against the active contract in
`SDP/Sprints/SPR-001/ScrumIterations.md`.

The supervising architect accepted committed SLC-002 state
`90bd7b6b0474331e54c5716398ca1bc714b995c2`. Before product implementation,
the Master recorded that acceptance, expanded and activated SLC-003, advanced
`CurrentIndex.yaml` and appended ledger events 023-024. Product implementation
was then delegated to a bounded Worker.

Verified product scope:

- exact direct `yaml` dependency in `package.json` and `package-lock.json`;
- `src/core/parsing/ParsedSource.ts`;
- `src/core/parsing/RawValue.ts`;
- `src/core/parsing/yamlSupport.ts`;
- `src/core/parsing/parseCurrentIndex.ts` and its tests;
- `src/core/parsing/parseRelations.ts` and its tests;
- `src/core/parsing/parseLedger.ts` and its tests;
- `src/core/parsing/parserBoundaries.test.ts`;
- `src/application/loadCoreTraceability.ts` and its tests;
- the three valid core examples in the existing bundled fixture and their test;
- the SLC-003 Worker evidence in `implementationNotes.md`; and
- the Master-authored activation/verification traceability and this record.

No UI source changed. No normalized snapshot, entity, relation, ledger-event,
validation-rule, finding, filesystem adapter or SLC-004 product surface is in
the verified tree.

## Environment and repository state

- Operating system: Windows
- Node.js: `v24.11.0`
- npm: `11.6.1`
- branch: `main`
- committed baseline: `90bd7b6b0474331e54c5716398ca1bc714b995c2`
- working tree: uncommitted by explicit supervising instruction

## Commands and outcomes

### Clean dependency installation

Command:

```powershell
npm ci
```

Outcome: passed with exit code 0. npm added 270 packages, audited 271 packages
in 14 seconds and reported zero vulnerabilities.

### Strict TypeScript

Command:

```powershell
npm run typecheck
```

Outcome: passed with exit code 0 and no TypeScript diagnostics.

### Complete automated suite

Command:

```powershell
npm test
```

Outcome: passed with exit code 0 under Vitest `4.1.10`: 9 test files and all
61 tests passed. This includes the unchanged SLC-001/SLC-002 tests and the
jsdom-rendered SharedUI application smoke.

### Static production build

Command:

```powershell
npm run build
```

Outcome: passed with exit code 0. TypeScript completed first. Vite `8.1.4`
transformed 1,976 modules and emitted 0.53 kB HTML, 72.88 kB CSS and 510.87 kB
JavaScript (150.91 kB gzip). The existing non-failing warning for a minified
chunk larger than 500 kB remains.

### Exact direct dependencies

Command:

```powershell
npm ls SharedUI yaml --depth=0
```

Outcome: passed with exit code 0 and resolved `SharedUI@0.1.0` and
`yaml@2.9.0`. The manifest pins `yaml` as exact version `2.9.0`; the lockfile
records its registry URL and integrity hash. No alternative YAML, Markdown,
schema, graph or parser-plugin dependency was added.

### Focused safety, provenance and boundary suite

Command:

```powershell
npm test -- src/core/parsing/parseCurrentIndex.test.ts src/core/parsing/parseLedger.test.ts src/core/parsing/parserBoundaries.test.ts --reporter=verbose
```

Outcome: passed with exit code 0: 3 test files and all 24 tests passed. The
individual cases exercised:

- CurrentIndex raw/unknown preservation, missing values and nulls;
- invalid active types without coercion;
- duplicate-key rejection with a parser-derived second-key location;
- 1-based, start-inclusive/end-exclusive YAML locations;
- non-map roots;
- rejection of an executable-looking custom tag without execution;
- the finite alias-expansion bound and cyclic-alias rejection;
- source-kind mismatch;
- ordered Ledger objects, blank-line sequencing and malformed-middle recovery;
- every JSON non-object kind;
- exact line provenance, final unterminated input and repeated determinism; and
- import, platform, execution and SLC-004 boundary assertions.

### Focused Relations and application suite

Command:

```powershell
npm test -- src/core/parsing/parseRelations.test.ts src/application/loadCoreTraceability.test.ts --reporter=verbose
```

Outcome: passed with exit code 0: 2 test files and all 12 tests passed. The
individual cases exercised stable raw section/key/value preservation, unknown
sections, sourced malformed YAML, duplicate stable keys, non-map roots,
diagnostic-bearing invalid known sections, one discovery pass, only the three
discovered reads, read-failure isolation and parse-failure isolation.

### Whitespace and UI-change checks

Commands:

```powershell
git diff --quiet -- src/ui src/main.tsx
git diff --check
```

Outcomes: passed. No UI source differs from the accepted SLC-002 baseline.
`git diff --check` returned exit code 0; output was limited to the repository's
existing Windows LF-to-CRLF working-copy notices.

No lint command is configured, so lint was not run. Because no UI source
changed, a new live browser smoke was not required or claimed; the unchanged
rendered application test passed within the 61-test suite.

## Parser options and security inspection

The Master read every parser implementation and test directly. YAML parsing
uses `yaml@2.9.0` `parseDocument` with a package `LineCounter` and these explicit
options:

- YAML version `1.2` and schema `core`;
- `strict: true`, `uniqueKeys: true`, `stringKeys: true`;
- `merge: false`;
- frozen empty `customTags` and `resolveKnownTags: false`;
- `intAsBigInt: false`, `keepSourceTokens: false`;
- `prettyErrors: false` and silent library logging.

Materialization uses
`document.toJS({ mapAsMap: false, maxAliasCount: 32 })` without a reviver.
The subsequent conversion admits only null, booleans, finite numbers, strings,
arrays and plain string-keyed objects. It diagnoses cyclic aliases, non-finite
numbers and non-plain objects. Parser errors, duplicate keys, unsupported tags,
alias limits and unsafe materialization become sourced parser diagnostics; no
repository module is imported and no arbitrary JavaScript evaluation surface
exists.

The custom-tag test kept its global marker false. The excessive-alias test
returned `PARSE_YAML_ALIAS_LIMIT`. Duplicate keys returned
`PARSE_YAML_DUPLICATE_KEY`. These results demonstrate the configured behavior
rather than relying only on option inspection.

## Raw-model and malformed-input inspection

- `ParsedSource<T>` carries the file-level `SourceRef`, readonly diagnostics
  and an optional value, distinguishing success, partial value plus diagnostics
  and failure without a value.
- CurrentIndex preserves its complete raw root and raw active mapping. Supported
  active fields copy only string/null values into typed properties. Invalid
  values remain raw, produce sourced diagnostics and are not coerced. Missing
  fields remain absent and no active ID is resolved.
- Relations preserves every top-level value, source order, unknown section,
  stable entry and raw target. Section and entry pointers are retained where
  parser ranges are reliable. No relation endpoint or completion evidence is
  interpreted.
- Ledger uses native `JSON.parse` once per nonblank line. Valid records around
  malformed or non-object lines survive. Record sequence equals the 1-based
  original source line, and every record/diagnostic covers that exact line.
  Event IDs, timestamps, duplicate IDs and state are not interpreted.
- The application operation calls SLC-002 `discoverProject`, reads its three
  discovered sources in deterministic order and aggregates diagnostics. A
  failed read or failed parse does not erase neighboring successful results.

## Location convention

Line and column numbers are 1-based, start-inclusive and end-exclusive. YAML
locations derive only from `LineCounter` plus AST/error offsets. Ledger
locations cover column 1 through `line.length + 1` on the exact source line.
When the YAML package exposes only a reliable structured pointer, the parser
retains that pointer without fabricating a range. Permanent tests assert both
YAML and Ledger conventions.

## Static boundary and scope inspection

Implementation-only scans of `src/core/parsing` and
`src/application/loadCoreTraceability.ts` found:

- no React, React DOM or SharedUI import;
- no browser or Node filesystem import/global;
- no fixture coupling;
- no `eval`, `Function` constructor or dynamic import;
- no write or filesystem-adapter API; and
- no `ProjectSnapshot`, normalized `LedgerEvent`, validation-rule, finding,
  fingerprint or `SDP001` through `SDP008` surface.

The first broad Master scan included `parserBoundaries.test.ts`, so it matched
the forbidden browser-token expression inside the test's own regular
expression. The corrected implementation-only scan excluded `*.test.ts` and
passed all four boundary groups. This was a scan-design false positive, not a
product boundary violation.

A parser-call scan found only the `parseDocument` import/call in
`yamlSupport.ts` and the single native `JSON.parse` call in `parseLedger.ts`.
A direct-dependency scan found none of the prohibited alternative parser or
schema packages. `git diff --quiet` confirmed no UI source change.

## Traceability verification

Read-only strict unique-key parsing succeeded for `CurrentIndex.yaml` and
`Relations.yaml`. All 24 nonblank Ledger lines parsed as JSON objects with
unique event IDs. The first 22 accepted baseline events remain unchanged;
events 023-024 append supervising architect acceptance of SLC-002 and SLC-003
activation.

`CurrentIndex.yaml` identifies `SPR-001 / ITR-001 / SLC-003` as active.
`Relations.yaml` keeps SLC-001 and SLC-002 completed, identifies SLC-003 as
active with its exact requirements/references, and keeps SLC-004 planned.

## Worker development evidence retained

The Worker recorded three corrected development issues in
`implementationNotes.md`: two strict TypeScript authoring errors, one boundary
test false positive caused by a local YAML `document` identifier, and four
Markdown trailing-space findings after notes were appended. The Worker
corrected each before its final checks. The Master clean-install and full
verification sequence above independently passed on the handed-back tree.

## Limitations and discoveries

- The parser intentionally supports syntax and raw installed-profile structure
  only. Cross-file normalization, resolution, state reconstruction, validation
  and findings belong to later Slices.
- Known Relations section-shape diagnostics are limited to the installed
  profile's current stable top-level sections; unknown sections are preserved
  raw rather than rejected.
- The fixture contains compact valid examples rather than the full live SDP
  documents.
- No live browser check was run because UI source is unchanged.
- No lint command is configured.
- The existing SharedUI bundle-size warning remains non-failing.

## Result

All applicable initial SLC-003 Master verification gates passed. The fresh
independent review subsequently identified malformed/raw inputs not covered by
those initial gates; its changes-required evidence is recorded below. SLC-003
remains active, `CurrentIndex.yaml` remains on SLC-003 and SLC-004 remains
planned and untouched.

## Initial independent review result

Fresh `REV-SLC-003` independently reproduced the clean install, typecheck,
61-test suite, build, dependency resolution, focused 24-test and 12-test suites,
boundary checks, whitespace check and traceability validation. It then used
read-only edge probes to identify:

1. `logLevel: "silent"` suppresses `yaml@2.9.0`'s `MULTIPLE_DOCS` error, so
   both YAML parsers expose only the first document and silently discard later
   document bytes;
2. the integer literal `9007199254740993` is exposed as rounded raw value
   `9007199254740992` in YAML and Ledger output without an explicit unsupported
   value diagnostic; and
3. README still describes SLC-002, no parsing and all-placeholder fixture
   bodies.

The review disposition is changes required. Passing initial commands remain
valid evidence, but they do not override these findings. A bounded correction,
applicable verification reruns and fresh independent re-review are required
before completion.

## Correction verification — 2026-07-12

A fresh bounded correction Worker addressed exactly the three initial review
findings. The Master inspected the corrected source/tests and independently
repeated applicable gates.

### Corrected behavior

- YAML logging changed from `silent` to `error`. This remains quiet for package
  warnings while allowing `yaml@2.9.0` `parseDocument` to retain its
  `MULTIPLE_DOCS` structural error. That error maps to stable
  `PARSE_YAML_MULTIPLE_DOCUMENTS` with parser-derived source range, and neither
  CurrentIndex nor Relations exposes a first-document value.
- Shared raw conversion now rejects integer numbers outside
  `Number.isSafeInteger`. YAML returns sourced `PARSE_YAML_UNSAFE_INTEGER` and
  no value. Ledger retains native `JSON.parse`, emits exact-line
  `PARSE_LEDGER_UNSAFE_INTEGER`, omits only that record and retains neighboring
  valid records at their original source-line sequences. No rounded raw value
  is exposed.
- README now describes active SLC-003 raw parsing, the three compact valid core
  fixture examples, `loadCoreTraceability`, unchanged discovery-preview UI and
  the explicit absence of normalization, resolution, validation, findings and
  SLC-004 behavior.

All prior YAML 1.2/core, strictness, unique string key, merge, custom/known tag,
alias-bound and serializable-value protections remain. No dependency, fixture,
application or UI source changed during the correction.

### Correction commands and outcomes

Command:

```powershell
npm ci
```

Outcome: passed with exit code 0; 270 packages added, 271 audited in 8 seconds,
zero vulnerabilities.

Command:

```powershell
npm run typecheck
```

Outcome: passed with exit code 0 and no TypeScript diagnostics.

Command:

```powershell
npm test -- src/core/parsing/parseCurrentIndex.test.ts src/core/parsing/parseRelations.test.ts src/core/parsing/parseLedger.test.ts src/core/parsing/parserBoundaries.test.ts --reporter=verbose
```

Outcome: passed with exit code 0: 4 files and all 36 tests passed. The verbose
run explicitly passed the four new cases for CurrentIndex/Relations
multi-document rejection, YAML unsafe-integer rejection and line-isolated
Ledger unsafe-integer rejection, along with the prior duplicate/tag/alias,
provenance, malformed-line and boundary cases.

Command:

```powershell
npm test
```

Outcome: passed with exit code 0: 9 files and all 65 tests passed, including
preserved SLC-001/SLC-002 and rendered SharedUI coverage.

Command:

```powershell
npm run build
```

Outcome: passed with exit code 0. Vite `8.1.4` transformed 1,976 modules and
emitted 0.53 kB HTML, 72.91 kB CSS and 510.87 kB JavaScript (150.91 kB gzip).
The existing non-failing chunk-size warning remains.

Command:

```powershell
npm ls SharedUI yaml --depth=0
```

Outcome: passed with `SharedUI@0.1.0` and direct `yaml@2.9.0`.

Implementation-only UI/platform, browser/execution, later-Slice model/rule and
write/filesystem-adapter scans all passed. The README stale-text scan passed
and showed the current SLC-003, parser, application and non-goal descriptions.
`git diff --quiet -- src/ui src/main.tsx` confirmed no UI change.
`git diff --check` passed with only existing LF-to-CRLF notices. Unique-key
traceability YAML and 26 append-only object events validated before correction
integration; SLC-003 remained active, the original review remained
changes-required and SLC-004 remained planned.

No lint command is configured. No new live browser run was performed because
UI source remains unchanged; the rendered test passed within the 65-test suite.

### Correction result

The Master correction verification passes. Ledger event 027 records the
bounded correction. The original independent findings and changes-required
disposition remain historical evidence pending fresh independent re-review.
SLC-003 remains active, CurrentIndex remains on SLC-003 and SLC-004 remains
planned and untouched.

## Final Reviewer confirmation

The second fresh independent Reviewer re-anchored from the complete corrected
tree, preserved the original findings as history and independently reproduced:

- `npm ci`, strict typecheck, the 4-file/36-test focused suite, the full
  9-file/65-test suite, production build and exact direct dependencies;
- direct multi-document CurrentIndex/Relations probes with sourced rejection;
- YAML and Ledger unsafe-integer probes with no rounded raw output and retained
  Ledger neighbors;
- duplicate-key, extension-tag, alias-limit, cyclic-alias and non-finite-value
  protections under `logLevel: "error"`;
- fixture/application focused tests, implementation boundaries, README scope,
  UI no-diff, whitespace and append-only traceability checks.

The final `REV-SLC-003` disposition is approved with no remaining or new
actionable finding. Two failed adverse-probe launch attempts were attributed to
Windows command quoting before any product import; the corrected no-file Vite
harness ran and produced the evidence above.

## Final result

All applicable SLC-003 verification gates pass and final independent review is
approved. Relations and ledger events 028-029 record approval and Slice
completion. `CurrentIndex.yaml` remains on SLC-003 for supervising acceptance;
SLC-004 remains planned and untouched.
