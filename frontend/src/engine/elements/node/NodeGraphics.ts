import * as PIXI from 'pixi.js'
import Color from 'color'
import type PixiNode from '../../PixiNode'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import {IDisplayObjectTypeCategoryNode} from '../types'
import CONFIG from '../../CONFIG'
import parseColor from '../../utils/parseColor'
import range from '../../../shared/utils/range'
// import drawRounded45DegreeLine from '../../utils/drawRounded45DegreeLine'
import {BORDER_DETAILS, NodeDetail} from './NODE_DETAILS'
import NodeDownloadHandle from './NodeDownloadHandle'
import NodeHeaderHandle from './NodeHeaderHandle'
import NodeResizeHandle from './NodeResizeHandle'
import NodeHeaderMarkups from './NodeHeaderMarkups'

const SPOT_SIZE = 1.5
const SPOT_SPACE = 1
const SPOT_COUNT = 2

class NodeGraphics extends PIXI.Graphics implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.graphics

  category = TARGET_CATEGORIES.node

  static spotTexture: PIXI.RenderTexture

  static isShown() {
    return true
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeGraphics
  }

  redrawHeaderHandle(): void {
    const {node} = this
    const {headerHeight, width, image, file} = this.node
    const {isTemporary} = this.node.state
    const {cornerRadius, cardSiblingSeparator, headerHandle, ghost, gridSize} = CONFIG.nodes
    const {paddingLeft: textPaddingLeft, paddingTop: textPaddingTop} = CONFIG.nodes.text

    const color = image || file ? parseColor(node.getColorName()).textContrast : node.getActiveBackgroundColor()
    const alpha = image || file ? headerHandle.alpha : 1

    this.lineStyle(0)
    this.beginFill(color.rgbNumber(), isTemporary ? ghost.alpha : alpha)
    this.drawRoundedRect(0, 0, width - cardSiblingSeparator, headerHeight - cardSiblingSeparator, cornerRadius)
    this.endFill()

    const radius = SPOT_SIZE / 2

    this.lineStyle(0)
    this.beginFill(parseColor(node.getColorName()).background.rgbNumber())

    const rowCount = Math.round((headerHeight - (gridSize / 2) * 2) / (SPOT_SIZE + SPOT_SPACE))
    const paddingX = (textPaddingLeft - (SPOT_SIZE * SPOT_COUNT + SPOT_SPACE * (SPOT_COUNT - 1))) / 2
    range(rowCount).forEach(row => {
      range(SPOT_COUNT).forEach(column => {
        // draw right handle
        this.drawCircle(
          paddingX + column * (SPOT_SIZE + SPOT_SPACE) + radius,
          gridSize / 2 + row * (SPOT_SIZE + SPOT_SPACE) + radius,
          radius,
        )
        // draw left handle
        this.drawCircle(
          width - (paddingX + column * (SPOT_SIZE + SPOT_SPACE) + radius),
          gridSize / 2 + row * (SPOT_SIZE + SPOT_SPACE) + radius,
          radius,
        )
      })
    })

    // draw top handles
    const columnCount = Math.round(width / 3 / (SPOT_SIZE + SPOT_SPACE))
    const paddingY = (textPaddingTop - (SPOT_SIZE * SPOT_COUNT + SPOT_SPACE * (SPOT_COUNT - 1))) / 2
    range(SPOT_COUNT).forEach(row => {
      range(columnCount).forEach(column => {
        this.drawCircle(
          width / 3 + column * (SPOT_SIZE + SPOT_SPACE) + radius,
          paddingY + row * (SPOT_SIZE + SPOT_SPACE) + radius,
          radius,
        )
      })
    })
    this.endFill()

    // // The first stripes
    // range(Math.round(headerHeight / 10) - 1).forEach(i => {
    //   const y = headerHeight - (i + 1) * 10
    //   const yToGo = Math.min(y - 3, width - 8)
    //   const length = Math.sqrt(2 * yToGo * yToGo)
    //
    //   drawRounded45DegreeLine(this, new PIXI.Point(3, y), length, 2)
    // })
    //
    // // The other stripes
    // range(Math.round(width / 10) + 20).forEach(i => {
    //   const startX = 7 + 10 * i
    //   const continueX = Math.min(startX + (headerHeight - 6), width - 5) - startX
    //
    //   if (continueX < 0 || continueX + startX > width) return
    //   const length = Math.sqrt(2 * continueX * continueX)
    //   const point = new PIXI.Point(startX, headerHeight - 3)
    //   drawRounded45DegreeLine(this, point, length, 2)
    // })
    // this.endFill()
  }

  redrawDownloadHandle() {
    const {width} = this.node
    const {color, alpha, path, padding, radius, circleColor, circleAlpha} = CONFIG.nodes.downloadHandle

    const downloadCircle = new PIXI.Circle(width - padding - radius, padding + radius, radius)
    const downloadPolygon = new PIXI.Polygon(
      path.map((xy, i) => (i % 2 === 0 ? xy + width : xy)).map((xy, i) => (i % 2 === 0 ? xy - padding : xy + padding)),
    )

    this.lineStyle(0)
    this.beginFill(Color(circleColor).rgbNumber(), circleAlpha)
    this.drawCircle(downloadCircle.x, downloadCircle.y, downloadCircle.radius)
    this.beginFill(Color(color).rgbNumber(), alpha)
    this.drawPolygon(downloadPolygon)
    this.endFill()
  }

  redrawResizeHandle() {
    const {node} = this
    const {width, height} = this.node
    const {gridSize, cardSiblingSeparator} = CONFIG.nodes
    const {color: colorCode, size} = CONFIG.nodes.resizeHandle
    const {offset, borderSize} = CONFIG.nodes.selected

    const heightAddition = node.hasExpandGhost() ? (2 / 3) * gridSize : 0

    const color = Color(colorCode).rgbNumber()

    const x = width + offset + borderSize / 2 - cardSiblingSeparator - size / 2
    const y = height + heightAddition + offset + borderSize / 2 - cardSiblingSeparator - size / 2

    this.lineStyle(0)
    this.beginFill(color)
    this.drawRect(x, y, size, size)
    this.endFill()
  }

  redrawBorder(borderType: BORDER_DETAILS): void {
    const {width, height} = this.node
    const {borderSize, cardSiblingSeparator, cornerRadius} = CONFIG.nodes

    if (borderType === BORDER_DETAILS.none) return

    const borderColor = this.node.getBorderColor()

    if (!borderColor) return

    this.lineStyle(borderSize, borderColor.rgbNumber(), borderColor.alpha(), 0)

    if (borderType === BORDER_DETAILS.rounded) {
      this.drawRoundedRect(0, 0, width - cardSiblingSeparator, height - cardSiblingSeparator, cornerRadius)
    } else {
      this.drawRect(0, 0, width - cardSiblingSeparator, height - cardSiblingSeparator)
    }
  }

  redraw(nodeDetail: NodeDetail): void {
    const {node} = this
    const {borderType} = nodeDetail
    const {width, height} = this.node
    const {isSelected} = this.node.state
    const {cornerRadius, selected, cardSiblingSeparator, gridSize} = CONFIG.nodes

    const backgroundColor = node.getBackgroundColor()
    const borderColor = node.getBorderColor()

    this.clear()

    const isOneColor = borderColor.hex() === backgroundColor.hex()

    // draw the border under the header, if background and border have the same color
    if (isOneColor) {
      this.redrawBorder(borderType)
      if (NodeHeaderHandle.isShown(node)) this.redrawHeaderHandle()
    } else {
      if (NodeHeaderHandle.isShown(node)) this.redrawHeaderHandle()
      this.redrawBorder(borderType)
    }

    if (NodeHeaderMarkups.isShown(node)) this.node.elements.elements.headerMarkups?.redrawTo(this, nodeDetail)

    // HIGHLIGHTING
    if (isSelected) {
      const selectedBorderColor = Color(selected.selectedBorderColor).rgbNumber()
      this.lineStyle(selected.borderSize, selectedBorderColor, isSelected ? 1 : 0.66, 1)

      const heightAddition = node.hasExpandGhost() ? (2 / 3) * gridSize : 0

      this.drawRoundedRect(
        -selected.offset,
        -selected.offset,
        width - cardSiblingSeparator + selected.offset * 2,
        height - cardSiblingSeparator + selected.offset * 2 + heightAddition,
        cornerRadius,
      )
    }

    if (NodeDownloadHandle.isShown(node)) this.redrawDownloadHandle()

    if (NodeResizeHandle.isShown(node)) this.redrawResizeHandle()
  }
}

export default NodeGraphics
