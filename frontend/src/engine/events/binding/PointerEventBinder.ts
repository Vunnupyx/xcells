import debug from 'debug'

import AbstractEventBinder from './AbstractEventBinder'
import * as pointerActions from '../actions/pointer'

import type PointerActionClick from '../actions/PointerActionClick'
import EDIT_MODES from '../EDIT_MODES'
import POINTER_PRESS_TYPES from '../POINTER_PRESS_TYPES'
import NODE_ELEMENT_TYPES from '../../elements/node/NODE_ELEMENT_TYPES'
import PointerActionCombination from '../actions/PointerActionCombination'
import ACTION_TYPES from '../actions/ACTION_TYPES'
import EventManager from '../EventManager'

import DEFAULT_BINDINGS from './DEFAULT_BINDINGS'
import BUTTONS from './BUTTONS'
import cartesianProduct from '../../../utils/cartesianProduct'
import {PointerAction, PointerActions, PointerBinding, RenderEngineEvent} from '../../types'

const log = debug('app:Event:PointerEventBinder')
const logFlood = log.extend('FLOOD', '::')

/**
 * To bind and event to an action this class will create and index stored in bindings and allow to deceide which action
 * should be chosen based on an incoming event, the events target and the current edit mode.
 *
 * This class is also able to attach user defined bindings to the currently available bindings.
 *
 * @see EventManager.mode
 * @see DEFAULT_BINDINGS
 * @see PointerEventHandler
 */
class PointerEventBinder extends AbstractEventBinder {
  /**
   * An index to access actions for arriving events fast
   * @type {Map<string, PointerActionClick>}
   * @private
   */
  bindings: Map<string, PointerActionClick> = new Map()

  /**
   * Instances for all the available actions
   * @private
   * @type {{string: PointerAction}}
   */
  actions: PointerActions

  /**
   * Attach the manager to the instance, initialize actions and register default bindings
   * @param manager
   */
  constructor(manager: EventManager) {
    super(manager)

    const {register, createActions} = this

    log('initialize', this)

    this.actions = createActions(manager)
    DEFAULT_BINDINGS.forEach(register)
  }

  /**
   * unset all instance variables
   */
  destroy(): void {
    this.actions = {}
    this.bindings = new Map()
  }

  /**
   * Instantiate the action classes, because they need the event manager
   * @private
   * @param manager
   * @returns {string: PointerAction}
   */
  createActions = (manager: EventManager): PointerActions => {
    // instantiate the actions with the given manager
    const actions = Object.fromEntries(
      Object.entries(pointerActions).map(([name, PointerActionCls]) => [name, new PointerActionCls(manager)]),
    )
    log('created actions', actions)

    return actions as PointerActions
  }

  /**
   * Uses parameters from binding or an event to generate an string index to reference actions fast, for example in
   * move events
   * @param mode
   * @param element
   * @param category
   * @param buttons
   * @param pointerPressType
   * @param actionType
   * @returns {string}
   */
  static getBindIndex = (
    mode: string,
    element: string,
    category: string,
    buttons: number,
    pointerPressType: string,
    actionType: string,
  ): string => {
    return `${mode}-${element}-${category}-${buttons}-${pointerPressType}-${actionType}`
  }

  /**
   * Register a binding and create an index to allow a fast access to actions while events are handled
   * @param binding
   */
  register = (binding: PointerBinding): void => {
    const {bindings, actions, getAllIndexes} = this
    const {actionName} = binding
    const action = actions[actionName]

    log('register binding', binding, action)

    getAllIndexes(binding).forEach(index => {
      logFlood('register binding index', index)

      const presentAction = bindings.get(index)

      if (!presentAction) {
        bindings.set(index, action)
      } else if (presentAction.isWrapper) {
        // there exists already a binding for this, so we need to wrap the several actions
        // @ts-ignore type was checked above in a fast way, as `instanceof` is expensive
        presentAction.add(action)
      } else {
        const wrapper = new PointerActionCombination([presentAction, action])
        bindings.set(index, wrapper)
      }
    })
  }

