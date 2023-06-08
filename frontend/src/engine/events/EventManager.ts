import debug from 'debug'

import type * as PIXI from 'pixi.js'

import {ClampZoom, Drag, MouseEdges, Wheel} from 'pixi-viewport'
import Publisher from '../../lib/Publisher'
import EDIT_MODES from './EDIT_MODES'

import runAsync from '../../shared/utils/runAsync'
import CONFIG from '../CONFIG'
import {
  add,
  addEdge,
  move,
  remove,
  removeChildren,
  rescale,
  resize,
  setFile,
  setImage,
  setImagePosition,
  setCheckBox,
  fromTemplate,
  addTemplate,
  edit,
  setColor,
  setBorderColor,
} from '../../store/actions'
import {generateEdgeId, generateNodeId} from '../../shared/utils/generateId'

import PixiNode from '../PixiNode'
import PixiEdge from '../PixiEdge'
import type PixiRenderEngine from '../PixiRenderEngine'
import type MapStoreWrite from '../../store/MapStoreWrite'
import type MapStoreReadOnly from '../../store/MapStoreReadOnly'
import {
  EdgeId,
  MapContentData,
  MapData,
  MapStoreAction,
  MapStoreActions,
  NodeData,
  NodeId,
  RectangleData,
  RenderEngineEvent,
  RenderNodeCandidate,
} from '../types'
import rectIntersectsRect from '../utils/intersect/rectIntersectsRect'
import {isEqual, isGreaterOrEqual, isGreaterThan, isLessThan, isZero} from '../utils/arithmetics'
import {getAllAttachedBelow, getAllAttachedRight, getAllAttachedX, getAllAttachedY} from '../utils/nodesAttached'
import onGrid from '../utils/onGrid'
import ImportHandler from '../import/ImportHandler'
import BoundedArray from '../../utils/BoundedArray'
import createMoveSteps from '../utils/createMoveSteps'
import {createChatCompletion} from '../utils/openAI'

const log = debug('app:Event:EventManager')
const logError = log.extend('ERROR*', '::')
const logFlood = log.extend('FLOOD', '::')

type Direction = 'x' | 'y'

type RepositionData = {
  referenceRect: RectangleData
  direction: Direction
  startValue: number
}

type ExpandData = {
  startWidth: number
  startHeight: number
}

const getNodeOverlap = (node: RectangleData, moveNode: RectangleData, direction: Direction): number =>
  node[direction] + (direction === 'x' ? node.width : node.height) - moveNode[direction]

const getShortestMoveDirection = (node: RectangleData, moveNode: RectangleData): Direction => {
  const xValue = getNodeOverlap(node, moveNode, 'x')
  const yValue = getNodeOverlap(node, moveNode, 'y')

  return xValue < yValue ? 'x' : 'y'
}

const getCollisionNodes = (
  rect: RectangleData,
  nodeList: PixiNode[],
  moveDirection?: Direction,
): [PixiNode, RepositionData][] =>
  nodeList
    .filter(sibling => rectIntersectsRect(sibling, rect))
    .map(collisionNode => {
      const direction = moveDirection || getShortestMoveDirection(rect, collisionNode)
      return [collisionNode, {direction, startValue: collisionNode[direction], referenceRect: rect}]
    })

const getGridSouthEastNodes = (inGridNode: PixiNode): [PixiNode, RepositionData][] => {
  let previousNodeRight: PixiNode
  let previousNodeBelow: PixiNode
  return [
    ...getAllAttachedRight(inGridNode, inGridNode.siblingNodes)
      .map<[PixiNode, RepositionData]>(moveNode => [
        moveNode,
        {direction: 'x', startValue: -Infinity, referenceRect: inGridNode},
      ])
      .reduce<[PixiNode, RepositionData][]>((acc, [nextNode, nextData]) => {
        nextData.referenceRect = previousNodeRight || inGridNode
        acc.push([nextNode, nextData])
        previousNodeRight = nextNode
        return acc
      }, []),
    ...getAllAttachedBelow(inGridNode, inGridNode.siblingNodes)
      .map<[PixiNode, RepositionData]>(moveNode => [
        moveNode,
        {direction: 'y', startValue: -Infinity, referenceRect: inGridNode},
      ])
      .reduce<[PixiNode, RepositionData][]>((acc, [nextNode, nextData]) => {
        nextData.referenceRect = previousNodeBelow || inGridNode
        acc.push([nextNode, nextData])
        previousNodeBelow = nextNode
        return acc
      }, []),
  ]
}

const getGridNodes = (inGridNode: PixiNode): PixiNode[] => {
  const {siblingNodes} = inGridNode
  const xNodes = getAllAttachedX(inGridNode, siblingNodes)
  return [
    inGridNode,
    ...xNodes,
    ...getAllAttachedY(inGridNode, siblingNodes),
    ...xNodes.flatMap(node => getAllAttachedY(node, siblingNodes)),
  ]
}

const moveCollisionNode = (moveNode: PixiNode, {direction, startValue, referenceRect}: RepositionData): boolean => {
  const deltaValue = getNodeOverlap(referenceRect, moveNode, direction)
  const otherDirection = direction === 'x' ? 'y' : 'x'
  const otherDimension = otherDirection === 'x' ? referenceRect.width : referenceRect.height

  // node does not collide anymore with the moveNode in the direction where it is not moved
  const isNotColliding = isLessThan(referenceRect[otherDirection] + otherDimension, moveNode[otherDirection])

  // do not move back more than start position or if there is no collision anymore
  if (moveNode[direction] + deltaValue <= startValue || isNotColliding) {
    moveNode._x = null
    moveNode._y = null
    moveNode.redrawContainer()

    return true
  }

  const x = direction === 'x' ? moveNode.x + deltaValue : moveNode.x
  const y = direction === 'y' ? moveNode.y + deltaValue : moveNode.y

  moveNode.move(x, y, false)

  return false
}

