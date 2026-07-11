# AGENTS-project.md

## Repository purpose

`SDP-Analyzer` is a Vite/React/TypeScript application governed by the repository-local SDP documents. The analysis core must remain independent of React and SharedUI.

## SharedUI package

A local package tarball is available at the repository root:

```text
SharedUI-0.1.0.tgz
```

Install it from the repository root with the selected npm-compatible package manager, using a repository-relative file dependency such as:

```json
"SharedUI": "file:./SharedUI-0.1.0.tgz"
```

or the equivalent explicit install command:

```powershell
npm install ./SharedUI-0.1.0.tgz
```

The authoritative SharedUI source repository is `Hans-Einar/SharedUI`. The packed package contains its runtime, docs, styles and baseline component contracts.

## Mandatory SharedUI usage rules

Before creating UI components, read the installed package documentation, especially:

- `node_modules/SharedUI/README.md`
- `node_modules/SharedUI/docs/PACKAGE_INSTALLATION.md`
- `node_modules/SharedUI/src/components/baseline/COMPONENT_CONTRACTS.md`

For the SDP-Analyzer UI:

1. Import `SharedUI/styles.css` exactly once from the application entry.
2. Use `DashboardRenderer`, `defineDashboardConfig` and `baselineComponentRegistry` as the normal dashboard shell.
3. Use semantic baseline components before writing local equivalents.
4. Do not copy or recreate SharedUI styling, tokens, shadcn primitives or baseline components inside this repository.
5. Add a local registered custom component only when it represents SDP-Analyzer-specific behavior or data that an existing baseline component cannot express.
6. Custom components must be registered by a stable key and remain inside `src/ui`; they must not bypass SharedUI layout/state resolution.
7. Prefer semantic imports from `SharedUI`, `SharedUI/schema`, `SharedUI/renderer` or `SharedUI/components/baseline` over raw shadcn imports.
8. Raw `SharedUI/components/shadcn/*` imports require an explicit documented reason and Reviewer approval.
9. Do not modify or unpack the tarball into application source.
10. A missing SharedUI capability is recorded as a discovery or future SharedUI improvement, not silently reimplemented as a new generic local design-system component.

Expected baseline reuse includes, where applicable:

- `TopNav` or `PageHeader` for product/page identity;
- `Section` for titled content grouping;
- `Badge` for compatibility and status labels;
- `AlertBanner`, `EmptyState`, `CardSkeleton` and `ErrorFallback` for feedback states;
- `DataTable` for stable tabular findings or source lists;
- `DetailPanel` for concise finding provenance and metadata;
- `SearchBar`, `FilterBar` or `TabBar` only when their documented behavior matches the workflow.

Do not force a baseline component where its contract is semantically wrong. The choice is between reuse and a narrowly domain-specific registered component, not a duplicate generic component.

## Architecture boundaries

- `src/core` must not import React, React DOM or SharedUI.
- `src/application` must not import SharedUI and should avoid React unless an explicit UI adapter requires it.
- `src/adapters` must not import SharedUI.
- SharedUI imports belong in `src/ui` and the application composition entry only.
- SDP parsing, normalization and validation decisions never belong in SharedUI config or React components.

## Commands and package manager

The package manager and exact commands are established by `SLC-001` from repository evidence. Once chosen, document them here and in the README. Do not maintain competing lockfiles.

## Operating constraints

- No pull requests or commits unless the human explicitly requests them.
- One active Slice at a time.
- No product work outside the active Slice.
- Record real verification and use a fresh independent Reviewer.
- Repository evidence overrides chat memory.