import * as PIXI from 'pixi.js'
import debug from 'debug'

import EdgeElements from './elements/edge/EdgeElements'

import type PixiNode from './PixiNode'
import type PixiRenderEngine from './PixiRenderEngine'

import EdgeTextField from './elements/edge/EdgeTextField'
import CONFIG from './CONFIG'
import {EdgeData, RectangleData} from './types'

const log = debug('app:RenderEngine:Edge')
const logError = log.extend('ERROR*', '::')
const logFlood = log.extend('FLOOD', '::')

type IState = {isSelected: boolean; isEdited: boolean; isTemporary: boolean}
type IStateChange = Partial<IState>

type Position = {
  dx: number
  dy: number
  radian: number
  scale: number
  startPoints: PIXI.Point[]
  endPoints: PIXI.Point[]
  startMiddlePoint: PIXI.Point
  endMiddlePoint: PIXI.Point
  startScale: number
  endScale: number
}

class PixiEdge {
  engine: PixiRenderEngine

  elements: EdgeElements

  startNode: PixiNode

  endNode: PixiNode

  storeEdge: EdgeData

  _title: string | null = null

  _start: string | null = null

  _end: string | null = null

  _color: string | undefined | null = null

  state: IState = {isSelected: false, isEdited: false, isTemporary: false}

  edgeTextField: EdgeTextField

  constructor(engine: PixiRenderEngine, edge: EdgeData) {
    this.engine = engine
    this.elements = new EdgeElements(this)

    this.edgeTextField = new EdgeTextField(this)

    const startNode = engine.renderNodes[edge.start]
    if (!startNode) {
      throw new Error(`Start node with id ${edge.start} of edge ${edge.id} was not found.`)
    }
    startNode.addEdge(this)
    this.startNode = startNode

    const endNode = engine.renderNodes[edge.end]
    if (!endNode) {
      throw new Error(`End node with id ${edge.end} of edge ${edge.id} was not found.`)
    }
    endNode.addEdge(this)
    this.endNode = endNode

    this.storeEdge = {...edge}

    this.log('new edge', engine)
  }

  setState(newStateOrFn: IStateChange | ((s: IState) => IStateChange)): void {
    const {state} = this
    const changes = typeof newStateOrFn === 'function' ? newStateOrFn(this.state) : newStateOrFn

    this.log('set edge state', state, changes)

    if (
      Object.keys(changes).length > 0 &&
      Object.entries(changes).find(([key, value]) => state[key as keyof IStateChange] !== value)
    ) {
      this.state = {...state, ...changes}
      this.redraw()

      this.log('state changed', state, changes, this.state)
      if (!this.state.isSelected && this.textField) {
        this.edgeTextField.closeTextField()
      }
    }
  }

  destroy(): void {
    this.engine.removeEdge(this)
  }

  /**
   * set new edge data
   *
   * @param edge
   * @param isFromStore
   */
  update(edge: EdgeData, isFromStore = false): void {
    const {state, engine, storeEdge, id, startNode: oldStartNode, endNode: oldEndNode} = this
    const {renderNodes} = engine
    const newStartNode = renderNodes[edge.start]
    const newEndNode = renderNodes[edge.end]

    this.logFlood('update', {id, edge, isFromStore, storeEdge, startNode: newStartNode, endNode: newEndNode})

    // TODO: how can this happen?
    if (!newStartNode || !newEndNode) {
      this.logError('Data inconsistency: start or end node does not exist')
      return
    }

    // TODO: how can this happen? It's even more strange
    if (!newStartNode.addEdge || !newEndNode.addEdge) {
      this.logError('Data inconsistency: start or end node is in a wrong format')
      return
    }

    if (isFromStore) state.isTemporary = false
    if (storeEdge === edge && !this.hasChanges()) return

    this.storeEdge = edge

    if (oldStartNode !== newStartNode) {
      if (oldStartNode) oldStartNode.removeEdge(this)
      newStartNode.addEdge(this)
      this.startNode = newStartNode
    }
    if (oldEndNode !== newEndNode) {
      if (oldEndNode) oldEndNode.removeEdge(this)
      newEndNode.addEdge(this)
      this.endNode = newEndNode
    }

    this.resetTemporaryValues()

    try {
      this.redraw()
    } catch (err) {
      this.logError('Could not rerender edge on update', err)
    }
  }

