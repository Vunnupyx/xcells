import * as PIXI from 'pixi.js'

import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import CONFIG from '../../CONFIG'
import {isMobile, isTablet} from '../../../utils/browserDetection'
import {IDisplayObjectTypeCategoryNode} from '../types'

class NodeResizeHandle extends PIXI.Container implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.resizeHandle

  category = TARGET_CATEGORIES.node

  cursor = 'nwse-resize'

  interactive = true

  static isShown(node: PixiNode) {
    return node.engine.store.isWriteable && node.state.isSelected
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeResizeHandle
  }

  redraw(): void {
    const {node} = this
    const {width, height} = this.node
    const {gridSize, cardSiblingSeparator} = CONFIG.nodes
    const {offset, borderSize} = CONFIG.nodes.selected
    const {size} = CONFIG.nodes.resizeHandle

    const heightAddition = node.hasExpandGhost() ? (2 / 3) * gridSize : 0

    // adjust hit are on mobile / tablet dynamically based on current scale
    const currentWorldScale = node.getCurrentWorldScale()
    const scaleDilation = isMobile || isTablet ? (1 / 1 + Math.exp(-currentWorldScale) - 1) * 10 * size : 0

    const x = width + offset + borderSize / 2 - cardSiblingSeparator - size / 2
    const y = height + heightAddition + offset + borderSize / 2 - cardSiblingSeparator - size / 2

    this.hitArea = new PIXI.Rectangle(
      x - scaleDilation / 2,
      y - scaleDilation / 2,
      size + scaleDilation,
      size + scaleDilation,
    )
  }
}

export default NodeResizeHandle
