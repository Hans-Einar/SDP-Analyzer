import {
  isMap,
  isScalar,
  LineCounter,
  parseDocument,
  type DocumentOptions,
  type Node,
  type ParseOptions,
  type ParsedNode,
  type SchemaOptions,
  type YAMLMap,
  type YAMLError,
} from "yaml";
import type { Diagnostic } from "../diagnostics/Diagnostic";
import type { ProjectTextFile } from "../source/ProjectSource";
import type { SourceKind, SourceRef } from "../source/SourceRef";
import {
  isRawObject,
  RawValueConversionError,
  toRawValue,
  type RawObject,
} from "./RawValue";

export const YAML_MAX_ALIAS_COUNT = 32;

const NO_CUSTOM_TAGS: [] = [];
Object.freeze(NO_CUSTOM_TAGS);

export const YAML_PARSE_OPTIONS = Object.freeze({
  customTags: NO_CUSTOM_TAGS,
  intAsBigInt: false,
  keepSourceTokens: false,
  logLevel: "error",
  merge: false,
  prettyErrors: false,
  resolveKnownTags: false,
  schema: "core",
  strict: true,
  stringKeys: true,
  uniqueKeys: true,
  version: "1.2",
} satisfies ParseOptions & DocumentOptions & SchemaOptions);

export type ParsedYamlMap = YAMLMap<ParsedNode, ParsedNode | null>;

export interface ParsedYamlMapping {
  readonly diagnostics: readonly Diagnostic[];
  readonly lineCounter: LineCounter;
  readonly map?: ParsedYamlMap;
  readonly value?: RawObject;
}

function fileSource(source: SourceRef): SourceRef {
  return {
    sourceId: source.sourceId,
    path: source.path,
    kind: source.kind,
  };
}

export function validateParserSource(
  file: ProjectTextFile,
  source: SourceRef,
  expectedKind: SourceKind,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (source.kind !== expectedKind) {
    diagnostics.push({
      code: "PARSE_SOURCE_KIND_MISMATCH",
      severity: "error",
      message: `Parser expected source kind ${expectedKind} but received ${source.kind}.`,
      source: fileSource(source),
    });
  }

  if (file.path !== source.path) {
    diagnostics.push({
      code: "PARSE_SOURCE_PATH_MISMATCH",
      severity: "error",
      message: `Parser source path ${source.path} does not match text file path ${file.path}.`,
      source: fileSource(source),
    });
  }

  return diagnostics;
}

export function yamlSourceFromOffsets(
  source: SourceRef,
  lineCounter: LineCounter,
  start: number,
  end: number,
  pointer?: string,
): SourceRef {
  const startPosition = lineCounter.linePos(start);
  const endPosition = lineCounter.linePos(end);

  return {
    sourceId: source.sourceId,
    path: source.path,
    kind: source.kind,
    lineStart: startPosition.line,
    columnStart: startPosition.col,
    lineEnd: endPosition.line,
    columnEnd: endPosition.col,
    ...(pointer === undefined ? {} : { pointer }),
  };
}

export function yamlSourceForNode(
  source: SourceRef,
  lineCounter: LineCounter,
  node: Node | null | undefined,
  pointer?: string,
): SourceRef {
  const range = node?.range;

  if (range === undefined || range === null) {
    return {
      ...fileSource(source),
      ...(pointer === undefined ? {} : { pointer }),
    };
  }

  return yamlSourceFromOffsets(
    source,
    lineCounter,
    range[0],
    range[1],
    pointer,
  );
}

function parserDiagnosticCode(error: YAMLError): string {
  switch (error.code) {
    case "DUPLICATE_KEY":
      return "PARSE_YAML_DUPLICATE_KEY";
    case "MULTIPLE_DOCS":
      return "PARSE_YAML_MULTIPLE_DOCUMENTS";
    case "TAG_RESOLVE_FAILED":
      return "PARSE_YAML_UNSUPPORTED_TAG";
    case "RESOURCE_EXHAUSTION":
      return "PARSE_YAML_RESOURCE_LIMIT";
    default:
      return "PARSE_YAML_SYNTAX_ERROR";
  }
}

function yamlErrorDiagnostic(
  error: YAMLError,
  source: SourceRef,
  lineCounter: LineCounter,
): Diagnostic {
  return {
    code: parserDiagnosticCode(error),
    severity: "error",
    message: `YAML parser ${error.code}: ${error.message}`,
    source: yamlSourceFromOffsets(
      source,
      lineCounter,
      error.pos[0],
      error.pos[1],
    ),
  };
}

