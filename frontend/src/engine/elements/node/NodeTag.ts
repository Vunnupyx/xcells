import * as PIXI from 'pixi.js'
import {IDisplayObjectTypeCategoryNode} from '../types'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import type PixiNode from '../../PixiNode'
import {BORDER_DETAILS, NodeDetail} from './NODE_DETAILS'
import CONFIG from '../../CONFIG'
import parseColor from '../../utils/parseColor'
import NODE_MARKUPS_ZINDEX from './NODE_MARKUPS_ZINDEX'

const config = CONFIG.nodes.tags

class NodeTag extends PIXI.Text implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.tag

  category = TARGET_CATEGORIES.node

  // TODO: implement an interaction with the tags
  // cursor = 'pointer'

  constructor(public node: PixiNode, private tagIndex: number) {
    super(node.tags[tagIndex])

    if (tagIndex < 0) {
      throw new Error(`Negative index given (${tagIndex})`)
    }

    this.zIndex = NODE_MARKUPS_ZINDEX.NodeTag
  }

  static isShown(node: PixiNode): boolean {
    return Boolean(node.tags.length)
  }

  redrawTo(graphics: PIXI.Graphics, nodeDetail: NodeDetail, offset: PIXI.IPointData) {
    const {tagIndex, x: textX, y: textY, width, height} = this
    const {store} = this.node.engine
    const tagId = this.node.tags[tagIndex]

    const storeTag = store.tags.find(({id}) => id === tagId)

    if (!storeTag) {
      throw new Error('Cannot find tag in store')
    }

    const x = textX - config.paddingHorizontal + offset.x
    const y = textY + offset.y
    const color = parseColor(storeTag.color).background.rgbNumber()

    graphics.lineStyle(0)
    graphics.beginFill(color)
    if (nodeDetail.borderType === BORDER_DETAILS.rounded) {
      graphics.drawRoundedRect(x, y, width, height, config.radius)
    } else {
      graphics.drawRect(x, y, width, height)
    }
    graphics.endFill()
  }

  redraw(nodeDetail: NodeDetail) {
    const {tagIndex} = this
    const {engine} = this.node
    const {store} = this.node.engine
    const tagId = this.node.tags[tagIndex]

    const {fontSizeFactor, renderText} = nodeDetail
    const {scale, size, fontFamily, fontWeight, lineHeight} = config.text

    this.visible = renderText

    if (!renderText) return

    const storeTag = store.tags.find(({id}) => id === tagId)

    if (!storeTag) {
      throw new Error('Tag definition not found in map store')
    }

    const totalScale = fontSizeFactor * scale

    this.text = storeTag.name || ''
    this.style = {
      ...this.style,
      fill: parseColor(storeTag.color).text.rgbNumber(),
      lineJoin: 'bevel',
      fontSize: totalScale * size,
      lineHeight: totalScale * size * lineHeight,
      fontWeight,
      fontFamily: engine.eventManager.state.isFontReady ? fontFamily : 'serif',
      textBaseline: 'alphabetic',
    }
    this.scale = new PIXI.Point(1 / totalScale, 1 / totalScale) as PIXI.ObservablePoint
    // this.hitArea = new PIXI.Rectangle(
    //   0 - config.paddingHorizontal,
    //   0,
    //   this.width,
    //   this.height,
    //   // config.radius,
    // )
    this.interactive = true

    // debugging position
    // const color = parseColor(storeTag.color).background.rgbNumber()
    // this.removeChildren()
    // const g = new PIXI.Graphics()
    // g.scale = new PIXI.Point(totalScale, totalScale) as PIXI.ObservablePoint
    // g.lineStyle(1, 0xff0000, 1, 0)
    // g.drawRect(0 - config.paddingHorizontal, 0, this.width, this.height)
    // g.drawRect(-config.paddingHorizontal, 0, this.width, CONFIG.nodes.gridSize)
    // this.addChild(g)
  }

  set x(value: number) {
    super.x = value + config.paddingHorizontal
  }

  get x(): number {
    return super.x
  }

  get width(): number {
    return super.width + config.paddingHorizontal * 2
  }
}

export default NodeTag