type ContextMenuPosition = PIXI.IPointData

type IState = {
  isFontReady: boolean
  isShowAllEdges: boolean
  isTouchScreen: boolean
  tickerStop: boolean
  showGhosts: boolean
  isDragged: boolean
  isCtrlPressed: boolean
  isShiftPressed: boolean
  isAltPressed: boolean
}

type IStateChange = Partial<IState>

/**
 * Manages the state of the event system and also stores EventController and EventBinders.
 */
class EventManager extends Publisher {
  /**
   * current active mode. Can be changed via keyboard shortcuts or in the toolbar
   * @type {string}
   */
  mode: EDIT_MODES = EDIT_MODES.navigate

  toggleMode = (newMode: EDIT_MODES): void => {
    this.setMode(this.mode === newMode ? EDIT_MODES.navigate : newMode)
  }

  setMode = (newMode: EDIT_MODES): void => {
    const {engine, selectedNodes, mode: oldMode} = this

    this.setState({showGhosts: newMode !== EDIT_MODES.addNode})
    if (newMode === oldMode) return

    this.mode = newMode

    this.deleteAddNode()

    if (newMode === EDIT_MODES.addNode || oldMode === EDIT_MODES.addNode) {
      selectedNodes.forEach(node => {
        node.redraw()
        node.parentNode.redraw()
      })
      engine.scheduleRender().then()
    }

    this.fireSubscriptions().then()
  }

  state: IState = {
    isFontReady: false,
    isShowAllEdges: true,
    isTouchScreen: false,
    tickerStop: true,
    showGhosts: true,
    isDragged: false,
    isCtrlPressed: false,
    isShiftPressed: false,
    isAltPressed: false,
  }

  setState = (newStateOrFn: IStateChange | ((s: IState) => IStateChange)): void => {
    const {state, selectedNodes} = this
    const {renderEdges, scheduleRender} = this.engine
    const changes = typeof newStateOrFn === 'function' ? newStateOrFn(this.state) : newStateOrFn

    const {isShowAllEdges, showGhosts} = state
    // @ts-ignore cannot find a way for typescript to accept this
    if (Object.entries(changes).find(([key, value]) => state[key] !== value)) {
      this.state = {...state, ...changes}
      if (changes.isShowAllEdges !== isShowAllEdges) {
        Object.values(renderEdges).forEach(e => e.redraw())
        scheduleRender().then()
      }
      if (changes.showGhosts !== showGhosts) {
        selectedNodes.forEach(node => {
          node.redraw()
          node.parentNode.redraw()
        })
        scheduleRender().then()
      }
      log('set new state', {state: this.state, changes, selectedNodes})

      this.fireSubscriptions().then()
    }
  }

  /**
   * selected nodes in the order where they were added. This is treated as immutable. On every update a
   * new set is created to allow better handling in asychronous events (e.g. saving an image to the backend first)
   * @type {Set<PixiNode>}
   */
  selectedNodes: Set<PixiNode> = new Set()

  lastSelectedNode?: PixiNode

  /**
   * selected edges.
   * @see selectedNodes
   * @type {Set<PixiEdge>}
   */
  selectedEdges: Set<PixiEdge> = new Set()

  lastSelectedEdge?: PixiEdge

  /**
   * all selected components to store the order in which they were selected.
   * @see selectedNodes
   * @type {Set<PixiNode|PixiEdge>}
   */
  _selectedAll = new Set<PixiNode | PixiEdge>()

  get selectedAll(): Set<PixiNode | PixiEdge> {
    return this._selectedAll
  }

  set selectedAll(value: Set<PixiNode | PixiEdge>) {
    this._selectedAll = value
    this.selectedAllHistory.push(value)
  }

  lastSelectedAll?: PixiNode | PixiEdge

  selectedAllHistory: BoundedArray<Set<PixiNode | PixiEdge>> = new BoundedArray()

  selectFromHistory(): void {
    const {renderNodes, renderEdges} = this.engine

    const lastSelected = this.selectedAllHistory.reverse().find(set =>
      [...set].find(element => {
        if (element instanceof PixiNode) {
          return element.id in renderNodes
        }
        return element.id in renderEdges
      }),
    )

    if (!lastSelected) return

    this.selectedEdges = new Set()
    this.selectedNodes = new Set()

    lastSelected.forEach(element => {
      if (element instanceof PixiNode) {
        this.selectNode(element)
      } else {
        this.selectEdge(element)
      }
    })
  }

  /**
   * temporary node use to add a new one. Need to reside here in the handler to allow keyboard events to create a node
   * at the current cursor position
   * @type {PixiNode}
   */
  addNode: PixiNode | null = null

  /**
   * node that was last hovered by the mouse
   * @type {PixiNode}
   */
  hoverNode: PixiNode | null = null

  /**
   * edges while creating new ones
   * @type {PixiEdge[]}
   */
  addEdges: PixiEdge[] = []

