import * as PIXI from 'pixi.js'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import {IDisplayObjectTypeCategoryNode} from '../types'

class NodeBackground extends PIXI.Sprite implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.background

  category = TARGET_CATEGORIES.node

  interactive = true

  static isShown(): boolean {
    return true
  }

  constructor(public node: PixiNode) {
    super(PIXI.Texture.WHITE)
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeBackground
  }

  redraw(): void {
    const {node} = this
    const {width, height} = this.node
    const {cardSiblingSeparator, borderSize} = CONFIG.nodes

    const color = node.getBackgroundColor()
    const innerWidth = width - 2 * borderSize - cardSiblingSeparator
    const innerHeight = height - 2 * borderSize - cardSiblingSeparator

    this.tint = color.rgbNumber()
    this.alpha = color.alpha()
    this.x = borderSize
    this.y = borderSize
    this.width = innerWidth
    this.height = innerHeight

    // sprite width is actually accomblished by scaling the texture, that why the hitarea needs to reverse this scale
    this.hitArea = new PIXI.Polygon([
      -borderSize / this.scale.x,
      -borderSize / this.scale.y,
      -borderSize / this.scale.x,
      (height - borderSize) / this.scale.y,
      (width - borderSize) / this.scale.x,
      (height - borderSize) / this.scale.y,
      (width - borderSize) / this.scale.x,
      -borderSize / this.scale.y,
    ])
  }
}

export default NodeBackground
