import * as PIXI from 'pixi.js'
import Color from 'color'
import CONFIG from '../../CONFIG'
import type PixiEdge from '../../PixiEdge'
import EDGE_ELEMENT_TYPES from './EDGE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import parseColor from '../../utils/parseColor'
import {IDisplayObjectTypeCategoryEdge} from '../types'
import EDGE_ELEMENT_ZINDEX from './EDGE_ELEMENT_ZINDEX'

class EdgeArrow extends PIXI.Graphics implements IDisplayObjectTypeCategoryEdge {
  interactive = true

  type = EDGE_ELEMENT_TYPES.arrow

  category = TARGET_CATEGORIES.edge

  constructor(public edge: PixiEdge) {
    super()
    this.zIndex = EDGE_ELEMENT_ZINDEX.EdgeArrow
  }

  redraw(): void {
    const {edge} = this
    const {edges: edgeConfig} = CONFIG

    const {dx, radian, endMiddlePoint, endScale} = edge.getPositions()

    const color = edge.color ? parseColor(edge.color).background : edgeConfig.defaultColor

    this.clear()
    this.beginFill(Color(color).rgbNumber())
    this.drawPolygon([...edgeConfig.arrowPath])
    this.x = endMiddlePoint.x
    this.y = endMiddlePoint.y
    this.scale = new PIXI.Point(
      endScale * edgeConfig.arrowScale,
      endScale * edgeConfig.arrowScale,
    ) as PIXI.ObservablePoint
    this.rotation = radian + (dx < 0 ? Math.PI : 0)
    this.cursor = 'pointer'
  }
}

export default EdgeArrow
