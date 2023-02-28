import * as PIXI from 'pixi.js'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import {IDisplayObjectTypeCategoryNode} from '../types'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import {NodeDetail} from './NODE_DETAILS'

class NodeChildren extends PIXI.Container implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.children

  category = TARGET_CATEGORIES.node

  sortableChildren = true

  isMasked = true

  static isShown(node: PixiNode): boolean {
    return node.childNodes.size > 0
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeChildren
  }

  redraw(nodeDetail: NodeDetail): void {
    const {showChildren} = nodeDetail
    const {headerHeight, scale} = this.node
    const {isSelected, isHighlighted} = this.node.state
    const {childrenPaddingLeft} = CONFIG.nodes

    this.visible = showChildren || isSelected || isHighlighted

    this.scale = new PIXI.Point(scale, scale) as PIXI.ObservablePoint
    // text need to been rendered to access the headerHeight
    this.y = headerHeight
    this.x = childrenPaddingLeft
  }
}

export default NodeChildren
