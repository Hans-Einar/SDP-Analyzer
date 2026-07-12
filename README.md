# SDP Analyzer

SDP Analyzer is a read-only static web application for inspecting repository-local Standard Document Procedure evidence. The active `SLC-003` implementation discovers a deterministic bundled SDP fixture and parses raw `CurrentIndex.yaml`, `Relations.yaml`, and `Ledger.ndjson` evidence through framework-independent core boundaries. The SharedUI screen remains an honest discovery preview; raw parser results are not yet presented as project health, normalized entities, resolved relations, validation findings, or completion evidence.

## Prerequisites

- Node.js 24 (verified with `v24.11.0`)
- npm 11 (verified with `11.6.1`)
- the repository-root `SharedUI-0.1.0.tgz` package

## Commands

Install exactly from the committed lockfile:

```powershell
npm ci
```

Start the local Vite development server:

```powershell
npm run dev
```

Run the strict TypeScript check:

```powershell
npm run typecheck
```

Run all deterministic unit and rendered smoke tests:

```powershell
npm test
```

Type-check and create the static production build:

```powershell
npm run build
```

No lint command is configured in `SLC-003`.

When intentionally changing dependencies, use `npm install` and keep only `package-lock.json`. Normal installs and verification should use `npm ci`.

## SLC-003 behavior and boundaries

- `src/core/source` owns the read-only source/provenance contracts and pure repository-relative path normalization. Paths use `/`, and empty, absolute, drive-letter, `.` and `..` paths fail explicitly.
- `src/core/discovery` lists source entries without reading contents, canonically sorts them, classifies source kinds, detects standard SDP directories and locates the exact CurrentIndex, Relations and Ledger paths.
- A source with all three core traceability files has `supported` profile discovery; a missing core file produces `partial` support plus a discovery diagnostic.
- `src/core/parsing` parses strict raw syntax and supported structure without coercing active IDs, resolving references, or interpreting Ledger event semantics. YAML uses the pinned `yaml@2.9.0` package in YAML 1.2 core mode with duplicate-key and multi-document rejection, no custom or known extension tags, bounded alias expansion, and explicit rejection of non-finite or unsafe integer values. Ledger keeps native `JSON.parse`, handles each nonblank line independently, retains valid neighboring records, and reports exact line provenance.
- `src/adapters/fixtures` supplies exactly 14 small files in deterministic order. The three core traceability bodies are compact valid examples: CurrentIndex declares the fixture project and active `SPR-001 / ITR-001 / SLC-003`; Relations declares matching document, Sprint, Iteration, and Slice entries; Ledger contains three JSON-object lifecycle records. The other 11 bodies remain small placeholders. Reads accept only known canonical paths and explicitly reject unsafe, non-canonical, and unknown paths.
- `src/application/loadCoreTraceability.ts` reuses discovery, reads only the three discovered core sources in deterministic order, invokes their raw parsers, aggregates diagnostics, and preserves successful neighboring results when a read or parse fails. The existing application screen still uses the discovery preview path.
- `src/ui` owns React and SharedUI composition.
- `SharedUI/styles.css` is imported once from `src/main.tsx`.

Parsing remains source-local and raw. The repository has no Markdown parser, normalized `Entity`, `Relation`, `LedgerEvent`, or `ProjectSnapshot` model, cross-file active hierarchy or relation resolution, state reconstruction, validation rules, findings/fingerprints, filesystem adapters, browser handles, write/repair operations, graph/report surfaces, CLI, or CI integration. Those later capabilities, including `SLC-004` normalization, are not implemented.

SharedUI is installed from `file:./SharedUI-0.1.0.tgz`. Its required stylesheet currently needs the matching Tailwind 4 Vite build plugin and `tw-animate-css`; these are build-time dependencies only and do not introduce a local component or token system.
