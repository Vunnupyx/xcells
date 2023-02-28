import * as PIXI from 'pixi.js'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import type PixiNode from '../../PixiNode'
import {RenderNodeCandidate} from '../../types'
import CONFIG from '../../CONFIG'
import type EventManager from '../../events/EventManager'
import parseColor from '../../utils/parseColor'
import GHOST_ELEMENT_TYPES from './GHOST_ELEMENT_TYPES'

class NodeChildGhost extends PIXI.Graphics {
  manager: EventManager

  candidate: RenderNodeCandidate

  node?: PixiNode

  type = GHOST_ELEMENT_TYPES.create

  category: string = TARGET_CATEGORIES.ghost

  firstGhost: boolean

  constructor(ghostPosition: RenderNodeCandidate, node: PixiNode, nodeAboveGhost?: PixiNode) {
    super()
    this.manager = node.engine.eventManager

    const {childNodes} = node
    const {cornerRadius, ghost} = CONFIG.nodes
    const {iconPath, iconScale} = ghost

    const {x = 0, y = 0, width = 0, height = 0} = ghostPosition

    const backgroundColor = node.getActiveBackgroundColor()
    const alpha = node.image ? 0.5 : 1.0
    const plusColors = parseColor(node.getColorName()).highlight

    this.clear()

    this.beginFill(backgroundColor.rgbNumber(), alpha)
    this.drawRoundedRect(x, y, width, height, cornerRadius)
    this.endFill()

    this.beginFill(plusColors.rgbNumber())
    this.drawPolygon(iconPath.map((p, i) => p * iconScale + (i % 2 ? y + height / 2 : x + width / 2)))
    this.endFill()

    this.cursor = 'pointer'
    this.interactive = true
    this.candidate = ghostPosition
    this.node = nodeAboveGhost
    this.firstGhost = childNodes.size === 0
  }
}

export default NodeChildGhost
