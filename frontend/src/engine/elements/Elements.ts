import * as PIXI from 'pixi.js'

abstract class Elements extends PIXI.Container {
  abstract type: string

  abstract category: string

  interactive = false

  interactiveChildren = true

  /**
   * @todo: obsolete: remove when not used anymore, the rootParent needs also to be adapted first
   */
  get container(): PIXI.Container {
    return this
  }
}

export default Elements
