# SDP Analyzer

SDP Analyzer is a read-only static web application for inspecting repository-local Standard Document Procedure evidence. The active `SLC-002` foundation discovers a deterministic bundled SDP fixture through a framework-independent source boundary and renders an honest discovery preview through SharedUI. It deliberately contains no SDP content parsing, normalization, or validation logic.

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

No lint command is configured in `SLC-002`.

When intentionally changing dependencies, use `npm install` and keep only `package-lock.json`. Normal installs and verification should use `npm ci`.

## SLC-002 behavior and boundaries

- `src/core/source` owns the read-only source/provenance contracts and pure repository-relative path normalization. Paths use `/`, and empty, absolute, drive-letter, `.` and `..` paths fail explicitly.
- `src/core/discovery` lists source entries without reading contents, canonically sorts them, classifies source kinds, detects standard SDP directories and locates the exact CurrentIndex, Relations and Ledger paths.
- A source with all three core traceability files has `supported` profile discovery; a missing core file produces `partial` support plus a discovery diagnostic.
- `src/adapters/fixtures` supplies exactly 14 small placeholder text files in deterministic order. It reads only known canonical paths and explicitly rejects unsafe, non-canonical and unknown reads.
- `src/application` coordinates the discovery preview and one known fixture text read retained from the original smoke path.
- `src/ui` owns React and SharedUI composition.
- `SharedUI/styles.css` is imported once from `src/main.tsx`.

Discovery does not parse or interpret YAML, JSON, NDJSON or Markdown contents and does not infer IDs, active work or status. There are no filesystem adapters, browser handles, validation rules, findings, write operations, repair behavior, CLI or CI integration.

SharedUI is installed from `file:./SharedUI-0.1.0.tgz`. Its required stylesheet currently needs the matching Tailwind 4 Vite build plugin and `tw-animate-css`; these are build-time dependencies only and do not introduce a local component or token system.
