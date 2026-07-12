# SDP Analyzer

SDP Analyzer is a read-only static web application for inspecting repository-local Standard Document Procedure evidence. The active `SLC-004` implementation discovers a deterministic bundled SDP fixture, parses raw `CurrentIndex.yaml`, `Relations.yaml`, and `Ledger.ndjson` evidence, and converts those inputs into one immutable, deterministic and provenance-preserving normalized snapshot. The SharedUI screen remains the unchanged discovery preview; normalized facts are not presented as project health, validation findings, or completion evidence.

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

No lint command is configured in `SLC-004`.

When intentionally changing dependencies, use `npm install` and keep only `package-lock.json`. Normal installs and verification should use `npm ci`.

## SLC-004 behavior and boundaries

- `src/core/source` owns the read-only source/provenance contracts and pure repository-relative path normalization. Paths use `/`, and empty, absolute, drive-letter, `.` and `..` paths fail explicitly.
- `src/core/discovery` lists source entries without reading contents, canonically sorts them, classifies source kinds, detects standard SDP directories and locates the exact CurrentIndex, Relations and Ledger paths.
- A source with all three core traceability files has `supported` profile discovery; a missing core file produces `partial` support plus a discovery diagnostic.
- `src/core/parsing` parses strict raw syntax and supported structure without coercing active IDs, resolving references, or interpreting Ledger event semantics. YAML uses the pinned `yaml@2.9.0` package in YAML 1.2 core mode with duplicate-key and multi-document rejection, no custom or known extension tags, bounded alias expansion, and explicit rejection of non-finite or unsafe integer values. Ledger keeps native `JSON.parse`, handles each nonblank line independently, retains valid neighboring records, and reports exact line provenance.
- `src/core/domain` defines readonly, serializable `Entity`, `Relation`, `LedgerEvent`, `ActiveDeclaration`, project metadata and `ProjectSnapshot` contracts. The domain imports neither React nor SharedUI and contains no graph-library types.
- `src/core/normalization` owns pure synchronous normalization. It clones and freezes its output, never mutates parser/discovery inputs, canonically orders sources, diagnostics, entities and relations, and preserves Ledger source order. Discovery support is the starting compatibility value: only `supported` may reduce to `partial` when a required parsed result or usable supported Relations structure is unavailable; `partial`, `unsupported` and `unknown` are never upgraded.
- Entities are created only from explicit stable keys in supported Relations sections. Tier, Sprint, Iteration, Slice, Review and Verification sections map directly to their kinds. Documents remain `unknown` unless their raw `kind` is an accepted document subtype; Refactors remain `unknown` unless `kind: refactor` is explicit. CurrentIndex IDs, relation targets and Ledger subjects never create entities. Complete raw attributes remain on the entity when typed string status, title or path fields are exposed.
- Duplicate explicit entity IDs use one documented deterministic policy: definitions sort by kind and canonical source, the first supplies the canonical kind/attributes, every definition `SourceRef` is retained, every definition location receives `NORMALIZE_DUPLICATE_ENTITY_DEFINITION`, and relations are still extracted from every valid definition. Duplicate definitions do not produce a validation finding.
- Directed relations are extracted only from `derives_from`, `decisions`, `tier`, `sprint`, `iteration`, `slice`, `slices`, `requirements`, `architecture`, `study_decisions`, `design`, `verification_plan`, `verification`, and `review`. Non-empty scalar string targets and non-empty string array elements are retained; invalid values are diagnosed without discarding valid array neighbors. `path`, `status`, `title`, `outcome`, `disposition`, and `design_sections` remain metadata, not relations. Targets are not resolved and reverse edges are never inferred.
- A relation occurrence ID is the unambiguous plain-text encoding `relation:${JSON.stringify([from, type, to, sourceId, path, kind, lineStart ?? null, columnStart ?? null, lineEnd ?? null, columnEnd ?? null, pointer ?? null])}`. Field pointers and array indexes make distinct explicit occurrences stable without a random/hash dependency. An identical full tuple is the same occurrence and is deterministically deduplicated with its identical provenance; distinct pointers remain distinct relations, even for the same from/type/to triple.
- CurrentIndex project metadata is retained at snapshot level without creating a project entity. Active sprint/refactor/iteration/slice values preserve explicit string, null and missing distinctions plus field provenance; invalid raw values do not become typed declarations. No existence or hierarchy conclusion is made.
- Every valid raw Ledger object becomes one ordered event with a deeply cloned payload. `type`, `subject_id`, and `timestamp` are convenience fields only when their values are strings. Invalid convenience values are diagnosed but do not erase the event; event IDs, timestamps, duplicates, chronology, completion and repository state are not interpreted.
- `src/adapters/fixtures` supplies exactly 14 small files in deterministic order. The three core traceability bodies are compact valid examples: CurrentIndex declares the fixture project and active `SPR-001 / ITR-001 / SLC-003`; Relations declares matching document, Sprint, Iteration, and Slice entries; Ledger contains three JSON-object lifecycle records. The other 11 bodies remain small placeholders. Reads accept only known canonical paths and explicitly reject unsafe, non-canonical, and unknown paths.
- `src/application/loadCoreTraceability.ts` reuses discovery, reads only the three discovered core sources in deterministic order, invokes their raw parsers, aggregates diagnostics, and preserves successful neighboring results when a read or parse fails. The existing application screen still uses the discovery preview path.
- `src/application/loadProjectSnapshot.ts` composes the existing discover/read/parse operation with pure normalization and returns discovery, useful raw parse results and the normalized snapshot. It does not validate.
- `src/ui` owns React and SharedUI composition.
- `SharedUI/styles.css` is imported once from `src/main.tsx`.

Normalization remains factual rather than semantic validation. The repository has no Markdown parser, endpoint or active-hierarchy validation, state reconstruction, validation rules or rule registry, `Finding`/fingerprint model, `SDP001` through `SDP008`, filesystem adapters, browser handles, write/repair operations, graph/report surfaces, CLI, or CI integration. Those later capabilities, including `SLC-005` validation, are not implemented.

SharedUI is installed from `file:./SharedUI-0.1.0.tgz`. Its required stylesheet currently needs the matching Tailwind 4 Vite build plugin and `tw-animate-css`; these are build-time dependencies only and do not introduce a local component or token system.
