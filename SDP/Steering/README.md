# Steering interaction records

`SDP/Steering/` preserves material communication between the supervising
Steering Group and repository-local Codex Masters.

Chat history is transport, not authority. The repository record is the durable
source for assignments, raw Master responses and Steering dispositions.

## Record layout

```text
SDP/Steering/
├── README.md
└── Interactions/
    └── STR-YYYY-NNN--short-name.md
```

Each interaction record has one stable ID and three ordered sections:

1. **Steering prompt** — the exact prompt issued to the Codex Master;
2. **Raw Master response** — copied verbatim when received, without cleanup or
   retrospective rewriting;
3. **Steering assessment** — the supervising assessment after repository
   evidence has been inspected.

A record may be created with the response and assessment sections marked
`pending`. Later updates must preserve the original prompt and raw response.
Corrections are additive and explicitly dated.

## Minimum metadata

Each record declares:

- interaction ID;
- project ID;
- created date;
- Steering role;
- target agent/role;
- repository and expected base commit;
- related Feature, Tier, Sprint, Iteration and Slice IDs when known;
- interaction status;
- prompt status, response status and assessment status.

Recommended interaction statuses are:

- `prompt-issued`;
- `response-received`;
- `under-steering-review`;
- `accepted`;
- `changes-required`;
- `blocked`;
- `superseded`.

## Traceability

Material interaction transitions should be represented in
`SDP/Traceability/Ledger.ndjson` when the installed SDP contract supports the
corresponding event types. Until that contract is formally added, the
interaction file itself is authoritative and must be related from planning or
work records where practical.

Future SDP Analyzer versions may discover these paths and present interaction
metadata. Raw chat-log interpretation is not required for the current Tier 2
implementation.
