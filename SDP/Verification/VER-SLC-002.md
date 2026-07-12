# VER-SLC-002 — Project source, provenance and discovery

Status: passed; independent review approved
Verification ID: `VER-SLC-002`
Slice: `SLC-002`
Sprint: `SPR-001`
Iteration: `ITR-001`
Date: 2026-07-11

## Scope verified

This record verifies the complete uncommitted SLC-002 transition and product
tree against the active contract in
`SDP/Sprints/SPR-001/ScrumIterations.md`:

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
- `SDP/Sprints/SPR-001/ScrumIterations.md`
- `SDP/Sprints/SPR-001/Handoff.md`
- `SDP/Sprints/SPR-001/implementationNotes.md`
- `SDP/CodeReview/REV-SLC-002.md`
- `SDP/Traceability/CurrentIndex.yaml`
- `SDP/Traceability/Relations.yaml`
- `SDP/Traceability/Ledger.ndjson`
- this verification record

No package manifest or lockfile changed. `SharedUI-0.1.0.tgz` is tracked and
its repository-relative dependency remains locked.

## Environment

- Operating system: Windows
- Node.js: `v24.11.0`
- npm: `11.6.1`
- branch: `main` at committed SLC-001 baseline `c83c88a`
- working tree: uncommitted by explicit human instruction

## Commands and outcomes

### Clean dependency installation

Command:

```powershell
npm ci
```

Outcome: passed with exit code 0. npm added 269 packages, audited 270 packages
in 9 seconds and reported 0 vulnerabilities.

Command:

```powershell
npm ls SharedUI --depth=0
```

Outcome: passed with exit code 0 and resolved `SharedUI@0.1.0` for
`sdp-analyzer@0.1.0`.

### Strict TypeScript

Command:

```powershell
npm run typecheck
```

Outcome: passed with exit code 0 and no TypeScript diagnostics.

### Automated tests

Command:

```powershell
npm test
```

Outcome: passed with exit code 0 under Vitest `4.1.10`: 4 test files passed
and 23 tests passed.

A second evidence run used:

```powershell
npm test -- --reporter=verbose
```

It also passed 4 files and 23 tests and exposed each contract case:

- canonical and Windows path normalization;
- absolute, UNC-like, drive-letter, empty, `.` and `..` rejection;
- exact 14-file fixture ordering and repeated-list determinism;
- known reads plus unknown, unsafe and non-canonical read failures;
- all three exact core sources and all seven lifecycle directories;
- canonical provenance on all 14 discovered files;
- deterministic repeated discovery with zero `readText()` calls;
- YAML/JSON/NDJSON/Markdown extension classification;
- partial support and a stable diagnostic when Relations is absent;
- invalid traversal entries excluded without erasing valid sources; and
- the rendered SharedUI application smoke.

### Static production build

Command:

```powershell
npm run build
```

Outcome: passed with exit code 0. TypeScript completed first; Vite `8.1.4`
then transformed 1,976 modules and emitted:

- `dist/index.html`: 0.53 kB, 0.33 kB gzip
- CSS: 72.88 kB, 12.17 kB gzip
- JavaScript: 510.07 kB, 150.61 kB gzip

Vite emitted the known non-failing warning because the mandatory full SharedUI
baseline registry produces a chunk larger than 500 kB after minification.

### Working-tree whitespace

Command:

```powershell
git diff --check
```

Outcome: passed with exit code 0. Git printed only the repository's existing
Windows LF-to-CRLF working-copy notices.

## Deterministic discovery evidence

Direct implementation and test inspection confirmed:

- `discoverProject` consumes `ProjectSource` and calls only `listFiles()`;
- the complete fixture manifest is byte-for-byte equal across repeated
  discovery calls;
- the complete fixture has 14 canonically sorted files, 3/3 core traceability
  sources, all seven lifecycle directories, Sprint/Verification/Traceability
  presence, structural profile `sdp-toolkit-current / supported` and zero
  diagnostics;
- every discovered file has a `SourceRef` whose `sourceId`, `path` and
  `kind` match the discovered source;
- a source missing `SDP/Traceability/Relations.yaml` returns `partial` plus
  `DISCOVERY_MISSING_CORE_SOURCE` without reading contents;
- unsafe listed paths produce `DISCOVERY_INVALID_PROJECT_PATH` and are
  excluded while valid files remain; and
- unrecognized extensions remain visible as `synthetic` with an explicit
  informational diagnostic rather than silent compatibility success.

## Rendered browser smoke

Command:

```powershell
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Outcome: passed. Vite reported ready in 258 ms at
`http://127.0.0.1:4173/`. A fresh in-app browser tab rendered the SharedUI
shell and exposed:

- `Bundled discovery smoke path`;
- `SLC-002` and the read-only discovery boundary description;
- fixture name `Bundled minimal SDP fixture`;
- source ID `fixture:minimal`;
- file count `14` and first file `AGENTS-project.md`;
- core traceability `3/3`;
- profile support `supported`;
- discovery diagnostics `0`; and
- the placeholder sample read.