  redraw(): void {
    const {elements} = this
    elements.redraw()

    const {textField, moveTextField} = this.edgeTextField
    if (textField) moveTextField()
  }

  toViewport(node: PixiNode): {
    x: number
    y: number
    width: number
    height: number
    headerHeight: number
    scale: number
  } {
    const {x, y} = node.transform(node)
    const cornerNE = node.transform(node.getCornerBottomRight())
    const width = cornerNE.x - x
    const scale = width / node.width
    const [height, headerHeight] = [node.height * scale, node.headerHeight * scale]

    return {x, y, width, height, headerHeight, scale}
  }

  transform(node: PixiNode, point: PIXI.IPointData): PIXI.Point {
    const {viewport} = this.engine
    const {parent} = node.container

    return viewport.toWorld(parent.toGlobal(point))
  }

  private static intersect(
    box: RectangleData,
    outerCenter: PIXI.IPointData,
    offset: number,
  ): [PIXI.Point, PIXI.Point[]] {
    const boundWidth = box.width / 2
    const boundHeight = box.height / 2
    const innerCenter = {x: box.x + boundWidth, y: box.y + boundHeight}

    // dx and dy have automatically the correct sign
    const dx = outerCenter.x - innerCenter.x
    const dy = outerCenter.y - innerCenter.y

    const dxSign = dx < 0 ? -1 : 1
    const dySign = dy < 0 ? -1 : 1

    const edgePoints: PIXI.Point[] = []
    let intersectionPoint: PIXI.Point

    if (dx === 0 || boundWidth * Math.abs(dy / dx) > boundHeight) {
      // bot or bottom border
      const xLeft = boundHeight * (dx / Math.abs(dy)) - offset
      const xRight = boundHeight * (dx / Math.abs(dy)) + offset

      intersectionPoint = new PIXI.Point(
        innerCenter.x + boundHeight * (dx / Math.abs(dy)),
        innerCenter.y + boundHeight * dySign,
      )

      if (xLeft < -boundWidth) {
        const newOffset = Math.abs(-boundWidth - xLeft) * (dy / Math.abs(dx))
        edgePoints.push(
          new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + boundHeight * dySign - newOffset),
          new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + boundHeight * dySign),
        )
      } else {
        edgePoints.push(new PIXI.Point(innerCenter.x + xLeft, innerCenter.y + boundHeight * dySign))
      }