  /**
   * information for context menu creation
   * @type Object
   */
  contextMenuPosition: ContextMenuPosition | null = null

  closeContextMenu = () => {
    this.contextMenuPosition = null
    this.fireSubscriptions()
  }

  /**
   * node that was last decollapsed
   * @type {PixiNode}
   */
  decollapsedNode: PixiNode | null = null

  /**
   * save to pointer position relative to the hover node to allow add node toggle to create a node
   * @type {{x: number, y: number}}
   */
  pointerPosition: {x: number; y: number} = {x: 0, y: 0}

  /**
   * propagate if the pointer is down at the moment
   * @type {boolean}
   */
  pointerDown = false

  /**
   * Temporarily save actions that will be scheduled in the next execution cyrcle
   * @type {[{name: String, reducer: Function}]}
   * @private
   */
  mapStoreActions: MapStoreActions = []

  /**
   * Store the promise that will succeed when MapStore Actions that are scheduled next succeed
   * @type {Promise}
   * @private
   */
  mapStoreDispatchPromise: Promise<void> | null = null

  /**
   * reference from setTimeout of the the collapseNode() function
   * @private
   */
  decollapseRef: NodeJS.Timeout | null = null

  /**
   * import handler that will be able to handle pasting or uploading files and plain text
   */
  importer: ImportHandler = new ImportHandler(this)

  constructor(public engine: PixiRenderEngine, public store: MapStoreWrite | MapStoreReadOnly) {
    super()
  }

  destroy(): void {
    super.destroy()
  }

  /**
   * Dispatch these changes asynchronously. You can call this function several times. As long as it happens
   * in one execution cycle the actions will be combined to one change of the mapstore
   * @param actions
   * @returns {Promise}
   */
  addDispatch = (actions: MapStoreActions | MapStoreAction): Promise<void> => {
    const {commitDispatches} = this
    this.mapStoreActions = this.mapStoreActions.concat(actions)

    log('schedule MapStore action for later dispatch', actions)

    if (!this.mapStoreDispatchPromise) {
      this.mapStoreDispatchPromise = runAsync(commitDispatches)
    }

    return this.mapStoreDispatchPromise
  }

  commitDispatches = (): void => {
    const {store, mapStoreActions} = this

    if (mapStoreActions.length === 0) return

    log('dispach MapStore actions', mapStoreActions)

    try {
      store.dispatch(mapStoreActions)
    } catch (e) {
      logError(`Could not save changes to map store: ${(e as Error).message}`)
      throw e
    } finally {
      this.mapStoreActions = []
      this.mapStoreDispatchPromise = null
    }
  }

  selectNode = (nodeOrId: PixiNode | NodeId): void => {
    const {engine, selectedNodes, selectedAll} = this

    const node = this.getNode(nodeOrId)

    log('selectNode', node, selectedNodes)

    node.setState({isSelected: true})

    this.selectedNodes = new Set(selectedNodes).add(node)
    this.lastSelectedNode = node

    this.selectedAll = new Set(selectedAll).add(node)
    this.lastSelectedAll = node

    engine.scheduleRender().then()
    this.fireSubscriptions().then()
  }

  unselectNode = (nodeOrId: PixiNode | NodeId): void => {
    const {engine, selectedNodes, selectedAll} = this
    const node = this.getNode(nodeOrId)

    log('unselectNode', node)

    if (node.isDestroyed) {
      logError('destroyed node was tried to unselect')
    } else {
      this.makeNodeVisibleIfNecessary(node)
      node.setState({isSelected: false})
    }

    this.selectedNodes = new Set(selectedNodes)
    this.selectedNodes.delete(node)
    this.lastSelectedNode = [...this.selectedNodes].pop()

    this.selectedAll = new Set(selectedAll)
    this.selectedAll.delete(node)
    this.lastSelectedAll = [...this.selectedAll].pop()

    engine.scheduleRender().then()
    this.fireSubscriptions().then()
  }

  selectSingleNode = (nodeOrId: PixiNode | NodeId): void => {
    const {selectedNodes, selectedEdges} = this
    const node = this.getNode(nodeOrId)
    selectedNodes.forEach(this.unselectNode)
    selectedEdges.forEach(this.unselectEdge)
    // subscriptions fired here
    this.selectNode(node)
  }

  makeNodeVisibleIfNecessary = (node: PixiNode): void => {
    if (node.isVisible()) return
    node.title = CONFIG.nodes.addTextSettings.style.title
    this.addDispatch(edit(node))
  }

  nodeEdit = (nodeOrId: PixiNode | NodeId, content?: string, cursorPosition?: string): void => {
    const node = this.getNode(nodeOrId)
    node.openTextField(content, cursorPosition)
  }

  zoomToNode = (nodeOrId: PixiNode | NodeId): void => {
    const node = this.getNode(nodeOrId)
    this.engine.control.zoomToNode(node)
  }

  zoomToEdge = (edgeOrId: PixiEdge | EdgeId): void => {
    const edge = this.getEdge(edgeOrId)
    this.engine.control.zoomToEdge(edge)
  }

  moveViewport = (x: number, y: number): void => {
    this.engine.viewport.x += x
    this.engine.viewport.y += y
  }

  toggleWheelZoom(enabled: boolean): void {
    const {wheelPlugin} = this

    if (wheelPlugin) wheelPlugin.options.wheelZoom = enabled
  }

