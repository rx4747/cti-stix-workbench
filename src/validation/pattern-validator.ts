import {
  type ATNSimulator,
  BaseErrorListener,
  CharStream,
  CommonTokenStream,
  ParseTreeWalker,
  type RecognitionException,
  type Recognizer,
  type Token,
} from "antlr4ng";

import { STIXPatternLexer } from "./generated/antlr/STIXPatternLexer.js";
import { STIXPatternListener } from "./generated/antlr/STIXPatternListener.js";
import { STIXPatternParser } from "./generated/antlr/STIXPatternParser.js";

export interface PatternSyntaxError {
  line: number;
  column: number;
  message: string;
}

const HASH_LENGTHS: Readonly<Record<string, readonly number[]>> = Object.freeze({
  MD5: [32],
  MD6: [32, 40, 56, 64, 96, 128],
  RIPEMD160: [40],
  SHA1: [40],
  SHA224: [56],
  SHA256: [64],
  SHA384: [96],
  SHA512: [128],
  SHA3224: [56],
  SHA3256: [64],
  SHA3384: [96],
  SHA3512: [128],
  WHIRLPOOL: [128],
});

function locationAt(
  input: string,
  offset: number,
): Pick<PatternSyntaxError, "line" | "column"> {
  const prefix = input.slice(0, offset);
  const lines = prefix.split("\n");
  return { line: lines.length, column: lines.at(-1)?.length ?? 0 };
}

function validateHashLiterals(input: string): PatternSyntaxError[] {
  const errors: PatternSyntaxError[] = [];
  const comparison =
    /\b[a-z0-9-]+:hashes\.(?:'([^']+)'|([a-z0-9-]+))\s*(?:NOT\s+)?(?:=|!=)\s*'([^']*)'/giu;
  for (const match of input.matchAll(comparison)) {
    const algorithm = (match[1] ?? match[2] ?? "").toUpperCase().replaceAll("-", "");
    const value = match[3] ?? "";
    const lengths = HASH_LENGTHS[algorithm];
    const validSsdeep =
      algorithm === "SSDEEP" && /^[a-zA-Z0-9/+:.]{1,128}$/u.test(value);
    if (
      lengths !== undefined &&
      (!lengths.includes(value.length) || !/^[a-fA-F0-9]+$/u.test(value))
    ) {
      errors.push({
        ...locationAt(input, match.index),
        message: `'${value}' is not a valid ${match[1] ?? match[2] ?? algorithm} hash`,
      });
    } else if (algorithm === "SSDEEP" && !validSsdeep) {
      errors.push({
        ...locationAt(input, match.index),
        message: `'${value}' is not a valid SSDEEP hash`,
      });
    }
  }
  return errors;
}

function validateQualifierUniqueness(
  tree: ReturnType<STIXPatternParser["pattern"]>,
): PatternSyntaxError[] {
  const errors: PatternSyntaxError[] = [];
  let qualifierTypes: Set<string> | undefined;
  const listener = new STIXPatternListener();
  listener.exitObservationExpressionSimple = () => {
    qualifierTypes = new Set();
  };
  listener.exitObservationExpressionCompound = () => {
    qualifierTypes = undefined;
  };
  const check = (type: string): void => {
    if (qualifierTypes === undefined) return;
    if (qualifierTypes.has(type)) {
      errors.push({
        line: 1,
        column: 0,
        message: `Duplicate qualifier type encountered: ${type}`,
      });
      return;
    }
    qualifierTypes.add(type);
  };
  listener.exitObservationExpressionWithin = () => check("WITHIN");
  listener.exitObservationExpressionRepeated = () => check("REPEATS");
  listener.exitObservationExpressionStartStop = () => check("STARTSTOP");
  ParseTreeWalker.DEFAULT.walk(listener, tree);
  return errors;
}

class CollectingErrorListener extends BaseErrorListener {
  public readonly errors: PatternSyntaxError[] = [];

  override syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    _offendingSymbol: S | null,
    line: number,
    column: number,
    message: string,
    _error: RecognitionException | null,
  ): void {
    void _error;
    this.errors.push({ line, column, message });
  }
}

export function parseStixPattern(input: string): PatternSyntaxError[] {
  const listener = new CollectingErrorListener();
  const lexer = new STIXPatternLexer(CharStream.fromString(input));
  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);

  const parser = new STIXPatternParser(new CommonTokenStream(lexer));
  parser.removeErrorListeners();
  parser.addErrorListener(listener);
  const tree = parser.pattern();

  if (listener.errors.length === 0) {
    listener.errors.push(
      ...validateHashLiterals(input),
      ...validateQualifierUniqueness(tree),
    );
  }

  return listener.errors;
}
