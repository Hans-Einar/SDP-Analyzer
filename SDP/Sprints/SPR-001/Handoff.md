# Handoff — SLC-001

Status: ready for Codex Master  
Active Slice: `SLC-001`  
Sprint: `SPR-001`  
Iteration: `ITR-001`

## Codex Master prompt

```text
You are now the repository-local SDP Master agent for:

Hans-Einar/SDP-Analyzer

Work directly in the local repository. Do not create a pull request. Do not commit unless the human explicitly asks you to commit.

Your only authorized implementation scope is:

SLC-001 — Project skeleton and SharedUI boundary enforcement

Before doing any work, re-anchor from repository evidence in this order:

1. AGENTS.md
2. AGENTS-project.md
3. SDP/AGENT-REMINDERS.md
4. SDP/Framework/README.md
5. .codex/skills/sdp-master/SKILL.md
6. .codex/skills/sdp-worker/SKILL.md
7. .codex/skills/sdp-reviewer/SKILL.md
8. .codex/skills/sdp-traceability/SKILL.md
9. SDP/Traceability/CurrentIndex.yaml
10. SDP/Traceability/Relations.yaml
11. SDP/Traceability/Ledger.ndjson
12. SDP/01--Mandate/mandate.md
13. SDP/02--Study/study.md
14. SDP/03--Requirements/requirements.md
15. SDP/04--Architecture/architecture.md
16. SDP/05--DesignAnalysis/design-analysis.md
17. SDP/06--Design/design.md
18. SDP/07--Implementation/implementation-plan.md
19. SDP/Sprints/SPR-001/ScrumIterations.md
20. SDP/Verification/verification-plan.md
21. SDP/Sprints/SPR-001/Handoff.md

Confirm from CurrentIndex that SPR-001 / ITR-001 / SLC-001 is active. Repository documents override this prompt if they disagree; stop and report the contradiction rather than guessing.

Operate as SDP Master:

- inspect the repository before choosing tooling;
- delegate bounded implementation to a Worker context;
- use a fresh independent Reviewer context;
- inspect actual verification output yourself;
- update implementation notes, verification, review and traceability only from real evidence;
- stop at the SLC-001 boundary.

SLC-001 goal:

Create the minimal Vite + React + TypeScript skeleton, deterministic install/test/typecheck/build commands, architectural folders, a correctly integrated SharedUI dashboard shell and one fixture-source smoke path. Do not implement SDP parsing, normalization, validation rules or findings semantics.

SharedUI package evidence:

- A package tarball exists at the repository root: SharedUI-0.1.0.tgz
- Install it as a repository-relative dependency, normally:
  "SharedUI": "file:./SharedUI-0.1.0.tgz"
- The source repository is Hans-Einar/SharedUI.
- After installation, read:
  - node_modules/SharedUI/README.md
  - node_modules/SharedUI/docs/PACKAGE_INSTALLATION.md
  - node_modules/SharedUI/src/components/baseline/COMPONENT_CONTRACTS.md

Mandatory SharedUI implementation pattern:

1. Import "SharedUI/styles.css" once from the application entry.
2. Use DashboardRenderer as the dashboard shell.
3. Use defineDashboardConfig with explicit validators and statePolicy.
4. Start the component registry from baselineComponentRegistry.
5. Prefer semantic baseline components before creating local JSX.
6. Register any allowed custom component by stable key.
7. Keep SharedUI imports inside src/ui or the UI composition entry.
8. Never import SharedUI from src/core, src/application or src/adapters.
9. Do not unpack/copy the tarball or copy SharedUI source into the app.
10. Do not recreate local generic equivalents of baseline components or theme tokens.

Expected baseline reuse for this shell:

- TopNav or another documented baseline header for product identity;
- PageHeader and/or Section for the smoke content;
- Badge for the fixture/source status where useful;
- EmptyState or AlertBanner only when semantically appropriate.

Do not force an unsuitable baseline contract. A narrow SDP-Analyzer-specific registered component is allowed only when needed to display the fixture/source smoke information correctly. It must not become a local generic Card, Button, Header, Badge, Alert, Table, DetailPanel, navigation primitive or styling system.

When a generic capability appears to be missing from SharedUI:

- record it as a discovery/future SharedUI improvement;
- do not audit or modify SharedUI in this Slice;
- do not silently implement a reusable substitute locally;
- stop as blocked only if the missing capability makes the tiny shell impossible.

Required outcomes:

1. One selected npm-compatible package manager and one lockfile.
2. A reproducible package manifest with SharedUI installed from file:./SharedUI-0.1.0.tgz.
3. Strict TypeScript and a static Vite production build.
4. A minimal SharedUI-rendered React application identifying the bundled fixture/source.
5. Clear boundaries:
   - src/core
   - src/application
   - src/adapters/fixtures
   - src/ui
6. A minimal read-only source contract and tiny deterministic fixture sufficient only to prove listing/reading text.
7. At least one smoke/unit test proving fixture text is accessed through the source boundary.
8. A rendered test or manual browser smoke check of the SharedUI shell.
9. README and AGENTS-project.md updated with the selected package manager and exact commands.
10. Actual verification evidence and fresh review.

Authoritative requirements:

- REQ-M-001
- REQ-M-004
- REQ-NF-005
- REQ-UI-004
- foundation only: REQ-T-003, REQ-F-001, REQ-M-002, REQ-UI-001

Authoritative references:

- ARC-COMP-001
- ARC-COMP-007
- ARC-COMP-008
- ARC-COMP-009
- ARC-COMP-011
- ADR-001
- ADR-002
- ADR-007
- DES-001 sections 2, 9, 10, 11 and 14
- AGENTS-project.md
- the complete SLC-001 contract in SDP/Sprints/SPR-001/ScrumIterations.md

Invariants:

- strict TypeScript;
- core imports neither React nor SharedUI;
- application/adapters import no SharedUI;
- no analyzed content is executed;
- fixture access is read-only and deterministic;
- UI contains no SDP parsing or validation logic;
- SharedUI state has validators and explicit ownership/update sources;
- no global state framework;
- no monorepo/published-package abstraction unless existing repository evidence requires it;
- no duplicated generic SharedUI components or tokens;
- no product behavior from later Slices.

Explicit non-goals:

- YAML, JSON, NDJSON or Markdown parser dependencies;
- CurrentIndex/Relations/Ledger semantics;
- normalized SDP entities or relations;
- validation rules/findings;
- File System Access API;
- graph visualization;
- polished dashboard;
- audit or modification of SharedUI;
- audit of GrassPhenology or other SharedUI consumers;
- Node service, Electron, Tauri, CLI or CI integration;
- beginning SLC-002.

Verification:

Run and record exact commands and outcomes for:

- clean dependency installation from the lockfile;
- successful installation/resolution of SharedUI from the local tarball;
- strict typecheck;
- tests;
- production build;
- lint if configured;
- rendered smoke check identifying the bundled fixture/source;
- inspection that SharedUI/styles.css is imported exactly once;
- inspection that src/core, src/application and src/adapters have no SharedUI imports;
- inspection that local UI files do not duplicate baseline generic components.

Create VER-SLC-001 only after checks run. Create REV-SLC-001 only after a fresh independent review. The Reviewer must explicitly assess SharedUI reuse and flag local generic component reimplementation.

Traceability on completion:

- update SLC-001 status only according to actual evidence;
- add VER-SLC-001 and REV-SLC-001 only if records exist;
- append Ledger.ndjson; never rewrite historical lines;
- keep CurrentIndex on SLC-001 until the supervising human/architect accepts completion;
- do not activate SLC-002 automatically.

Return with:

- changed files;
- package-manager and SharedUI installation decisions;
- baseline components reused and any custom component justification;
- exact verification evidence;
- Reviewer disposition/findings;
- traceability changes;
- residual discoveries;
- a clear statement that you stopped at SLC-001.
```

## Supervising review checklist after Codex returns

- SharedUI is installed from `file:./SharedUI-0.1.0.tgz` and locked reproducibly.
- SharedUI package docs/contracts were followed.
- `DashboardRenderer`, `defineDashboardConfig` and `baselineComponentRegistry` are used.
- `SharedUI/styles.css` is imported once.
- No generic SharedUI component or theme primitive was recreated locally.
- Every local custom component is narrowly domain-specific and registered by stable key.
- Core/application/adapters contain no SharedUI imports.
- No parser or validation logic slipped into SLC-001.
- Source contract remains minimal and deterministic.
- Actual verification and fresh review records exist before completion is claimed.
- Ledger was appended, not rewritten.
- CurrentIndex did not silently advance to SLC-002.
