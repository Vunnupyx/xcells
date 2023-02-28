import * as PIXI from 'pixi.js'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import CONFIG from '../../CONFIG'
import {IDisplayObjectTypeCategoryNode} from '../types'

class NodeHeaderHandle extends PIXI.Container implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.headerHandle

  category = TARGET_CATEGORIES.node

  interactive = true

  static isShown(node: PixiNode): boolean {
    return Boolean(node.state.isSelected && node.engine.store.isWriteable)
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeHeaderHandle
  }

  redraw() {
    const {headerHeight, width} = this.node
    const {cornerRadius} = CONFIG.nodes

    this.hitArea = new PIXI.RoundedRectangle(0, 0, width, headerHeight, cornerRadius)
  }
}

export default NodeHeaderHandle
