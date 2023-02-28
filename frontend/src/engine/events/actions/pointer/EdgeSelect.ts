import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:NodeSelect')

class EdgeSelect extends PointerActionClick {
  isChanging = false

  category = TARGET_CATEGORIES.edge

  cursor = 'pointer'

  down = (event: RenderEngineEvent): void => {
    const {edge} = event.target || {}

    if (!edge) return

    log('down', edge)

    this.state = {edge}
  }

  up = (event: RenderEngineEvent): void => {
    const {manager, reset} = this
    const {edge} = event.target || {}
    const {control} = event

    if (!edge) return

    log('up', edge)

    const {isSelected} = edge.state

    log('select edge', {edge, control, isSelected})
    if (control) {
      // select a single node, therefore unselect and remove all the old nodes
      if (!isSelected) {
        manager.selectEdge(edge)
      } else {
        manager.unselectEdge(edge)
      }
    } else {
      manager.selectSingleEdge(edge)
    }

    reset()
  }
}

export {EdgeSelect}