      if (xRight > boundWidth) {
        const newOffset = Math.abs(boundWidth - xRight) * (dy / Math.abs(dx))
        edgePoints.push(
          new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + boundHeight * dySign),
          new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + boundHeight * dySign - newOffset),
        )
      } else {
        edgePoints.push(new PIXI.Point(innerCenter.x + xRight, innerCenter.y + boundHeight * dySign))
      }
      if (dy < 0) edgePoints.reverse()
    } else {
      // left or right border
      const yTop = boundWidth * (dy / Math.abs(dx)) + offset
      const yBottom = boundWidth * (dy / Math.abs(dx)) - offset

      intersectionPoint = new PIXI.Point(
        innerCenter.x + boundWidth * dxSign,
        innerCenter.y + boundWidth * (dy / Math.abs(dx)),
      )

      if (yTop > boundHeight) {
        const newOffset = Math.abs(boundHeight - yTop) * (dx / Math.abs(dy))
        edgePoints.push(
          new PIXI.Point(innerCenter.x + boundWidth * dxSign - newOffset, innerCenter.y + boundHeight * dySign),
          new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + boundHeight * dySign),
        )
      } else {
        edgePoints.push(new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + yTop))
      }

      if (yBottom < -boundHeight) {
        const newOffset = Math.abs(-boundHeight - yBottom) * (dx / Math.abs(dy))
        edgePoints.push(
          new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + boundHeight * dySign),
          new PIXI.Point(innerCenter.x + boundWidth * dxSign - newOffset, innerCenter.y + boundHeight * dySign),
        )
      } else {
        edgePoints.push(new PIXI.Point(innerCenter.x + boundWidth * dxSign, innerCenter.y + yBottom))
      }
      // sort the points always on mathematical positive rotation
      if (dx < 0) edgePoints.reverse()
    }
    return [intersectionPoint, edgePoints]
  }

  getPositions(): Position {
    const {startNode, endNode} = this
    const {edges: edgeConfig} = CONFIG

    const startBox = this.toViewport(startNode)
    const endBox = this.toViewport(endNode)

    const startScale = startBox.scale
    const endScale = endBox.scale
    const scale =
      Math.max(startScale, endScale) * Math.sqrt(Math.min(startScale, endScale) / Math.max(startScale, endScale))

    const startOffset = startScale * edgeConfig.width
    const endOffset = endScale * edgeConfig.width

    let startResult: [PIXI.Point, PIXI.Point[]]
    let endResult: [PIXI.Point, PIXI.Point[]]
    if (startNode.isChildOf(endNode.id)) {
      const headerMiddle = new PIXI.Point(endBox.x + endBox.width / 2, endBox.y + endBox.headerHeight)
      startResult = PixiEdge.intersect(startBox, headerMiddle, startOffset)
      endResult = [
        headerMiddle,
        [
          new PIXI.Point(headerMiddle.x - endOffset, headerMiddle.y),
          new PIXI.Point(headerMiddle.x + endOffset, headerMiddle.y),
        ],
      ]
    } else if (endNode.isChildOf(startNode.id)) {
      const headerMiddle = new PIXI.Point(startBox.x + startBox.width / 2, startBox.y + startBox.headerHeight)
      endResult = PixiEdge.intersect(endBox, headerMiddle, endOffset)
      startResult = [
        headerMiddle,
        [
          new PIXI.Point(headerMiddle.x - startOffset, headerMiddle.y),
          new PIXI.Point(headerMiddle.x + startOffset, headerMiddle.y),
        ],
      ]
    } else {
      startResult = PixiEdge.intersect(startBox, this.transform(endNode, endNode.center), startOffset)
      endResult = PixiEdge.intersect(endBox, this.transform(startNode, startNode.center), endOffset)
    }
    const [startMiddlePoint, startPoints] = startResult
    const [endMiddlePoint, endPoints] = endResult

    // TODO: move text and arrow to viewport edge
    const dx = endMiddlePoint.x - startMiddlePoint.x
    const dy = endMiddlePoint.y - startMiddlePoint.y
    const radian = Math.atan(dy / dx)

    return {
      dx,
      dy,
      radian,
      scale,
      startPoints,
      endPoints,
      startMiddlePoint,
      endMiddlePoint,
      startScale,
      endScale,
    }
  }

  get container(): PIXI.Container {
    return this.elements
  }

  get visible(): boolean {
    const {
      state: {isSelected},
      engine: {
        eventManager: {
          state: {isShowAllEdges},
        },
      },
      startNode: {state: startState},
      endNode: {state: endState},
    } = this

    return (
      isSelected ||
      startState.isHighlighted ||
      startState.isSelected ||
      endState.isHighlighted ||
      endState.isSelected ||
      isShowAllEdges
    )
  }

  get id(): string {
    const {storeEdge} = this
    return storeEdge.id
  }

  set start(startNodeId: string) {
    this._start = startNodeId
    this.redraw()
  }

  get start(): string {
    const {_start, startNode} = this
    return _start || startNode.id
  }

  set end(endNodeId: string) {
    this._end = endNodeId
    this.redraw()
  }

  get end(): string {
    const {_end, endNode} = this
    return _end || endNode.id
  }

  set title(title: string | undefined) {
    this.log('set title', {title})
    this._title = title !== undefined ? title : null
    this.redraw()
  }

  get title(): string | undefined {
    return this._title !== null ? this._title : this.storeEdge.title
  }

  get color(): string | undefined {
    return this._color !== null ? this._color : this.storeEdge.color
  }

  set color(color: string | undefined) {
    this._color = color
    this.redraw()
  }

  resetTemporaryValues(): void {
    this._title = null
    this._start = null
    this._end = null
    this._color = null
  }

  hasChanges(): boolean {
    const {_title, _color, _start, _end, storeEdge} = this
    return (
      (_title !== null && _title !== storeEdge.title) ||
      (_color !== null && _color !== storeEdge.color) ||
      (_start !== null && _start !== storeEdge.start) ||
      (_end !== null && _end !== storeEdge.end)
    )
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

  // Legacy functions for events

  openTextField(content?: string, cursorPosition?: string): void {
    this.edgeTextField.openTextField(content, cursorPosition)
  }

  closeTextField(abort: boolean): void {
    this.edgeTextField.closeTextField(abort)
  }

  get textField(): HTMLDivElement | null {
    return this.edgeTextField.textField
  }

  deleteTextField(): void {
    this.edgeTextField.deleteTextField()
  }
}

export default PixiEdge
