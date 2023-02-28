import debug from 'debug'

import PointerActionWheel from '../PointerActionWheel'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeScaleWheel')

class NodeScaleWheel extends PointerActionWheel {
  isChanging = true

  category = TARGET_CATEGORIES.node

  wheel = (event: WheelEvent): void => {
    const {manager} = this
    const {hoverNode: node} = manager
    // TODO: extract shift into keybinding
    const {shiftKey} = event

    if (!node) {
      log('no hover node')
      return
    }

    log('wheel', node)

    if (shiftKey) {
      manager.wheelPlugin?.pause()
      const {deltaY} = event
      if (deltaY > 0) {
        manager.scaleDown(node)
        trackAction('nodeScaleWheel', {method: 'PointerAction', direction: 'down'})
      } else {
        manager.scaleUp(node)
        trackAction('nodeScaleWheel', {method: 'PointerAction', direction: 'up'})
      }
    }
  }
}

export {NodeScaleWheel}
