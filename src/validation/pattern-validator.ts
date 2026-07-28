import {
  type ATNSimulator,
  BaseErrorListener,
  CharStream,
  CommonTokenStream,
  ParserRuleContext,
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

function contextLocation(
  context: ParserRuleContext,
): Pick<PatternSyntaxError, "line" | "column"> {
  return {
    line: context.start?.line ?? 1,
    // antlr4ng 3.x exposes the in-line token offset as `column`.
    column: context.start?.column ?? 0,
  };
}

function trailingRuleLocation(
  context: ParserRuleContext,
): Pick<PatternSyntaxError, "line" | "column"> {
  const trailingChild = context.children.at(-1);
  return contextLocation(
    trailingChild instanceof ParserRuleContext ? trailingChild : context,
  );
}

function validateHashComparisons(
  tree: ReturnType<STIXPatternParser["pattern"]>,
): PatternSyntaxError[] {
  const errors: PatternSyntaxError[] = [];
  const check = (context: ParserRuleContext): void => {
    const comparison = context.getText();
    const path =
      /^\b[a-z0-9-]+:hashes\.(?:'([^']+)'|([a-z0-9-]+?))(?=(?:NOT)?(?:IN|LIKE|MATCHES)|[=!<>])/iu.exec(
        comparison,
      );
    if (path === null) return;
    const algorithmName = path[1] ?? path[2] ?? "";
    const algorithm = algorithmName.toUpperCase().replaceAll("-", "");
    const values = [...comparison.slice(path[0].length).matchAll(/'([^']*)'/gu)].map(
      (match) => match[1] ?? "",
    );
    for (const value of values) {
      const lengths = HASH_LENGTHS[algorithm];
      const validSsdeep =
        algorithm === "SSDEEP" && /^[a-zA-Z0-9/+:.]{1,128}$/u.test(value);
      if (
        lengths !== undefined &&
        (!lengths.includes(value.length) || !/^[a-fA-F0-9]+$/u.test(value))
      ) {
        errors.push({
          ...contextLocation(context),
          message: `'${value}' is not a valid ${algorithmName} hash`,
        });
      } else if (algorithm === "SSDEEP" && !validSsdeep) {
        errors.push({
          ...contextLocation(context),
          message: `'${value}' is not a valid SSDEEP hash`,
        });
      }
    }
  };
  const listener = new STIXPatternListener();
  listener.exitPropTestEqual = check;
  listener.exitPropTestSet = check;
  listener.exitPropTestLike = check;
  listener.exitPropTestRegex = check;
  ParseTreeWalker.DEFAULT.walk(listener, tree);
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
  const check = (type: string, context: ParserRuleContext): void => {
    if (qualifierTypes === undefined) return;
    if (qualifierTypes.has(type)) {
      errors.push({
        ...trailingRuleLocation(context),
        message: `Duplicate qualifier type encountered: ${type}`,
      });
      return;
    }
    qualifierTypes.add(type);
  };
  listener.exitObservationExpressionWithin = (context) => check("WITHIN", context);
  listener.exitObservationExpressionRepeated = (context) => check("REPEATS", context);
  listener.exitObservationExpressionStartStop = (context) =>
    check("STARTSTOP", context);
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
      ...validateHashComparisons(tree),
      ...validateQualifierUniqueness(tree),
    );
  }

  return listener.errors;
}
