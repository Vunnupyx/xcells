import * as PIXI from 'pixi.js'
import debug from 'debug'

import Color from 'color'
import {generateNodeId} from '../shared/utils/generateId'
import NodeElements from './elements/node/NodeElements'

import rectIntersectsRect from './utils/intersect/rectIntersectsRect'

import type PixiRenderEngine from './PixiRenderEngine'
import type PixiEdge from './PixiEdge'
import CONFIG from './CONFIG'
import NodeTextField from './elements/node/NodeTextField'
import isUrl from '../utils/isUrl'
import isEmail from '../utils/isEmail'
import parseColor from './utils/parseColor'
import {Dimensions, ImagePositions, NODE_VISIBLE, NodeData, RectangleData} from './types'
import {getAllAttachedY} from './utils/nodesAttached'
import {length, ZERO_AREA} from '../utils/points'
import range from '../shared/utils/range'
import onGrid from './utils/onGrid'
import AbstractPixiNode from './AbstractPixiNode'

const log = debug('app:RenderEngine:Node')
const logError = log.extend('ERROR*', '::')
const logFlood = log.extend('FLOOD', '::')

type State = {
  isHighlighted: boolean
  isSelected: boolean
  isTemporary: boolean
  isEdited: boolean
  isAddNode: boolean
  isMoving: boolean
}

type StateChange = Partial<State>

class PixiNode extends AbstractPixiNode implements NodeData {
  _edges: Set<PixiEdge> = new Set()

  _id: string | null = null

  _x: number | null = null

  _y: number | null = null

  _borderColor: string | null | undefined = null

  _color: string | null | undefined = null

  _scale: number | null = null

  _image: string | null | undefined = null

  _imagePosition: ImagePositions | null | undefined = null

  _file: string | null | undefined = null

  _height: number | null = null

  _width: number | null = null

  _angle: number | null = null

  _pivot: PIXI.IPointData | null = null

  _title: string | null = null

  _html: string | null = null

  _depth: number | null = null

  _tags: string[] | null = null

  _checked?: boolean

  state: State = {
    isHighlighted: false,
    isSelected: false,
    isTemporary: false,
    isEdited: false,
    isAddNode: false,
    isMoving: false,
  }

  isRoot = false

  isRootParent = false

  isDestroyed = false

  nodeTextField: NodeTextField

  elements: NodeElements

  constructor(public engine: PixiRenderEngine, public storeNode: NodeData, public parentNode: PixiNode) {
    super()

    this.log('new node', engine)

    this.elements = new NodeElements(this)
    this.nodeTextField = new NodeTextField(this)

    parentNode.addChild(this)
    this.redraw()
  }

  update(storeNode: NodeData, parentNode: PixiNode, isFromStore = false): void {
    const {state, storeNode: currentStoreNode, parentNode: currentParentNode} = this

    this.setCache(false)
    if (isFromStore) {
      state.isTemporary = false
      state.isAddNode = false
    }

    if (currentStoreNode !== storeNode) {
      this.log('update', storeNode, isFromStore)

      this.storeNode = storeNode
      this.resetTemporaryValues()
    } else if (this.hasChanges()) {
      // TODO: remove if there are no other cases than closing node opened by hover
      this.logError('node has changes after update from store! this should not happen, please report a bug!', this)
    }

    if (currentParentNode !== parentNode) {
      this.log('change parent')
      parentNode.addChild(this)
    }

    if (currentStoreNode !== storeNode) {
      try {
        this.redraw()
        if (currentStoreNode?.color !== storeNode.color) this.childrenRedrawRects()
      } catch (err) {
        this.logError('Could not rerender node on update', err)
      }
    }
  }

  setState(newStateOrFn: StateChange | ((s: State) => StateChange)): void {
    const {state, isCached, isDestroyed, parentNode} = this
    const changes = typeof newStateOrFn === 'function' ? newStateOrFn(state) : newStateOrFn

    this.logFlood('node setState', changes)

    if (isDestroyed) return

    if (Object.entries(changes).find(([key, value]) => state[key as keyof StateChange] !== value)) {
      this.state = {...state, ...changes}
      if (isCached) this.setCache(false)
      if (changes.isSelected !== undefined && changes.isSelected !== state.isSelected) {
        // redraw the parent, so it can decide whether and where to draw a ghost
        parentNode.redraw()

        if (!this.state.isSelected && this.nodeTextField.textField) {
          this.nodeTextField.closeTextField()
        }
      }
      this.redraw()
    }
  }

