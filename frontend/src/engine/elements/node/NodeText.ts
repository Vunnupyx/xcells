import * as PIXI from 'pixi.js'
import debug from 'debug'

import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import type PixiNode from '../../PixiNode'
import parseColor from '../../utils/parseColor'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import CONFIG from '../../CONFIG'
import {IDisplayObjectTypeCategoryNode} from '../types'
import {NodeDetail} from './NODE_DETAILS'
import logDuration from '../../utils/logDuration'

const log = debug('')
const logPerformance = log.extend('PERFORMANCE', '::')

class NodeText extends PIXI.Text implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.text

  category = TARGET_CATEGORIES.node

  accessible = true

  accessibleTitle = ''

  accessibleType = 'div'

  static isShown(node: PixiNode): boolean {
    return Boolean(node.title)
  }

  constructor(public node: PixiNode) {
    super(node.title || '')
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeText
  }

  redraw(nodeDetail: NodeDetail): void {
    const endDuration = logDuration(logPerformance, 'node text redraw')

    const {node} = this
    const {fontSizeFactor, renderText} = nodeDetail
    const {width, title, engine, isUrl, isEmail} = this.node
    const {isEdited, isSelected} = this.node.state
    const {scale, size, paddingLeft, paddingTop, fontFamily, fontWeight, lineHeight} = CONFIG.nodes.text

    this.visible = renderText

    if (!renderText) return

    const textColor = parseColor(node.getColorName())[isUrl || isEmail ? 'textLink' : 'text']

    const totalScale = fontSizeFactor * scale
    this.text = title || ''
    this.accessibleTitle = title || ''
    this.style = {
      ...this.style,
      fill: textColor.rgbNumber(),
      lineJoin: 'bevel',
      fontSize: totalScale * size,
      wordWrapWidth: totalScale * (width - paddingLeft * 2),
      wordWrap: true,
      breakWords: true,
      lineHeight: totalScale * size * lineHeight,
      fontWeight,
      fontFamily: engine.eventManager.state.isFontReady ? fontFamily : 'serif',
      textBaseline: 'alphabetic',
    }
    this.resolution = 1
    this.x = paddingLeft
    this.y = paddingTop
    this.scale = new PIXI.Point(1 / totalScale, 1 / totalScale) as PIXI.ObservablePoint
    this.alpha = isEdited ? 0 : 1
    this.interactive = isSelected

    endDuration()
  }
}

export default NodeText
