# SLC-001 Implementation Notes

Status: completed; independent review approved; supervising architect accepted
Slice: `SLC-001`  
Sprint: `SPR-001`  
Iteration: `ITR-001`  
Date: 2026-07-11

These notes integrate Worker implementation facts, Master verification,
independent review, and final traceability state. Exact evidence remains in the
verification and review records.

## Master verification

The Master independently inspected the complete changed tree and reran clean
installation, SharedUI resolution, strict typecheck, both tests, the production
build, import/boundary scans, and a rendered browser smoke on 2026-07-11. All
applicable gates passed. Exact commands and outcomes are recorded in
`SDP/Verification/VER-SLC-001.md`.

## Independent review and completion

The first fresh Reviewer found no product, SharedUI, dependency, test, or build
defect, but required the `SLC-001` relation to include authoritative
`REQ-UI-004` and foundation-only `REQ-UI-001`. A bounded correction Worker
added exactly those IDs and validated the YAML. A second fresh Reviewer verified
the correction, preserved the original finding history, and approved the
current tree with no remaining actionable finding.

`Relations.yaml` now relates `SLC-001` to `VER-SLC-001` and
`REV-SLC-001`; the ledger records verification, the initial review finding,
the correction, final approval, and Slice completion. The supervising architect
accepted SLC-001 on 2026-07-11; `CurrentIndex.yaml` now points to
`SPR-001 / ITR-001 / SLC-002`.

## Decisions

- Selected npm because Node.js `v24.11.0` and npm `11.6.1` are available and no package manager or lockfile previously existed.
- Added one `package-lock.json`; dependency versions are exact in `package.json` and SharedUI resolves from `file:SharedUI-0.1.0.tgz` with an integrity hash in the lockfile.
- Read the installed `node_modules/SharedUI/README.md`, `docs/PACKAGE_INSTALLATION.md`, and `src/components/baseline/COMPONENT_CONTRACTS.md` in full before authoring UI.
- Kept the source boundary to `sourceId`, `displayName`, deterministic file listing, and text reading. The fixture is one in-memory text file and exposes no write operation.
- Added one application function that lists and reads the first fixture file into a presentation-neutral preview. It performs no parsing, normalization, validation, or repository discovery.
- Built the shell with `DashboardRenderer`, `defineDashboardConfig`, and a registry spread from `baselineComponentRegistry`.
- Reused SharedUI `TopNav`, `PageHeader`, `Section`, `Badge`, `CardSkeleton`, `AlertBanner`, and `DetailPanel`. No local UI component, raw shadcn import, CSS file, token layer, or generic SharedUI equivalent was added.
- Defined the `selectedSource` validator and an explicit system-owned state policy that permits only `trusted-runtime` updates. The current static shell does not update that state.
- Imported `SharedUI/styles.css` once, in `src/main.tsx`.
- Did not configure lint; the required strict typecheck, tests, and production build are separate deterministic scripts.

## SharedUI packaging discovery

The initial `npm run build` failed because the packed `SharedUI/styles.css` imports `tailwindcss` and `tw-animate-css`, while those packages and the Tailwind Vite plugin are SharedUI development dependencies and are not listed in its package-installation guide as consumer requirements. The consuming app now pins the same build-time versions (`@tailwindcss/vite` `4.2.2`, `tailwindcss` `4.2.2`, and `tw-animate-css` `1.4.0`) and enables the Tailwind Vite plugin. SharedUI itself and its tarball were not modified or unpacked into application source.

The successful production build also reports a non-failing warning that the generated JavaScript chunk is larger than 500 kB after minification. SLC-001 is required to start from the full `baselineComponentRegistry`; code splitting is deferred because it would expand this foundation Slice.

## Worker verification evidence

- `npm install`: passed; installed the initial dependency tree and resolved `SharedUI@0.1.0` from the local tarball. After adding the documented build-time workaround, the dependency audit reported 270 packages and zero vulnerabilities.
- Initial `npm run typecheck`: failed with three skeleton-authoring type errors (stylesheet declaration, Vite `ImportMeta`, and a TypeScript 7 interface/record constraint). Adding the Vite client declaration and using a type alias resolved them.
- Initial `npm test`: passed, 2 test files and 2 tests.
- Initial `npm run build`: failed because the packed SharedUI stylesheet's undeclared Tailwind imports could not be resolved. The SharedUI packaging discovery above records the bounded resolution.
- Subsequent `npm run typecheck`: passed.
- Subsequent `npm run build`: passed; Vite transformed 1,974 modules and emitted static `dist/` assets, with only the non-failing chunk-size warning described above.
- Final `npm ci`: passed; added 269 packages, audited 270 packages, and reported zero vulnerabilities.
- Final `npm run typecheck`: passed with TypeScript `7.0.2` and no diagnostics.
- Final `npm test`: passed with Vitest `4.1.10`; 2 test files passed and 2 tests passed. One Node-environment contract test lists and reads the fixture through `ProjectSource`; one jsdom rendered test opens the SharedUI shell and asserts the bundled fixture name, first file path, and ready state.
- Final `npm run build`: passed with Vite `8.1.4`; 1,974 modules transformed and static HTML/CSS/JavaScript assets emitted. The only warning was the recorded JavaScript chunk-size warning.
- `npm ls SharedUI --depth=0`: passed and reported `SharedUI@0.1.0`.
- Import inspection found exactly one `SharedUI/styles.css` import in `src`, located at `src/main.tsx:3`.
- Boundary inspection found zero SharedUI imports and zero React/React DOM imports in `src/core`, `src/application`, and `src/adapters`.
- UI inspection found zero raw `SharedUI/components/shadcn` imports and no local CSS or local generic baseline component implementation.
- Scope inspection found no parser, YAML, NDJSON, Markdown, normalization, validation-rule, or findings implementation in `src` or `package.json`.
- Lockfile inspection found only `package-lock.json`.

## Changed files

- `.gitignore`
- `AGENTS-project.md`
- `README.md`
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `src/vite-env.d.ts`
- `src/main.tsx`
- `src/core/source/ProjectSource.ts`
- `src/application/loadSourcePreview.ts`
- `src/adapters/fixtures/bundledFixtureSource.ts`
- `src/adapters/fixtures/bundledFixtureSource.test.ts`
- `src/ui/App.tsx`
- `src/ui/App.test.tsx`
- `src/ui/dashboardConfig.ts`
- `SDP/CodeReview/REV-SLC-001.md`
- `SDP/Traceability/Relations.yaml`
- `SDP/Traceability/Ledger.ndjson`
- `SDP/Verification/VER-SLC-001.md`
- `SDP/Sprints/SPR-001/ScrumIterations.md`
- `SDP/Sprints/SPR-001/Handoff.md`
- `SDP/Sprints/SPR-001/implementationNotes.md`

The supplied `SharedUI-0.1.0.tgz` was not implementation-authored and is now
tracked in the repository, preserving the local file dependency.

## Limitations and stop boundary

- The fixture is intentionally a single bundled text record; full path rules, discovery, provenance, and adapter contract breadth belong to `SLC-002`.
- There are no parser dependencies or CurrentIndex, Relations, Ledger, Markdown, normalization, validation, findings, filesystem API, graph, global state, CLI, service, or mutation features.
- The Worker did not pre-claim verification, review, or completion. The Master
  integrated those records and statuses only after real verification and final
  Reviewer approval.
- Work stopped at `SLC-001`; `SLC-002` was not started.

---

## SLC-002 Worker Implementation

Status: completed; final independent review approved; supervising architect accepted
Slice: `SLC-002`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-11

This section records the bounded Worker pass only. It does not create or claim
`VER-SLC-002`, `REV-SLC-002`, Slice completion, or supervising acceptance.
The Master-authored activation changes to `ScrumIterations.md`, `Handoff.md`,
`CurrentIndex.yaml`, `Relations.yaml`, and ledger events 016-017 were preserved.

### Decisions

- Added the exact readonly `SourceKind`, `SourceRef`, `DiagnosticSeverity` and
  `Diagnostic` contracts from `DES-001`, without parser records, entities,
  validation findings or UI types.
- Implemented path normalization as a pure discriminated result. It converts
  backslashes, canonically collapses redundant separators, and explicitly
  rejects empty, rooted/absolute, drive-letter, `.` and `..` paths. The
  implementation imports no Node or browser filesystem API.
- Kept `ProjectSource` unchanged and read-only; its existing list/read boundary
  was already sufficient for discovery and canonical fixture reads.
- Replaced the one-file smoke fixture with the exact 14 placeholder text files
  named by the SLC-002 contract. Fixture listings use deterministic code-point
  path ordering. Fixture reads require an exact known canonical path and throw
  typed `FixtureSourceReadError` codes for unsafe, non-canonical and unknown
  paths. Internal fixture data is frozen and no mutation API exists.
- Added `discoverProject(ProjectSource)`, which calls `listFiles()` only,
  normalizes and canonically sorts paths, classifies recognized extensions,
  records standard directory presence, locates the exact three core files, and
  attaches `SourceRef` provenance to every discovered file.