  redrawText(): void {
    this.elements.redrawText()
    this.elements.redrawHeaderMarkups()
  }

  redrawRect(): void {
    this.elements.redrawGraphics()
  }

  redrawChildGhosts(): void {
    this.elements.redrawGhostContainer()
  }

  redrawChildContainer(): void {
    this.elements.redrawChildren()
  }

  redrawMask(): void {
    this.elements.attachMasks()
  }

  redrawContainer(): void {
    this.elements.redrawContainer()
  }

  redrawHtml(): void {
    this.elements.redrawHtml()
  }

  redraw(): void {
    const {elements, nodeTextField, parentNode} = this

    elements.redraw()
    this.redrawEdges()
    this.childrenRedrawEdges()
    if (nodeTextField.textField) nodeTextField.moveTextField()
    parentNode.redrawChildGhosts()
  }

  redrawEdges(): void {
    ;[...this.edges].forEach(e => e.redraw())
  }

  childrenRedrawEdges(): void {
    this.childNodes.forEach(node => {
      node.redrawEdges()
      node.childrenRedrawEdges()
    })
  }

  childrenRedrawRects(): void {
    this.childNodes.forEach(node => {
      node.redrawRect()
      node.childrenRedrawRects()
    })
  }

  childrenRedrawText(): void {
    this.childNodes.forEach(node => {
      const {textField} = node.nodeTextField
      if (textField) node.nodeTextField.moveTextField()
      node.redrawText()
      node.childrenRedrawText()
    })
  }

  get childrenDimensions(): Dimensions {
    const {childNodes, headerHeight, scale} = this
    const {childrenPaddingLeft} = CONFIG.nodes

    if (childNodes.size === 0) return ZERO_AREA

    const width = childrenPaddingLeft + Math.max(...[...childNodes].map(node => node.x + node.width)) * scale
    const height = headerHeight + Math.max(...[...childNodes].map(node => node.y + node.height)) * scale

    return {width, height}
  }

  hasExpandGhost(): boolean {
    const {siblingNodes, isCollapsed, state} = this
    const {eventManager} = this.engine
    return (
      isCollapsed &&
      !state.isTemporary &&
      !state.isMoving &&
      eventManager.state.showGhosts &&
      getAllAttachedY(this, siblingNodes).length === 0
    )
  }

  resize(width: number, height: number, isOnGrid = true): void {
    const {headerHeight} = this
    const {isEdited} = this.state
    const minWidth = Math.max(width, CONFIG.nodes.minWidth)
    const minHeight = Math.max(height, headerHeight)

    this.setCache(false)

    if (!Number.isFinite(width) && !Number.isFinite(height)) {
      this.logError('cannot resize node, as at least one given value is not finite', width, height)
      return
    }

    if (isOnGrid) {
      const {childrenDimensions} = this
      const {minWidthGridAdditionFactor, minHeightGridAdditionFactor} = CONFIG.nodes
      const gridPoint = this.parentNode.getGridCoord(
        {
          x: Math.max(childrenDimensions.width + CONFIG.nodes.gridSize * minWidthGridAdditionFactor, minWidth),
          y: Math.max(childrenDimensions.height + CONFIG.nodes.gridSize * minHeightGridAdditionFactor, minHeight),
        },
        Math.ceil,
      )
      this.width = gridPoint.x
      // allow to collapse the node to min height, which might not be in the grid
      this.height = minHeight === headerHeight ? minHeight : gridPoint.y
    } else {
      this.width = minWidth
      this.height = minHeight
    }

    this.redrawContainer()
    this.redrawRect()
    this.redrawText()
    this.redrawEdges()
    this.childrenRedrawEdges()
    this.redrawChildContainer()
    this.redrawMask()
    this.redrawChildGhosts()
    this.parentNode.redrawChildGhosts()

    if (isEdited) this.nodeTextField.moveTextField()
  }