  selectEdge = (edgeOrId: PixiEdge | EdgeId): void => {
    const {engine, selectedEdges, selectedAll} = this
    const edge = this.getEdge(edgeOrId)

    edge.setState({isSelected: true})

    this.selectedEdges = new Set(selectedEdges).add(edge)
    this.lastSelectedEdge = edge

    this.selectedAll = new Set(selectedAll).add(edge)
    this.lastSelectedAll = edge

    engine.scheduleRender().then()
    this.fireSubscriptions().then()
  }

  unselectEdge = (edgeOrId: PixiEdge | EdgeId): void => {
    const {engine, selectedEdges, selectedAll} = this
    const edge = this.getEdge(edgeOrId)

    log('unselect edge', edge)

    if (!selectedEdges.has(edge)) return

    edge.setState({isSelected: false})

    this.selectedEdges = new Set(selectedEdges)
    this.selectedEdges.delete(edge)
    this.lastSelectedEdge = [...this.selectedEdges].pop()

    this.selectedAll = new Set(selectedAll)
    this.selectedAll.delete(edge)
    this.lastSelectedAll = [...this.selectedAll].pop()

    engine.scheduleRender().then()
    this.fireSubscriptions().then()
  }

  selectSingleEdge = (edgeOrId: PixiEdge | EdgeId): void => {
    const {selectedNodes, selectedEdges} = this

    const edge = this.getEdge(edgeOrId)
    selectedNodes.forEach(this.unselectNode)
    selectedEdges.forEach(this.unselectEdge)
    // subscriptions fired here
    this.selectEdge(edge)
  }

  /**
   * manipulate cache state of a node.
   * @param node
   * @param isCached
   */
  setNodeCache = (node: PixiNode, isCached: boolean): void => {
    node.setCache(isCached)
  }

  /**
   * set current position of the pointer, so it is accessible in wheel and keyboard events
   * @see PointerEventHandler
   * @param position
   */
  setPointerPosition = (position: {x: number; y: number}): void => {
    this.pointerPosition = position
  }

  private getEdge(edgeOrId: PixiEdge | EdgeId): PixiEdge {
    const {engine} = this
    return typeof edgeOrId === 'string' ? engine.renderEdges[edgeOrId] : edgeOrId
  }

  private getNode(nodeOrId: PixiNode | NodeId): PixiNode {
    const {engine} = this
    return typeof nodeOrId === 'string' ? engine.renderNodes[nodeOrId] : nodeOrId
  }

  /**
   * set the hover node, so its accessible with wheel and keyboard events
   * @todo how do we implement this on a touch screen?
   * @see PointerEventHandler
   */
  setHoverNode = (nodeOrId: PixiNode | NodeId): void => {
    const {hoverNode, deleteHoverNode} = this
    const node = this.getNode(nodeOrId)

    if (hoverNode !== node) {
      logFlood('set new hover node')
      if (hoverNode) {
        hoverNode.setState({isHighlighted: false})
      }
      if (node) {
        node.setState({isHighlighted: true})
      }
      this.hoverNode = node
      node.container.addListener('removed', deleteHoverNode)
    }
  }

  deleteHoverNode = (): void => {
    const {hoverNode, deleteHoverNode} = this

    if (hoverNode) {
      logFlood('remove hover node')
      hoverNode.container.removeListener('removed', deleteHoverNode)
      this.hoverNode = null
    }
  }

  /**
   * get position relative to the given nodes children container
   * @param node
   * @param event
   * @returns {*}
   */
  getPosition = (node: PixiNode, event: PIXI.InteractionEvent): PIXI.Point => {
    return event.data.getLocalPosition(node.elements.childrenContainer)
  }

  /**
   * get current position based on parent node children container
   * @param node
   * @param event
   * @returns {*}
   */
  getPositionParent = (node: PixiNode, event: RenderEngineEvent): PIXI.Point => {
    return event.data.getLocalPosition(node.parentNode.elements.childrenContainer)
  }

  /**
   * get position relative to the nodes own origin
   * @param node
   * @param event
   * @returns {*}
   */
  // getPositionSelf = (node: PixiNode, event: RenderEngineEvent): PIXI.Point => {
  //   return event.data.getLocalPosition(node.container)
  // }

  /**
   * get global position relative to the viewport
   * @param event
   * @returns {*}
   */
  getPositionGlobal = (event: PIXI.InteractionEvent): PIXI.Point => {
    const {viewport} = this.engine
    return event.data.getLocalPosition(viewport)
  }

  nodeDecollapse = (node: PixiNode): void => {
    const {nodeResize} = this
    const {width, y, headerHeight} = node
    const {gridSize, decollapseRatio} = CONFIG.nodes
    // decollapse the ratio for single line headers, else minimum the ratio minus 2 gridsizes (minimum header)
    const height = onGrid(y + headerHeight + (width * decollapseRatio - 2 * gridSize)) - y
    nodeResize(node, width, height)
  }

  clearDecollapse = (): void => {
    const {decollapseRef} = this
    if (decollapseRef) clearTimeout(decollapseRef)
  }

  decollapse = (node: PixiNode): void => {
    const {decollapsedNode, engine} = this
    const {decollapseTimeout} = CONFIG.interaction

    if (decollapsedNode && decollapsedNode !== node) {
      this.recollapse()
    }
    this.clearDecollapse()

    if (node.isCollapsed) {
      this.decollapseRef = setTimeout(() => {
        this.nodeDecollapse(node)
        this.nodeGrow(node)
        engine.scheduleRender().then()
        this.decollapsedNode = node
      }, decollapseTimeout)
    }
  }