- Discovery support is deliberately structural in this Slice: all three exact
  core traceability paths produce `sdp-toolkit-current / supported`; any missing
  core path produces `partial` plus a stable
  `DISCOVERY_MISSING_CORE_SOURCE` diagnostic. File contents, IDs, statuses and
  active-work semantics are not inspected. Standard directory presence is
  reported separately and does not add content/profile inference.
- Because the authoritative `SourceKind` union has no `unknown` member,
  unrecognized extensions remain visible as `synthetic` with an explicit
  informational discovery diagnostic. The bundled fixture contains no such
  source.
- Retained the SLC-001 sample text read in the application preview, but now runs
  discovery first and exposes truthful file count, 3/3 core-source count,
  profile support and discovery diagnostic count. The SharedUI dashboard reuses
  only its existing `PageHeader`, `Section`, `Badge`, `CardSkeleton`,
  `AlertBanner`, `DetailPanel`, `TopNav` and renderer/config surfaces; no local
  component or primitive was added.

### Worker-changed files

- `README.md`
- `src/core/source/SourceRef.ts`
- `src/core/source/projectPath.ts`
- `src/core/source/projectPath.test.ts`
- `src/core/diagnostics/Diagnostic.ts`
- `src/core/discovery/ProjectDiscoveryManifest.ts`
- `src/core/discovery/discoverProject.ts`
- `src/core/discovery/discoverProject.test.ts`
- `src/adapters/fixtures/bundledFixtureSource.ts`
- `src/adapters/fixtures/bundledFixtureSource.test.ts`
- `src/application/loadSourcePreview.ts`
- `src/ui/dashboardConfig.ts`
- `src/ui/App.test.tsx`
- `SDP/Sprints/SPR-001/implementationNotes.md` (this appended section only)

### Tests and coverage

- Path tests cover canonical input, Windows separators, redundant separators,
  rooted/absolute and UNC-like input, drive letters, empty input, `.` segments,
  `..` traversal and Windows-form traversal.
- Fixture tests assert the exact 14 paths and deterministic repeated ordering,
  a known canonical read, and explicit unknown, unsafe and non-canonical read
  failures.
- Discovery tests assert all three exact core sources, all seven lifecycle
  directories plus standard directory booleans, 14 provenance-bearing files,
  YAML/JSON/NDJSON/Markdown classification, canonical sorting after Windows
  input, repeated deterministic manifests, missing-core partial support and
  diagnostic output, rejected traversal, and zero `readText()` calls.
- The existing jsdom-rendered application test now verifies the SharedUI shell,
  fixture-ready state, first canonical file, 14 files, 3/3 core files,
  `supported` profile and zero discovery diagnostics.

### Worker command evidence

- An early `npm run typecheck` development check failed with four authoring
  errors: three unsupported Vitest matcher type arguments and one invalid
  TypeScript filter predicate. Those were corrected before verification.
- A subsequent `npm run typecheck` passed and `npm test` passed with 4 test
  files and 22 tests before the final recognized-extension assertion was added.
- `npm ci`: passed; added 269 packages, audited 270 packages in 11 seconds, and
  reported zero vulnerabilities.
- Final `npm run typecheck`: passed with no TypeScript diagnostics.
- Final `npm test`: passed with Vitest `4.1.10`; 4 test files passed and 23
  tests passed. The rendered `src/ui/App.test.tsx` smoke check is included.
- Final `npm run build`: passed with Vite `8.1.4`; 1,976 modules transformed and
  `dist/index.html`, 72.88 kB CSS and 510.07 kB JavaScript assets emitted. The
  existing non-failing greater-than-500-kB chunk warning remains.
- `npm ls SharedUI --depth=0`: passed and reported `SharedUI@0.1.0`.
- Final `git diff --check`: passed after the Worker notes were appended, with
  only Git's existing LF-to-CRLF working-copy warnings.
- Boundary scan
  `rg -n 'from\s+["''](?:react|react-dom|SharedUI)|import\s+["'']SharedUI' src/core src/application src/adapters`
  found no React, React DOM or SharedUI import below the UI boundary.
- Core-runtime scan
  `rg -n '\b(window|document|navigator|FileSystemDirectoryHandle|process|Buffer)\b|node:|from\s+["''](?:fs|path)["'']' src/core`
  found no browser/Node globals, `node:` imports or `fs`/`path` imports.
- Scope scan
  `rg -n 'JSON\.parse|parseDocument|remarkParse|ValidationRule|FindingSeverity|fingerprint|showDirectoryPicker|FileSystemDirectoryHandle|node:fs|from\s+["'']fs["'']|writeFile|appendFile|createWriteStream|exec\(|spawn\(' src package.json`
  found no content-parser calls, validation/finding model, filesystem adapter,
  execution or write API.
- Parser-dependency scan
  `rg -n '"(?:yaml|js-yaml|remark|remark-parse|unified|gray-matter|markdown-it)"\s*:' package.json`
  found no direct parser dependency declaration. A supplementary
  `npm ls yaml js-yaml remark remark-parse unified gray-matter markdown-it --depth=0`
  printed `(empty)`; npm returned its expected exit code 1 because none of the
  explicitly queried packages are installed at depth zero.
- `rg -n 'SharedUI' src` showed SharedUI imports only in `src/ui` plus the one
  `SharedUI/styles.css` entry import in `src/main.tsx`; the remaining match was
  rendered-test description text.
- No lint command is configured, so no lint check was run. The Worker did not
  perform a manual browser check; the rendered automated check passed and the
  Master will perform independent browser verification if required.

### Limitations, discoveries and stop boundary

- The 14 fixture contents are intentionally small placeholders and are not
  parsed or asserted as valid YAML, JSON, NDJSON or Markdown records. Content
  parsing belongs to SLC-003.
- Discovery support describes the required path structure only. It cannot claim
  schema/content compatibility until later parsing and profile work exists.
- The pre-existing SharedUI production chunk remains 510.07 kB after
  minification and triggers Vite's non-failing size warning; no bundle redesign
  was authorized in this Slice.
- No browser or Node filesystem source, handle, parser, entity model, active-work
  model, validation rule, finding, CLI/CI surface, mutation or execution path
  was added.
- `CurrentIndex.yaml`, `Relations.yaml`, `Ledger.ndjson`, Scrum/Handoff status,
  `SLC-003`, `VER-SLC-002` and `REV-SLC-002` were not changed by the Worker.
  The result is pending Master verification and a fresh independent Reviewer.
- Work stopped at the SLC-002 boundary; SLC-003 was not begun.

### Master verification

The Master independently inspected the complete product and transition diff,
reran clean installation, strict typecheck, all 23 tests, the production build,
SharedUI resolution, whitespace and boundary/scope scans, and a live rendered
browser smoke. All applicable gates passed. Exact evidence is recorded in
`SDP/Verification/VER-SLC-002.md`.

`VER-SLC-002` is related in `Relations.yaml` and recorded by append-only
ledger event 018. SLC-002 remains active pending fresh independent review;
`CurrentIndex.yaml` remains on SLC-002 and SLC-003 remains planned.

### SLC-002 Source-List Failure Correction

Status: correction verified; final independent review approved
Date: 2026-07-12

The correction addresses the sole medium finding in `REV-SLC-002`. A rejected
`ProjectSource.listFiles()` now returns an unobserved manifest with profile
`sdp-toolkit-current / unknown`, empty files, core traceability and standard
directory presence, and only the stable `DISCOVERY_SOURCE_LIST_FAILED` error.
It does not invent `DISCOVERY_MISSING_CORE_SOURCE` warnings. Successful
listings retain their prior behavior: an empty or otherwise core-incomplete
listing is `partial` with missing-core warnings. Discovery still never calls
`readText()`.

The permanent regression in
`src/core/discovery/discoverProject.test.ts` distinguishes rejected listing
from a successfully listed empty source, asserts deterministic repeated failure
output, the exact empty manifest and error diagnostic, preserved successful
`partial` semantics, and zero content reads. The correction changed only
`src/core/discovery/discoverProject.ts`, its test, and this appended subsection;
it did not harden duplicate paths or begin `SLC-003`.

Correction verification evidence:

- `npm test -- src/core/discovery/discoverProject.test.ts --reporter=verbose`:
  passed; 1 test file and 6 tests passed.
- `npm run typecheck`: passed with no TypeScript diagnostics.
- `npm test`: passed with Vitest `4.1.10`; 4 test files and 24 tests passed.
- `npm run build`: passed; Vite `8.1.4` transformed 1,976 modules and emitted
  the production assets. The already-recorded non-failing chunk-size warning
  remains.
- `git diff --check`: passed with only the existing LF-to-CRLF working-copy
  notices.

No new residual risk was introduced by the correction. Structural profile
support remains path-only as already recorded. A fresh independent Reviewer
subsequently approved the correction. Work stopped at the SLC-002 boundary.

### Independent review and completion

The first fresh Reviewer reproduced all command gates and found one medium
honesty defect: a rejected `listFiles()` call was labeled `partial` and
generated unsupported missing-core warnings. A bounded correction Worker
changed only that failure branch, its regression test and implementation-note
evidence. Master reruns passed the focused 6-test discovery file, strict
typecheck, 4 files/24 tests, production build and whitespace checks.

