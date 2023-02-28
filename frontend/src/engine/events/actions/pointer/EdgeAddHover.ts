import debug from 'debug'

import PointerActionHover from '../PointerActionHover'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:EdgeAddHover')
const logFlood = log.extend('FLOOD', '::')

class EdgeAddHover extends PointerActionHover {
  isChanging = true

  category = TARGET_CATEGORIES.node

  move = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {node: targetNode} = event.target

    if (!targetNode) return

    logFlood('move', targetNode)
    manager.getAddEdges(targetNode)
  }

  reset = (): void => {
    const {manager} = this
    logFlood('reset')
    manager.deleteAddEdges()
  }
}

export {EdgeAddHover}
