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

Status: completed; final independent review approved; awaiting supervising acceptance
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
Slice completion. `CurrentIndex.yaml` remains on SLC-002 for supervising
acceptance; SLC-003 remains planned and untouched.
