import * as PIXI from 'pixi.js'
import {Viewport} from 'pixi-viewport'
import {Ease, EaseOptions, Easing} from 'pixi-ease'
import debug from 'debug'
import FontFaceObserver from 'fontfaceobserver'

import PixiEdge from './PixiEdge'
import PixiNode from './PixiNode'
import CONFIG from './CONFIG'
import {length} from '../utils/points'

import type MapStoreWrite from '../store/MapStoreWrite'
import type MapStoreReadOnly from '../store/MapStoreReadOnly'
import RenderEngineControl from './RenderEngineControl'
import {isDesktopSafari} from '../utils/browserDetection'
import EventManager from './events/EventManager'
import PointerEventHandler from './events/PointerEventHandler'
import KeyboardEvents from './events/KeyboardEvents'
import GestureEvents from './events/GestureEvents'
import NODE_ELEMENT_TYPES from './elements/node/NODE_ELEMENT_TYPES'
import PixiRootNode from './PixiRootNode'
import {
  AnimateViewportParameter,
  EdgeData,
  EdgeDatas,
  MapData,
  NODE_VISIBLE,
  NodeData,
  NodeDatas,
  NodeId,
  RenderEngineEventMixin,
  RenderEngineEventTarget,
  TApplicationOptions,
} from './types'
import onGrid from './utils/onGrid'
import TARGET_CATEGORIES from './TARGET_CATEGORIES'
import ScreenPosition from './collaboration/ScreenPosition'
import CollaboratorPointerPosition from './collaboration/CollaboratorPointerPosition'
import logDuration from './utils/logDuration'
import Publisher from '../lib/Publisher'
import Application from './Application'
import {PasteActionHandler} from './events/paste/PasteActionHandler'

const log = debug('app:RenderEngine')
const logError = log.extend('ERROR*', '::')
const logFlood = log.extend('FLOOD', '::')
const logPerformance = log.extend('PERFORMANCE', '::')

PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false

type TRenderEngineEvents = 'mounted' | 'unmounted' | 'zoom-to-node'

class PixiRenderEngine extends Publisher<TRenderEngineEvents> {
  app: Application

  store: MapStoreWrite | MapStoreReadOnly

  eventManager: EventManager

  pointerEventPlugin: PointerEventHandler

  pasteActionHandler: PasteActionHandler

  keyboardEvents: KeyboardEvents

  gestureEvents: GestureEvents

  viewport: Viewport & RenderEngineEventMixin

  tilingSprite: PIXI.TilingSprite

  get ticker(): PIXI.Ticker {
    return this.app.ticker
  }

  control: RenderEngineControl

  state = {}

  get rootNode(): PixiNode | undefined {
    const {root, renderNodes} = this
    return root ? renderNodes[root] : undefined
  }

  root?: NodeId

  textFieldNodes: Set<PixiNode> = new Set()

  textFieldEdges: Set<PixiEdge> = new Set()

  textFieldContainer: HTMLDivElement = document.createElement('div')

  config = CONFIG

  nodeContainer: PIXI.Container

  renderNodes: {[key: string]: PixiNode} = {}

  private _lastStoreNodes: NodeDatas = {}

  edgeContainer: PIXI.Container

  renderEdges: {[key: string]: PixiEdge} = {}

  private _lastStoreEdges: EdgeDatas = {}

  mountRef: HTMLDivElement | null = null

  view: HTMLDivElement

  animation: Easing | null = null

  ease: Ease

  mapId: string

  isDestroyed = false

  /**
   * a border around the canvas is needed for the move and zoom traps to function correctly
   * @see setupTraps
   */
  trapBorder: PIXI.Graphics

  skippedZoomStep = false