  collapse(): void {
    const {width, headerHeight} = this

    this.log('collapse', {width, headerHeight})

    this.resize(width, headerHeight, false)
  }

  decollapse(isOnGrid = true): void {
    const {width, y, headerHeight} = this
    const {gridSize, decollapseRatio} = CONFIG.nodes
    const coords = this.getGridCoord({
      x: 0,
      // decollapse the ratio for single line headers, else minimum the ratio minus 2 gridsizes (minimum header)
      y: y + headerHeight + (width * decollapseRatio - 2 * gridSize),
    })
    this.resize(width, coords.y - y, isOnGrid)
  }

  getFreeNodePosition(x: number, y: number, collisionNodes = this.siblingNodes): PIXI.IPointData | undefined {
    const {x: nodeX, y: nodeY, width, height} = this
    const {gridSize} = CONFIG.nodes

    const gridPoint = this.getGridCoord({x, y})
    const {x: gridX, y: gridY} = gridPoint

    const searchArea: RectangleData = {
      x: onGrid(Math.min(gridX, nodeX) - width - gridSize),
      y: onGrid(Math.min(gridY, nodeY) - height - gridSize),
      width: onGrid(Math.max(gridX + width, nodeX + width) - Math.min(gridX, nodeX) + 2 * width + 2 * gridSize),
      height: onGrid(Math.max(gridY + height, nodeY + height) - Math.min(gridY, nodeY) + 2 * height + 2 * gridSize),
    }

    // debugging: draw the searchArea
    // const g = new PIXI.Graphics()
    // g.lineStyle(2, Math.random() * 16 ** 6)
    // g.drawRect(...Object.values(searchArea))
    // this.parentNode.elements.childrenContainer.addChild(g)

    const colCount = Math.round((searchArea.width - width) / gridSize) || 1
    const rowCount = Math.round((searchArea.height - height) / gridSize) || 1

    // this is a lineserach algorithm, very intuitive, not optimized
    return range(colCount)
      .flatMap(col =>
        range(rowCount).map(row => ({
          x: searchArea.x + col * gridSize,
          y: searchArea.y + row * gridSize,
          width,
          height,
        })),
      )
      .filter(c => !collisionNodes.find(sibling => rectIntersectsRect(c, sibling)))
      .reduce<PIXI.IPointData | undefined>(
        (prev, next) => (!prev || length(gridPoint, next) < length(gridPoint, prev) ? next : prev),
        undefined,
      )
  }

  move(x: number, y: number, isOnGrid = true, collisionNodes = this.siblingNodes): void {
    const {parentNode, nodeTextField} = this
    const {isEdited} = this.state

    this.setCache(false)

    if (!Number.isFinite(x) && !Number.isFinite(y)) {
      this.logError('cannot move node, as at least one given value is not finite', x, y)
      return
    }

    this.logFlood('move', x, y, isOnGrid)

    if (isOnGrid) {
      const newPosition = this.getFreeNodePosition(x, y, collisionNodes)

      if (!newPosition) {
        this.logFlood('No new position found')
        return
      }

      this.x = newPosition.x
      this.y = newPosition.y
    } else {
      this.x = x
      this.y = y
    }

    this.redrawContainer()
    this.redrawEdges()
    this.childrenRedrawEdges()
    parentNode.redrawChildGhosts()
    parentNode.redrawMask()

    if (isEdited) nodeTextField.moveTextField()
  }

  turn(angle: number, pivot: PIXI.IPointData): void {
    if (!Number.isFinite(angle) || !Number.isFinite(pivot.x) || !Number.isFinite(pivot.y)) {
      this.logError('Cannot turn node, as at least one given value is not a number', angle, pivot)
      return
    }

    this.pivot = pivot
    this.angle = angle
    this.redrawContainer()
  }