  recollapse = (): void => {
    const {clearDecollapse, decollapsedNode, resetNodes} = this

    clearDecollapse()

    if (decollapsedNode) {
      decollapsedNode._height = null
      decollapsedNode._width = null
      decollapsedNode.redraw()
      this.decollapsedNode = null
      resetNodes()
    }

    // @TODO: grow back, shrink back, move back
  }

  saveDecollapsedNode = async (): Promise<void> => {
    const {decollapsedNode, addDispatch, saveNodes} = this

    if (decollapsedNode) {
      this.decollapsedNode = null
      await Promise.all([saveNodes(), addDispatch(resize(decollapsedNode))])
    }
  }

  setNodeProperties = (node: PixiNode, style: Partial<NodeData> = {}, makePermanent = false): void => {
    node.title = style.title || ''
    node.gridOptions = style.gridOptions || undefined
    node.color = style.color || undefined
    node.borderColor = style.borderColor || undefined
    node.image = style.image || undefined
    node.imagePosition = style.imagePosition || undefined
    node.file = style.file || undefined
    node.width = style.width || CONFIG.nodes.create.width
    node.height = style.height || CONFIG.nodes.gridSize * 2

    node.redraw()

    const actions = []
    if (style.color) actions.push(setColor(node))
    if (style.borderColor) actions.push(setBorderColor(node))
    if (style.width || style.height) actions.push(resize(node))
    if (style.file) actions.push(setFile(node))
    if (style.image) {
      node.imagePosition = node.imagePosition || 'body'
      actions.push(setImage(node))
      actions.push(setImagePosition(node))
    }

    // save changes; in some cases the node has to be made permanent first
    let isPermanent = !node.state.isTemporary
    if (!isPermanent && (actions.length > 0 || makePermanent)) {
      actions.unshift(add(node), move(node))
      node.setState({isTemporary: false})
    }
    isPermanent = !node.state.isTemporary
    if (isPermanent) {
      this.addDispatch(actions)
      this.saveNodes()
    }
  }

  setNodeTemplate = (node: PixiNode, template: MapData | MapContentData): void => {
    this.setNodeProperties(node, template.nodes[template.root], true)
    this.addDispatch(fromTemplate(node, template))
    this.saveNodes()
  }

  /**
   * @private
   * @returns {*}
   */
  createAddNode = (style?: Partial<NodeData>, permanent = true): PixiNode => {
    const {hoverNode, engine} = this
    const {create} = CONFIG.nodes

    const parentNode = hoverNode || engine.rootNode

    if (!parentNode) throw new Error('No root node existing')

    const id = generateNodeId()
    const {id: parent} = parentNode
    const nodeData = {...create, parent, ...style, id}

    const addNode = engine.updateNode(nodeData, parentNode)

    addNode.setState({isTemporary: !permanent, isAddNode: true})
    addNode.container.interactiveChildren = false
    addNode.container.interactive = false

    log('create addNode', addNode)

    this.addNode = addNode

    return addNode
  }

  getAddNode = (style?: Partial<NodeData>, isTemporary?: boolean): PixiNode => {
    const {addNode, createAddNode} = this
    return addNode || createAddNode(style, isTemporary)
  }

  saveAddNode = (isResized = false): void => {
    const {getAddNode, addDispatch} = this

    const addNode = getAddNode()
    const nodeData = {
      id: addNode.id,
      borderColor: addNode.borderColor,
      color: addNode.color,
      scale: addNode.scale,
      image: addNode.image,
      title: addNode.title,
      gridOptions: addNode.gridOptions,
      file: addNode.file,
      height: addNode.height,
      width: addNode.width,
      x: addNode.x,
      y: addNode.y,
    }
    this.engine.updateNode(nodeData, addNode.parentNode, false)
    addNode.redraw()
    addNode.container.interactiveChildren = true
    addNode.container.interactive = addNode.isCached

    const actions = []

    if (addNode.state.isTemporary) {
      if (isResized) {
        actions.push(add(addNode), resize(addNode))
      }
    } else {
      actions.push(add(addNode), move(addNode))
      if (isResized) {
        actions.push(resize(addNode))
      }
    }

    this.addNode = null

    addDispatch(actions)
    this.commitDispatches()
  }

  /**
   * @see NodeAddHover.reset
   */
  deleteAddNode = (): void => {
    const {engine, addNode, addDispatch} = this

    if (addNode && this.mode !== EDIT_MODES.addNode) {
      this.addNode = null
      engine.removeNode(addNode)
      if (!addNode.state.isTemporary) {
        addDispatch(remove(addNode))
        this.commitDispatches()
      }
    }
  }

  getAddEdges = (node: PixiNode): PixiEdge[] => {
    const {addEdges, selectedNodes, engine, deleteAddEdges} = this

    const filteredNodes = [...selectedNodes].filter(selected => selected !== node)

    logFlood('get add edges', node, addEdges, filteredNodes)

    if (node.isRoot) return this.addEdges

    if (
      !addEdges ||
      addEdges.length !== filteredNodes.length ||
      !addEdges.every(e => filteredNodes.includes(e.startNode) && e.endNode === node)
    ) {
      deleteAddEdges()

      log('create add edges')

      this.addEdges = filteredNodes
        .filter(start => !(generateEdgeId(start.id, node.id) in engine.renderEdges))
        .map(start => {
          const id = generateEdgeId(start.id, node.id)
          const edgeData = {id, start: start.id, end: node.id} as PixiEdge
          const edge = engine.updateEdge(edgeData)

          edge.setState({isTemporary: true})
          edge.container.interactiveChildren = true
          return edge
        })
    }

    return this.addEdges
  }

