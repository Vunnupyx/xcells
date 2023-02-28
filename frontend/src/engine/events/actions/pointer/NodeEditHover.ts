import debug from 'debug'

import PointerActionHover from '../PointerActionHover'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeEditHover')
const logFlood = log.extend('FLOOD', '::')

class NodeEditHover extends PointerActionHover {
  isChanging = true

  category = TARGET_CATEGORIES.node

  move = (event: RenderEngineEvent): void => {
    const {node} = event.target

    logFlood('move', node)

    if (!node) return

    const {isSelected, isEdited} = node.state

    if (!isEdited && isSelected) {
      node.openTextField()
      trackAction('editNodeHover', {method: 'PointerAction'})
    }
  }
}

export {NodeEditHover}
