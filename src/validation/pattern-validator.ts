import {
  type ATNSimulator,
  BaseErrorListener,
  CharStream,
  CommonTokenStream,
  type RecognitionException,
  type Recognizer,
  type Token,
} from "antlr4ng";

import { STIXPatternLexer } from "./generated/antlr/STIXPatternLexer.js";
import { STIXPatternParser } from "./generated/antlr/STIXPatternParser.js";

export interface PatternSyntaxError {
  line: number;
  column: number;
  message: string;
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
  parser.pattern();

  return listener.errors;
}
