import * as PIXI from 'pixi.js'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import {IDisplayObjectTypeCategoryNode} from '../types'

class NodeDownloadHandle extends PIXI.Container implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.downloadHandle

  category = TARGET_CATEGORIES.node

  interactive = true

  static isShown(node: PixiNode): boolean {
    return Boolean(node.state.isSelected && node.file)
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeDownloadHandle
  }

  redraw(): void {
    const {width} = this.node
    const {padding, radius} = CONFIG.nodes.downloadHandle

    this.hitArea = new PIXI.Circle(width - padding - radius, padding + radius, radius)
  }
}

export default NodeDownloadHandle
