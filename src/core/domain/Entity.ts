import type { SourceRef } from "../source/SourceRef";

export const RECOGNIZED_ENTITY_KINDS = Object.freeze([
  "mandate",
  "study",
  "requirement",
  "architecture-decision",
  "design-decision",
  "tier",
  "sprint",
  "iteration",
  "slice",
  "verification",
  "review",
  "unknown",
] as const);

export type RecognizedEntityKind = (typeof RECOGNIZED_ENTITY_KINDS)[number];

/**
 * The known installed-profile values remain a finite documented set while
 * explicit compatibility extensions can retain their own string kind.
 */
export type EntityKind = RecognizedEntityKind | (string & {});

export interface Entity {
  readonly id: string;
  readonly kind: EntityKind;
  readonly status?: string;
  readonly title?: string;
  readonly path?: string;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly sources: readonly SourceRef[];
}