A second fresh Reviewer validated the correction, unchanged successful
supported/partial behavior, deterministic output, zero content reads, scope
boundaries and append-only traceability. Final `REV-SLC-002` disposition is
approved with no remaining actionable finding.

`Relations.yaml` now records SLC-002 completed and relates
`VER-SLC-002` and `REV-SLC-002`. Ledger events 018-022 record
verification, initial changes-required review, correction, final approval and
Slice completion. The supervising architect accepted committed state
`90bd7b6b0474331e54c5716398ca1bc714b995c2` on 2026-07-12.
`CurrentIndex.yaml` now points to SLC-003, and SLC-003 was activated through
the required Master traceability transition before product implementation.

---

## SLC-003 Implementation

Status: completed; final independent review approved; supervising architect accepted
Slice: `SLC-003`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

The Master re-anchored from the complete repository evidence at accepted
commit `90bd7b6b0474331e54c5716398ca1bc714b995c2`, confirmed SLC-002 has
passing `VER-SLC-002` evidence and final approved `REV-SLC-002`, and recorded
the supervising architect acceptance before activating SLC-003.

Before any product implementation, the complete SLC-003 parser contract was
expanded in `ScrumIterations.md`, `CurrentIndex.yaml` was advanced to SLC-003,
the SLC-003 relation was expanded and marked active, and ledger events 023-024
were appended. SLC-001 and SLC-002 remain completed. SLC-004 remains planned
and untouched.

---

## SLC-003 Worker Implementation

Status: bounded Worker implementation complete; pending Master verification and
fresh independent review
Slice: `SLC-003`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

This section records Worker implementation and command evidence only. It does
not create or claim `VER-SLC-003`, `REV-SLC-003`, Slice completion, acceptance
or a transition to SLC-004. The Master-authored activation changes to Scrum,
Handoff, CurrentIndex, Relations and Ledger were preserved.

### Dependency and parser-safety decisions

- Added only `yaml` `2.9.0` as an exact direct runtime dependency in
  `package.json` and `package-lock.json`. NDJSON uses native `JSON.parse` per
  nonblank line. No second parser, Markdown parser, schema framework, graph
  library or parser-plugin system was added.
- YAML uses `parseDocument` and `LineCounter` with explicit YAML 1.2 `core`
  schema, `strict: true`, `uniqueKeys: true`, `stringKeys: true`, `merge: false`,
  `intAsBigInt: false`, `keepSourceTokens: false`, `prettyErrors: false` and
  silent package logging. `customTags` is a frozen empty array and
  `resolveKnownTags` is false, so no supplied or known extension constructor is
  available. The options object itself is frozen.
- Conversion uses `document.toJS({ mapAsMap: false, maxAliasCount: 32 })` with
  no reviver. A subsequent plain serializable-value conversion rejects cyclic
  aliases, non-finite numbers and non-plain objects. Parser errors, unresolved
  tags, alias-limit failures and unsafe serialization return stable sourced
  diagnostics rather than throwing malformed repository content through the
  application boundary.
- Permanent tests cover duplicate keys, a `!!js/function`-looking custom tag
  without execution, excessive alias expansion, a cyclic alias and exact
  malformed-YAML locations. Static tests and scans cover React, SharedUI,
  browser/Node filesystem, fixture, eval, dynamic-import and SLC-004 boundaries.

### Contracts and behavior

- Added `ParsedSource<T>` with a file-level `SourceRef`, readonly diagnostics
  and optional value, plus JSON-serializable `RawValue`/`RawObject` contracts.
- `RawCurrentIndex` retains the complete root in `fields`, raw `project` and
  `planning` values, unknown top-level/active data and structured field sources.
  Its typed active declaration accepts only string or null values. Invalid
  values remain in raw fields, emit `PARSE_CURRENT_INDEX_INVALID_FIELD`, and are
  not coerced or copied into typed active properties. Missing properties remain
  absent. No referenced ID is resolved.
- `RawRelations` retains every top-level value and source order, exposes raw
  sections/stable entries, and records section/entry pointers and parser ranges
  where the YAML AST supplies them. Known installed-profile sections with a
  non-map value emit `PARSE_RELATIONS_INVALID_SECTION` while the raw value
  remains available. Unknown sections are preserved without relation or
  completion interpretation.
- `RawLedger` contains raw JSON-object records only. Each record sequence is the
  1-based original source line. Blank lines are ignored; non-object JSON and
  malformed JSON become line diagnostics; valid neighboring records survive;
  duplicate IDs and event/timestamp meaning are not inspected; and a final
  unterminated line parses normally.
- Location convention is 1-based line and column, start-inclusive and
  end-exclusive. YAML ranges and syntax positions come only from the package
  `LineCounter` and AST/error offsets. Ledger provenance covers the exact
  non-newline line text from column 1 through `line.length + 1`. When YAML has
  only a reliable pointer, the parser emits that pointer without fabricating a
  range.
- Stable parser codes include `PARSE_SOURCE_KIND_MISMATCH`,
  `PARSE_SOURCE_PATH_MISMATCH`, `PARSE_YAML_SYNTAX_ERROR`,
  `PARSE_YAML_DUPLICATE_KEY`, `PARSE_YAML_UNSUPPORTED_TAG`,
  `PARSE_YAML_ALIAS_LIMIT`, `PARSE_YAML_RESOURCE_LIMIT`,
  `PARSE_YAML_NON_SERIALIZABLE_VALUE`, `PARSE_YAML_UNSUPPORTED_ROOT`,
  `PARSE_CURRENT_INDEX_INVALID_FIELD`, `PARSE_RELATIONS_INVALID_SECTION`,
  `PARSE_LEDGER_INVALID_JSON`, `PARSE_LEDGER_NON_OBJECT` and
  `PARSE_APPLICATION_READ_FAILED`. No `SDP001` through `SDP008` validation code
  was introduced.
- Added presentation-neutral `loadCoreTraceability(ProjectSource)`. It calls
  SLC-002 `discoverProject`, reads only the three discovered core sources in a
  fixed order, calls the matching parsers and aggregates discovery/read/parser
  diagnostics. A read or parse failure for one source does not erase successful
  results from the other sources. It creates no `ProjectSnapshot`.
- Replaced exactly the CurrentIndex, Relations and Ledger bundled placeholder
  bodies with small valid installed-profile examples. The other eleven fixture
  files and the deterministic 14-path contract remain unchanged. Deliberately
  malformed inputs live in tests.

### Required-test coverage

- Cases 1-8: CurrentIndex tests cover valid parsing, missing properties, nulls,
  invalid types without coercion, duplicates, syntax locations, unsupported
  roots and unknown-field preservation.
- Cases 9-14: Relations tests cover valid raw sections/entries, unknown sections,
  source-isolated malformed YAML, duplicate stable keys, unsupported roots,
  invalid known sections and deliberately unresolved targets.
- Cases 15-22: Ledger tests cover ordered object lines, deterministic blank-line
  handling, malformed-middle recovery, every JSON non-object kind, exact line
  provenance, original-line sequence, no-final-newline input and repeated
  deterministic output.
- Cases 23-24: application tests cover one failed read with successful neighbors
  and assert exactly one SLC-002 discovery listing plus reads of its three
  discovered paths.
- Case 25: the permanent raw-source boundary test and focused scans cover parser
  imports, platform globals, fixture coupling, code execution and SLC-004 scope.
- Cases 26-27: the complete suite retains the SLC-002 discovery tests and the
  unchanged jsdom-rendered SharedUI smoke test.

### Development corrections and final Worker evidence

- The intentional `npm install yaml@2.9.0 --save-exact` succeeded and found zero
  vulnerabilities, but npm reported a non-fatal Windows `EPERM` cleanup warning
  for an unrelated optional Rolldown WASI directory. The required later
  lockfile-driven `npm ci` completed cleanly.
- The first development typecheck after authoring parser files failed with two
  strict `exactOptionalPropertyTypes`/`noUncheckedIndexedAccess` errors in an
  invalid-active diagnostic. Explicit missing-value handling and a sourced
  pointer fallback corrected them; every subsequent typecheck passed.
- The first focused run passed 39/40 tests and found one false positive in the
  new static boundary test: its broad `document.` expression matched the local
  YAML `document` value. The check was narrowed to actual DOM APIs; the repeated
  focused run passed all 40 tests.
- The first `git diff --check` after appending these notes found four Markdown
  hard-break trailing-space lines in the new section. They were removed before
  the final whitespace check.
- Final `npm ci`: passed; added 270 packages, audited 271 packages in 10 seconds
  and found zero vulnerabilities.
- Final `npm run typecheck`: passed with no TypeScript diagnostics.
- Final `npm test`: passed with Vitest `4.1.10`; 9 test files and 61 tests
  passed, including existing SLC-001/SLC-002 and rendered UI coverage.
- Final `npm run build`: passed with Vite `8.1.4`; 1,976 modules transformed and
  0.53 kB HTML, 72.88 kB CSS and 510.87 kB JavaScript assets emitted. The
  pre-existing non-failing greater-than-500-kB chunk warning remains.