  scaling(scale: number, quantized = false): void {
    const {scaleFactor} = CONFIG.nodes

    if (!Number.isFinite(scale)) {
      this.logError('cannot scale node, as the given scale is not finite', scale)
      return
    }

    this.scale = quantized ? scaleFactor ** Math.round(Math.log(scale) / Math.log(scaleFactor)) : scale
  }

  addEdge(edge: PixiEdge): void {
    this.edges.add(edge)
  }

  removeEdge(edge: PixiEdge): void {
    this.edges.delete(edge)
  }

  addChild(child: PixiNode): void {
    const {elements} = this

    this.setCache(false)

    if (child === this) {
      throw new Error('Cannot make node its own child')
    }

    if (child.parentNode) child.parentNode.removeChild(child)
    child.parentNode = this
    child.depth = this.depth + 1
    this.offspringCount += 1
    this.childNodes.add(child)
    elements.childrenContainer.addChild(child.elements)

    this.redrawChildContainer()
    this.redrawMask()
    this.redrawChildGhosts()
    child.redrawRect()
    child.childrenRedrawRects()
  }

  setParent(parent: PixiNode): void {
    parent.addChild(this)
  }

  removeChild(child: PixiNode): void {
    const {elements, childNodes} = this
    childNodes.delete(child)
    this.redrawChildContainer()
    this.redrawMask()
    this.redrawChildGhosts()
    elements.removeChild(child.elements)
  }

  isChildOf(parentOrId: PixiNode | string): boolean {
    const {isRoot, parentNode} = this
    if (isRoot) return false

    const parent = typeof parentOrId === 'string' ? parentNode.id : parentNode
    return parent === parentOrId || parentNode.isChildOf(parentOrId)
  }

  isParentOf(child: PixiNode): boolean {
    return child.isChildOf(this)
  }

  hasContent(): boolean {
    return !this.isLeaf() || this.image != null || this.file != null
  }

  isVisible(): boolean {
    if (this.getBorderColor().alpha() > 0 || (this.borderColor && this.borderColor !== '@transparent')) return true
    if (this.getBackgroundColor().alpha() > 0 || (this.color && this.color !== '@transparent')) return true
    if (this.image) return true
    if (this.title) return true
    if (this.html) return true
    if (!this.childNodes || this.childNodes.size <= 0) return false
    return [...this.childNodes].some(node => node.isVisible())
  }

  isInViewport(): NODE_VISIBLE {
    const {viewport} = this.engine

    const boundsTopLeft = {
      x: (-viewport.x - viewport.screenWidth) / viewport.scale.x,
      y: (-viewport.y - viewport.screenHeight) / viewport.scale.y,
    }

    const boundsBottomRight = {
      x: (-viewport.x + viewport.screenWidth) / viewport.scale.x,
      y: (-viewport.y + viewport.screenHeight) / viewport.scale.y,
    }

    const pointBottomRight = this.transform(this.getCornerBottomRight())

    if (boundsTopLeft.x > pointBottomRight.x || boundsTopLeft.y > pointBottomRight.y) return NODE_VISIBLE.NO

    const pointTopLeft = this.transform(this)

    if (boundsBottomRight.x < pointTopLeft.x || boundsBottomRight.y < pointTopLeft.y) return NODE_VISIBLE.NO

    if (
      boundsTopLeft.x > pointTopLeft.x &&
      boundsTopLeft.y > pointTopLeft.y &&
      boundsBottomRight.x < pointBottomRight.x &&
      boundsBottomRight.y < pointBottomRight.y
    ) {
      return NODE_VISIBLE.OVER
    }

    const center = {
      x: (boundsTopLeft.x + boundsBottomRight.x) / 2,
      y: (boundsTopLeft.y + boundsBottomRight.y) / 2,
    }

    if (
      center.x > pointTopLeft.x &&
      center.y > pointTopLeft.y &&
      center.x < pointBottomRight.x &&
      center.y < pointBottomRight.y
    )
      return NODE_VISIBLE.CENTER

    return NODE_VISIBLE.YES
  }

  destroy(): void {
    this.engine.removeNode(this)
  }

