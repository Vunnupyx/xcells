import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeCheckBoxToggle')

class NodeCheckBoxToggle extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.node

  cursor = 'pointer'

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

    manager.toggleCheckbox(node).then()

    trackAction('toggleCheckbox', {method: 'PointerAction'})
  }
}

export {NodeCheckBoxToggle}
