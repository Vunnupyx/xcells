import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:GhostExpand')

class GhostExpand extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.ghost

  cursor = 'pointer'

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    this.state = {node}
  }

  up = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {node: nodeTarget} = event.target || {}
    const {node: nodeDown} = this.state || {}

    if (!nodeTarget || nodeTarget !== nodeDown) return

    log('up', nodeTarget)

    manager.createChildAndSelect(nodeTarget)
  }
}

export {GhostExpand}
