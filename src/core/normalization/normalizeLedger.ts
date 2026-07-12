import type { LedgerEvent } from "../domain/LedgerEvent";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { RawLedger } from "../parsing/parseLedger";
import type { RawValue } from "../parsing/RawValue";
import {
  cloneRawObject,
  cloneSourceRef,
} from "./canonicalOrdering";

const CONVENIENCE_FIELDS = ["type", "subject_id", "timestamp"] as const;

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function describeRawValue(value: RawValue): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

export interface LedgerNormalization {
  readonly ledger: readonly LedgerEvent[];
  readonly diagnostics: readonly Diagnostic[];
}

export function normalizeLedger(rawLedger: RawLedger): LedgerNormalization {
  const diagnostics: Diagnostic[] = [];
  const ledger: LedgerEvent[] = [];

  for (const record of rawLedger.records) {
    for (const field of CONVENIENCE_FIELDS) {
      if (!hasOwn(record.value, field)) {
        continue;
      }

      const value = record.value[field];
      if (typeof value !== "string") {
        diagnostics.push({
          code: "NORMALIZE_INVALID_LEDGER_CONVENIENCE_FIELD",
          severity: "warning",
          message: `Ledger record at sequence ${record.sequence} field ${field} must be a string to expose a typed convenience value; received ${
            value === undefined ? "missing" : describeRawValue(value)
          }.`,
          source: cloneSourceRef(record.source),
        });
      }
    }

    ledger.push(
      Object.freeze({
        sequence: record.sequence,
        ...(typeof record.value.type === "string"
          ? { eventType: record.value.type }
          : {}),
        ...(typeof record.value.subject_id === "string"
          ? { subjectId: record.value.subject_id }
          : {}),
        ...(typeof record.value.timestamp === "string"
          ? { timestamp: record.value.timestamp }
          : {}),
        payload: cloneRawObject(record.value) as Readonly<Record<string, unknown>>,
        source: cloneSourceRef(record.source),
      }),
    );
  }

  return {
    ledger: Object.freeze(ledger),
    diagnostics,
  };
}
