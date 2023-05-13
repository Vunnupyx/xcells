import * as PIXI from 'pixi.js'
import {GlowFilter} from 'pixi-filters'
import debug from 'debug'

import Elements from '../Elements'
import NodeText from './NodeText'
import NodeMask from './NodeMask'
import NodeGhostContainer from './NodeGhostContainer'
import NodeGraphics from './NodeGraphics'
import NodeImage from './NodeImage'
import NodeBackground from './NodeBackground'
import NodeHeaderHandle from './NodeHeaderHandle'
import NodeDownloadHandle from './NodeDownloadHandle'
import NodeResizeHandle from './NodeResizeHandle'
import NodeChildren from './NodeChildren'
import NodeHeaderMarkups from './NodeHeaderMarkups'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import type PixiNode from '../../PixiNode'
import CONFIG from '../../CONFIG'
import NODE_DETAIL_LEVELS from './NODE_DETAIL_LEVELS'
import NODE_DETAILS, {NodeDetail} from './NODE_DETAILS'
import logDuration from '../../utils/logDuration'
import {isMobile, isTablet} from '../../../utils/browserDetection'
import NodeHtml from './NodeHtml'

const log = debug('app:RenderEngine:Node:Elements')
const logPerformance = log.extend('PERFORMANCE', '::')

type ElementMapping = {
  graphics: NodeGraphics
  background: NodeBackground
  text?: NodeText
  html?: NodeHtml
  ghostContainer?: NodeGhostContainer
  children?: NodeChildren
  mask?: NodeMask
  resizeHandle?: NodeResizeHandle
  downloadHandle?: NodeDownloadHandle
  headerHandle?: NodeHeaderHandle
  image?: NodeImage
  headerMarkups?: NodeHeaderMarkups
}

class NodeElements extends Elements {
  sortableChildren = true

  elements: ElementMapping

  category = TARGET_CATEGORIES.node

  type = NODE_ELEMENT_TYPES.container

  detailLevel: NODE_DETAIL_LEVELS = NODE_DETAIL_LEVELS.normal

  get childrenContainer(): NodeChildren {
    const {node, elements} = this
    if (!elements.children) {
      elements.children = new NodeChildren(node)
      this.addChild(elements.children)
      elements.children.redraw(this.getDetailInfo())
    }
    return elements.children
  }

  constructor(public node: PixiNode) {
    super()
    // allow access to this object within events
    if (CONFIG.nodes.glowFilterSettings.enabled) this.filters = [new GlowFilter(CONFIG.nodes.glowFilterSettings)]

    const graphics = new NodeGraphics(node)
    this.addChild(graphics)
    const background = new NodeBackground(node)
    this.addChild(background)

    this.elements = {
      graphics,
      background,
    }
  }

  redrawContainer(): void {
    const {container, node} = this

    const {x, y, width, height, angle, pivot} = this.node
    const {isSelected, isTemporary} = this.node.state
    container.x = x + pivot.x
    container.y = y + pivot.y
    container.angle = angle
    container.pivot = new PIXI.Point(pivot.x, pivot.y) as PIXI.ObservablePoint
    container.interactive = false
    if (isSelected) {
      const {gridSize} = CONFIG.nodes
      const heightAddition = node.hasExpandGhost() ? (2 / 3) * gridSize : 0

      // adjust hit area on mobile devices dynamically based on current scale
      const currentWorldScale = node.getCurrentWorldScale()
      const scaleDilation = isMobile || isTablet ? (1 / 1 + Math.exp(-currentWorldScale) - 1) * 10 * width : 0

      container.hitArea = new PIXI.Rectangle(
        0 - scaleDilation / 2,
        0 - scaleDilation / 2,
        width + 10 + scaleDilation,
        height + 10 + heightAddition + scaleDilation,
      )
    } else {
      container.hitArea = new PIXI.Rectangle(0, 0, width, height)
    }

    if (isSelected) {
      container.zIndex = Number.MAX_SAFE_INTEGER
    } else {
      container.zIndex = y
    }
    if (isTemporary) {
      container.alpha = CONFIG.nodes.ghost.alpha
    } else {
      container.alpha = 1
    }
  }

  redraw(): void {
    const endDuration = logDuration(logPerformance, 'node elements redraw')

    this.redrawContainer()
    this.redrawText()
    this.redrawHeaderMarkups()
    this.redrawBackground()
    this.redrawGraphics()
    this.redrawChildren()
    this.redrawGhostContainer()
    this.redrawImage()
    this.redrawDownloadHandle()
    this.redrawHeaderHandle()
    this.redrawResizeHandle()
    this.redrawHtml()

    this.attachMasks()

    endDuration()
  }

  isMaskNeeded(): boolean {
    const {childNodes, scale, width, height, headerHeight, state} = this.node
    const {childrenPaddingLeft} = CONFIG.nodes
    // TODO: check if mask is needed

    return (
      state.isSelected ||
      Boolean(
        [...childNodes].find(
          node =>
            node.x < -childrenPaddingLeft ||
            node.y * scale < -headerHeight ||
            (childrenPaddingLeft + node.x + node.width) * scale > width ||
            headerHeight + (node.y + node.height) * scale > height,
        ),
      )
    )
  }

