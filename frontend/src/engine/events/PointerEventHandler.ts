import {Plugin, Viewport} from 'pixi-viewport'
import debug from 'debug'
import * as PIXI from 'pixi.js'

import PointerEventBinder from './binding/PointerEventBinder'
import {ORIGIN} from '../../utils/points'
import ACTION_TYPES from './actions/ACTION_TYPES'
import POINTER_PRESS_TYPES from './POINTER_PRESS_TYPES'
import BUTTONS from './binding/BUTTONS'

import CONFIG from '../CONFIG'
import type PointerActionHover from './actions/PointerActionHover'
import type PointerActionDrag from './actions/PointerActionDrag'
import EventManager from './EventManager'
import type PointerActionClick from './actions/PointerActionClick'
import EDIT_MODES from './EDIT_MODES'
import {RenderEngineEvent, RenderEngineEventMixin, RenderEngineEventTarget} from '../types'
import {add} from '../../store/actions'
import type PixiNode from '../PixiNode'
import {track} from '../../contexts/tracking'

const log = debug('app:Event:PointerEventHandler')
const logFlood = log.extend('FLOOD', '::')

/**
 * Functions as a plugin for pixi-viewport and will hand pointer events. It will consult a binder instance, which
 * actions to trigger and will then orchestrate different actions like decide whether a click or a drag action
 * should be handled. It will also set the cursor and allow the ticker to render whenever an action is performed
 * @see PointerEventBinder
 */
class PointerEventHandler extends Plugin {
  viewport: Viewport & RenderEngineEventTarget

  manager: EventManager

  interactionManager: PIXI.InteractionManager

  binder: PointerEventBinder

  ongoingClickAction: PointerActionClick | null = null

  ongoingDragAction: PointerActionDrag | null = null

  ongoingHoverAction: PointerActionHover | null = null

  ongoingActionPointerId: number | null = null

  ongoingActionButtons: number | null = null

  ongoingActionStartPosition: {x: number; y: number} = ORIGIN

  moved = false

  hasFirstClick = false

  doubleClickRef: NodeJS.Timeout | null = null

  lastMoveTarget: (PIXI.DisplayObject & RenderEngineEventMixin) | null = null

  longClickRef: NodeJS.Timeout | null = null

  eventDOMElement: HTMLElement

  wheelTrackerEnabled = true

  trackNumberOfSelected = 0

  constructor(
    viewport: Viewport & RenderEngineEventTarget,
    manager: EventManager,
    interactionManager: PIXI.InteractionManager,
  ) {
    super(viewport)

    log('initialize', this)

    this.viewport = viewport
    this.manager = manager
    this.interactionManager = interactionManager
    this.binder = new PointerEventBinder(manager)

    this.eventDOMElement = this.manager.engine.view
    this.eventDOMElement.addEventListener('contextmenu', this._contextMenuHandler)
  }

  destroy(): void {
    this.eventDOMElement.removeEventListener('contextmenu', this._contextMenuHandler)
    this.binder.destroy()
  }

  private _contextMenuHandler = (event: MouseEvent): void => {
    const {manager, _resetClickActions} = this
    log('context menu')

    event.preventDefault()

    // safari will not trigger an up event when the context menu is opened, so we need to emulate that here
    _resetClickActions()
    manager.pointerDown = false
  }

  private _resetClickActions = (): void => {
    const {manager, ongoingClickAction, ongoingDragAction} = this

    if (ongoingClickAction) {
      ongoingClickAction.reset()
      this.ongoingClickAction = null
      manager.engine.scheduleRender().then()
    }

    if (ongoingDragAction) {
      ongoingDragAction.reset()
      manager.setState({isDragged: false})
      this.ongoingDragAction = null
      manager.engine.scheduleRender().then()
    }
  }

