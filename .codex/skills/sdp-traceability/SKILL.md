# SDP Traceability

Use this skill when updating SDP traceability.

1. Read the active Slice and linked requirements, design, review and verification IDs.
2. Update `CurrentIndex.yaml` to reflect only the actual active state.
3. Update `Relations.yaml` with explicit requirement, design, Slice, review and verification links.
4. Append immutable events to `Ledger.ndjson`; never rewrite historical events.
5. Validate YAML and NDJSON syntax.
6. Check that document status and traceability status agree.
7. Report stale, missing or contradictory links to the Master.

Do not invent IDs, evidence or completion state.