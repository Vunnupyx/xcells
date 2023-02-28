import type EventManager from '../EventManager'

/**
 * @abstract
 */
class AbstractEventBinder {
  /**
   * stores and handles the state
   * @type {EventManager}
   */
  manager: EventManager

  constructor(manager: EventManager) {
    this.manager = manager
  }
}

export default AbstractEventBinder