  constructor(store: MapStoreWrite | MapStoreReadOnly, options: TApplicationOptions) {
    super()

    log('initialize', store)

    this.mapId = store.mapId
    this.store = store

    this.control = new RenderEngineControl(this)

    PIXI.utils.skipHello()
    this.app = new Application(options)

    // wait for load to load
    const {fontFamily, fontWeight} = CONFIG.nodes.text
    new FontFaceObserver(fontFamily, {weight: fontWeight})
      .load()
      .then(() => {
        const {rootNode, renderEdges} = this
        this.eventManager.setState({isFontReady: true})
        // if we already rendered, rerender everything
        if (rootNode) {
          rootNode.childrenRedrawText()
          Object.values(renderEdges).forEach(e => e.redraw())
        }
      })
      .catch((e: Error) => log('Error loading font', e))

    this.view = document.createElement('div')
    this.view.style.height = '100%'
    this.view.style.width = '100%'
    this.view.tabIndex = 0
    this.textFieldContainer.style.position = 'absolute'
    this.textFieldContainer.style.top = '0'
    this.textFieldContainer.style.left = '0'
    this.textFieldContainer.style.width = '0'
    this.textFieldContainer.style.height = '0'
    this.view.appendChild(this.textFieldContainer)
    this.view.appendChild(this.app.view)

    const viewport = new Viewport({
      // need to disable this, to allow scrolling inside text fields, this will not work, in non full screen mode
      // interaction: this.app.renderer.plugins.interaction,
      threshold: this.config.interaction.clickMoveThreshold,
      divWheel: this.view,
      passiveWheel: false,
      stopPropagation: true,
    }) as Viewport & RenderEngineEventTarget
    // allow the viewport to be handled as the root node
    // @see RootNode.constructor
    viewport.type = NODE_ELEMENT_TYPES.background
    viewport.category = TARGET_CATEGORIES.node
    viewport.accessibleChildren = true

    this.trapBorder = new PIXI.Graphics()
    viewport.addChild(this.trapBorder)

    // background texture
    this.tilingSprite = this.app.renderBackgroundSprite()
    viewport.addChild(this.tilingSprite)

    this.eventManager = new EventManager(this, store)
    this.pointerEventPlugin = new PointerEventHandler(
      viewport,
      this.eventManager,
      this.app.renderer.plugins.interaction,
    )
    this.pasteActionHandler = new PasteActionHandler(this.eventManager, options)
    this.keyboardEvents = new KeyboardEvents(this, this.eventManager, this.view)
    this.gestureEvents = new GestureEvents(this, this.view)

    viewport.plugins.add('infinity-pointer-events', this.pointerEventPlugin, 0)

    this.nodeContainer = new PIXI.Container()
    this.nodeContainer.sortableChildren = true
    this.edgeContainer = new PIXI.Container()
    viewport.addChild(this.nodeContainer, this.edgeContainer)
    this.app.stage.addChild(viewport)

    // .bounce() and .zoomClamp() is based on the root object so it has to be updated when it changes - see below
    viewport.drag({wheel: isDesktopSafari}).pinch().mouseEdges({
      distance: this.config.mouseEdgeBorderSize,
      allowButtons: true,
      speed: this.config.mouseEdgeSpeed,
    })

    // disable wheel on desktop safari to allow scrolling by apples mouse pad
    if (!isDesktopSafari) viewport.wheel()

    // Run zoomStepEvent on every move of the viewport, that includes zooming
    viewport.on('moved', this.maybeZoomStepEvent)
    viewport.on('moved-end', this.ensureZoomStepEvent)
    viewport.on('pointerdown', this.focusView)
    viewport.on('moved', this.moveBackground)

    this.viewport = viewport

    // pause mouseEdge plugin until needed
    this.eventManager.mouseEdgePlugin?.pause()

    window.addEventListener('touchstart', this.onTouchStart)

    this.ease = new Ease({ticker: this.ticker, maxFrame: 100})

    // render once to have the background in place
    this.app.render()

    // put this at the end, so we only receive updates if the engine was created successfully
    store.subscribe(this.update)
  }

