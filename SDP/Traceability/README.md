# Traceability

Project traceability normally contains:

- `CurrentIndex.yaml` - current active Sprint/Refactor, Iteration and Slice
- `Relations.yaml` - links between requirements, designs, slices, reviews and verification
- `Ledger.ndjson` - append-only event history

Create `Ledger.ndjson` as an empty file in a consuming project, then append one
valid JSON object per line. Never rewrite historical ledger events.