  /**
   * Remove a binding from the binder
   * @param binding
   */
  unregister = (binding: PointerBinding): void => {
    const {bindings, getAllIndexes} = this

    getAllIndexes(binding).forEach(index => {
      log('unregistered action', index)

      bindings.delete(index)
    })
  }

  /**
   * Create all indexes that are used in a binding
   * @param binding
   * @returns [string] list of indexes of the binding, there is at least one
   * @private
   */
  getAllIndexes = (binding: PointerBinding): string[] => {
    const {actions} = this
    const {getBindIndex} = PointerEventBinder
    const {
      actionName,
      buttons = BUTTONS.left,
      mode = Object.values(EDIT_MODES),
      element = NODE_ELEMENT_TYPES.container,
      type = POINTER_PRESS_TYPES.normal,
    } = binding

    const elements = Array.isArray(element) ? element : [element]
    const modes = Array.isArray(mode) ? mode : [mode]
    const action = actions[actionName]

    return cartesianProduct(elements, modes).map(([e, m]) =>
      getBindIndex(m, e, action.category, buttons, type, action.type),
    )
  }

  /**
   * Analyse an event and return the action bound to this event
   * @param event
   * @param pointerPressType
   * @param actionType
   * @returns {PointerActionClick}
   */
  getAction = (event: RenderEngineEvent, pointerPressType: string, actionType: string): PointerAction | null => {
    const {bindings, getMode} = this
    const {store} = this.manager
    const {getBindIndex} = PointerEventBinder
    const {type: element, category} = event.target || {}
    // set left click as default for touch events
    const {buttons = BUTTONS.left} = event.data

    const mode = getMode(event)

    const index = getBindIndex(mode, element, category, buttons, pointerPressType, actionType)

    const action = bindings.get(index)

    if (!action) {
      logFlood('no action', index)
      return null
    }

    if (action.isChanging && !store.isWriteable) {
      log('action would change readonly store')
      return null
    }
    log('get action', index, action)
    return action
  }

  /**
   * return the current editMode depending on pressed keys in the event
   * @todo move this to the EventManager and make it switch the mode on keypress, to allow the React Interface to
   *       access that information
   * @param event
   * @returns {string}
   */
  getMode = (event: RenderEngineEvent): EDIT_MODES => {
    const {mode} = this.manager
    const {ctrlKey, metaKey, altKey, shiftKey} = event.data.originalEvent
    const control = ctrlKey || metaKey

    if (altKey && shiftKey && !control) {
      return EDIT_MODES.addEdge
    }
    if (!altKey && shiftKey && control) {
      return EDIT_MODES.addNode
    }
    if (altKey && !shiftKey && !control) {
      return EDIT_MODES.moveNode
    }
    return mode
  }

  /**
   * Get the cursor for the current event when using a normal click. Check first click, then drag and then hover actions
   * @param event
   * @returns {string|null}
   */
  getCursor = (event: RenderEngineEvent): string => {
    const {bindings, getMode} = this
    const {getBindIndex} = PointerEventBinder
    const {buttons = BUTTONS.left} = event.data
    const {type: element, category} = event.target || {}

    const mode = getMode(event)

    const actionIndexes = [
      getBindIndex(mode, element, category, BUTTONS.left, POINTER_PRESS_TYPES.normal, ACTION_TYPES.click),
      getBindIndex(mode, element, category, buttons, POINTER_PRESS_TYPES.normal, ACTION_TYPES.click),
      getBindIndex(mode, element, category, BUTTONS.left, POINTER_PRESS_TYPES.normal, ACTION_TYPES.drag),
      getBindIndex(mode, element, category, buttons, POINTER_PRESS_TYPES.normal, ACTION_TYPES.drag),
      getBindIndex(mode, element, category, buttons, POINTER_PRESS_TYPES.normal, ACTION_TYPES.hover),
    ]

    const index = actionIndexes.find(i => bindings.get(i)?.getCursor())

    return index ? bindings.get(index)?.getCursor() || '' : ''
  }
}

export default PointerEventBinder
