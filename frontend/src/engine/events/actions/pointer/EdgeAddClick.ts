import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import type PixiNode from '../../../PixiNode'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:EdgeAddClick')

type State = {
  node: PixiNode
}

/**
 * When a click occurs, a node is created at that point. This does not move a temporary node arround nor allow for
 * a resizing of the created node. For these functions:
 * @see NodeAddResize
 * @see NodeAddHover
 */
class EdgeAddClick extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.node

  state: State | null = null

  down = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    manager.getAddEdges(node)

    this.state = {node}
  }

  up = (): void => {
    const {manager, state} = this

    if (!state) return

    const {node} = state

    if (!node) return

    log('up', node)

    const edges = manager.getAddEdges(node)
    manager.saveAddEdges()

    Array.from(manager.selectedNodes).forEach(n => manager.unselectNode(n))
    edges.forEach(e => manager.selectEdge(e))
  }
}

export {EdgeAddClick}