  moveBackground = (): void => {
    const {tilingSprite, viewport} = this

    const {dotRadius} = CONFIG.background
    const {gridSize} = CONFIG.nodes
    const bounds = viewport.getVisibleBounds()

    tilingSprite.width = bounds.width + 2 * gridSize
    tilingSprite.height = bounds.height + 2 * gridSize

    tilingSprite.x = onGrid(bounds.x) - dotRadius / 2 - 0.3
    tilingSprite.y = onGrid(bounds.y) - dotRadius / 2 - 0.3

    tilingSprite.visible = viewport.scale.x > 0.5
  }

  onTouchStart = (): void => {
    this.eventManager.state.isTouchScreen = true
    this.viewport.decelerate()
    window.removeEventListener('touchstart', this.onTouchStart)
  }

  destroy = (): void => {
    log('destroy')
    const {viewport, app, rootNode} = this

    if (this.isDestroyed) return

    this.eventManager.destroy()
    this.pointerEventPlugin.destroy()
    this.keyboardEvents.destroy()
    this.gestureEvents.destroy()
    this.store.unsubscribe(this.update)
    window.removeEventListener('touchstart', this.onTouchStart)
    this.unmount()
    viewport.off('moved', this.moveBackground)
    viewport.off('moved', this.maybeZoomStepEvent)
    viewport.off('moved-end', this.ensureZoomStepEvent)
    viewport.off('pointerdown', this.focusView)

    viewport.destroy()
    app.stop()
    app.destroy()
    if (rootNode) this._removeNode(rootNode)
    this.isDestroyed = true

    this.fireSubscriptions().then()
  }

  mount = (ref: HTMLDivElement): void => {
    const {isDestroyed, view, onResizeWindow} = this

    log('mount', ref)

    if (isDestroyed) {
      logError('Not mounting as engine was destroyed before')
      return
    }

    ref.appendChild(view)

    window.addEventListener('resize', onResizeWindow)
    onResizeWindow()
    this.mountRef = ref

    this.emit('mounted')
  }

  unmount = (): void => {
    const {view, onResizeWindow, mountRef} = this

    log('unmount', {mountRef})

    if (!mountRef) return

    if (view.parentNode === mountRef) mountRef.removeChild(view)

    window.removeEventListener('resize', onResizeWindow)
    this.mountRef = null

    this.emit('unmounted')
  }

  onResizeWindow = (): void => {
    const {viewport, app, mountRef, moveBackground, setupTraps} = this

    if (!mountRef) return

    const {width: innerWidth, height: innerHeight} = mountRef.getBoundingClientRect()

    log('resize window', {innerWidth, innerHeight})

    app.renderer.resize(innerWidth, innerHeight)
    viewport.resize(innerWidth, innerHeight)

    moveBackground()
    setupTraps()

    // workaround until https://github.com/davidfig/pixi-viewport/pull/373 is merged
    const oldScale = new PIXI.Point(viewport.scale.x, viewport.scale.y) as PIXI.ObservablePoint
    viewport.scale = new PIXI.Point(1, 1) as PIXI.ObservablePoint
    viewport.plugins.get('mouse-edges')?.resize()
    viewport.scale = oldScale

    // call update directly to not have a extreme black flickering (Firefox 88)
    this.app.render()
  }

