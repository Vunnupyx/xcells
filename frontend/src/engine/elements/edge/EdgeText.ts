import * as PIXI from 'pixi.js'
import Color from 'color'
import EDGE_ELEMENT_TYPES from './EDGE_ELEMENT_TYPES'
import type PixiEdge from '../../PixiEdge'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import parseColor from '../../utils/parseColor'
import {IDisplayObjectTypeCategoryEdge} from '../types'
import CONFIG from '../../CONFIG'
import {EdgeDetail} from './EDGE_DETAILS'
import EDGE_ELEMENT_ZINDEX from './EDGE_ELEMENT_ZINDEX'

class EdgeText extends PIXI.Text implements IDisplayObjectTypeCategoryEdge {
  readonly type = EDGE_ELEMENT_TYPES.text

  readonly category = TARGET_CATEGORIES.edge

  interactive = true

  static isShown(edge: PixiEdge): boolean {
    return Boolean(edge.title)
  }

  constructor(public edge: PixiEdge) {
    super(edge.title || '')
    this.zIndex = EDGE_ELEMENT_ZINDEX.EdgeText
  }

  redraw(edgeDetail: EdgeDetail): void {
    const {edge} = this
    const {
      title,
      color,
      state: {isSelected, isEdited},
      engine: {
        eventManager: {
          state: {isFontReady},
        },
      },
    } = this.edge
    const {fontSizeFactor, renderText} = edgeDetail
    const {scale: fontScale, size, fontFamily, fontWeight} = CONFIG.edges.text

    this.visible = renderText

    if (!renderText) {
      return
    }

    const totalFontScale = fontScale * fontSizeFactor

    this.text = title || ''
    this.style = {
      ...this.style,
      fill: Color(color ? parseColor(color).background : CONFIG.edges.defaultColor).rgbNumber(),
      lineJoin: 'bevel',
      fontSize: size * totalFontScale,
      // @ts-ignore does not recognize this is a valid TextStyleFontWeight and interprets it as type 'string'
      fontWeight,
      fontFamily: isFontReady ? fontFamily : 'serif',
      textBaseline: 'alphabetic',
    }

    const {dx, dy, radian, scale, startMiddlePoint} = edge.getPositions()

    this.alpha = isEdited ? 0 : 1
    this.anchor.set(0.5, 1)
    this.cursor = isSelected ? 'text' : ''
    // const rect = new PIXI.Graphics()
    // rect.beginFill(0xff0000, 0.5)
    // rect.drawRect((-this.width * scale) / 2, -this.height * scale, this.width * scale, this.height * scale)
    // rect.endFill()
    // this.removeChildren()
    // this.addChild(rect)
    this.x = startMiddlePoint.x + dx / 2.0
    this.y = startMiddlePoint.y + dy / 2.0
    this.rotation = radian
    this.scale = new PIXI.Point(scale / totalFontScale, scale / totalFontScale) as PIXI.ObservablePoint
  }
}

export default EdgeText
