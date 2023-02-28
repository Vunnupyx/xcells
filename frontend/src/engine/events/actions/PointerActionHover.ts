import ACTION_TYPES from './ACTION_TYPES'
import PointerAction from './PointerAction'
import {RenderEngineEvent} from '../../types'

/**
 * This class of actions will ignore up, down and wheel events and is only there for hovering and cursor changes
 * @see NodeAddHover
 * @abstract
 */
abstract class PointerActionHover extends PointerAction {
  type: string = ACTION_TYPES.hover

  up = (): void => undefined

  down = (): void => undefined

  /**
   * @abstract
   */
  abstract move(event: RenderEngineEvent): void

  wheel = (): void => undefined
}

export default PointerActionHover
