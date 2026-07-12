export type RawValue =
  | null
  | boolean
  | number
  | string
  | readonly RawValue[]
  | RawObject;

export interface RawObject {
  readonly [key: string]: RawValue;
}

export type RawValueConversionErrorReason =
  | "cyclic-value"
  | "non-finite-number"
  | "unsafe-integer"
  | "unsupported-value";

export class RawValueConversionError extends Error {
  readonly reason: RawValueConversionErrorReason;

  constructor(reason: RawValueConversionErrorReason, message: string) {
    super(message);
    this.name = "RawValueConversionError";
    this.reason = reason;
  }
}

export function isRawObject(value: RawValue): value is RawObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function convertObject(
  value: object,
  ancestors: Set<object>,
): RawObject | readonly RawValue[] {
  if (ancestors.has(value)) {
    throw new RawValueConversionError(
      "cyclic-value",
      "YAML aliases produced a cyclic value.",
    );
  }

  ancestors.add(value);

  try {
    if (Array.isArray(value)) {
      return Object.freeze(
        value.map((item) => convertToRawValue(item, ancestors)),
      );
    }

    const prototype = Object.getPrototypeOf(value) as unknown;

    if (prototype !== Object.prototype && prototype !== null) {
      throw new RawValueConversionError(
        "unsupported-value",
        "YAML produced a non-plain object value.",
      );
    }

    const converted: Record<string, RawValue> = {};

    for (const [key, item] of Object.entries(value)) {
      Object.defineProperty(converted, key, {
        configurable: false,
        enumerable: true,
        value: convertToRawValue(item, ancestors),
        writable: false,
      });
    }

    return Object.freeze(converted);
  } finally {
    ancestors.delete(value);
  }
}

function convertToRawValue(value: unknown, ancestors: Set<object>): RawValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RawValueConversionError(
        "non-finite-number",
        "YAML produced a non-finite number.",
      );
    }

    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new RawValueConversionError(
        "unsafe-integer",
        "Parsed data contains an integer outside JavaScript's safe integer range.",
      );
    }

    return value;
  }

  if (typeof value === "object") {
    return convertObject(value, ancestors);
  }

  throw new RawValueConversionError(
    "unsupported-value",
    `YAML produced an unsupported ${typeof value} value.`,
  );
}

export function toRawValue(value: unknown): RawValue {
  return convertToRawValue(value, new Set<object>());
}