Direct visual inspection showed the existing SharedUI navigation, page header,
section, ready badge and detail panel styled and laid out. Computed evidence
reported one active style node, slate body background/text, a 20 px top heading
and flex main layout. Browser warning/error logs were empty. The screenshot was
inspected live but not persisted; the tab and development server were closed.

## Boundary and scope inspections

Commands:

```powershell
rg -n 'SharedUI/styles\.css' src
rg -n '(from\s+["''](?:SharedUI|react|react-dom)|import\s+["''](?:SharedUI|react|react-dom))' src/core src/application src/adapters
rg -n '\b(window|document|navigator|FileSystemDirectoryHandle|process|Buffer)\b|node:|from\s+["''](?:fs|path)["'']' src/core
rg -n 'JSON\.parse|parseDocument|remarkParse|ValidationRule|FindingSeverity|fingerprint|showDirectoryPicker|FileSystemDirectoryHandle|node:fs|writeFile|appendFile|createWriteStream|exec\(|spawn\(' src package.json
rg -n '"(?:yaml|js-yaml|remark|remark-parse|unified|gray-matter|markdown-it)"\s*:' package.json
```

Outcomes:

- exactly one `SharedUI/styles.css` import remains at `src/main.tsx:3`;
- no React, React DOM or SharedUI import exists in core, application or
  adapters;
- core contains no Node/browser filesystem dependency or global;
- no content-parser call, validation/finding model, filesystem adapter,
  execution or write API was found;
- no direct YAML/Markdown parser dependency is declared; and
- package and lockfile diffs are empty.

Manual inspection found no YAML, JSON, NDJSON or Markdown content
interpretation; no entity or active-work normalization; no validation rule or
finding; no browser/Node source adapter; and no SLC-003 implementation.

## Traceability verification

YAML and NDJSON syntax checks passed. `CurrentIndex.yaml` and
`Relations.yaml` both identify `SPR-001 / ITR-001 / SLC-002` as active;
`SLC-001` remains completed; `SLC-003` remains planned. All 17
pre-verification ledger events had unique IDs, and the first 15 committed events
were unchanged. Transition events 016 and 017 record supervising architect
acceptance of SLC-001 and activation of SLC-002.

## Earlier Worker failure retained as evidence

An early authoring typecheck found four test/type-predicate issues. The Worker
corrected those test typings before the final clean installation and passing
typecheck/test/build sequence. No product requirement or architecture change
was needed.

## Limitations and discoveries

- Fixture contents are intentional placeholders and are not parsed or asserted
  as valid YAML, JSON, NDJSON or Markdown records.
- Profile support is path-structural only in SLC-002; content/profile
  compatibility awaits later parsing work.
- Unknown extensions map to the required `synthetic` source kind and produce
  an informational diagnostic because `SourceKind` has no `unknown` member.
- No lint command is configured, so lint was not run.
- The known SharedUI baseline-registry chunk warning remains non-failing.
- No production deployment, filesystem acquisition, parser, findings model or
  SLC-003 behavior is part of this verification.

## Initial verification result

All applicable initial SLC-002 Master verification gates passed. The first
independent review subsequently required the source-list failure correction
recorded below.

## Correction verification — 2026-07-12

The first independent review required one correction: a rejected
`ProjectSource.listFiles()` call had been routed through the successful empty
listing path, producing `partial` support and three unsupported missing-core
warnings. A bounded Worker changed only `discoverProject.ts`, its discovery
test and the appended implementation-note evidence.

The corrected failure path returns `sdp-toolkit-current / unknown`, empty
observed structure and only `DISCOVERY_SOURCE_LIST_FAILED`. A successfully
observed empty listing remains `partial` with three missing-core warnings.
The regression asserts exact output, repeated determinism and zero content
reads for both paths.

Master reruns:

- `npm test -- src/core/discovery/discoverProject.test.ts --reporter=verbose`:
  passed, 1 file and 6 tests;
- `npm run typecheck`: passed without diagnostics;
- `npm test`: passed, 4 files and 24 tests;
- `npm run build`: passed, 1,976 modules transformed; JavaScript 510.26 kB
  minified / 150.65 kB gzip with the same non-failing chunk warning; and
- `git diff --check`: passed with only LF-to-CRLF working-copy notices.

No UI, package, adapter, path-normalization, fixture, transition or later-Slice
file changed during correction. The fresh re-review approval is recorded below.

## Reviewer confirmation

`REV-SLC-002` independently reproduced clean installation, strict typecheck,
the original 23-test suite, production build, SharedUI resolution, whitespace,
boundary/scope and traceability checks. Its first disposition required the
source-list failure correction.

A bounded Worker implemented that correction. A second fresh Reviewer reran
the focused 6/6 discovery tests, strict typecheck, the final 24/24 test suite,
production build, SharedUI resolution, traceability validation and focused
boundary/platform/parser/write/content-read scans. The original finding is
resolved and the final disposition is approved with no remaining actionable
finding.

## Final result

All applicable SLC-002 verification gates passed and the final independent
review disposition is approved.
