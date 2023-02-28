import type EventManager from '../EventManager'
import {RenderEngineEvent} from '../../types'

/**
 * Abstracts all pointer actions, provides constructor and basic reset function, and makes sure all decendent actions
 * define the abstract attributes.
 * @abstract
 */
abstract class PointerAction {
  /**
   * to differentiate between PointerActions and PointerActionCombinations
   */
  isWrapper = false

  /**
   * type of pointer action
   * @see ACTION_TYPES
   * @type {string}
   */
  abstract type: string

  /**
   * category of object, e.g. edge, node or ghost
   * @type {string}
   */
  abstract category: string

  /**
   * to make changes to the global event state
   * @type {EventManager}
   */
  manager: EventManager

  /**
   * cursor when hovering over. Only works, if the binding is for left mouse button
   * @see BUTTONS.left
   * @see PointerEventBinder.getCursor
   * @type {string}
   */
  cursor: string | null = null

  /**
   * return the cursor attribute or allow subclasses to generate dynamic cursors
   */
  getCursor(): string | null {
    return this.cursor
  }

  /**
   * state to hold information between down and up of a click
   * @type {Object}
   */
  state: Record<string, unknown> | null = null

  /**
   * Is this action changing the map and so should not work with read-only maps?
   * @type {boolean}
   */
  abstract isChanging: boolean

  /**
   * Pass in the EventManager to be able to change global event state
   * @param manager
   */
  constructor(manager: EventManager) {
    this.manager = manager
  }

  /**
   * Triggered when a mouse button is pressed down or a touch starts
   * @abstract
   */
  abstract down(event: RenderEngineEvent): void

  /**
   * Triggered when a mouse button is released or a touch ends
   * @abstract
   */
  abstract up(event: RenderEngineEvent): void

  /**
   * Triggered when a mouse or a touch event is moving
   * @abstract
   */
  abstract move(event: RenderEngineEvent): void

  /**
   * Triggered by the mouse wheel
   * @abstract
   */
  abstract wheel(event: WheelEvent): void

  /**
   * abort the current state, e.g. when a click turns into a drag, the click action will be reset
   */
  reset = (): void => {
    this.state = null
  }
}

export default PointerAction
