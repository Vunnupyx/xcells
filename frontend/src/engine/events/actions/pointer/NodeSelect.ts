import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:NodeSelect')

class NodeSelect extends PointerActionClick {
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
    const {control} = event

    if (!node) return

    log('up', node)

    const {isSelected} = node.state

    // at this point the event handles a click on a node to select/deselect
    if (control) {
      // select a single node, therefore unselect and remove all the old nodes
      if (!isSelected) {
        manager.selectNode(node)
      } else {
        manager.unselectNode(node)
      }
    } else {
      manager.selectSingleNode(node)
    }
  }
}

export {NodeSelect}
