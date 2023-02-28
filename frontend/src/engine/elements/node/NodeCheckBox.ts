import * as PIXI from 'pixi.js'
import Color from 'color'
import type PixiNode from '../../PixiNode'
import {IDisplayObjectTypeCategoryNode} from '../types'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import CONFIG from '../../CONFIG'
import {BORDER_DETAILS, NodeDetail} from './NODE_DETAILS'
import NODE_MARKUPS_ZINDEX from './NODE_MARKUPS_ZINDEX'

const config = CONFIG.nodes.checkbox

class NodeCheckBox extends PIXI.Container implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.checkBox

  category = TARGET_CATEGORIES.node

  cursor = 'pointer'

  constructor(public node: PixiNode) {
    super()

    this.zIndex = NODE_MARKUPS_ZINDEX.NodeCheckBox
  }

  static isShown(node: PixiNode): boolean {
    return node.hasCheckBox()
  }

  redrawTo(graphics: PIXI.Graphics, nodeDetail: NodeDetail, offset: PIXI.IPointData) {
    const {node, x: checkboxX, y: checkboxY} = this

    const x = checkboxX + offset.x
    const y = checkboxY + offset.y
    const fillColor = new Color(config.fillColor).rgbNumber()
    const color = new Color(config.color).rgbNumber()

    const borderWidth = nodeDetail.borderType === BORDER_DETAILS.squared ? 0 : config.borderWidth
    graphics.lineStyle(borderWidth, color, 1, 0)
    graphics.beginFill(fillColor)
    if (nodeDetail.borderType === BORDER_DETAILS.rounded) {
      graphics.drawRoundedRect(x, y, config.size, config.size, config.radius)
    } else {
      graphics.drawRect(x, y, config.size, config.size)
    }
    graphics.endFill()

    if (node.checked) {
      graphics.lineStyle(config.lineWidth, color)
      graphics.moveTo(x + (3 / 12) * config.size, y + (6 / 12) * config.size)
      graphics.lineTo(x + (5 / 12) * config.size, y + (8 / 12) * config.size)
      graphics.lineTo(x + (9 / 12) * config.size, y + (4 / 12) * config.size)
    }
  }

  redraw() {
    const {node} = this

    this.hitArea = new PIXI.Rectangle(0, 0, config.size, config.size)

    // debugging position
    // const g = new PIXI.Graphics()
    // g.lineStyle(1, 0xff0000, 1, 0)
    // g.drawRect(0, 0, gridSize, gridSize)
    // this.addChild(g)

    this.interactive = node.state.isSelected
  }

  get width() {
    return config.size
  }

  get height() {
    return config.size
  }
}

export default NodeCheckBox
