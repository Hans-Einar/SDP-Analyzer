# SDP Analyzer

SDP Analyzer is a read-only static web application for inspecting repository-local Standard Document Procedure evidence. The current `SLC-001` foundation renders a bundled fixture through SharedUI and deliberately contains no SDP parsing, normalization, or validation logic.

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

No lint command is configured in `SLC-001`.

When intentionally changing dependencies, use `npm install` and keep only `package-lock.json`. Normal installs and verification should use `npm ci`.

## SLC-001 boundaries

- `src/core` owns framework-independent contracts.
- `src/application` coordinates the minimal source-preview use case.
- `src/adapters/fixtures` supplies the deterministic, read-only fixture.
- `src/ui` owns React and SharedUI composition.
- `SharedUI/styles.css` is imported once from `src/main.tsx`.

SharedUI is installed from `file:./SharedUI-0.1.0.tgz`. Its required stylesheet currently needs the matching Tailwind 4 Vite build plugin and `tw-animate-css`; these are build-time dependencies only and do not introduce a local component or token system.

