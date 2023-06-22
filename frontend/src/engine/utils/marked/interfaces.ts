import {GridOptions} from '../../types'

export interface RulesBlockBase {
  newline: RegExp
  text: RegExp
}

export interface RulesBlockTables extends RulesBlockBase {
  nptable: RegExp
  table: RegExp
}

export interface LexerReturns {
  text: string
  gridOptions?: GridOptions
}
