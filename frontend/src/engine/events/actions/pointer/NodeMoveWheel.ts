import debug from 'debug'

import PointerActionWheel from '../PointerActionWheel'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {advancedNavigation} from '../../../../contexts/experimentalFeatures'

const log = debug('app:Event:NodeMoveWheel')

/** Move the scene using mouse wheels */
class NodeMoveWheel extends PointerActionWheel {
  isChanging = false

  category = TARGET_CATEGORIES.node

  wheel = (event: WheelEvent): void => {
    const {manager} = this

    if (!advancedNavigation()) {
      manager.toggleWheelZoom(true) // ensure backwards compatibility after turning off the toggle
      return // because functionality disabled via feature toggle
    }

    const shift = event.shiftKey

    if (event.deltaX !== 0) {
      log('horizontal move wheel')
      manager.moveViewport(-event.deltaX, 0)
      manager.toggleWheelZoom(false)
    } else if (event.deltaY !== 0 && shift) {
      log('vertical move wheel')
      manager.moveViewport(0, -event.deltaY)
      manager.toggleWheelZoom(false)
    } else {
      // reset default wheel behavior (zooming)
      manager.toggleWheelZoom(true)
    }
  }
}

export {NodeMoveWheel}
