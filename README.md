# SDP Analyzer

SDP Analyzer is a read-only static React application for inspecting repository-local Standard Document Procedure evidence. Its accepted Tier 1 implementation analyzes bundled fixtures against the explicit `sdp-toolkit-structured-core-v1` profile. The active Tier 2 foundation also provides a presentation-neutral browser-directory `ProjectSource` for an already-selected handle; it is not yet connected to a picker or UI.

Tier 1 content analysis is deliberately limited to:

- `SDP/Traceability/CurrentIndex.yaml`;
- `SDP/Traceability/Relations.yaml`; and
- `SDP/Traceability/Ledger.ndjson`.

Standard SDP Markdown files and directories are discovered and classified from canonical repository-relative paths only. Their contents are not read.

## Prerequisites

- Node.js 24 (verified with `v24.11.0`)
- npm 11 (verified with `11.6.1`)
- the repository-root `SharedUI-0.1.0.tgz` package

SharedUI is installed through the repository-relative dependency `file:./SharedUI-0.1.0.tgz`. The application imports `SharedUI/styles.css` once and uses SharedUI's dashboard renderer, registry, and semantic baseline components. The analysis core does not import React or SharedUI.

## Commands

Install exactly from the committed lockfile:

```powershell
npm ci
```

Start the local Vite development server:

```powershell
npm run dev
```

Run strict TypeScript checking:

```powershell
npm run typecheck
```

Run all deterministic core, application, fixture, and rendered UI tests:

```powershell
npm test
```

Type-check and create the static production build:

```powershell
npm run build
```

Confirm the direct analysis dependencies:

```powershell
npm ls SharedUI yaml --depth=0
```

No lint command is configured. Use `npm install` only when intentionally changing dependencies; normal installation and verification use `npm ci`. Keep the single `package-lock.json` lockfile.

## Tier 1 capabilities

The shipped fixture selector exposes two deterministic `ProjectSource` inputs:

- a clean fixture with declared project identity, active Sprint/Iteration/Slice, a past completed Slice, and a related structured verification entity containing a synthetic check description plus exact `outcome: passed`;
- a broken fixture with malformed Ledger evidence, duplicate definitions, dangling relations, contradictory active hierarchy, and a completed Slice without qualifying verification.

Both fixtures traverse the real pipeline:

```text
ProjectSource
-> discovery
-> strict parsing
-> normalization
-> ordered validation
-> application lifecycle
-> SharedUI presentation
```

The analyzer currently provides:

- canonical source discovery and standard-directory presence detection;
- YAML 1.2-compatible parsing with duplicate-key, multi-document, unsafe-number, unsupported-root, custom-tag, and alias-limit protections;
- independent NDJSON line parsing that retains valid records around a malformed line;
- immutable normalized project metadata, active declarations, entities, relations, Ledger events, compatibility metadata, diagnostics, and source provenance;
- stable rule IDs `SDP001` through `SDP008`, canonical finding ordering, and deterministic structural fingerprints;
- `SDP007` verification qualification from an explicit Slice `verification` relation resolving to a `verification` entity with exact `outcome: passed` and a non-empty trimmed string `check` or `command`;
- project identity, compatibility, input status, declared active work, diagnostics, filtered findings, recommendations, affected IDs, fingerprints, and full provenance detail in the UI;
- distinct loading, ready, no-diagnostics, no-findings, partial/unknown/unsupported, and failed states;
- source switching that clears stale results and finding selection, plus repeat analysis without duplicate UI state; and
- deterministic tests proving the Tier 1 analysis path reads only the three structured traceability files.

Diagnostics describe acquisition, parser, normalization, and isolated rule-engine conditions. Findings are separate validation conclusions. A finding-free clean fixture is not presented as proof of total repository correctness.

## Tier 2 browser adapter foundation

`BrowserDirectoryProjectSource` accepts an already-selected File System Access API directory handle and traverses only handles yielded beneath it. It lists canonical repository-relative file paths deterministically, reads file text lazily, reports immutable acquisition state for complete, partial, or failed listings, and exposes prompt-free read-permission inspection. Browser acquisition capability detection is separate and only checks whether the required picker surface is callable.

This adapter is read-only. It does not invoke the directory picker, request permission, persist handles, upload content, expose write APIs, or add browser-specific behavior to discovery and analysis. The current application UI continues to offer only bundled fixtures until the separately contracted explicit user-gesture workflow is implemented.

## Read-only and security boundary

Analyzed source content is processed in memory. The analyzer does not:

- execute project code, scripts, hooks, binaries, MDX, YAML constructors, or recorded verification commands;
- mutate, repair, or write back to the analyzed project;
- upload repository content; or
- infer missing entities or provenance.

Failure in one structured source retains diagnostics and any usable neighboring evidence. Missing targets receive no invented source reference.

## Known limitations and planned work

The current UI remains fixture-only. The browser adapter accepts an already-selected handle, but local-folder selection, picker invocation, permission-request UX, and application source switching remain later Tier 2 work.

Tier 1 discovers Markdown paths but does not analyze Markdown content, headings, stable IDs, document statuses, lifecycle/Sprint/Iteration/Slice text, review text, or verification-document content. That coverage belongs to Tier 3. The structured-core profile must not be interpreted as complete installed-document compatibility.

The application also has no graph view, entity/relation navigation beyond finding provenance, report export, CLI, CI integration, local Node service, stale-work policy, automatic repair, or write-back. Those are later Tier or separately mandated capabilities.