function compareYamlErrors(left: YAMLError, right: YAMLError): number {
  if (left.pos[0] !== right.pos[0]) {
    return left.pos[0] - right.pos[0];
  }

  if (left.pos[1] !== right.pos[1]) {
    return left.pos[1] - right.pos[1];
  }

  return left.code < right.code ? -1 : left.code > right.code ? 1 : 0;
}

export function parseYamlMapping(
  file: ProjectTextFile,
  source: SourceRef,
): ParsedYamlMapping {
  const lineCounter = new LineCounter();
  const sourceDiagnostics = validateParserSource(file, source, "yaml");

  if (sourceDiagnostics.length > 0) {
    return { diagnostics: sourceDiagnostics, lineCounter };
  }

  let document;

  try {
    document = parseDocument(file.text, {
      ...YAML_PARSE_OPTIONS,
      lineCounter,
    });
  } catch {
    return {
      diagnostics: [
        {
          code: "PARSE_YAML_SYNTAX_ERROR",
          severity: "error",
          message: "YAML parsing failed before a document could be produced.",
          source: fileSource(source),
        },
      ],
      lineCounter,
    };
  }

  const parserDiagnostics = [...document.errors, ...document.warnings]
    .sort(compareYamlErrors)
    .map((error) => yamlErrorDiagnostic(error, source, lineCounter));

  if (parserDiagnostics.length > 0) {
    return { diagnostics: parserDiagnostics, lineCounter };
  }

  if (!isMap(document.contents)) {
    return {
      diagnostics: [
        {
          code: "PARSE_YAML_UNSUPPORTED_ROOT",
          severity: "error",
          message: "YAML traceability source root must be a mapping object.",
          source: yamlSourceForNode(
            source,
            lineCounter,
            document.contents,
          ),
        },
      ],
      lineCounter,
    };
  }

  let converted: unknown;

  try {
    converted = document.toJS({
      mapAsMap: false,
      maxAliasCount: YAML_MAX_ALIAS_COUNT,
    });
  } catch {
    return {
      diagnostics: [
        {
          code: "PARSE_YAML_ALIAS_LIMIT",
          severity: "error",
          message: `YAML alias expansion exceeds the configured limit of ${YAML_MAX_ALIAS_COUNT}.`,
          source: fileSource(source),
        },
      ],
      lineCounter,
    };
  }

  let value;

  try {
    value = toRawValue(converted);
  } catch (cause: unknown) {
    const isUnsafeInteger =
      cause instanceof RawValueConversionError &&
      cause.reason === "unsafe-integer";
    const detail =
      cause instanceof RawValueConversionError ? ` ${cause.message}` : "";
    return {
      diagnostics: [
        {
          code: isUnsafeInteger
            ? "PARSE_YAML_UNSAFE_INTEGER"
            : "PARSE_YAML_NON_SERIALIZABLE_VALUE",
          severity: "error",
          message: isUnsafeInteger
            ? "YAML contains an integer outside JavaScript's safe integer range."
            : `YAML value is not safely serializable.${detail}`,
          source: fileSource(source),
        },
      ],
      lineCounter,
    };
  }

  if (!isRawObject(value)) {
    return {
      diagnostics: [
        {
          code: "PARSE_YAML_UNSUPPORTED_ROOT",
          severity: "error",
          message: "YAML traceability source root must be a mapping object.",
          source: yamlSourceForNode(
            source,
            lineCounter,
            document.contents,
          ),
        },
      ],
      lineCounter,
    };
  }

  return {
    diagnostics: [],
    lineCounter,
    map: document.contents as ParsedYamlMap,
    value,
  };
}

export function yamlMapValueNode(
  map: ParsedYamlMap,
  key: string,
): ParsedNode | null | undefined {
  for (const pair of map.items) {
    if (isScalar(pair.key) && pair.key.value === key) {
      return pair.value;
    }
  }

  return undefined;
}

export function yamlMapAtKey(
  map: ParsedYamlMap,
  key: string,
): ParsedYamlMap | undefined {
  const node = yamlMapValueNode(map, key);
  return isMap(node) ? (node as ParsedYamlMap) : undefined;
}

export function escapeJsonPointerSegment(segment: string): string {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}
