# SDP Document Guide

The folders at this repository root show the recommended structure inside a
consuming project's `SDP/` directory. They are reference templates, not active
project records for this toolkit repository.

## Lifecycle documents

| Folder | Purpose |
|---|---|
| `01--Mandate` | Why the project exists, intended outcomes, scope and non-goals |
| `02--Study` | Research, evidence, alternatives, assumptions and unresolved questions |
| `03--Requirements` | Stable numbered functional and quality requirements |
| `04--Architecture` | Major boundaries, responsibilities, dependencies and contracts |
| `05--DesignAnalysis` | Horizontal layer analysis, contract mapping and Tier fan-out |
| `06--Design` | Chosen detailed designs and interaction contracts |
| `07--Implementation` | Ordered vertical delivery strategy and implementation plans |

## Operating documents

- `Sprints/`: active delivery containers with iterations and slices
- `Refactors/`: structured architecture/refactor programmes
- `CodeReview/`: independent review records and findings
- `Verification/`: build, test, rendered and manual evidence
- `Traceability/`: `CurrentIndex.yaml`, `Relations.yaml` and append-only `Ledger.ndjson`
- `Instructions/`: project-specific operating rules

## Installation ownership

The installer copies templates only when the target file is missing. Existing
project documents are never replaced. Toolkit-managed files are limited to
`SDP/Framework/` and `.codex/skills/`; project documents remain project-owned.

Use:

```powershell
C:\Users\hanse\GIT\SDP\Toolkit\scripts\Install-SDP.ps1 `
  -ProjectRoot C:\path\to\Project `
  -InitializeProjectStructure
```

Edit the installed templates into project-specific documents. Remove template
instructions once the document becomes authoritative.