  setupTraps = (): void => {
    const {viewport, rootNode, mountRef} = this
    const {zoomTrapBorderRatio, moveTrapBorderRatio} = CONFIG.nodes

    if (!mountRef || !rootNode) return

    const {width: innerWidth, height: innerHeight} = mountRef.getBoundingClientRect()
    const {x: nodesX, y: nodesY, width: nodesWidth, height: nodesHeight} = rootNode.getBounds()

    const minInnerWidth = Math.max(nodesWidth, innerWidth)
    const minInnerHeight = Math.max(nodesHeight, innerHeight)

    // calculate the width/height of the rootElement relative to the viewport size
    const borderWidth = Math.max(minInnerWidth, minInnerHeight * (innerWidth / innerHeight))
    const borderHeight = Math.max(minInnerHeight, minInnerWidth * (innerHeight / innerWidth))
    // allow `config.zoomTrapBorderRatio` border around the viewport, relative to the large
    // side compared to viewport size
    const clampOptions = {
      left: nodesX - borderWidth * moveTrapBorderRatio,
      top: nodesY - borderHeight * moveTrapBorderRatio,
      right: nodesX + nodesWidth + borderWidth * moveTrapBorderRatio,
      bottom: nodesY + nodesHeight + borderHeight * moveTrapBorderRatio,
    }

    // kind of dirty hack to make the zoom trap work as expected
    // without this the zoom trap hangs much to early and does not allow any movement
    this.trapBorder.clear()
    this.trapBorder.lineStyle(10, 0x000000, 0)
    this.trapBorder.drawRect(
      clampOptions.left,
      clampOptions.top,
      clampOptions.right - clampOptions.left,
      clampOptions.bottom - clampOptions.top,
    )

    viewport
      .clampZoom({
        maxWidth: borderWidth * zoomTrapBorderRatio,
        maxHeight: borderHeight * zoomTrapBorderRatio,
      })
      .clamp(clampOptions)
  }

  update = ({nodes, root, edges}: MapData): void => {
    const {app, eventManager} = this
    const endDuration = logDuration(logPerformance, 'store update')

    const isFirst = this.root !== root
    this.root = root
    const {isDestroyed, renderNodes, renderEdges, _lastStoreNodes, _lastStoreEdges} = this

    log('update', {nodes, root, edges})

    if (isDestroyed) {
      throw new Error('Cannot update destroyed engine')
    }

    if (!root) {
      Object.values(renderNodes).forEach(this._removeNode)
      Object.values(renderEdges).forEach(this.removeEdge)
      return
    }

    if (nodes && nodes !== _lastStoreNodes) {
      // update or create nodes
      let parents = [root]
      // prepare root node
      if (!(root in renderNodes)) {
        renderNodes[root] = new PixiRootNode(this, nodes[root]) as unknown as PixiNode
      }

      while (parents && parents.length > 0) {
        const newParents: string[] = []
        parents.forEach(parentId => {
          const parentNode = renderNodes[parentId]
          if (nodes[parentId] && nodes[parentId].children) {
            nodes[parentId].children?.forEach(childId => {
              if (nodes[childId]) {
                try {
                  this.updateNode(nodes[childId], parentNode, true)
                  newParents.push(childId)
                } catch (e) {
                  logError(`Could not create node with id ${childId}: ${(e as Error).message}`)
                }
              } else {
                logError(
                  `data inconsistency: node id ${childId} defined in children of node ${parentId}, ` +
                    'but not present in nodes of this mapstore',
                )
              }
            })
          }
        })
        parents = newParents
      }

      // remove deleted nodes
      Object.values(renderNodes).forEach(node => {
        if (!(node.id in nodes) && !node.state.isTemporary) {
          this._removeNode(node)
        }
      })
      this._lastStoreNodes = nodes
    }

    // start to load images
    app.loader.load()

    if (edges && edges !== _lastStoreEdges) {
      // update or create edges
      Object.values(edges).forEach(storeEdge => {
        // TODO: need to handle temporary edges here too, see node implementation addNode and PixiNode::update
        try {
          this.updateEdge(storeEdge, true)
        } catch (e) {
          logError(`Could not create edge with id ${storeEdge.id}: ${(e as Error).message}`)
        }
      })
      // remove deleted edges
      Object.values(renderEdges).forEach(edge => {
        if (!(edge.id in edges) && !edge.state.isTemporary) {
          this.removeEdge(edge)
        }
      })
      this._lastStoreEdges = edges
    }

    if (root && isFirst) {
      log('first time render', {root})
      // initial hide of small nodes or text, but first we need to render once to have the transformation matrises
      app.renderer.once('postrender', this.zoomStepEvent)

      eventManager.selectNode(this.renderNodes[root])
    }

    // need to resize if the root object has changed, as resize include maxZoom etc.
    this.setupTraps()

    // create new objects at the end to have mutation performance above and still use these in react hooks
    this.renderNodes = {...renderNodes}
    this.renderEdges = {...renderEdges}
    this.fireSubscriptions().then()
    this.scheduleRender().then()

    endDuration()
  }

