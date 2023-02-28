import ACTION_TYPES from './ACTION_TYPES'
import PointerAction from './PointerAction'

/**
 * Abstract class for drag actions. Ignores wheel events.
 * @see NodeMove
 * @see NodeAddResize
 * @abstract
 */
abstract class PointerActionDrag extends PointerAction {
  type: string = ACTION_TYPES.drag

  /**
   * while the normal cursor is used, when a hover occurs (only for left click bindings), this cursor is drawn when
   * the drag action is in progress
   * @type {string}
   */
  dragCursor = ''

  wheel = (): void => undefined
}

export default PointerActionDrag
