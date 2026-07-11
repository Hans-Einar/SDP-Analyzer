# SLC-001 Implementation Notes

Status: completed; independent review approved; awaiting supervising acceptance  
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
the correction, final approval, and Slice completion. `CurrentIndex.yaml`
intentionally remains pointed at `SPR-001 / ITR-001 / SLC-001` for supervising
acceptance. `SLC-002` remains planned.

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

The pre-existing untracked `SharedUI-0.1.0.tgz` remains intact and is not an implementation-authored file.

## Limitations and stop boundary

- The fixture is intentionally a single bundled text record; full path rules, discovery, provenance, and adapter contract breadth belong to `SLC-002`.
- There are no parser dependencies or CurrentIndex, Relations, Ledger, Markdown, normalization, validation, findings, filesystem API, graph, global state, CLI, service, or mutation features.
- The Worker did not pre-claim verification, review, or completion. The Master
  integrated those records and statuses only after real verification and final
  Reviewer approval.
- Work stopped at `SLC-001`; `SLC-002` was not started.