  scheduleRender = () => this.app.scheduleRender()

  redraw = (): void => {
    const {renderNodes, renderEdges} = this
    Object.values(renderNodes).forEach(n => n.redraw())
    Object.values(renderEdges).forEach(e => e.redraw())
    this.scheduleRender().then()
  }

  updateNode = (nodeData: NodeData, parentNode: PixiNode, isFromStore = false): PixiNode => {
    const {renderNodes, _removeNode} = this

    logFlood('update node', nodeData, isFromStore)

    let renderNode: PixiNode | undefined
    try {
      if (!renderNodes[nodeData.id]) {
        renderNodes[nodeData.id] = new PixiNode(this, nodeData, parentNode)
        this.fireSubscriptions().then()
      }
      renderNode = renderNodes[nodeData.id]

      renderNode.update(nodeData, parentNode, isFromStore)
      return renderNode
    } catch (e) {
      logError(`Cannot create new node: ${e}`)
      if (renderNodes[nodeData.id]) {
        _removeNode(renderNodes[nodeData.id])
      }
      throw e
    }
  }

  _removeNode = (node: PixiNode): void => {
    const {renderNodes, eventManager} = this

    // TODO: how can this happen?
    if (!node) return

    log('remove node', node)

    const {parentNode, textField} = node
    if (textField) node.deleteTextField()

    if (!(node.id in renderNodes)) return

    if (eventManager.selectedNodes.has(node)) {
      eventManager.unselectNode(node)
    }

    node.edges.forEach(this.removeEdge)
    node.parentNode.removeChild(node)
    node.elements.destroy()
    node.isDestroyed = true

    delete renderNodes[node.id]
    node.childNodes.forEach(this._removeNode)

    if (!parentNode.isDestroyed) {
      parentNode.redraw()
      eventManager.makeNodeVisibleIfNecessary(parentNode)
    }
  }

  removeNode = (node: PixiNode): void => {
    this._removeNode(node)

    this.scheduleRender().then()
    this.fireSubscriptions().then()
  }

  updateEdge = (edgeData: EdgeData, isFromStore = false): PixiEdge => {
    const {renderEdges, removeEdge, edgeContainer} = this

    logFlood('update edge', edgeData, isFromStore)

    let renderEdge
    try {
      if (!(edgeData.id in renderEdges)) {
        renderEdges[edgeData.id] = new PixiEdge(this, edgeData)
        this.fireSubscriptions().then()
      }

      renderEdge = renderEdges[edgeData.id]
      renderEdge.update(edgeData, isFromStore)

      if (!renderEdge.container.parent) edgeContainer.addChild(renderEdge.container)

      return renderEdge
    } catch (e) {
      logError(`Cannot create new edge: ${e}`)
      if (renderEdges[edgeData.id]) {
        removeEdge(renderEdges[edgeData.id])
      }
      throw e
    }
  }

  removeEdge = (edge: PixiEdge): void => {
    const {renderEdges, eventManager} = this

    const {startNode, endNode, elements} = edge

    log('remove edge', edge)

    if (!(edge.id in renderEdges)) return

    elements.destroy()
    startNode.removeEdge(edge)
    endNode.removeEdge(edge)

    if (eventManager.selectedEdges.has(edge)) {
      eventManager.unselectEdge(edge)
    }

    delete renderEdges[edge.id]
    this.scheduleRender().then()
  }

