import * as PIXI from 'pixi.js'
import debug from 'debug'

import type Color from 'color'

import PixiNode from './PixiNode'
import parseColor from './utils/parseColor'

import type PixiRenderEngine from './PixiRenderEngine'
import CONFIG from './CONFIG'
import {Dimensions, NodeData, RectangleData} from './types'
import {ZERO_AREA} from '../utils/points'
import RootNodeElements from './RootNodeElements'
import PixiEdge from './PixiEdge'
import AbstractPixiNode from './AbstractPixiNode'

const log = debug('app:RenderEngine:RootNode')

type State = {
  isSelected: boolean
  isHighlighted: boolean
}

class PixiRootNode extends AbstractPixiNode {
  isRoot = true

  get id(): string {
    return this.storeNode.id
  }

  x = 0

  y = 0

  depth = 0

  scale = 1

  width = Number.MAX_SAFE_INTEGER

  headerHeight = 0

  height = Number.MAX_SAFE_INTEGER

  get title(): string | undefined {
    return this.storeNode?.title
  }

  siblingNodes = []

  edges = new Set<PixiEdge>()

  state: State = {
    isSelected: false,
    isHighlighted: false,
  }

  elements: RootNodeElements

  get container(): PIXI.Container {
    return this.elements
  }

  constructor(public engine: PixiRenderEngine, public storeNode: NodeData) {
    super()

    log('new root node', engine)

    this.elements = new RootNodeElements(this)

    engine.nodeContainer.addChild(this.elements)

    // @TODO: fix typing
    engine.viewport.node = this as unknown as PixiNode

    this.redraw()
  }

  transform = (point: PIXI.Point): PIXI.Point => this.engine.viewport.toWorld(point)

  redrawChildGhosts = (): void => this.elements.elements.ghostContainer.redraw()

  redrawMask = (): void => undefined

  isRootParent = true

  getGlobalPosition = (): PIXI.Rectangle => new PIXI.Rectangle(0, 0, 0, 0)

  get parentNode(): PixiNode {
    return this as unknown as PixiNode
  }

  getBackgroundColor(): Color {
    return parseColor(this.getColorName()).background
  }

  getColorName(): string {
    return CONFIG.nodes.rootColor
  }

  isDestroyed = false

  setState(state: State): void {
    const {state: oldState} = this
    this.state = {...oldState, ...state}

    this.redraw()
  }

  redraw(): void {
    this.elements.redraw()
  }

  childrenRedrawText(): void {
    this.childNodes.forEach(node => {
      const {textField} = node.nodeTextField
      if (textField) node.nodeTextField.moveTextField()
      node.redrawText()
      node.childrenRedrawText()
    })
  }

  addChild(child: PixiNode): void {
    const {elements, childNodes} = this

    if (child.parentNode) child.parentNode.removeChild(child)
    child.parentNode = this as unknown as PixiNode
    child.depth = this.depth + 1
    this.offspringCount += 1
    childNodes.add(child)
    elements.childrenContainer.addChild(child.container)

    child.redrawRect()
    child.childrenRedrawRects()
  }

  removeChild(child: PixiNode): void {
    const {childNodes, elements} = this
    childNodes.delete(child)
    elements.childrenContainer.removeChild(child.container)
  }

  isChildOf(): boolean {
    return false
  }

  isParentOf(): boolean {
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  isVisible(): boolean {
    return true
  }

  hasContent(): boolean {
    return !this.isLeaf()
  }

  hasCheckBox(): boolean {
    return false
  }

  destroy(): void {
    this.engine.removeNode(this as unknown as PixiNode)
  }

  isCollapsed = false

  get childrenDimensions(): Dimensions {
    const {childNodes} = this

    if (childNodes.size === 0) return ZERO_AREA

    const width =
      Math.max(...[...childNodes].map(node => node.x + node.width)) - Math.min(...[...childNodes].map(node => node.x))
    const height =
      Math.max(...[...childNodes].map(node => node.y + node.height)) - Math.min(...[...childNodes].map(node => node.y))

    return {width, height}
  }

  getBounds(): RectangleData {
    const {childNodes} = this

    if (childNodes.size === 0)
      return {
        x: -window.innerWidth / 2 + CONFIG.nodes.create.width / 2,
        y: -window.innerHeight / 2,
        width: window.innerWidth,
        height: window.innerHeight,
      }

    const childNodeArray = [...childNodes]
    const x = Math.min(...childNodeArray.map(node => node.x))
    const y = Math.min(...childNodeArray.map(node => node.y))
    const width = Math.max(...childNodeArray.map(node => node.x + node.width)) - x
    const height = Math.max(...childNodeArray.map(node => node.y + node.height)) - y

    return {x, y, width, height}
  }

  getViewportPosition(): PIXI.Rectangle {
    const {viewport} = this.engine

    return viewport.getBounds()
  }

  zoomTo(): Promise<void> {
    const {viewport, animateViewport} = this.engine
    const {left, right, top, bottom} = CONFIG.nodes.zoomToNodePadding

    const {width: worldWidth, height: worldHeight, x: worldX, y: worldY} = this.getBounds()

    const scale = Math.min(
      (viewport.screenWidth - left - right) / worldWidth,
      (viewport.screenHeight - top - bottom) / worldHeight,
    )
    const x = (viewport.screenWidth + left - right) / 2 - (worldX + worldWidth / 2) * scale
    const y = (viewport.screenHeight + top - bottom) / 2 - (worldY + worldHeight / 2) * scale

    log('zoom to root node', {x, y, scale})
    viewport.emit('zoom-start')

    return animateViewport({x, y, scale})
  }

  getCornerBottomRight(): PIXI.Point {
    const {viewport} = this.engine
    const bounds = viewport.getBounds()
    return new PIXI.Point(bounds.x + bounds.width, bounds.y + bounds.height)
  }

  setCache(): void {
    // pass
  }

  getGridCoord({x, y}: PIXI.IPointData): PIXI.Point {
    const {gridSize} = CONFIG.nodes

    return new PIXI.Point(Math.round(x / gridSize) * gridSize, Math.round(y / gridSize) * gridSize)
  }

  getFreeNodePosition = (x: number, y: number): PIXI.IPointData | undefined => ({x, y})

  getActiveColor(name?: string): Color {
    return parseColor(name || this.getColorName()).active
  }

  getBorderColor(name?: string): Color {
    const {defaultBackground} = CONFIG.nodes

    const color = name || this.getColorName()
    return parseColor(color || defaultBackground).background
  }

  openTextField(): void {
    return undefined
  }
}

export default PixiRootNode