  /**
   * Handles pointer down events and schedules double, long or normal clicks and calls _downActions() to execute bound
   * actions
   *
   * @param event
   * @returns {boolean|*}
   */
  down = (event: RenderEngineEvent): boolean => {
    const {manager, moved, ongoingHoverAction, hasFirstClick, doubleClickRef, longClickRef, _downActions} = this
    // handle touch events without buttons as a left click
    const {ctrlKey, metaKey} = event.data.originalEvent
    const {buttons = BUTTONS.left} = event.data
    event.control = ctrlKey || metaKey
    const isDoubleClick = hasFirstClick && !moved
    this.trackNumberOfSelected = this.manager.engine.eventManager.selectedNodes.size
    manager.engine.abortAnimation()
    if (buttons === BUTTONS.right) {
      // pause drag plugin of the viewport to ignore right clicks
      if (!this.manager.dragPlugin?.paused) this.manager.dragPlugin?.pause()
    } else if (this.manager.dragPlugin?.paused) {
      // resume plugin if a normal click was received
      this.manager.dragPlugin?.resume()
    }

    // do not trigger any events, when render engine is not ready yet
    if (!event.target) return true

    logFlood('pointer down')

    manager.pointerDown = true
    this.ongoingActionButtons = event.data.buttons
    this.ongoingActionPointerId = event.data.pointerId
    this.ongoingActionStartPosition = event.data.global.clone()
    this.moved = false

    // if the user clicks on a new created card (eg sibling) it becomes permanent
    if (event.target.node) {
      if (event.target.node.state.isTemporary) {
        event.target.node.state.isTemporary = false
        manager.addDispatch(add(event.target.node))
      }
    }

    // double click handling
    if (doubleClickRef) clearTimeout(doubleClickRef)
    if (!isDoubleClick) {
      this.hasFirstClick = true
      this.doubleClickRef = setTimeout(() => {
        log('abort double click')
        this.hasFirstClick = false
      }, CONFIG.interaction.doubleClickTimeout)
    } else {
      this.hasFirstClick = false
    }

    // long click handling
    if (longClickRef) clearTimeout(longClickRef)
    this.longClickRef = setTimeout(() => {
      log('long click')
      this.up(event)
    }, CONFIG.interaction.longClickLatency)

    const pointerEventType = isDoubleClick ? POINTER_PRESS_TYPES.double : POINTER_PRESS_TYPES.normal

    // reset hover action
    if (ongoingHoverAction) {
      ongoingHoverAction.reset()
      this.ongoingHoverAction = null
      manager.engine.scheduleRender().then()
    }

    // allow context menu
    if (buttons === BUTTONS.right) {
      this.openContextMenu(manager, event)
    }

    _downActions(event, pointerEventType)

    return true
  }

  /**
   * Sets contextMenuState of EventManager, then fires subscriptions of EventManager to cause rerender including
   * context menu
   * @param manager
   * @param event
   */
  openContextMenu = (manager: EventManager, event: RenderEngineEvent): void => {
    const {control} = event
    const {node, edge} = event.target || {}

    // select current node, also allow root select, as it will be handled in the context menu
    if (node) {
      if (control) {
        if (!node.state.isSelected) {
          manager.selectNode(node)
        } else {
          manager.unselectNode(node)
        }
      } else {
        manager.selectSingleNode(node)
      }
    } else if (edge) {
      if (control) {
        if (!edge.state.isSelected) {
          manager.selectEdge(edge)
        } else {
          manager.unselectEdge(edge)
        }
      } else {
        manager.selectSingleEdge(edge)
      }
    } else {
      // neither node nor edge was clicked
      return
    }

    event.data.originalEvent.preventDefault()
    manager.contextMenuPosition = {
      x: event.data.global.x,
      y: event.data.global.y,
    }
    manager.fireSubscriptions()

    this.trackAction('openNodeToolbar', 'atClick')
  }

