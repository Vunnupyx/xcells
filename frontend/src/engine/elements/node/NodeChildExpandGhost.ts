import * as PIXI from 'pixi.js'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import type PixiNode from '../../PixiNode'
import CONFIG from '../../CONFIG'
import parseColor from '../../utils/parseColor'
import GHOST_ELEMENT_TYPES from './GHOST_ELEMENT_TYPES'

class NodeChildExpandGhost extends PIXI.Graphics {
  node: PixiNode

  type = GHOST_ELEMENT_TYPES.expand

  category: string = TARGET_CATEGORIES.ghost

  cursor = 'pointer'

  interactive = true

  constructor(node: PixiNode) {
    super()

    const {cornerRadius, ghost, gridSize, cardSiblingSeparator} = CONFIG.nodes
    const {expandPath, expandScale} = ghost

    const {x = 0} = node
    const width = node.width - cardSiblingSeparator
    const y = node.y + node.height - 2 * cornerRadius
    const height = 2 * cornerRadius + (2 / 3) * gridSize

    const backgroundColor = node.parentNode.getActiveBackgroundColor()
    const iconColor = parseColor(node.parentNode.getColorName()).highlight

    this.clear()

    this.beginFill(backgroundColor.rgbNumber())
    this.drawRoundedRect(x, y, width, height, cornerRadius)
    this.endFill()

    this.beginFill(iconColor.rgbNumber())
    this.drawPolygon(
      expandPath.map((p, i) => p * expandScale + (i % 2 ? y + height / 2 + cornerRadius : x + width / 2)),
    )
    this.endFill()

    this.node = node
  }
}

export default NodeChildExpandGhost