  saveAddEdges = (): void => {
    const {addEdges, mode, selectEdge, addDispatch} = this

    log('save')

    if (addEdges && addEdges.length > 0) {
      addEdges.forEach(e => {
        e.container.interactiveChildren = true
      })
      addDispatch(addEdges.map(addEdge))
      addEdges.forEach(selectEdge)
    }

    // TODO: find a nice place for this
    if (mode === EDIT_MODES.addEdge) {
      this.mode = EDIT_MODES.navigate
    }

    this.addEdges = []
  }

  deleteAddEdges = (): void => {
    const {addEdges, engine} = this
    if (addEdges) {
      addEdges.forEach(engine.removeEdge)
    }
    this.addEdges = []
  }

  scaleUp = (node?: PixiNode): void => {
    const {selectedNodes, addDispatch} = this
    const {scaleFactor} = CONFIG.nodes
    const nodes = node ? [node] : [...selectedNodes]
    log('scale up', {scaleFactor, nodes})
    addDispatch(
      nodes.map(n => {
        n.scale /= scaleFactor
        return rescale(n)
      }),
    )
  }

  scaleDown = (node?: PixiNode): void => {
    const {selectedNodes, addDispatch} = this
    const {scaleFactor} = CONFIG.nodes
    const nodes = node ? [node] : [...selectedNodes]
    log('scale down', {scaleFactor, nodes})
    addDispatch(
      nodes.map(n => {
        n.scale *= scaleFactor
        return rescale(n)
      }),
    )
  }

  saveTemporaryNode = (node: PixiNode): void => {
    const {addDispatch, saveNodes, commitDispatches} = this
    addDispatch(add(node))
    saveNodes()
    commitDispatches()
  }

  createNode = (nodeData: NodeData): void => {
    const {engine, addDispatch, nodeGrow, saveNodes} = this

    let parentNode
    if (nodeData.parentNode) {
      parentNode = nodeData.parentNode
    } else if (nodeData.parent) {
      parentNode = engine.renderNodes[nodeData.parent]
    }

    if (!parentNode) throw new Error('No parent provided')

    const node = engine.updateNode(nodeData, parentNode, false)

    addDispatch(add(node))
    nodeGrow(node.parentNode)
    saveNodes()
  }

  /**
   * This is a map of maps to allow resizing of several items in the future
   * resizeNode -> [moveNode -> moveData]
   */
  moveNodes: Map<PixiNode, Map<PixiNode, RepositionData>> = new Map()

  /**
   * When a resize starts with initNodeResize, the grid Nodes will be save in this variable
   */
  gridNodes: Map<PixiNode, PixiNode[]> = new Map()

  gridBorderRects: Map<PixiNode, RectangleData> = new Map()

  saveNodes = (): Promise<void> => {
    const {moveNodes, gridNodes, growNodes, gridBorderRects, addDispatch} = this

    // growNodes not included as they are resized to and thus go into the moveNodes keys, all grid nodes are also in
    // the gridnode keys
    const moveResizeSet = new Set([...moveNodes.keys(), ...gridNodes.keys()])
    const resizeActions = [...moveResizeSet].map(resize)

    const moveNodesSet = new Set(
      [...moveNodes.values()].flatMap(map => [...map.keys()]).concat([...gridNodes.values()].flat()),
    )
    const moveActions = [...moveNodesSet].map(move)

    moveNodes.clear()
    growNodes.clear()
    gridNodes.clear()
    gridBorderRects.clear()

    return addDispatch([...resizeActions, ...moveActions])
  }

  resetNodes = (): void => {
    const {moveNodes, gridNodes, growNodes, gridBorderRects} = this

    // growNodes not included as they are resized to and thus go into the moveNodes keys, all grid nodes are also in
    // the gridnode keys
    new Set([...moveNodes.keys(), ...gridNodes.keys()]).forEach(node => {
      node._width = null
      node._height = null
      node.redraw()
    })

    new Set([...moveNodes.values()].flatMap(map => [...map.keys()]).concat([...gridNodes.values()].flat())).forEach(
      node => {
        node._x = null
        node._y = null
        node.redraw()
      },
    )

    moveNodes.clear()
    growNodes.clear()
    gridNodes.clear()
    gridBorderRects.clear()

    // make sure we have something selected
    this.selectFromHistory()
  }

  initNodeResize = (resizeNode: PixiNode): void => {
    const {moveNodes, gridNodes} = this
    const currentMoveNodes = moveNodes.get(resizeNode) || new Map<PixiNode, RepositionData>()

    const gridSouthEastNodes = getGridSouthEastNodes(resizeNode)
    gridSouthEastNodes.forEach(([node, data]) => {
      if (!currentMoveNodes.has(node)) {
        currentMoveNodes.set(node, data)
      }
    })

    const allGridNodes = getGridNodes(resizeNode)

    gridNodes.set(resizeNode, allGridNodes)
    allGridNodes.forEach(node => gridNodes.set(node, allGridNodes))
    moveNodes.set(resizeNode, currentMoveNodes)
  }

