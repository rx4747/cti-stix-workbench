import { type ParserRuleContext, type ParseTreeListener } from "antlr4ng";

export declare class STIXPatternListener implements ParseTreeListener {
  exitObservationExpressionSimple?: (ctx: ParserRuleContext) => void;
  exitObservationExpressionCompound?: (ctx: ParserRuleContext) => void;
  exitObservationExpressionStartStop?: (ctx: ParserRuleContext) => void;
  exitObservationExpressionWithin?: (ctx: ParserRuleContext) => void;
  exitObservationExpressionRepeated?: (ctx: ParserRuleContext) => void;
  visitTerminal: ParseTreeListener["visitTerminal"];
  visitErrorNode: ParseTreeListener["visitErrorNode"];
  enterEveryRule: ParseTreeListener["enterEveryRule"];
  exitEveryRule: ParseTreeListener["exitEveryRule"];
}
