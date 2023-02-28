import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeZoomTo')

class NodeZoomTo extends PointerActionClick {
  isChanging = false

  category = TARGET_CATEGORIES.node

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    this.state = {node}
  }

  up = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {node} = event.target || {}

    if (!node) return

    log('up', node)

    manager.zoomToNode(node)
    trackAction('zoomToNode', {method: 'PointerAction'})
  }
}

export {NodeZoomTo}
