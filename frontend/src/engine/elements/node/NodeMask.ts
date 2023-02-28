import * as PIXI from 'pixi.js'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import {IDisplayObjectTypeCategoryNode} from '../types'

class NodeMask extends PIXI.Graphics implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.mask

  category = TARGET_CATEGORIES.node

  isMask = true

  renderable = false

  constructor(public node: PixiNode) {
    super()
    this.zIndex = 0
  }

  redraw(): void {
    const {width, height} = this.node
    const {cardSiblingSeparator, borderSize} = CONFIG.nodes

    const maskBorder = borderSize / 2
    this.clear()
    this.beginFill()
    this.drawRect(
      maskBorder,
      maskBorder,
      width - cardSiblingSeparator - 2 * maskBorder,
      height - cardSiblingSeparator - 2 * maskBorder,
    )
    this.endFill()
  }
}

export default NodeMask