  get siblingNodes(): PixiNode[] {
    if (this.isRoot) {
      return []
    }
    return [...this.parentNode.childNodes].filter(n => n !== this)
  }

  get edges(): Set<PixiEdge> {
    return this._edges
  }

  get scale(): number {
    return this._scale || this.storeNode.scale || CONFIG.nodes.create.scale
  }

  set scale(scale: number) {
    this._scale = scale
    this.redrawChildContainer()
    this.redrawEdges()
    this.childrenRedrawEdges()
    this.redrawChildGhosts()
  }

  get center(): PIXI.Point {
    return new PIXI.Point(this.x + this.width / 2, this.y + this.height / 2)
  }

  get width(): number {
    const {_width, storeNode} = this
    // need to remove two times half of the border, because its painted over the real width
    return _width !== null ? _width : storeNode.width || 0
  }

  set width(width: number) {
    // manual rerender, this is only used by resize function
    this._width = width
  }

  get height(): number {
    const {headerHeight, _height, storeNode} = this
    return Math.max(_height !== null ? _height : storeNode.height || 0, headerHeight)
  }

  set height(height: number) {
    // manual rerender, this is only used by resize function
    this._height = height
  }

  get pivot(): PIXI.IPointData {
    const {_pivot} = this
    return (
      _pivot || {
        x: 0,
        y: 0,
      }
    )
  }

  set pivot({x, y}: PIXI.IPointData) {
    this._pivot = {
      x,
      y,
    }
  }

  get angle(): number {
    const {_angle} = this
    return _angle || 0
  }

  set angle(angle: number) {
    this._angle = angle
  }

  get id(): string {
    const id = this.storeNode.id || this._id || generateNodeId()

    if (!this.storeNode.id && !this._id) {
      this._id = id
    }

    return id
  }

  get x(): number {
    const {_x, storeNode} = this
    return (_x !== null ? _x : storeNode.x) || 0
  }

  set x(x: number) {
    // manual rerender, this is only used by move function
    this._x = x
  }

  get y(): number {
    const {_y, storeNode} = this
    return (_y !== null ? _y : storeNode.y) || 0
  }

  set y(y: number) {
    // manual rerender, this is only used by move function
    this._y = y
  }

  get depth(): number {
    return this._depth || 1
  }

  set depth(value: number) {
    this._depth = value
    this.childNodes.forEach(child => (child.depth = value + 1))
  }

  get title(): string | undefined {
    return this._title !== null ? this._title : this.storeNode.title
  }

  set title(title: string | undefined) {
    this.log('set title', {title})

    this._title = title !== undefined ? title : null
    this.redrawText()
    this.redrawRect()
    this.redrawChildContainer()
    this.redrawEdges()
    this.childrenRedrawEdges()
  }

  get html(): string | undefined {
    return this._html !== null ? this._html : this.storeNode.html
  }

  set html(html: string | undefined) {
    this._html = html !== undefined ? html : null
    this.redrawHtml()
  }

  get imagePosition(): ImagePositions | undefined {
    return this._imagePosition !== null ? this._imagePosition : this.storeNode.imagePosition
  }

  set imagePosition(imagePosition: ImagePositions | undefined) {
    this._imagePosition = imagePosition
    this.redrawRect()
  }

  get parent(): string | undefined {
    return this.isRoot ? undefined : this.parentNode.id
  }

  get headerHeight(): number {
    const {gridSize, text: textStyle} = CONFIG.nodes
    const {title, elements} = this
    const {text, headerMarkups} = elements.elements

    const padding = textStyle.paddingTop + textStyle.paddingBottom
    const textHeight = title && text ? text.height : gridSize
    const markupHeight = headerMarkups ? headerMarkups.height : 0

    return onGrid(textHeight + markupHeight + padding)
  }

  get color(): string | undefined {
    return this._color !== null ? this._color : this.storeNode.color
  }

  set color(color: string | undefined) {
    this._color = color
    this.redrawRect()
    this.childrenRedrawRects()
    this.redrawText()
    this.redrawChildGhosts()
    this.parentNode.redrawChildGhosts()
  }

