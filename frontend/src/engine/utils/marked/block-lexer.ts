/* eslint-disable no-cond-assign, no-continue */
import {RulesBlockBase, RulesBlockTables} from './interfaces'
import {GridOptions} from '../../types'

export class BlockLexer {
  protected static rulesBase: RulesBlockBase

  protected static rulesTables: RulesBlockTables

  protected rules: RulesBlockBase | RulesBlockTables

  constructor(protected staticThis: typeof BlockLexer) {
    this.rules = this.staticThis.getRulesTable()
  }

  /**
   * Accepts Markdown text and returns object with tokens and links.
   *
   * @param src String of markdown source to be compiled.
   */
  static lex(src: string): GridOptions {
    src = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n')
      .replace(/^ +$/gm, '')

    const lexer = new this(this)
    return lexer.getTable(src)
  }

  protected static getRulesBase(): RulesBlockBase {
    if (this.rulesBase) {
      return this.rulesBase
    }

    const base: RulesBlockBase = {
      newline: /^\n+/,
      text: /^[^\n]+/,
    }

    return (this.rulesBase = base)
  }

  protected static getRulesTable(): RulesBlockTables {
    if (this.rulesTables) {
      return this.rulesTables
    }

    return (this.rulesTables = {
      ...this.getRulesBase(),
      ...{
        nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
        table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
      },
    })
  }

  /**
   * Lexing.
   */
  protected getTable(src: string): GridOptions {
    let nextPart = src
    let execArr: RegExpExecArray | null
    while (nextPart) {
      // newline
      if ((execArr = this.rules.newline.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
      }

      // table no leading pipe (gfm)
      if ((execArr = (this.rules as RulesBlockTables).nptable.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        const gridOptions: GridOptions = {
          columnDefs: execArr[1]
            .replace(/^ *| *\| *$/g, '')
            .split(/ *\| */)
            .map(x => ({field: x})),
          rowData: [],
        }

        const rows: string[] = execArr[3].replace(/\n$/, '').split('\n')
        if (gridOptions.columnDefs && gridOptions.rowData)
          for (let i = 0; i < rows.length; i += 1) {
            const td = rows[i].split(/ *\| */)
            if (gridOptions.columnDefs.length === td.length) {
              gridOptions.rowData[i] = Object.fromEntries(gridOptions.columnDefs.map((x, j) => [x.field, td[j]]))
            }
          }
        return gridOptions
      }

      // table (gfm)
      if ((execArr = (this.rules as RulesBlockTables).table.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)

        const gridOptions: GridOptions = {
          columnDefs: execArr[1]
            .replace(/^ *| *\| *$/g, '')
            .split(/ *\| */)
            .map(x => ({field: x})),
          rowData: [],
        }

        const rows = execArr[3].replace(/(?: *\| *)?\n$/, '').split('\n')

        if (gridOptions.columnDefs && gridOptions.rowData)
          for (let i = 0; i < rows.length; i += 1) {
            const td = rows[i].replace(/^ *\| *| *\| *$/g, '').split(/ *\| */)
            if (gridOptions.columnDefs.length === td.length) {
              gridOptions.rowData[i] = Object.fromEntries(gridOptions.columnDefs.map((x, j) => [x.field, td[j]]))
            }
          }

        return gridOptions
      }

      // text
      // Top-level should never reach here.
      if ((execArr = this.rules.text.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        continue
      }

      if (nextPart) {
        throw new Error(`Infinite loop on byte: ${nextPart.charCodeAt(0)}, near text '${nextPart.slice(0, 30)}...'`)
      }
    }

    return {}
  }
}
