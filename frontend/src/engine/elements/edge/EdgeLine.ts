import * as PIXI from 'pixi.js'
import Color from 'color'
import debug from 'debug'
import styleConfig from '../../../styles/config'
import type PixiEdge from '../../PixiEdge'
import EDGE_ELEMENT_TYPES from './EDGE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import parseColor from '../../utils/parseColor'
import {IDisplayObjectTypeCategoryEdge} from '../types'
import EDGE_ELEMENT_ZINDEX from './EDGE_ELEMENT_ZINDEX'

const log = debug('app:RenderEngine:Edge')
const logError = log.extend('ERROR*', '::')

class EdgeLine extends PIXI.Graphics implements IDisplayObjectTypeCategoryEdge {
  readonly type = EDGE_ELEMENT_TYPES.line

  readonly category = TARGET_CATEGORIES.edge

  interactive = true

  constructor(public edge: PixiEdge) {
    super()
    this.zIndex = EDGE_ELEMENT_ZINDEX.EdgeLine
  }

  redraw(): void {
    const {edge} = this
    const {color: edgeColor, visible, startNode, endNode} = this.edge
    const {edges: edgeConfig} = styleConfig

    const {startPoints, endPoints} = edge.getPositions()

    if (!startNode || !endNode) {
      logError('Data inconsistency: start or end node does not exist', this)
      return
    }

    if (!visible) return

    const color = edgeColor ? parseColor(edgeColor).background : edgeConfig.defaultColor

    this.clear()
    this.beginFill(Color(color).rgbNumber())
    this.drawPolygon(startPoints.concat(endPoints))
    this.endFill()
  }
}

export default EdgeLine