  get borderColor(): string | undefined {
    return this._borderColor !== null ? this._borderColor : this.storeNode.borderColor
  }

  set borderColor(borderColor: string | undefined) {
    this._borderColor = borderColor
    this.redrawRect()
  }

  get image(): string | undefined {
    return this._image !== null ? this._image : this.storeNode.image
  }

  set image(image: string | undefined) {
    this._image = image
  }

  get file(): string | undefined {
    return this._file !== null ? this._file : this.storeNode.file
  }

  set file(file: string | undefined) {
    this._file = file
  }

  getActiveColor(name?: string): Color {
    return parseColor(name || this.getColorName()).active
  }

  getColorName(): string {
    const {color, parentNode} = this
    const {defaultBackground, childColorForTransparent} = CONFIG.nodes

    let colorName
    const parentColor = parentNode.getColorName()

    if (color) {
      colorName = color
    } else if (!parentColor) {
      colorName = defaultBackground
    } else if (parentColor === '@transparent') {
      colorName = childColorForTransparent
    } else if (parentColor.endsWith('-light')) {
      colorName = parentColor.replace('-light', '')
    } else {
      colorName = `${parentColor}-light`
    }

    // backward compatible with older colors, where gray existed
    return colorName.replace('gray', 'white').replace('transparent-light', 'transparent')
  }

  getBackgroundColor(name?: string): Color {
    return parseColor(name || this.getColorName()).background
  }

  getBorderColor(name?: string): Color {
    const {borderColor, image, file, parentNode} = this
    const {isSelected} = this.state
    const {defaultBackground} = CONFIG.nodes

    if (borderColor) {
      return parseColor(borderColor.replace('gray', 'white').replace('transparent-light', 'transparent')).border
    }

    const parentColor = parentNode.getColorName()
    const color = name || this.getColorName()
    if (color && color === parentColor) {
      return parseColor(color).border
    }
    if (image || file) {
      return parseColor(color || defaultBackground).background
    }
    if (isSelected) {
      return this.getBackgroundColor()
    }
    return parseColor(color || defaultBackground).background
  }

  get isCollapsed(): boolean {
    return this.height <= this.headerHeight
  }

  get isUrl(): boolean {
    const {title} = this

    return Boolean(title && isUrl(title.trim()))
  }

  get isEmail(): boolean {
    const {title} = this

    return Boolean(title && isEmail(title.trim()))
  }

  get isCached(): boolean {
    const {container} = this
    return Boolean(container.cacheAsBitmap)
  }

  get container(): NodeElements {
    return this.elements
  }

  hasChanges(): boolean {
    const {storeNode} = this

    return (
      (this._id !== null && this._id !== storeNode.id) ||
      (this._borderColor !== null && this._borderColor !== storeNode.borderColor) ||
      (this._color !== null && this._color !== storeNode.color) ||
      (this._scale !== null && this._scale !== storeNode.scale) ||
      (this._image !== null && this._image !== storeNode.image) ||
      (!(this._title === '' || !this._title) && this._title !== storeNode.title) ||
      (!(this._html === '' || !this._html) && this._html !== storeNode.html) ||
      (this._file !== null && this._file !== storeNode.file) ||
      (this._height !== null && this._height !== storeNode.height) ||
      (this._width !== null && this._width !== storeNode.width) ||
      (this._x !== null && this._x !== storeNode.x) ||
      (this._y !== null && this._y !== storeNode.y) ||
      (this._checked !== undefined && this._checked !== storeNode.checked) ||
      (this._tags !== null &&
        this._tags.length === storeNode.tags?.length &&
        !this._tags.every(tag => storeNode.tags?.includes(tag)))
    )
  }

  resetTemporaryValues(): void {
    this._id = null
    this._borderColor = null
    this._color = null
    // TODO: regard in new architecture
    if (this.storeNode.title === this._title) this._title = null
    this._scale = null
    this._image = null
    this._html = null
    this._file = null
    this._height = null
    this._width = null
    this._x = null
    this._y = null
    this._pivot = null
    this._angle = null
    this._checked = undefined
    this._tags = null
  }