  nodeResize = (resizeNode: PixiNode, width: number, height: number): void => {
    const {gridNodes, gridBorderRects, moveNodes, nodeGrow, initNodeResize} = this
    // get grid nodes -> init
    if (!gridNodes.has(resizeNode)) initNodeResize(resizeNode)
    const currentGridNodes = gridNodes.get(resizeNode)
    // this should never be true, as we initialize the grid nodes above
    if (!currentGridNodes) throw new Error('Grid nodes not initialized correctly')
    if (currentGridNodes.length === 0) throw new Error('No nodes selected')

    const resizeNodesX = getAllAttachedX(resizeNode, currentGridNodes)
    const resizeNodesY = getAllAttachedY(resizeNode, currentGridNodes)

    // resize node
    const doPartialResize = (innerWidth: number, innerHeight: number) => {
      const beforeWidth = resizeNode.width
      const beforeHeight = resizeNode.height

      resizeNode.resize(innerWidth, innerHeight)
      const diffWidth = resizeNode.width - beforeWidth
      const diffHeight = resizeNode.height - beforeHeight

      resizeNode.resize(beforeWidth, beforeHeight)

      // resize grid nodes
      // move grid nodes
      if (!isZero(diffWidth)) {
        const moveRight = (node: PixiNode): void => node.move(node.x + diffWidth, node.y, false)

        getAllAttachedRight(resizeNode, currentGridNodes).forEach(moveRight)
        resizeNodesY.forEach(yNode => {
          getAllAttachedRight(yNode, currentGridNodes).forEach(moveRight)
          yNode.resize(yNode.width + diffWidth, yNode.height)
        })
      }

      resizeNode.resize(innerWidth, beforeHeight)

      if (!isZero(diffHeight)) {
        const moveBelow = (node: PixiNode): void => node.move(node.x, node.y + diffHeight, false)

        getAllAttachedBelow(resizeNode, currentGridNodes).forEach(moveBelow)
        resizeNodesX.forEach(xNode => {
          getAllAttachedBelow(xNode, currentGridNodes).forEach(moveBelow)
          xNode.resize(xNode.width, xNode.height + diffHeight)
        })
      }

      // intersect grid border with siblings
      const nonGridSiblings = resizeNode.siblingNodes.filter(node => !currentGridNodes.includes(node))

      const currentMoveNodes = moveNodes.get(resizeNode) || new Map<PixiNode, RepositionData>()

      const removeMoveNodes = new Set<PixiNode>()

      resizeNode.resize(innerWidth, innerHeight)

      // calculate grid bounds
      const x = currentGridNodes.reduce((acc, node) => Math.min(acc, node.x), Infinity)
      const y = currentGridNodes.reduce((acc, node) => Math.min(acc, node.y), Infinity)
      const gridBorder = gridBorderRects.get(resizeNode) || {x: 0, y: 0, width: 0, height: 0}
      gridBorder.x = x
      gridBorder.y = y
      gridBorder.width = currentGridNodes.reduce((acc, node) => Math.max(acc, node.x + node.width), -Infinity) - x
      gridBorder.height = currentGridNodes.reduce((acc, node) => Math.max(acc, node.y + node.height), -Infinity) - y
      gridBorderRects.set(resizeNode, gridBorder)

      const collisionNodes = getCollisionNodes(gridBorder, nonGridSiblings)
      collisionNodes.forEach(([node, data]) => {
        if (!currentMoveNodes.has(node)) {
          currentMoveNodes.set(node, data)
        }
      })

      // @TODO: sort siblings by x or y, depending on direction
      const recursiveCollisionDetection = (fixedNode: PixiNode, collisionEntries: [PixiNode, RepositionData][]) => {
        collisionEntries.forEach(([moveNode, moveData]) => {
          const isDeletable = moveCollisionNode(moveNode, moveData)
          if (isDeletable) removeMoveNodes.add(moveNode)
          else if (removeMoveNodes.has(moveNode)) removeMoveNodes.delete(moveNode)
          // find collisions in moved nodes
          const newCollisions = getCollisionNodes(moveNode, nonGridSiblings, moveData.direction).filter(
            ([filterNode]) => filterNode !== resizeNode && !currentMoveNodes.has(filterNode),
          )

          if (newCollisions.length > 0) {
            newCollisions.forEach(([node, data]) => currentMoveNodes.set(node, data))

            recursiveCollisionDetection(moveNode, newCollisions)
          }
        })
      }

      recursiveCollisionDetection(resizeNode, [...currentMoveNodes])

      removeMoveNodes.forEach(n => currentMoveNodes.delete(n))

      moveNodes.set(resizeNode, currentMoveNodes)
    }

    createMoveSteps(resizeNode, width, height).forEach(([w, h]) => {
      doPartialResize(w, h)
    })

    nodeGrow(resizeNode.parentNode)
  }

  /**
   * save dimensions of grown nodes
   */
  growNodes: Map<PixiNode, ExpandData> = new Map()

