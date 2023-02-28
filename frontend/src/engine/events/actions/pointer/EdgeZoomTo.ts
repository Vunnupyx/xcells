import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:EdgeZoomTo')

class EdgeZoomTo extends PointerActionClick {
  isChanging = false

  category = TARGET_CATEGORIES.edge

  down = (event: RenderEngineEvent): void => {
    const {edge} = event.target || {}

    if (!edge) return

    log('down', edge)

    this.state = {edge}
  }

  up = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {edge} = event.target || {}

    if (!edge) return

    log('up', edge)

    manager.zoomToEdge(edge)
  }
}

export {EdgeZoomTo}
