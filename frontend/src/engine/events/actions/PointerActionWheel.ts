import ACTION_TYPES from './ACTION_TYPES'
import PointerAction from './PointerAction'

/**
 * This class of actions will ignore all touch and mouse events besides the mouse wheel.
 * @abstract
 */
abstract class PointerActionWheel extends PointerAction {
  type: string = ACTION_TYPES.wheel

  up = (): void => {
    // ignored on purpose
  }

  down = (): void => {
    // ignored on purpose
  }

  move = (): void => {
    // ignored on purpose
  }

  /**
   * @abstract
   */
  abstract wheel(event: WheelEvent): void
}

export default PointerActionWheel