- `npm ls SharedUI yaml --depth=0`: passed and reported `SharedUI@0.1.0` and
  direct `yaml@2.9.0`.
- Focused safety/provenance/boundary run: 3 files and 24 tests passed for
  CurrentIndex safety/location, Ledger recovery/provenance and raw-source
  boundaries. A second focused run passed 2 files and 12 tests for Relations
  raw fidelity/provenance and application failure isolation/discovery reuse.
- Static boundary and scope scans found no forbidden UI/platform filesystem,
  eval/Function/dynamic import, fixture coupling, SLC-004 normalized model,
  validation/fingerprint, Markdown parser, filesystem-adapter or write surface
  in parser implementation or `loadCoreTraceability.ts`.
- Final `git diff --check`: passed with only Git's existing LF-to-CRLF
  working-copy warnings.
- No lint command is configured. No UI source changed, so no new manual browser
  smoke was claimed; the unchanged rendered UI test passed in the 61-test suite.

### Worker-changed files and stop boundary

- `package.json`, `package-lock.json`
- `src/core/parsing/ParsedSource.ts`
- `src/core/parsing/RawValue.ts`
- `src/core/parsing/yamlSupport.ts`
- `src/core/parsing/parseCurrentIndex.ts` and `.test.ts`
- `src/core/parsing/parseRelations.ts` and `.test.ts`
- `src/core/parsing/parseLedger.ts` and `.test.ts`
- `src/core/parsing/parserBoundaries.test.ts`
- `src/application/loadCoreTraceability.ts` and `.test.ts`
- `src/adapters/fixtures/bundledFixtureSource.ts` and `.test.ts`
- `SDP/Sprints/SPR-001/implementationNotes.md` (this appended Worker section)

The Worker did not edit Scrum, Handoff, CurrentIndex, Relations, Ledger,
verification or review state; their existing Master activation changes remain
untouched. No commit, staging, push or pull request was performed. No Markdown
parser, normalized entity/relation/event, snapshot, resolution, validation,
finding, filesystem adapter, graph/report/repair/CLI/CI or UI feature was added.
Work stopped at the SLC-003 implementation boundary; SLC-004 was not begun.

### Master verification

The Master read the complete product/test diff and independently reran the
lockfile-driven clean install, strict typecheck, complete 61-test suite,
production build, exact direct-dependency check, focused 24-test safety and
provenance suite, focused 12-test Relations/application suite, whitespace,
traceability and implementation-only boundary/scope checks. All applicable
gates passed. Exact commands, outputs, the corrected static-scan false positive
and limitations are recorded in `SDP/Verification/VER-SLC-003.md`.

`VER-SLC-003` is related in `Relations.yaml` and recorded by append-only ledger
event 025. SLC-003 remains active pending a fresh independent Reviewer;
`CurrentIndex.yaml` remains on SLC-003 and SLC-004 remains planned and
untouched.

### Initial independent review

Fresh `REV-SLC-003` independently reproduced all standard and focused gates
but identified two medium raw-fidelity defects and one low documentation defect.
With `logLevel: "silent"`, `yaml@2.9.0` `parseDocument` suppresses its
`MULTIPLE_DOCS` error and silently discards documents after the first. Finite
integers outside JavaScript's safe range are exposed as rounded values in YAML
and native-JSON raw output without an explicit diagnostic. README also still
describes SLC-002, no parser and 14 placeholder bodies.

The initial disposition is changes required. Relations and ledger event 026
record that real review result. SLC-003 remains active pending a bounded
correction, repeated verification and fresh independent re-review. SLC-004
remains planned and untouched.

### SLC-003 Review Correction Worker

Status: bounded correction implemented; pending Master verification and fresh
independent re-review
Date: 2026-07-12

This appended Worker section addresses only the three findings in
`REV-SLC-003`. It does not change or claim Master verification, review
approval, Slice completion, supervising acceptance or a transition to
`SLC-004`.

#### Corrections

- Changed only the YAML package log level from `silent` to `error`. Under
  `yaml@2.9.0`, this remains quiet for warnings while retaining the structural
  `MULTIPLE_DOCS` error that `silent` suppresses. The shared YAML parser maps
  that package error to `PARSE_YAML_MULTIPLE_DOCUMENTS` and returns no value.
  CurrentIndex and Relations regressions contain explicit first and discarded
  second documents, assert the dedicated code and assert the package-derived
  range beginning at the second document marker. YAML 1.2/core schema,
  strictness, unique string keys, merge behavior, tag controls, alias bound and
  all other parsing/materialization options remain unchanged.
- Extended shared raw conversion to reject integer numbers for which
  `Number.isSafeInteger` is false, while retaining its existing finite-number
  rejection. YAML rejects the complete source with
  `PARSE_YAML_UNSAFE_INTEGER` and file provenance rather than exposing a
  rounded raw value. Ledger retains native `JSON.parse`, diagnoses only the
  affected line with `PARSE_LEDGER_UNSAFE_INTEGER`, omits that record and keeps
  valid neighboring records with their original sequences. Permanent tests use
  literal `9007199254740993`, assert that rounded `9007199254740992` is not
  exposed and assert exact Ledger line provenance.
- Updated `README.md` from the stale SLC-002/no-parser description to the
  active SLC-003 raw CurrentIndex/Relations/Ledger behavior, the three compact
  valid core fixture bodies, `loadCoreTraceability`, current parser safety and
  partial-failure boundaries. It explicitly states that the UI remains a
  discovery preview and that Markdown parsing, normalization, resolution,
  state reconstruction, validation, findings and SLC-004 behavior remain
  absent.

#### Correction Worker changed files

- `README.md`
- `src/core/parsing/RawValue.ts`
- `src/core/parsing/yamlSupport.ts`
- `src/core/parsing/parseLedger.ts`
- `src/core/parsing/parseCurrentIndex.test.ts`
- `src/core/parsing/parseRelations.test.ts`
- `src/core/parsing/parseLedger.test.ts`
- `SDP/Sprints/SPR-001/implementationNotes.md` (this appended section only)

#### Correction Worker evidence

- Focused corrected/boundary command
  `npm test -- src/core/parsing/parseCurrentIndex.test.ts src/core/parsing/parseRelations.test.ts src/core/parsing/parseLedger.test.ts src/core/parsing/parserBoundaries.test.ts --reporter=verbose`:
  passed; 4 test files and all 36 tests passed. The four new regression cases
  cover CurrentIndex and Relations multi-document rejection, YAML unsafe
  integer rejection and line-isolated Ledger unsafe integer rejection.
- `npm run typecheck`: passed with no TypeScript diagnostics.
- `npm test`: passed with Vitest `4.1.10`; 9 test files and all 65 tests passed,
  including preserved SLC-001/SLC-002 and rendered UI coverage.
- `npm run build`: passed with Vite `8.1.4`; 1,976 modules transformed and
  0.53 kB HTML, 72.91 kB CSS and 510.87 kB JavaScript emitted. The existing
  non-failing greater-than-500-kB chunk warning remains.
- `npm ls SharedUI yaml --depth=0`: passed and reported `SharedUI@0.1.0` and
  direct `yaml@2.9.0`.
- Implementation-only boundary scans found zero forbidden UI/framework,
  platform/execution, mutation or SLC-004 normalized-model/validation matches.
  The parser-call scan found only the `parseDocument` import/call in
  `yamlSupport.ts` and native `JSON.parse` in `parseLedger.ts`.
- `git diff --check`: passed; output contained only the repository's existing
  Windows LF-to-CRLF working-copy warnings.
- `npm ci` was not rerun because the correction changes no dependency or
  lockfile. No lint command is configured.

The Worker did not edit Scrum, Handoff, CurrentIndex, Relations, Ledger,
verification/review records, package files, fixture/application/UI source or
any SLC-004 surface. No commit, staging, push or pull request was performed.
SLC-003 remains the active Slice with review changes required; SLC-004 remains
planned. Work stopped at the SLC-003 correction boundary.

#### Master correction verification

The Master inspected the exact correction and independently reran a clean
install, strict typecheck, the focused 4-file/36-test parser and boundary suite,
the full 9-file/65-test suite, production build, exact dependency resolution,
implementation-only boundary/scope scans, README stale-text checks, UI no-diff,
traceability syntax/state and `git diff --check`. All applicable checks passed;
exact outputs are appended in `SDP/Verification/VER-SLC-003.md`.

Ledger event 027 records the verified correction. The initial
changes-required review remains unchanged until a fresh independent Reviewer
reassesses the corrected tree. SLC-003 remains active and SLC-004 remains
planned and untouched.

#### Final independent review and completion

The second fresh Reviewer independently reproduced clean installation,
typecheck, 36 focused tests, 65 full tests, production build, dependency,
multi-document, unsafe-integer, retained safety, application/fixture,
boundary, README, UI no-diff, whitespace and traceability evidence. All three
original findings are resolved and no new actionable finding was identified.
The appended final `REV-SLC-003` disposition is approved.

`Relations.yaml` records SLC-003 completed and `REV-SLC-003` approved. Ledger
events 025-029 record initial verification, changes-required review, bounded
correction, final approval and Slice completion without rewriting earlier
history. The supervising architect accepted committed state
`25418c4a505729f48b8ac5698307e6e3336fed75` on 2026-07-12.

