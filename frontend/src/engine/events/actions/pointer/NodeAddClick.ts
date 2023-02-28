import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import type PixiNode from '../../../PixiNode'
import {trackAction} from '../../../../contexts/tracking'
import EDIT_MODES from '../../EDIT_MODES'

const log = debug('app:Event:NodeAddClick')

const numberOfNestingParents = (node: PixiNode, depth = 0): number => {
  if (!node.isRoot) {
    depth = numberOfNestingParents(node.parentNode, (depth += 1))
  }
  return depth
}

/**
 * When a click occurs, a node is created at that point. This does not move a temporary node arround nor allow for
 * a resizing of the created node. For these functions:
 * @see NodeAddResize
 * @see NodeAddHover
 */
class NodeAddClick extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.node

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    this.state = {node}

    const {manager} = this
    const {control} = event

    const addNode = manager.getAddNode()
    if (!node || !addNode || node === addNode) return

    const isOffGrid = control && manager.mode === EDIT_MODES.addNode

    const position = node.elements.childrenContainer.toLocal(event.data.global)

    if (node !== addNode.parentNode) {
      addNode.setParent(node)
      log('new parent in add node', addNode, node)

      // recollapse the node if a node was decollapsed
      manager.recollapse()
      if (node.isCollapsed) {
        manager.decollapse(node)
      }
      addNode.setCache(false)
    }
    addNode.move(position.x, position.y, !isOffGrid)
    addNode.redraw()
  }

  up = (): void => {
    const {manager} = this
    const node = (this.state?.node as PixiNode) || {}

    if (!node) return

    log('up', node)

    // make sure it is there, it will be created in the current hover node at the current mouse pointer position
    const addNode = manager.getAddNode()

    manager.saveAddNode()

    manager.nodeGrow(addNode.parentNode)
    manager.saveNodes()

    manager.selectSingleNode(addNode)

    // addNode.openTextField('', 'end')
    addNode.openTextField(addNode.title, 'selectAll')

    trackAction('nodeAdd', {method: 'PointerAction', nestingParents: numberOfNestingParents(node)})

    manager.setMode(EDIT_MODES.navigate)
  }
}

export {NodeAddClick}