  nodeGrow = (growNode: PixiNode): void => {
    const {growNodes, nodeResize} = this
    const siblingDimensions = growNode.childrenDimensions

    const growData = growNodes.get(growNode)

    const parentWidth = growNode.width
    const parentHeight = growNode.height

    const goalWidth = siblingDimensions.width + CONFIG.nodes.gridSize
    const goalHeight = siblingDimensions.height + 2 * CONFIG.nodes.gridSize

    const nodeResizeWrapper = (width: number, height: number) => {
      const newWidth = Math.max(goalWidth, width)
      const newHeight = Math.max(goalHeight, height)

      nodeResize(growNode, newWidth, newHeight)
    }

    if (growData) {
      const {startWidth, startHeight} = growData
      if (
        (isGreaterOrEqual(goalWidth, startWidth) && !isEqual(parentWidth, goalWidth)) ||
        (isGreaterOrEqual(goalHeight, startHeight) && !isEqual(parentHeight, goalHeight))
      ) {
        nodeResizeWrapper(startWidth, startHeight)
      }
    } else if (isGreaterThan(goalWidth, parentWidth) || isGreaterThan(goalHeight, parentHeight)) {
      nodeResizeWrapper(parentWidth, parentHeight)
      growNodes.set(growNode, {startWidth: parentWidth, startHeight: parentHeight})
    }
  }

  createSibling = (startNodeOrId: PixiNode | NodeId, isTemporary = false): void => {
    const {engine, addDispatch, nodeGrow, saveNodes} = this
    const {scale} = CONFIG.nodes.create
    const id = generateNodeId()

    const startNode = this.getNode(startNodeOrId)

    log('create sibling', {startNode, isTemporary})

    const {candidate: position} = startNode.parentNode.getFreeChildPosition(startNode)
    const nodeData = {...position, color: startNode.color, borderColor: startNode.borderColor, scale, id}
    const node = engine.updateNode(nodeData, startNode.parentNode, false)

    nodeGrow(startNode.parentNode)

    if (isTemporary) {
      node.setState({isTemporary: true})
    } else {
      addDispatch(add(nodeData))
      saveNodes()
    }

    this.selectSingleNode(node)
    node.openTextField('', 'end')
  }

  replyChatGPTOnSingleLine = async (content: string, node: PixiNode) => {
    const {scale} = CONFIG.nodes.create
    const {addDispatch, nodeGrow, saveNodes, engine} = this
    const {settings} = this.store

    if (!settings) return

    const {candidate, nodeAbove} = node.getFreeChildPosition({parentNode: node})
    const completion = await createChatCompletion([{role: 'user', content}], settings.openai.apiKey)

    if (!completion) return

    if (node.hasContent() && nodeAbove) {
      nodeAbove.title = completion
      addDispatch(edit(nodeAbove)).then()
    } else {
      const id = generateNodeId()
      const nodeData = {
        ...candidate,
        title: completion,
        scale,
        id,
      }
      const newChild = engine.updateNode(nodeData, node, false)
      nodeGrow(newChild.parentNode)

      addDispatch(add(newChild)).then()
      saveNodes().then()
    }
  }

  replyChatGPTOnMultiLine = async (content: string, node: PixiNode) => {
    const {addDispatch} = this
    const {settings} = this.store

    if (!settings) return

    const completion = await createChatCompletion([{role: 'user', content}], settings.openai.apiKey)

    if (!completion) return

    await addDispatch(removeChildren(node))
    this.importer.runImport(new Blob([completion], {type: 'text/plain'}), node.id).then()
  }

  createChild = (parentNodeOrId: PixiNode | NodeId, additionalNodeData?: RenderNodeCandidate): PixiNode => {
    const {addDispatch, nodeGrow, saveNodes, engine} = this
    const {scale} = CONFIG.nodes.create
    const id = generateNodeId()

    const parentNode = this.getNode(parentNodeOrId)

    const {candidate} = parentNode.getFreeChildPosition({parentNode, ...additionalNodeData})
    const nodeData = {
      ...candidate,
      scale,
      id,
      ...additionalNodeData,
    }
    const newChild = engine.updateNode(nodeData, parentNode, false)

    log('create child', {parentNode, newChild})

    nodeGrow(newChild.parentNode)

    addDispatch(add(newChild)).then()
    saveNodes().then()

    return newChild
  }

  createChildAndSelect = (parentNodeOrId: PixiNode | NodeId, additionalNodeData?: RenderNodeCandidate): PixiNode => {
    const {createChild} = this

    const newChild = createChild(parentNodeOrId, additionalNodeData)

    this.selectSingleNode(newChild)
    newChild.openTextField('', 'end')

    return newChild
  }

  toggleCheckbox = (nodeOrId: PixiNode | NodeId): Promise<void> => {
    const {engine, addDispatch} = this

    const node = typeof nodeOrId === 'string' ? engine.renderNodes[nodeOrId] : nodeOrId

    node.checked = !node.checked

    return addDispatch(setCheckBox(node))
  }

  get wheelPlugin(): Wheel | null {
    return this.engine.viewport.plugins.get('wheel') || null
  }

  get dragPlugin(): Drag | null {
    return this.engine.viewport.plugins.get('drag') || null
  }

  get mouseEdgePlugin(): MouseEdges | null {
    return this.engine.viewport.plugins.get('mouse-edges') || null
  }

  get clampPlugin(): ClampZoom | null {
    return this.engine.viewport.plugins.get('clamp-zoom') || null
  }

  addTemplate = (template: MapData, node: PixiNode | undefined = this.lastSelectedNode): Promise<void> => {
    if (!node) {
      throw new Error('Cannot add template without a selected node')
    }
    if (node.isCollapsed) {
      this.decollapse(node)
      // this is based on the same promise as addDispatch
      this.saveDecollapsedNode().then()
    }

    return this.addDispatch(addTemplate(node, template))
  }
}

export default EventManager