---

## SLC-004 Activation

Status: active; implementation authorized
Slice: `SLC-004`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

The Master re-anchored from the accepted SLC-003 commit, confirmed passing
`VER-SLC-003` and final approved `REV-SLC-003`, recorded supervising architect
acceptance in ledger event 030, expanded the complete SLC-004 normalization
contract, advanced `CurrentIndex.yaml` to SLC-004, marked the SLC-004 relation
active and appended activation event 031 before product implementation.

SLC-001 through SLC-003 remain completed. SLC-005 remains planned and
untouched.

---

## SLC-004 Worker Implementation and Evidence

Status: bounded Worker implementation pass finished; pending Master
verification and fresh independent review
Slice: `SLC-004`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-12

This section records only the bounded Worker implementation and actual command
evidence. It does not create or claim `VER-SLC-004`, `REV-SLC-004`, Master
verification, review approval, Slice completion, supervising acceptance or a
transition to `SLC-005`. The Master-authored activation changes to Scrum,
Handoff, CurrentIndex, Relations and Ledger were preserved.

### Domain and normalization decisions

- Added readonly presentation-neutral domain contracts for extensible
  `EntityKind`, `Entity`, `Relation`, `LedgerEvent`, `ActiveDeclaration`, raw
  explicit project metadata and `ProjectSnapshot`. Active declarations retain
  fixed-order sprint/refactor/iteration/slice properties plus per-field
  provenance. Project metadata remains snapshot-level data and never becomes a
  project entity.
- `normalizeTraceability` is pure and synchronous. It accepts discovery plus
  optional parsed CurrentIndex, Relations and Ledger results. Optional
  application diagnostics are additive so read failures without a parsed
  result survive; discovery and every present parser diagnostic are always
  included, then exact duplicates are removed canonically.
- Snapshot-owned arrays, objects, raw attributes, payloads, provenance and
  diagnostics are cloned and frozen. Input arrays are never sorted in place.
  Sources sort by path/location/pointer, diagnostics by
  code/provenance/message, entities by kind/ID/source and relations by
  type/from/to/source. Ledger events preserve parser record order and sequence.
- Entities are created only from non-empty explicit keys in supported
  Relations sections. Tier/Sprint/Iteration/Slice/Review/Verification map to
  their fixed kinds. Documents remain `unknown` unless the explicit raw `kind`
  is an accepted document subtype; Refactors remain `unknown` unless
  `kind: refactor` is explicit. Raw attributes are retained when typed string
  status/title/path fields are exposed. Active IDs, relation targets, Ledger
  subjects and project metadata do not create entities.
- Duplicate IDs use one canonical entity policy. Valid definitions sort by
  kind then source and the first supplies canonical attributes. Every stable
  definition-key source, including an invalid-shaped definition beside a
  valid one, remains on the canonical entity and receives a sourced
  `NORMALIZE_DUPLICATE_ENTITY_DEFINITION` diagnostic. Relations are extracted
  from every valid definition. Invalid records remain diagnostics and never
  cause guessed entities. No duplicate-ID finding is emitted.
- The deliberate relationship-field set is `derives_from`, `decisions`,
  `tier`, `sprint`, `iteration`, `slice`, `slices`, `requirements`,
  `architecture`, `study_decisions`, `design`, `verification_plan`,
  `verification` and `review`. Non-empty scalar strings and non-empty string
  array elements become directed relations. Invalid values/elements are
  diagnosed independently and valid neighbors remain. Metadata fields are not
  relations, endpoints are not resolved and reverse edges are never inferred.
- Relation provenance uses a truthful pointer-only `SourceRef` for
  `/section/id/field[/index]` because SLC-003 does not expose exact nested field
  ranges. Entity definitions retain their exact parser-derived range. Relation
  IDs use the unambiguous plain-text JSON tuple
  `[from,type,to,sourceId,path,kind,lineStart,columnStart,lineEnd,columnEnd,pointer]`
  prefixed by `relation:`. Missing locations encode as `null`; there is no
  UUID, hash or presentation input. An identical full occurrence tuple is
  deduplicated with canonical source merging; different pointers remain
  distinct.
- Compatibility begins exactly at discovery support. Missing/value-less
  required parser results or an unavailable supported Relations structure
  reduce only `supported` to `partial`. `partial`, `unsupported` and `unknown`
  never upgrade. Unresolved references, active hierarchy and Ledger semantics
  do not affect compatibility.
- Every valid raw Ledger record becomes one event with the original sequence,
  exact line source and complete cloned payload. `type`, `subject_id` and
  `timestamp` are extracted only when strings. Invalid convenience types are
  normalization diagnostics and do not erase the event. Event IDs,
  timestamps, duplicates, chronology, state and completion are not validated.
- Added `loadProjectSnapshot`, which reuses the existing one-pass
  discover/read/parse operation, carries its complete diagnostics into
  normalization and returns discovery, useful raw results and the snapshot.
  It runs no validation.

### Permanent coverage

- The contract-authored complete bundled expectation asserts all 14 sorted
  sources, supported profile, zero diagnostics, raw project metadata, four
  explicit entities, five directed relations with hard-coded IDs/pointers,
  three ordered Ledger events and the exact active declaration. It asserts the
  unresolved `REQ-F-001` target does not become an entity.
- The focused permanent suite makes all 42 numbered contract cases explicit:
  cases 1-40 are named in the normalization/application tests; case 41 is the
  preserved full discovery/parser/source/UI suite; case 42 is the unchanged
  rendered SharedUI smoke included in that full suite. Coverage includes
  missing and failed parser results, all monotonic support states, deterministic
  source/diagnostic/entity/relation ordering, non-mutation and deep ownership,
  every supported entity section and relationship field, invalid records and
  relation neighbors, duplicate definitions, pointer escaping, stable
  occurrence IDs, explicit/null/missing/invalid active fields, Ledger payload
  fidelity and order, partial application failure and implementation-only
  import/scope boundaries.

### Development corrections and read-only audit

- The first development `npm ci` passed but printed a non-fatal Windows
  `EPERM` cleanup warning for an optional Rolldown WASI nested directory. The
  final clean install below completed without that warning.
- The first development typecheck found four local authoring errors: one
  unused type import and three empty-array `readonly never[]` inference errors.
  Explicit snapshot collection types and removal of the unused import resolved
  them; every later typecheck passed.
- An attempted inline `vite-node -e` snapshot probe failed before product code
  ran because this installed CLI requires a file. A temporary file-based probe
  then succeeded; the temporary file was deleted before tests and is absent
  from the final scope.
- A fresh read-only implementation audit (not the formal SDP review) found
  four edge cases: optional diagnostics could suppress parser evidence,
  invalid-shaped duplicate keys lacked structured duplicate evidence, empty
  relation targets were accepted, and a project `__proto__` key could corrupt
  its field-source map. The Worker made diagnostics additive, tracks stable
  definition occurrences before shape rejection, requires non-empty relation
  targets and defines project field-source keys as own data properties. Four
  permanent regressions were added. A targeted read-only recheck found all four
  resolved and no introduced regression.

### Worker-changed files

- `README.md`
- `src/core/domain/ActiveDeclaration.ts`
- `src/core/domain/Entity.ts`
- `src/core/domain/LedgerEvent.ts`
- `src/core/domain/ProjectSnapshot.ts`
- `src/core/domain/Relation.ts`
- `src/core/normalization/canonicalOrdering.ts`
- `src/core/normalization/normalizeCurrentIndex.ts`
- `src/core/normalization/normalizeRelations.ts`
- `src/core/normalization/normalizeLedger.ts`
- `src/core/normalization/normalizeTraceability.ts`
- `src/core/normalization/bundledFixtureSnapshot.test.ts`
- `src/core/normalization/normalizeTraceability.test.ts`
- `src/core/normalization/normalizationBoundaries.test.ts`
- `src/application/loadProjectSnapshot.ts`
- `src/application/loadProjectSnapshot.test.ts`
- `SDP/Sprints/SPR-001/implementationNotes.md` (this appended Worker section
  only)

No dependency, lockfile, fixture or UI source changed.

### Final Worker command evidence

- `npm ci`: passed; added 270 packages, audited 271 packages in 10 seconds and
  reported zero vulnerabilities.
- `npm run typecheck`: passed with no TypeScript diagnostics.
- Focused command
  `npm test -- src/core/normalization/normalizeTraceability.test.ts src/core/normalization/bundledFixtureSnapshot.test.ts src/core/normalization/normalizationBoundaries.test.ts src/application/loadProjectSnapshot.test.ts --reporter=verbose`:
  passed; 4 files and all 32 tests passed, with individual case names visible.
- `npm test`: passed with Vitest `4.1.10`; 13 files and all 97 tests passed,
  including every preserved discovery/parser/source test and the unchanged
  jsdom SharedUI rendered smoke.
- `npm run build`: passed. Vite `8.1.4` transformed 1,976 modules and emitted
  0.53 kB HTML, 72.91 kB CSS and 510.87 kB JavaScript (150.91 kB gzip). The
  pre-existing non-failing greater-than-500-kB chunk warning remains.
