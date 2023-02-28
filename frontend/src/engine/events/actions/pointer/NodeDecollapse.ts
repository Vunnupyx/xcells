import debug from 'debug'
import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import type PixiNode from '../../../PixiNode'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeDecollapse')

type State = {
  node: PixiNode
}

class NodeDecollapse extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.node

  state: State | null = null

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    this.state = {node}
  }

  up = (): void => {
    const {manager, state} = this

    if (!state) return

    const {node} = state

    if (!node) return

    log('up', node)

    // TODO: move to EventController
    if (node.isCollapsed) {
      manager.nodeDecollapse(node)
      manager.saveNodes()
      trackAction('decollapseNode', {method: 'PointerAction'})
    }
  }
}

export {NodeDecollapse}