  attachMasks(): void {
    const {elements} = this
    if (this.isMaskNeeded()) {
      if (!elements.mask) {
        elements.mask = new NodeMask(this.node)
        this.addChild(elements.mask)
      }
      elements.mask.redraw()
      Object.values(elements)
        .filter(element => element && 'isMasked' in element && element.isMasked)
        .forEach(element => {
          element.mask = elements.mask as PIXI.Container
        })
    } else if (elements.mask) {
      this.removeChild(elements.mask)
      delete elements.mask
      Object.values(elements)
        .filter(element => 'isMasked' in element && element.isMasked)
        .forEach(element => {
          element.mask = null
        })
    }
  }

  redrawText(): void {
    const {node, elements} = this
    if (NodeText.isShown(node)) {
      if (!elements.text) {
        elements.text = new NodeText(node)
        this.addChild(elements.text)
      }
      elements.text.redraw(this.getDetailInfo())
    } else if (elements.text) {
      this.removeChild(elements.text)
      delete elements.text
    }
  }

  redrawHtml(): void {
    const {node, elements} = this
    if (NodeHtml.isShown(node)) {
      if (!elements.html) {
        elements.html = new NodeHtml(node)
        this.addChild(elements.html)
      }
      elements.html.redraw(this.getDetailInfo())
    } else if (elements.html) {
      this.removeChild(elements.html)
      delete elements.html
    }
  }

  redrawGhostContainer(): void {
    const {node, elements} = this
    if (NodeGhostContainer.isShown(node)) {
      if (!elements.ghostContainer) {
        elements.ghostContainer = new NodeGhostContainer(node)
        this.addChild(elements.ghostContainer)
      }
      elements.ghostContainer.redraw()
    } else if (elements.ghostContainer) {
      this.removeChild(elements.ghostContainer)
      delete elements.ghostContainer
    }
  }

  redrawChildren(): void {
    const {node, elements} = this
    if (NodeChildren.isShown(node)) {
      if (!elements.children) {
        elements.children = new NodeChildren(node)
        this.addChild(elements.children)
      }
      elements.children.redraw(this.getDetailInfo())
    } else if (elements.children) {
      this.removeChild(elements.children)
      delete elements.children
    }
  }

  redrawResizeHandle(): void {
    const {node, elements} = this
    if (NodeResizeHandle.isShown(node)) {
      if (!elements.resizeHandle) {
        elements.resizeHandle = new NodeResizeHandle(node)
        this.addChild(elements.resizeHandle)
      }
      elements.resizeHandle.redraw()
    } else if (elements.resizeHandle) {
      this.removeChild(elements.resizeHandle)
      delete elements.resizeHandle
    }
  }

  redrawDownloadHandle(): void {
    const {node, elements} = this
    if (NodeDownloadHandle.isShown(node)) {
      if (!elements.downloadHandle) {
        elements.downloadHandle = new NodeDownloadHandle(node)
        this.addChild(elements.downloadHandle)
      }
      elements.downloadHandle.redraw()
    } else if (elements.downloadHandle) {
      this.removeChild(elements.downloadHandle)
      delete elements.downloadHandle
    }
  }

  redrawHeaderHandle(): void {
    const {node, elements} = this
    if (NodeHeaderHandle.isShown(node)) {
      if (!elements.headerHandle) {
        elements.headerHandle = new NodeHeaderHandle(node)
        this.addChild(elements.headerHandle)
      }
      elements.headerHandle.redraw()
    } else if (elements.headerHandle) {
      this.removeChild(elements.headerHandle)
      delete elements.headerHandle
    }
  }

  redrawHeaderMarkups(): void {
    const {node, elements} = this
    if (NodeHeaderMarkups.isShown(node)) {
      if (!elements.headerMarkups) {
        elements.headerMarkups = new NodeHeaderMarkups(node)
        this.addChild(elements.headerMarkups)
      }
      elements.headerMarkups.redraw(this.getDetailInfo())
    } else if (elements.headerMarkups) {
      this.removeChild(elements.headerMarkups)
      delete elements.headerMarkups
    }
  }

  redrawImage(): void {
    const {node, elements} = this
    if (NodeImage.isShown(node)) {
      if (!elements.image) {
        elements.image = new NodeImage(node)
        this.addChild(elements.image)
      }
      elements.image.redraw(this.getDetailInfo())
    } else if (elements.image) {
      this.removeChild(elements.image)
      delete elements.image
    }
  }

  redrawGraphics(): void {
    this.elements.graphics.redraw(this.getDetailInfo())
    this.redrawBackground()
    this.redrawImage()
    this.redrawDownloadHandle()
    this.redrawResizeHandle()
  }

  redrawBackground(): void {
    this.elements.background.redraw()
  }

  getDetailInfo(): NodeDetail {
    return NODE_DETAILS[this.detailLevel]
  }

  getDetailLevel(worldScale: number): NODE_DETAIL_LEVELS {
    const {detailLevelThresholds} = CONFIG
    const detailLevel = Object.values(NODE_DETAIL_LEVELS)
      .reverse()
      .find(level => worldScale < detailLevelThresholds[level])

    if (!detailLevel) {
      throw new Error('Misconfiguration detailLevel')
    }
    return detailLevel
  }

  calculateDetailLevel(worldScale: number): NodeDetail {
    const newDetailLevel = this.getDetailLevel(worldScale)
    if (this.detailLevel !== newDetailLevel) {
      this.detailLevel = newDetailLevel
      this.redraw()
    }
    return this.getDetailInfo()
  }
}

export default NodeElements