- `npm ls SharedUI yaml --depth=0`: passed with `SharedUI@0.1.0` and direct
  `yaml@2.9.0`.
- Three implementation-only `rg` scans returned exit code 1 with no matches
  for forbidden UI/framework/fixture imports; browser/Node filesystem,
  execution, mutation or ambient identity/time APIs; or Markdown, validation,
  finding/fingerprint, `SDP001`-`SDP008`, graph, report or repair surfaces.
- `git diff --quiet 25418c4a505729f48b8ac5698307e6e3336fed75 -- src/ui src/main.tsx`
  returned exit code 0. No UI source changed, so no new live browser run was
  performed or claimed. The unchanged rendered test passed in the full suite.
- `git diff --quiet -- package.json package-lock.json src/adapters/fixtures/bundledFixtureSource.ts`
  returned exit code 0, confirming no dependency/lock/fixture change.
- `git diff --check`: passed with exit code 0; output was limited to the
  repository's existing Windows LF-to-CRLF working-copy notices.
- No lint command is configured, so lint was not run.

### Limitations and stop boundary

- Relation field/value provenance is pointer-only because the SLC-003 raw
  Relations contract exposes exact ranges only for sections and entity
  definitions. No line/column values were fabricated.
- Normalization reports structural inability only. It intentionally does not
  decide endpoint existence, duplicate-ID meaning, active validity/hierarchy,
  verification qualification, completion, chronology or project health.
- The Worker did not edit Scrum, Handoff, CurrentIndex, Relations, Ledger,
  verification or review records. No commit, staging, push or pull request was
  performed.
- Work stopped at the SLC-004 boundary. No Markdown parsing, validation rule,
  `Finding`, fingerprint, `SDP001`-`SDP008`, rule registry, filesystem adapter,
  graph/report/repair/CLI/CI or SLC-005 behavior was added.

## SLC-004 Master verification — 2026-07-12

The Master read the complete Worker handoff and every new domain,
normalization, application and test file. The implementation conforms to the
active contract: entities arise only from explicit supported Relations keys;
directed relations preserve unresolved targets without judging them; duplicate
definitions preserve every source under a deterministic canonical-entity
policy; active declarations and Ledger events remain factual; compatibility is
monotonic; and output ordering, identity, provenance, ownership and
immutability are deterministic.

Independent Master commands passed: `npm ci` (270 packages added, 271 audited,
zero vulnerabilities), `npm run typecheck`, the focused 4-file/32-test verbose
suite, the full 13-file/97-test suite, `npm run build`,
`npm ls SharedUI yaml --depth=0` and `git diff --check`. Implementation-only
boundary scans found no UI/platform filesystem, validation/finding, ambient
identity/time, Markdown, graph, repair or SLC-005 behavior. Git comparisons
confirmed no UI, dependency/lock/fixture or SLC-001 through SLC-003 product
change. Strict traceability validation confirmed 32 unique append-only Ledger
events with the accepted first 29 lines unchanged, CurrentIndex on SLC-004,
SLC-001 through SLC-003 completed and SLC-005 planned.

`VER-SLC-004` contains the exact verification record. SLC-004 remains active
pending a fresh independent Reviewer. No staging, commit, push or pull request
was performed.

## SLC-004 independent review and completion — 2026-07-12

Fresh independent `REV-SLC-004` re-anchored from the repository and inspected
the complete contract, source, tests, verification and latest traceability.
It independently reproduced `npm ci`, typecheck, the focused 4-file/32-test
suite, all 13 files/97 tests, build, exact dependency resolution,
`git diff --check`, implementation boundaries, UI/dependency/fixture and prior
product no-diff checks, and strict 32-event append-only traceability.

Adversarial read-only probes also passed for explicit-only entity creation,
valid/invalid duplicate definitions, hostile prototype-named keys, distinct
relation occurrences and IDs, unresolved targets, Ledger gaps/order/payload,
active null-versus-invalid distinctions, deep repeatability/ownership and a
source-list failure retaining `unknown` support without invented facts. Two
initial stdin launch attempts failed before product import because the harness
could not resolve bundler-style TypeScript imports; the same probes passed with
a read-only Node loader. The Reviewer correctly classified those as harness,
not product, failures.

The final disposition is approved with no actionable finding. Relations links
`VER-SLC-004` and `REV-SLC-004` and records SLC-004 completed. Immutable Ledger
events 033-034 record review approval and Slice completion. CurrentIndex
remains on SLC-004 for supervising acceptance, while SLC-005 remains planned
and untouched. No staging, commit, push or pull request was performed.

## SLC-005 Activation — 2026-07-12

Status: active; implementation authorized
Slice: `SLC-005`
Sprint: `SPR-001`
Iteration: `ITR-001`

The supervising architect accepted committed SLC-004 state
`2023db3541cb3f3bd54d44027b843bf7ba70ea57`. The Master confirmed the passed
`VER-SLC-004`, approved `REV-SLC-004`, completed SLC-004 relation, and immutable
completion event 034 before transition. The full deterministic validation
contract is now recorded in Scrum; CurrentIndex points to SLC-005, its relation
is active with explicit requirement/architecture/design links, and immutable
ledger events 035-036 record supervising acceptance and activation.

SLC-001 through SLC-004 remain completed. SLC-006 and SLC-007 remain planned
and untouched. Product implementation is delegated to a bounded fresh Worker.

## SLC-005 Worker Implementation — 2026-07-12

Implemented the bounded presentation-neutral validation Slice. Added the
canonical Finding and AnalysisContext contracts, structural JSON-tuple
fingerprints, deterministic severity/rule/entity/source/fingerprint ordering,
the explicit SDP001-SDP008 registry, exception-isolated validation execution,
and discover -> parse -> normalize -> validate application orchestration.

Rule policies are explicit: SDP003 emits one finding per missing endpoint;
SDP001 groups unavailable-source diagnostics by stable core path (or one
synthetic project reference when listing failed); SDP004 groups rejected Ledger
evidence by original sourced line; SDP006 evaluates only explicit hierarchy
relations after both active IDs resolve; and SDP007 accepts only an explicit
`verification` relation to a verification entity whose preserved `outcome` is
exactly `passed`. All rule findings canonicalize and deduplicate entity IDs and
sources and receive non-empty real or stable synthetic provenance.

Added in-memory snapshot builders and deterministic tests for engine ordering,
fingerprints, deduplication, exception isolation, input immutability and all
eight rule evidence/absence cases. Added end-to-end application analysis over
the bundled fixture. The fixture's Sprint requirement relation now targets its
explicitly defined `REQSET-001`, keeping the supported fixture clean without
inventing an entity and updating its contract-authored snapshot expectation.

Verification evidence:

- `npm ci`: passed; 270 packages installed, 0 vulnerabilities.
- focused Vitest run: passed; 4 files, 20 tests.
- `npm run typecheck`: passed.
- `npm test`: passed; 16 files, 112 tests.
- `npm run build`: passed; Vite built 1,976 modules. The pre-existing chunk-size
  advisory remained non-fatal.
- `npm ls SharedUI yaml --depth=0`: passed; `SharedUI@0.1.0`, `yaml@2.9.0`.
- `git diff --check`: passed; only Git line-ending conversion warnings.
- boundary scan across the new core/application surface found no React,
  SharedUI, filesystem, ambient time/randomness, Markdown, health-score or
  write-back imports/behavior.

No UI, SLC-006, graph, Markdown parsing, repair, write-back, CLI/CI, commit,
push or pull request work was performed. Master-owned CurrentIndex, Relations,
Ledger and Scrum transition changes were preserved and not edited by this
Worker. Fresh independent review and Master-owned verification/traceability
decisions remain outstanding.

## SLC-005 Master verification — 2026-07-12

The Master inspected every new finding, validation, rule, application and test
file and independently ran the exact SLC-005 gates. `npm ci`, typecheck, the
focused 4-file/16-test verbose suite, full 16-file/112-test suite, build, exact
dependency listing and `git diff --check` passed. Boundary scans found no
React/SharedUI, filesystem, ambient-time/random, Markdown, health-score or write
surface in the new core/application code; UI remained unchanged. Strict
traceability assertions passed through immutable activation event 036.

`VER-SLC-005` records the exact evidence, Relations links it as passed and
immutable event 037 records verification. SLC-005 remains active pending fresh
independent review; CurrentIndex remains on SLC-005 and SLC-006 remains planned.

## SLC-005 Review Correction Worker — 2026-07-12

Corrected exactly the two actionable `REV-SLC-005` findings. Failing SDP007
findings now include canonical sources from every resolved verification target
whose kind and outcome were inspected; genuinely missing targets continue to
cite only the completed Slice and verification relation. Permanent focused
regressions now cover source-location fingerprint changes, severity/source
ordering, built-in-rule immutability and repeatability, unresolved active
Iteration and Slice declarations, review-only SDP007 evidence, resolved
wrong-kind/missing-outcome/failed-outcome target provenance, missing-target
provenance, and malformed/non-object Ledger diagnostics with valid neighboring
events retained.

