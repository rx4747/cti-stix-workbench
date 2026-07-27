import {
  Parser,
  type ParserRuleContext,
  type TokenStream,
} from "antlr4ng";

export declare class STIXPatternParser extends Parser {
  constructor(input: TokenStream);
  pattern(): ParserRuleContext;
}
