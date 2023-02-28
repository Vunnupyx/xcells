import debug from 'debug'

import PointerActionHover from '../PointerActionHover'
import EDIT_MODES from '../../EDIT_MODES'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:NodeAddHover')
const logFlood = log.extend('FLOOD', '::')

class NodeAddHover extends PointerActionHover {
  isChanging = true

  category = TARGET_CATEGORIES.node

  move = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {node: targetNode} = event.target
    const {control} = event

    logFlood('move', targetNode)

    const addNode = manager.getAddNode()
    if (!targetNode || !addNode || targetNode === addNode) return

    const isOffGrid = control && manager.mode === EDIT_MODES.addNode

    const position = manager.getPosition(targetNode, event)

    if (targetNode !== addNode.parentNode) {
      addNode.setParent(targetNode)
      log('new parent in add node', addNode, targetNode)

      // recollapse the node if a node was decollapsed
      manager.recollapse()
      if (targetNode.isCollapsed) {
        manager.decollapse(targetNode)
      }
      addNode.setCache(false)
    }
    addNode.move(position.x, position.y, !isOffGrid)
  }

  reset = (): void => {
    const {manager} = this
    manager.deleteAddNode()
  }
}

export {NodeAddHover}
