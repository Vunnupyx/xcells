import * as PIXI from 'pixi.js'

export enum HORIZONTAL_CONTAINER_ALIGN {
  top,
  center,
  bottom,
}

export type HorizontalContainerOptions = {
  lineHeight: number
  space: number
  align: HORIZONTAL_CONTAINER_ALIGN
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
}

export class HorizontalContainer extends PIXI.Container {
  sortableChildren = true

  private lineCount = 0

  constructor(private options: HorizontalContainerOptions) {
    super()

    this.once('added', (parent: PIXI.Container) => {
      if (!this._width) {
        this.width = parent.width
      }
    })
  }

  override sortChildren(): void {
    const {options} = this
    super.sortChildren()

    let x = 0
    let lineNumber = 0

    this.children.forEach(child => {
      if (!(child instanceof PIXI.Container)) {
        return
      }

      if (x + child.width > this.width) {
        x = 0
        lineNumber += 1
      }

      child.x = x
      if (options.align === HORIZONTAL_CONTAINER_ALIGN.top) {
        child.y = lineNumber * options.lineHeight
      } else if (options.align === HORIZONTAL_CONTAINER_ALIGN.bottom) {
        child.y = lineNumber * options.lineHeight + options.lineHeight - child.height
      } else if (options.align === HORIZONTAL_CONTAINER_ALIGN.center) {
        child.y = lineNumber * options.lineHeight + (options.lineHeight - child.height) / 2
      } else {
        throw new Error(`Align parameter '${options.align}' not implemented`)
      }

      x += child.width + options.space
    })

    this.lineCount = lineNumber + 1
  }

  get width(): number {
    return this._width
  }

  set width(value: number) {
    const {options} = this
    this._width = value - (options.marginRight || 0) - (options.marginLeft || 0)
  }

  get height(): number {
    return this.lineCount * this.options.lineHeight
  }
}
