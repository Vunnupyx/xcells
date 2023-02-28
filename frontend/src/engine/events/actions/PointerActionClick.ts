import ACTION_TYPES from './ACTION_TYPES'
import PointerAction from './PointerAction'
import {RenderEngineEvent} from '../../types'

/**
 * For simple down and up events. Ignores movement and mouse wheel.
 * @see NodeAddClick
 * @see NodeDownloadFile
 * @abstract
 */
abstract class PointerActionClick extends PointerAction {
  type: string = ACTION_TYPES.click

  /**
   * @abstract
   */
  abstract down(event: RenderEngineEvent): void

  /**
   * @abstract
   */
  abstract up(event: RenderEngineEvent): void

  move: (e: RenderEngineEvent) => void = (): void => {
    // ignored on purpose
  }

  wheel: (e: WheelEvent) => void = (): void => {
    // ignored on purpose
  }
}

export default PointerActionClick