  transform(point: PIXI.IPointData): PIXI.Point {
    const {viewport} = this.engine
    const {childrenContainer: siblingContainer} = this.parentNode.elements

    return viewport.toWorld(siblingContainer.toGlobal(point))
  }

  getCurrentWorldScale(): number {
    return this.elements.parent.worldTransform.a
  }

  getGlobalPosition(): PIXI.Rectangle {
    const {parent} = this.elements

    const {x, y} = parent.toGlobal(this)
    const {x: xWidth, y: yBottom} = parent.toGlobal(this.getCornerBottomRight())

    return new PIXI.Rectangle(x, y, xWidth - x, yBottom - y)
  }

  getBounds(): RectangleData {
    return this
  }

  getViewportPosition(): PIXI.Rectangle {
    const {x, y} = this.transform(this)
    const {x: xWidth, y: yBottom} = this.transform(this.getCornerBottomRight())

    return new PIXI.Rectangle(x, y, xWidth - x, yBottom - y)
  }

  zoomTo({left, right, top, bottom} = CONFIG.nodes.zoomToNodePadding): Promise<void> {
    const {viewport, animateViewport} = this.engine

    const {x: worldX, y: worldY} = this.transform(this)
    const {x: cornerX, y: cornerY} = this.transform(this.getCornerBottomRight())
    const [worldWidth, worldHeight] = [cornerX - worldX, cornerY - worldY]

    const scale = Math.min(
      (viewport.screenWidth - left - right) / worldWidth,
      (viewport.screenHeight - top - bottom) / worldHeight,
    )
    const x = (viewport.screenWidth + left - right) / 2 - (worldX + worldWidth / 2) * scale
    const y = (viewport.screenHeight + top - bottom) / 2 - (worldY + worldHeight / 2) * scale

    this.log('zoom to node', {x, y, scale, worldWidth, worldHeight, worldX, worldY, cornerX, cornerY})
    viewport.emit('zoom-start')
    return animateViewport({x, y, scale})
  }

  getCornerBottomRight(): PIXI.Point {
    return new PIXI.Point(this.x + this.width, this.y + this.height)
  }

  setCache(isCached: boolean): void {
    const {parentNode, container, isCached: wasCached, state} = this

    if (wasCached && (state.isSelected || state.isHighlighted || state.isMoving)) {
      container.interactive = false
      container.cacheAsBitmap = false
      return
    }

    if (wasCached !== isCached) {
      this.logFlood('set cache', wasCached, isCached)
      if (wasCached && !isCached) parentNode.setCache(false)
      // make container only interactive if cached, so it does not receive any events, as its size is not to be trusted,
      // due to children that are masked still resizing the container
      container.interactive = isCached
      container.cacheAsBitmap = isCached
    }
  }

  log(...args: unknown[]): void {
    const {id} = this
    log(id, ...args)
  }

  logFlood(...args: unknown[]): void {
    const {id} = this
    logFlood(id, ...args)
  }

  logError(...args: unknown[]): void {
    const {id} = this
    logError(id, ...args)
  }

  openTextField(content?: string, cursorPosition?: string): void {
    this.nodeTextField.openTextField(content, cursorPosition)
  }

  closeTextField(abort: boolean): void {
    this.nodeTextField.closeTextField(abort)
  }

  get textField(): HTMLDivElement | null {
    return this.nodeTextField.textField
  }

  deleteTextField(): void {
    this.nodeTextField.deleteTextField()
  }

  get offspringCount(): number {
    return this._offspringCount
  }

  set offspringCount(value: number) {
    const diff = value - this._offspringCount

    this._offspringCount = value
    this.parentNode.offspringCount += diff
  }

  get tags(): string[] {
    return this._tags || this.storeNode.tags || []
  }

  set tags(value: string[]) {
    this._tags = value
  }

  get checked(): boolean | undefined {
    return typeof this._checked === 'boolean' ? this._checked : this.storeNode.checked
  }

  set checked(value: boolean | undefined) {
    this._checked = value
  }

  hasCheckBox() {
    return typeof this.checked === 'boolean'
  }
}

export default PixiNode