  /**
   * Abort a running animation
   */
  abortAnimation = (): void => {
    const {animation, ease} = this
    if (animation) {
      log('abort not completed animation')
      ease.removeAll()
      // complete event is normally not called, so do this manually
      animation.emit('complete')

      this.animation = null
    }
  }

  /**
   * This will animate the viewport to match the given parameters. If no duration is given, a duration will be
   * calculated. The animation can be aborted with the abortAnimation() function. This will happen, when ever a pointer
   * down occurs or a the keyboard is used.
   *
   * @see abortAnimation
   * @param params
   * @param options
   * @returns {Promise<void>}
   */
  animateViewport = async (params: AnimateViewportParameter, options: EaseOptions = {}): Promise<void> => {
    const {viewport, config, abortAnimation, ticker} = this
    const {duration: givenDuration, ...otherEaseOptions} = options

    abortAnimation()

    let duration
    if (givenDuration) {
      duration = givenDuration
    } else {
      const newScale = params.scale || viewport.scale.x

      const viewportNW = {x: -viewport.x / viewport.scale.x, y: -viewport.y / viewport.scale.y}
      const newNW = {x: -params.x / newScale, y: -params.y / newScale}

      const viewportSE = {
        x: (-viewport.x + viewport.screenWidth) / viewport.scale.x,
        y: (-viewport.y + viewport.screenHeight) / viewport.scale.y,
      }
      const newSE = {
        x: (-params.x + viewport.screenWidth) / newScale,
        y: (-params.y + viewport.screenHeight) / newScale,
      }

      const lengthNW = length(newNW, viewportNW)
      const lengthSE = length(newSE, viewportSE)

      duration = Math.max(lengthNW, lengthSE) * Math.min(viewport.scale.x, newScale) * config.animateFactor
      duration = Math.min(duration, config.animateDurationMax)
      // work around for a bug in the ease library, that does not allow duration to be 0
      duration = Math.max(duration, 1)
    }

    log('animate viewport', {duration, params, rest: otherEaseOptions})

    // make sure all given parameters are valid
    if ([duration, ...Object.values(params)].find(n => !Number.isFinite(n))) {
      logError('animation aborted which would send the viewport to nirvana', {duration, params})
      throw new Error('animation aborted which would send the viewport to nirvana')
    }

    const animation = this.ease.add(viewport, params, {ease: config.animateFunction, duration, ...otherEaseOptions})
    const emitMoved = () => {
      try {
        viewport.emit('moved', {viewport, type: 'engine'})
      } catch (e) {
        logError(`Error while emitting move event: ${e}`)
      }
    }
    ticker.add(emitMoved)

    ticker.start()
    viewport.emit('moved-start')
    viewport.emit('zoom-start')

    this.animation = animation

    return new Promise(resolve => {
      animation.once('complete', () => {
        const {tickerStop} = this.eventManager.state
        if (tickerStop) ticker.stop()
        log('animation completed')
        viewport.emit('moved-end')
        viewport.emit('zoom-end')
        ticker.remove(emitMoved)
        this.animation = null
        resolve()
      })
    })
  }

  lastZoomStepTimestamp = 0

  private focusView = () => this.view.focus()

  maybeZoomStepEvent = (): void => {
    // selected is not needed for the transform workaround
    const {lastZoomStepTimestamp} = this

    const currentTimestamp = performance.now()

    if (currentTimestamp - lastZoomStepTimestamp < CONFIG.performance.zoomStepTimeDistance) {
      this.skippedZoomStep = true
    } else {
      this.skippedZoomStep = false

      this.lastZoomStepTimestamp = currentTimestamp

      this.zoomStepEvent()
    }
  }

  ensureZoomStepEvent = (): void => {
    const {skippedZoomStep} = this
    if (skippedZoomStep) {
      this.zoomStepEvent()
      this.skippedZoomStep = false
      this.scheduleRender().then()
    }
  }

