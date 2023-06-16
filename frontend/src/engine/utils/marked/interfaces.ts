export interface RulesBlockBase {
  newline: RegExp
  text: RegExp
}

export interface RulesBlockTables extends RulesBlockBase {
  nptable: RegExp
  table: RegExp
}