Correction evidence: `npm ci` passed (270 packages, 0 vulnerabilities); focused
Vitest passed (4 files, 33 tests); typecheck passed; full Vitest passed (16
files, 121 tests); build passed (1,976 modules, with the existing non-failing
chunk-size advisory); dependency inspection retained `SharedUI@0.1.0` and
`yaml@2.9.0`; `git diff --check` passed with line-ending warnings only. Boundary
scans found no React/SharedUI/platform filesystem, ambient time/randomness,
Markdown, health-score, repair/write-back or UI/SLC-006 additions in the
corrected core/test surface. Master-owned Scrum, CurrentIndex, Relations,
Ledger, VER and REV state was preserved; no completion transition, commit,
push or pull request was performed.

## SLC-005 final independent review and completion — 2026-07-12

The first independent review required two bounded corrections: complete the
minimum permanent regression coverage and include resolved verification-target
entity provenance in non-qualifying SDP007 findings. A fresh correction Worker
implemented only those changes. Master re-verification passed the focused
4-file/25-test suite, full 16-file/121-test suite, typecheck, build, dependency,
whitespace, boundary and traceability checks.

A second fresh independent Reviewer confirmed both findings resolved, reran the
same gates and approved SLC-005 with no remaining actionable finding. Relations
now records SLC-005 completed, passed `VER-SLC-005` and approved
`REV-SLC-005`; immutable events 040-041 record final approval and completion.
CurrentIndex intentionally remains on SLC-005 for supervising acceptance.
SLC-006 remains planned and untouched. No commit, push or pull request occurred.

## SLC-006 activation — 2026-07-12

Status: active; implementation authorized

The supervising architect accepted committed SLC-005 state
`f27541559a3b5103fbafa97fca4d9830d9b0f5ff`. The Master confirmed passed
`VER-SLC-005`, approved `REV-SLC-005`, completed SLC-005 traceability and
immutable completion event 041 before transition. The full SLC-006 contract is
recorded in Scrum; CurrentIndex points to SLC-006; its relation is active with
explicit requirement, architecture, Study and design links; and immutable
events 042-043 record supervising acceptance and Slice activation.

SLC-001 through SLC-005 remain completed. SLC-007 remains planned and
untouched. Product implementation is bounded to SLC-006.

## SLC-006 Worker implementation — application workflow and read-only findings UI

Date: 2026-07-12

Role: fresh bounded Worker

Scope: `SPR-001 / ITR-001 / SLC-006` only

Implemented one React application lifecycle owner for the selected bundled
fixture and the authoritative `ProjectAnalysis`. It invokes the existing
`analyzeProject` orchestration with an explicit deterministic context, exposes
loading/ready/failed states, clears stale success when a new run begins or
fails, and leaves finding selection and filters local to presentation.

Replaced the earlier discovery smoke surface with a complete registered
`AnalyzerWorkflow` custom component inside the existing SharedUI dashboard
shell. The UI reuses SharedUI `TopNav`, `PageHeader`, `Section`, `Badge`,
`AlertBanner`, `EmptyState`, `CardSkeleton`, `TableSkeleton`, `DataTable`, and
`DetailPanel`. It presents fixture-only/read-only scope, compatibility and
parse status, truthful counts, declared Sprint/Refactor/Iteration/Slice values,
separate diagnostics and validation findings, immutable severity/rule filters,
keyboard-native finding selection, explanation, recommendation, affected IDs,
fingerprint, and every canonical provenance source. No parser, normalization,
validation, finding creation, health score, filesystem acquisition, graph,
mutation, routing, persistence, or SLC-007 behavior was added.

Automated evidence after implementation:

- `npm run typecheck`: passed.
- `npm test`: passed, 16 files and 123 tests.
- `npm run build`: passed; Vite emitted only the pre-existing chunk-size advisory.
- `npm ls SharedUI yaml --depth=0`: passed with `SharedUI@0.1.0` and `yaml@2.9.0`.
- `git diff --check`: passed; Git emitted only line-ending conversion warnings.
- stylesheet scan found exactly one `SharedUI/styles.css` import, in `src/main.tsx`.
- boundary scan found no React, React DOM, or SharedUI imports in `src/core`,
  `src/application`, or `src/adapters`.

The rendered jsdom workflow tests cover loading, clean success, safe failure,
stale-result removal, truthful summaries and explicit-null display, honest
empty states, finding canonical order, text severity, affected IDs, selection,
full detail and multi-source provenance, immutable filtering, and confirmation
that UI-only changes do not rerun analysis. No commit, push, PR, traceability
ledger/index edit, verification record, or review record was made by this Worker.

## SLC-006 bounded correction after Master audit

Date: 2026-07-12

Role: fresh bounded Worker

Scope: `SPR-001 / ITR-001 / SLC-006` correction only

Moved analysis lifecycle ownership out of React into the presentation-neutral
`src/application/analysisController.ts` contract. The controller invokes
`analyzeProject`, owns idle/loading/ready/failed state and one current result,
clears success on every new loading state and failure, publishes state to UI
subscribers, and uses monotonically increasing run identity so late success or
failure from a superseded analysis cannot replace the newest result. React now
subscribes to and invokes that application controller; `src/application`
imports neither React nor SharedUI.

Corrected diagnostic presentation to use `snapshot.diagnostics` once because
the normalized snapshot already composes discovery, parser and normalization
diagnostics, then append only distinct validation-engine diagnostics. Findings
remain a separate UI section. Changed the summary wording from the overly
narrow `Parsed ...` status to `Loaded ... diagnostics`, matching the composed
input diagnostic set.

Added permanent focused controller and UI tests for lifecycle transitions,
stale-result removal, late success and late failure supersession, subscription,
no reanalysis during UI-only filtering/selection, unknown and unsupported
compatibility, missing active declaration, diagnostic code/severity/path/
line/column/pointer and deduplication, findings separation, and native Enter/
Space button activation sequences for finding detail.

Correction verification evidence:

- Initial `npm ci` attempt was blocked by Windows `EPERM` while unlinking the
  loaded native `lightningcss.win32-x64-msvc.node`; because npm had partially
  removed the dependency tree, `npm install --ignore-scripts=false` restored
  the lockfile-defined dependencies without changing `package.json` or
  `package-lock.json`. It completed with only cleanup warnings for locked native
  temporary directories and reported zero vulnerabilities.
- `npm run typecheck`: passed.
- `npm test`: passed, 17 files and 132 tests.
- `npm run build`: passed; Vite emitted only its chunk-size advisory.
- `npm ls SharedUI yaml --depth=0`: passed with `SharedUI@0.1.0` and
  `yaml@2.9.0`.
- `git diff --check`: passed; Git emitted only line-ending conversion warnings.
- stylesheet scan found exactly one `SharedUI/styles.css` import in
  `src/main.tsx`.
- boundary scan found no React, React DOM or SharedUI imports in `src/core`,
  `src/application` or `src/adapters` (only existing test regex text matched a
  broad first scan).
- prohibited-scope scan found no File System Access API, health score,
  repair or write-back implementation in production source.

No VER/REV record, commit, push, PR or SLC-007 work was performed. Existing
Master traceability edits were preserved.

## SLC-006 Master verification — 2026-07-12

The Master inspected the complete controller/UI/test diff and required a
bounded correction before verification: lifecycle orchestration moved below
React into a presentation-neutral controller, duplicate diagnostic presentation
was removed, and focused compatibility, missing-declaration,
diagnostic-location, keyboard and superseded-run coverage was added.

After stopping the development server that temporarily locked a native npm
binary, clean `npm ci` passed (270 packages, zero vulnerabilities). Typecheck
passed; the full suite passed with 17 files and 132 tests; build passed for
2,067 modules with only the existing chunk advisory; dependency inspection
retained `SharedUI@0.1.0` and `yaml@2.9.0`; and `git diff --check` passed with
line-ending warnings only.

A real in-app browser smoke rendered the clean fixture workflow with supported
compatibility, all summary/declaration labels and honest empty diagnostic/
finding states. Inspection found one stylesheet, no horizontal overflow and no
console warning/error. Boundary, prohibited-scope, UI core-logic and
traceability syntax checks passed. `VER-SLC-006` records the evidence and event
044 records passed verification. SLC-006 remains active pending fresh review;
SLC-007 remains planned and untouched.

## SLC-006 bounded keyboard-evidence correction

Date: 2026-07-12

Role: fresh bounded Worker

Scope: `SPR-001 / ITR-001 / SLC-006` review correction only

Corrected the focused finding-control regression to focus the native button and
use `userEvent.keyboard` for Enter and Space activation. The test now asserts
the selected state and rendered detail without dispatching an unconditional
separate click. No production behavior changed. The correction adds the exact
dev-only test dependency `@testing-library/user-event@14.6.1` to `package.json`
and `package-lock.json` so the regression models native keyboard behavior.

Correction evidence:

- `npm ci`: passed; 271 packages added, 272 audited, zero vulnerabilities.
- `npm test -- --run src/ui/App.test.tsx
  src/application/analysisController.test.ts`: passed; 2 files, 12 tests.