  private zoomStepEvent = (): void => {
    const {viewport, rootNode} = this
    const {nodes: nodesConfig} = CONFIG

    if (!rootNode) return

    const boundsTopLeftX =
      (-viewport.x - viewport.screenWidth * nodesConfig.hideOutsideViewportFactor) / viewport.scale.x
    const boundsTopLeftY =
      (-viewport.y - viewport.screenHeight * nodesConfig.hideOutsideViewportFactor) / viewport.scale.y

    const boundsBottomRightX =
      (-viewport.x + viewport.screenWidth * (1 + nodesConfig.hideOutsideViewportFactor)) / viewport.scale.x
    const boundsBottomRightY =
      (-viewport.y + viewport.screenHeight * (1 + nodesConfig.hideOutsideViewportFactor)) / viewport.scale.y

    const checkVisible = (node: PixiNode) => {
      const pointBottomRight = node.transform(node.getCornerBottomRight())

      if (boundsTopLeftX > pointBottomRight.x || boundsTopLeftY > pointBottomRight.y) return NODE_VISIBLE.NO

      const pointTopLeft = node.transform(node)

      if (boundsBottomRightX < pointTopLeft.x || boundsBottomRightY < pointTopLeft.y) return NODE_VISIBLE.NO

      if (
        boundsTopLeftX > pointTopLeft.x &&
        boundsTopLeftY > pointTopLeft.y &&
        boundsBottomRightX < pointBottomRight.x &&
        boundsBottomRightY < pointBottomRight.y
      ) {
        return NODE_VISIBLE.OVER
      }

      return NODE_VISIBLE.YES
    }

    let parents = [...rootNode.childNodes].map(child => ({node: child, parentVisibility: NODE_VISIBLE.OVER}))
    while (parents && parents.length > 0) {
      const newParents: {node: PixiNode; parentVisibility: number}[] = []
      parents.forEach(({node, parentVisibility}) => {
        const visibility = parentVisibility === NODE_VISIBLE.OVER ? checkVisible(node) : NODE_VISIBLE.YES

        node.container.visible = visibility !== NODE_VISIBLE.NO
        if (visibility === NODE_VISIBLE.NO || (node.state.isTemporary && !node.state.isAddNode)) return

        const worldScale = node.getCurrentWorldScale()

        node.setCache(false)
        const nodeDetails = node.elements.calculateDetailLevel(worldScale)

        if (nodeDetails.showChildren) {
          node.childNodes.forEach(child => {
            newParents.push({node: child, parentVisibility: visibility})
          })
        }
      })
      parents = newParents
    }

    Object.values(this.renderEdges).forEach(edge => {
      if (edge.visible) {
        const worldScale = (edge.startNode.getCurrentWorldScale() + edge.endNode.getCurrentWorldScale()) / 2
        edge.elements.calculateDetailLevel(worldScale)
      }
    })

    this.scheduleRender().then()
  }

  zoomAtPoint = ({clientX, clientY, scale}: {clientX: number; clientY: number; scale: number}): void => {
    const {viewport, app, eventManager, scheduleRender} = this

    const point = new PIXI.Point()
    app.renderer.plugins.interaction.mapPositionToPoint(point, clientX, clientY)
    const previousPosition = viewport.toLocal(point)

    log('zoom at point', {clientX, clientY, scale, viewport})

    viewport.scale.x = scale
    viewport.scale.y = scale
    viewport.emit('zoomed', {viewport, type: 'engine'})
    viewport.emit('zoom-end')

    const newPosition = viewport.toGlobal(previousPosition)
    viewport.x += point.x - newPosition.x
    viewport.y += point.y - newPosition.y
    viewport.emit('moved', {viewport, type: 'engine'})
    viewport.emit('moved-end')

    eventManager.clampPlugin?.clamp()

    scheduleRender().then()
  }

  public toScreenPosition = (mapPosition: CollaboratorPointerPosition): ScreenPosition | null => {
    const {viewport} = this

    return viewport.toGlobal<CollaboratorPointerPosition>(mapPosition)
  }
}

export default PixiRenderEngine