  /**
   * Asks the binder for the actions for the current event and hands the event over to these actions. This is called
   * from either a normal click or asynchronly for a long click.
   *
   * @param event
   * @param pointerEventType
   * @returns {boolean} should other actions run
   * @private
   */
  private _downActions = (
    event: RenderEngineEvent,
    pointerEventType: typeof POINTER_PRESS_TYPES[keyof typeof POINTER_PRESS_TYPES],
  ): void => {
    const {binder, manager, setCursor, ongoingDragAction, ongoingClickAction, ongoingHoverAction} = this

    const clickAction = binder.getAction(event, pointerEventType, ACTION_TYPES.click)

    // tracking ghostClickAction

    if (clickAction?.category === 'ghost') {
      setTimeout(() => {
        this.trackAction('nodeAdd', 'atGhostClick', this.numberOfNestingParents(event.target.node as PixiNode))
      }, 1000)
    }

    if (clickAction) {
      log('down click action', clickAction)

      // track and prevent false tracking when card added with menu and zoom with touch/pinch

      clickAction.down(event)

      if (ongoingClickAction && ongoingClickAction !== clickAction) ongoingClickAction.reset()

      if (pointerEventType === POINTER_PRESS_TYPES.long) {
        clickAction.up(event)
        clickAction.reset()
        this.ongoingClickAction = null
      } else {
        this.ongoingClickAction = clickAction
      }
      manager.engine.scheduleRender().then()
    }

    const dragAction = binder.getAction(event, pointerEventType, ACTION_TYPES.drag) as PointerActionDrag

    if (dragAction) {
      dragAction.down(event)

      setCursor(dragAction.dragCursor)

      if (ongoingDragAction && ongoingDragAction !== dragAction) ongoingDragAction.reset()

      manager.setState({isDragged: true})
      this.ongoingDragAction = dragAction

      if (!this.manager.dragPlugin?.paused) this.manager.dragPlugin?.pause()
      if (this.manager.mouseEdgePlugin?.paused) this.manager.mouseEdgePlugin?.resume()

      manager.engine.scheduleRender().then()
    }

    if (ongoingHoverAction) {
      ongoingHoverAction.reset()
      manager.engine.scheduleRender().then()
    }

    if (clickAction || dragAction) {
      if (event.data.originalEvent.preventDefault) event.data.originalEvent.preventDefault()
      if (event.data.originalEvent.stopPropagation) event.data.originalEvent.stopPropagation()
      if (event.stopPropagation) event.stopPropagation()
    }
  }

  /**
   * Handles pointer up events, checks if it is a valid pointer up, then hands over the event to actions, if
   * there are any running.
   * @param event
   */
  up = (event: RenderEngineEvent): boolean => {
    const {
      binder,
      manager,
      ongoingClickAction,
      ongoingDragAction,
      ongoingActionPointerId,
      moved,
      longClickRef,
      setCursor,
      _resetClickActions,
    } = this

    // handle touch events without buttons as a left click
    const {ctrlKey, metaKey} = event.data.originalEvent
    event.control = ctrlKey || metaKey

    // do not trigger any events, when renderengine is not ready yet
    if (!event.target) return true
    // check for the same pointer (multitouch)
    if (event.data.pointerId !== ongoingActionPointerId || !manager.pointerDown) return true

    logFlood('pointer up')

    manager.pointerDown = false
    this.ongoingActionButtons = null

    if (longClickRef) clearTimeout(longClickRef)

    if (ongoingClickAction && !moved) {
      ongoingClickAction.up(event)
      manager.engine.scheduleRender().then()
    }

    if (ongoingDragAction && moved) {
      ongoingDragAction.up(event)
      manager.setState({isDragged: false})
      manager.engine.scheduleRender().then()
    }

    _resetClickActions()

    manager.saveDecollapsedNode()

    if (manager.mode !== EDIT_MODES.navigate && manager.mode !== EDIT_MODES.moveNode) {
      manager.mode = EDIT_MODES.navigate
    }

    setCursor(binder.getCursor(event))

    if (this.manager.dragPlugin?.paused) this.manager.dragPlugin?.resume()
    if (!this.manager.mouseEdgePlugin?.paused) this.manager.mouseEdgePlugin?.pause()

    manager.fireSubscriptions()
    manager.commitDispatches()

    return true
  }

