import type PointerAction from './PointerAction'
import type EventManager from '../EventManager'
import {RenderEngineEvent} from '../../types'

/**
 * Wrapper used to combine actions. It does not need type or category as it is used to combine actions in the binder if
 * they overlap.
 */
class PointerActionCombination implements PointerAction {
  /**
   * Fast detection of the class.
   * @type {boolean}
   */
  isWrapper = true

  /**
   * Store all added actions in this set, to call them separately
   * @type {Set<PointerAction>}
   * @private
   */
  actions: Set<PointerAction> = new Set()

  /**
   * state to hold information between down and up of a click
   * @type {Object}
   */
  state: Record<string, unknown> | null = null

  constructor(actionList: PointerAction[]) {
    const {add} = this

    if (actionList.length === 0) {
      throw new Error('PointerActionCompination must be initialized with at least one action')
    }

    actionList.forEach(add)
  }

  get type(): string {
    const {actions} = this
    return actions.size > 0 ? Array.from(actions)[0].type : ''
  }

  get category(): string {
    const {actions} = this
    return actions.size > 0 ? Array.from(actions)[0].category : ''
  }

  get cursor(): string | null {
    const {actions} = this
    return (
      Array.from(actions)
        .find(a => a.getCursor())
        ?.getCursor() || null
    )
  }

  getCursor(): string | null {
    return this.cursor
  }

  get manager(): EventManager {
    const {actions} = this
    return Array.from(actions)[0].manager
  }

  /**
   * Is this action changing the map and so should not work with read-only maps?
   * @type {boolean}
   */
  get isChanging(): boolean {
    const {actions} = this
    return Boolean(Array.from(actions).every(a => a.isChanging))
  }

  /**
   * Add actions. The action will depending on the order it was added called when a pointer event is given to this
   * wrapper
   * @param action
   */
  add = (action: PointerAction): void => {
    this.actions.add(action)
  }

  filter = (action: PointerAction): boolean => {
    const {manager} = this
    return manager.store.isWriteable || !action.isChanging
  }

  /**
   * Remove an action from the wrapper.
   * @param action
   */
  delete = (action: PointerAction): void => {
    this.actions.delete(action)
  }

  down = (event: RenderEngineEvent): void => {
    Array.from(this.actions)
      .filter(this.filter)
      .forEach(a => a.down(event))
  }

  up = (event: RenderEngineEvent): void => {
    Array.from(this.actions)
      .filter(this.filter)
      .forEach(a => a.up(event))
  }

  move = (event: RenderEngineEvent): void => {
    Array.from(this.actions)
      .filter(this.filter)
      .forEach(a => a.move(event))
  }

  wheel = (event: WheelEvent): void => {
    Array.from(this.actions)
      .filter(this.filter)
      .forEach(a => a.wheel(event))
  }

  reset = (): void => {
    Array.from(this.actions)
      .filter(this.filter)
      .forEach(a => a.reset())
  }
}

export default PointerActionCombination
