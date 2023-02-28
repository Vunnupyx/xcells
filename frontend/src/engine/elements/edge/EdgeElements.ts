import Elements from '../Elements'
import EdgeLine from './EdgeLine'
import EdgeText from './EdgeText'
import EdgeArrow from './EdgeArrow'
import EDGE_ELEMENT_TYPES from './EDGE_ELEMENT_TYPES'
import CONFIG from '../../CONFIG'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import type PixiEdge from '../../PixiEdge'
import EDGE_DETAIL_LEVELS from './EDGE_DETAIL_LEVELS'
import {EDGE_DETAILS, EdgeDetail} from './EDGE_DETAILS'

class EdgeElements extends Elements {
  elements: {
    text?: EdgeText
    line: EdgeLine
    arrow: EdgeArrow
  }

  detailLevel: EDGE_DETAIL_LEVELS = EDGE_DETAIL_LEVELS.normal

  type = EDGE_ELEMENT_TYPES.container

  category = TARGET_CATEGORIES.edge

  constructor(public edge: PixiEdge) {
    super()

    const line = new EdgeLine(edge)
    this.addChild(line)

    const arrow = new EdgeArrow(edge)
    this.addChild(arrow)

    this.elements = {line, arrow}
  }

  redrawContainer(): void {
    const {visible} = this.edge
    const {isSelected, isTemporary} = this.edge.state
    const {alpha, selectedAlpha} = CONFIG.edges

    this.alpha = isSelected || isTemporary ? selectedAlpha : alpha
    this.visible = visible
  }

  redrawText(): void {
    const {edge} = this
    if (EdgeText.isShown(edge)) {
      if (!this.elements.text) {
        const text = new EdgeText(edge)
        this.elements.text = text
        this.addChild(text)
      }
      this.elements.text.redraw(this.getDetailInfo())
    } else {
      const {text} = this.elements
      if (text) {
        delete this.elements.text
        this.removeChild(text)
      }
    }
  }

  redraw(): void {
    this.redrawContainer()
    this.redrawText()
    this.elements.line.redraw()
    this.elements.arrow.redraw()
  }

  getDetailInfo(): EdgeDetail {
    return EDGE_DETAILS[this.detailLevel]
  }

  getDetailLevel(worldScale: number): EDGE_DETAIL_LEVELS {
    const {detailLevelThresholds} = CONFIG
    const detailLevel = Object.values(EDGE_DETAIL_LEVELS)
      .reverse()
      .find(level => worldScale < detailLevelThresholds[level])

    if (!detailLevel) {
      throw new Error('Misconfiguration detailLevel')
    }
    return detailLevel
  }

  calculateDetailLevel(worldScale: number): void {
    const newDetailLevel = this.getDetailLevel(worldScale)
    if (this.detailLevel === newDetailLevel) return

    this.detailLevel = newDetailLevel
    this.redraw()
  }
}

export default EdgeElements