  /**
   *
   * @param event
   */
  move = (event: RenderEngineEvent): boolean => {
    const {
      binder,
      manager,
      ongoingDragAction,
      ongoingHoverAction,
      ongoingActionPointerId,
      ongoingActionStartPosition,
      ongoingActionButtons,
      longClickRef,
      doubleClickRef,
      setCursor,
    } = this
    const {pointerDown} = this.manager
    const {ctrlKey, metaKey} = event.data.originalEvent
    event.control = ctrlKey || metaKey

    // do not trigger any events, when renderengine is not ready yet
    if (!event.target) return true
    // check for the same pointer (multitouch)
    if (ongoingActionPointerId && ongoingActionPointerId !== event.data.pointerId) {
      return true
    }

    const {node} = event.target

    this.lastMoveTarget = event.target
    if (node && node !== manager.hoverNode) {
      manager.setHoverNode(node)
      manager.setNodeCache(node, false)
      manager.engine.scheduleRender().then()
    }
    manager.setPointerPosition(event.data.global.clone())

    // use the viewports functions to calculate if we moved
    if (
      Math.abs(event.data.global.x - ongoingActionStartPosition.x) < CONFIG.interaction.clickMoveThreshold &&
      Math.abs(event.data.global.y - ongoingActionStartPosition.y) < CONFIG.interaction.clickMoveThreshold
    ) {
      return true
    }

    this.moved = true
    // clear long click
    if (longClickRef) clearTimeout(longClickRef)
    // clear double click
    this.hasFirstClick = false
    if (doubleClickRef) clearTimeout(doubleClickRef)

    logFlood('move')

    // hover actions, also check for an available drag action to change the cursor accordingly
    const hoverAction = binder.getAction(event, POINTER_PRESS_TYPES.normal, ACTION_TYPES.hover) as PointerActionHover

    if ((!ongoingHoverAction && hoverAction) || (ongoingHoverAction && ongoingHoverAction !== hoverAction)) {
      const mode = binder.getMode(event)
      manager.setState({showGhosts: mode !== EDIT_MODES.addNode})
    }
    if (ongoingHoverAction && ongoingHoverAction !== hoverAction) {
      ongoingHoverAction.reset()
      this.ongoingHoverAction = null
      manager.engine.scheduleRender().then()
    }

    if (ongoingDragAction) {
      setCursor(ongoingDragAction.dragCursor)
    } else {
      setCursor(binder.getCursor(event))
    }

    if (ongoingDragAction) {
      if (event.data.buttons === ongoingActionButtons) {
        ongoingDragAction.move(event)
        manager.engine.scheduleRender().then()
      } else {
        // this happens if we miss an up event for some reason
        ongoingDragAction.up(event)
        ongoingDragAction.reset()
        manager.setState({isDragged: false})
        this.ongoingDragAction = null
        this.ongoingActionButtons = null
        manager.pointerDown = false
      }
    } else if (!pointerDown && hoverAction) {
      hoverAction.move(event)
      this.ongoingHoverAction = hoverAction
      manager.engine.scheduleRender().then()
    } else if (pointerDown) {
      // set this here, as this is handled by an buildin pixi-viewport plugin
      // TODO: create an drag event for this
      setCursor('all-scroll')
      manager.engine.scheduleRender().then()
    }
    return true
  }

  wheel = (event: WheelEvent): boolean => {
    const {binder, manager, lastMoveTarget} = this

    manager.engine.scheduleRender().then()

    if (!lastMoveTarget) {
      log('wheel no target')
      return true
    }

    const newEvent = {data: {originalEvent: event}, target: lastMoveTarget} as unknown as RenderEngineEvent

    logFlood('wheel', event)

    // at the moment, the plugin itself is responsible to disable this
    if (manager.wheelPlugin?.paused) manager.wheelPlugin?.resume()

    const action = binder.getAction(newEvent, POINTER_PRESS_TYPES.normal, ACTION_TYPES.wheel)
    if (action) {
      action.wheel(event)
    }

    // track wheel navZoomFree with timeout
    if (this.wheelTrackerEnabled) {
      this.trackAction('navZoomFree', 'wheel')
      this.wheelTrackerEnabled = false
      setTimeout(() => (this.wheelTrackerEnabled = true), 10000)
    }

    return true
  }

  /**
   * Set the current pointer of the pixi viewport
   * @param cursor
   */
  setCursor = (cursor: string): void => {
    logFlood('set cursor', cursor)
    this.viewport.cursor = cursor
  }

  numberOfNestingParents = (node: PixiNode, depth = 0): number => {
    if (!node.isRoot || !node) {
      depth = this.numberOfNestingParents(node.parentNode, (depth += 1))
    }
    return depth
  }

  trackAction = (action: string, method: string, nestingParents?: number): void => {
    const details: Record<string, unknown> = {method, nestingParents}
    if (this.trackNumberOfSelected > 1) details.selected = this.trackNumberOfSelected

    track({action, details})
  }
}

export default PointerEventHandler