- `npm run typecheck`: passed.
- `npm test`: passed; 17 files, 132 tests.
- `npm run build`: passed; 2,067 modules, with only the non-failing chunk-size
  advisory.
- `npm ls SharedUI yaml @testing-library/user-event --depth=0`: passed with
  `SharedUI@0.1.0`, `yaml@2.9.0` and `@testing-library/user-event@14.6.1`.
- `git diff --check`: passed with line-ending conversion warnings only.

No Handoff, CurrentIndex, Relations, Ledger, VER or REV edit; commit, push, PR;
or SLC-007 work was performed by this Worker.

## SLC-006 post-review Master verification — 2026-07-12

The Master updated the stale Handoff and inspected the keyboard correction. The
first post-correction `npm ci` completed but Vitest startup then failed on a
transient missing `convert-source-map/index.js` file. A second lockfile-clean
install restored the tree. The full sequence then passed: typecheck, 17 files/
132 tests, 2,067-module build, exact dependency listing and diff check. The
keyboard regression now uses user-event Enter and Space on the focused native
button and does not inject a click. `VER-SLC-006` retains both the transient
failure and successful rerun; immutable event 045 records updated passing
evidence. Fresh re-review remains required.

## SLC-006 final independent review and completion — 2026-07-12

The second fresh Reviewer independently reassessed the complete Slice and
confirmed both original findings resolved: Handoff was current and the
keyboard regression used real user-event Enter/Space activation without an
injected click. Focused 2-file/12-test and full 17-file/132-test suites,
typecheck, build, dependency listing, boundary scans and diff check passed.
The Reviewer transparently recorded two Windows `npm ci` cleanup failures and
successful lock-defined dependency restoration; the earlier Master clean
install evidence remains qualifying.

Relations now records SLC-006 completed with passed `VER-SLC-006` and approved
`REV-SLC-006`; immutable events 046-047 record approval and completion.
CurrentIndex intentionally remains on SLC-006 for supervising acceptance.
SLC-007 remains planned and untouched. No commit, push or pull request occurred.

## SLC-006 post-completion audit reopening — 2026-07-12

A third fresh independent Reviewer found that the completion record still had
one medium implementation gap and two low evidence/traceability gaps. Selected
source was not owned with lifecycle/result by the application controller, the
SharedUI config retained an inert duplicate source key, and the page lacked a
clearly labeled fixture source panel. Required summary, declaration,
compatibility and full-provenance assertions were incomplete. Handoff and the
append-only review transition also needed clarification.

SLC-006 is reopened for bounded correction. Relations returns SLC-006 to active
and `REV-SLC-006` to changes required. CurrentIndex remains on SLC-006;
SLC-007 remains planned and untouched. Historical verification, approval and
completion events are not rewritten.

## SLC-006 bounded post-completion audit correction

Date: 2026-07-12

Role: fresh bounded correction Worker

Scope: `SPR-001 / ITR-001 / SLC-006` only

Corrected selected-source ownership so the presentation-neutral application
controller now holds the selected `ProjectSource` in every idle, loading,
ready and failed state together with the single current analysis result. The
controller owns source replacement, invalidates superseded runs, and analyzes
only its selected source. React initializes, subscribes to and invokes that
controller; it does not keep a separate authoritative selected-source state.
The inert `selectedSource` key, validator and policy were removed from the
SharedUI dashboard config, which now truthfully has no dashboard-owned state.

Added the registered SDP-Analyzer-specific `SourceSelector` surface to the
schema-authored main region. It composes SharedUI `Section`, `DetailPanel` and
`AlertBanner` components to identify the selected bundled fixture and source
ID and to state clearly that local-folder selection/filesystem access is not
available in Tier 1. Finding provenance now also uses labeled SharedUI detail
panels for source ID, path, kind, line range, column range and pointer.

Strengthened permanent rendered UI evidence to assert exact discovered-file,
profile ID/support, entity, relation, Ledger, input-diagnostic and finding
counts; declared Sprint, Refactor, Iteration and Slice labels; explicit null
versus missing values; partial, unknown and unsupported compatibility; and
both complete canonical provenance records including unavailable ranges. The
existing canonical ordering, diagnostics/findings separation, real user-event
Enter/Space activation, immutable filtering and no-reanalysis assertions
remain passing.

Correction evidence:

- focused controller/UI tests passed: 2 files, 15 tests;
- `npm run typecheck` passed with no diagnostics;
- full `npm test` passed: 17 files, 135 tests;
- `npm run build` passed for 2,067 modules with only the existing non-failing
  chunk-size advisory;
- `npm ls SharedUI yaml @testing-library/user-event --depth=0` passed with
  `SharedUI@0.1.0`, `yaml@2.9.0` and
  `@testing-library/user-event@14.6.1`;
- the source-only stylesheet scan found exactly one
  `SharedUI/styles.css` import at `src/main.tsx:3`;
- boundary, UI parser/normalizer/validator-call, raw-shadcn, local generic
  primitive/token, prohibited-scope and SLC-007 product scans were clean;
- `git diff --check` passed with line-ending conversion warnings only.

No dependency, Handoff, CurrentIndex, Relations, Ledger, VER or REV edit;
commit, stage, push or pull request; or SLC-007 work was performed by this
Worker. CurrentIndex remains on SLC-006 and the SLC-007 relation remains
planned.

## SLC-006 post-completion correction Master verification — 2026-07-12

The Master inspected the complete controller, dashboard, workflow and test
correction. One application lifecycle union now owns selected source and the
single result; SharedUI config has empty state/statePolicy; the registered
fixture source panel is visible and truthful; and the expanded permanent tests
cover the required summary, declaration, compatibility and full provenance
evidence.

Independent Master commands passed a clean `npm ci` (271 added, 272 audited,
zero vulnerabilities), focused 2-file/15-test run, strict typecheck, full
17-file/135-test suite, 2,067-module production build, exact dependency list
and diff check. Static scans passed for one stylesheet import, framework
boundaries, UI core-logic exclusion, raw-shadcn exclusion, prohibited scope and
the SLC-007 stop. Rendered browser smoke confirmed the fixture panel and clean
analysis with one stylesheet, no overflow and no console warning/error.

`VER-SLC-006` contains exact correction evidence. SLC-006 remains active and
`REV-SLC-006` remains changes required pending a new fresh review. CurrentIndex
remains on SLC-006; SLC-007 remains planned and untouched.

## SLC-006 final post-completion re-review and completion — 2026-07-12

A fourth fresh independent Reviewer inspected the corrected controller, empty
SharedUI state, registered fixture panel, expanded permanent tests, all linked
planning and the append-only review/reopen history. It independently reproduced
the focused 2-file/15-test run, typecheck, full 17-file/135-test suite,
2,067-module build, exact dependency listing, diff check and boundary/scope/
traceability scans. No actionable finding remained.

Relations now records SLC-006 completed with passed `VER-SLC-006` and approved
`REV-SLC-006`. Immutable events 052-053 record final approval and completion
after the reopened correction. CurrentIndex intentionally remained on SLC-006
for supervising acceptance. SLC-007 remained planned and untouched at that
checkpoint. No commit, push or pull request occurred.

## SLC-007 activation — 2026-07-13

Status: active; integration, acceptance and handoff work authorized

The supervising architect accepted the completed SLC-006 boundary at committed
state `d08e097f2813231ca29c13293459697aace2e706`. The Master re-read the complete
accepted planning set, current product/test tree, passed `VER-SLC-006`, final
approved `REV-SLC-006` and the 53-line immutable Ledger before transition.

Before delegating product work, the Master expanded the complete SLC-007
contract in `ScrumIterations.md`, advanced CurrentIndex to SLC-007, expanded and
activated the SLC-007 relation, and appended immutable events 054-055 for
supervising acceptance and activation. SLC-001 through SLC-006 remain
completed. No Tier 2 work, product-code change, commit, push or pull request was
performed during this transition.

## SLC-007 Master stop-condition discovery — 2026-07-13

Status: blocked before product implementation; supervising direction required

Two independent read-only acceptance audits and the Master's direct source
inspection found that Tier 1 cannot be accepted under the current governing
documents. REQ-D-003/STU-001 require Markdown structural-heading and explicit
stable-ID extraction, while SLC-007 explicitly forbids Markdown parsing or ID
extraction and the implementation reads only the three structured core files.
This also leaves REQ-V-002 and REQ-C-001 partial for Markdown duplicate/profile
coverage.

DEC-STU-011 additionally requires a qualifying verification record to identify
its subject and contain a command/check description and outcome. Current SDP007
accepts a related verification entity from structured kind plus outcome:
passed, because verification Markdown is not read. The Master cannot silently
select the narrower semantics or expand the authorized parser boundary.

The Worker was interrupted and removed its one incomplete untracked fixture
source before any product change remained. No README, AGENTS-project, source,
test, verification or review record was changed; no command suite or browser
smoke was claimed; and no SLC/Tier/Sprint/Iteration completion was recorded.
Relations marks SLC-007 blocked, CurrentIndex stays on SLC-007 and immutable
event 056 preserves the stop reason. SLC-001 through SLC-006 remain completed;
no Tier 2 work began.
