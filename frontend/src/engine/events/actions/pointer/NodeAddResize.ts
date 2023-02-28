import * as PIXI from 'pixi.js'
import debug from 'debug'

import PointerActionDrag from '../PointerActionDrag'
import EDIT_MODES from '../../EDIT_MODES'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeAddResize')
const logFlood = log.extend('FLOOD', '::')

type State = {
  startPosition: PIXI.IPointData
}

class NodeAddResize extends PointerActionDrag {
  isChanging = true

  category = TARGET_CATEGORIES.node

  cursor = 'plus'

  dragCursor = 'nwse-resize'

  state: State | null = null

  // used also in long click function
  down = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {node} = event.target || {}

    if (!node) return

    const addNode = manager.getAddNode()

    const startPosition = event.data.getLocalPosition(node.elements.childrenContainer)

    log('down', node, addNode, startPosition)

    addNode.move(startPosition.x, startPosition.y, true)

    this.state = {startPosition}
  }

  up = (): void => {
    const {manager, state} = this

    if (!state) return

    log('up', state)

    const addNode = manager.getAddNode()

    manager.saveAddNode(true)

    manager.nodeGrow(addNode.parentNode)
    manager.saveNodes()

    manager.selectSingleNode(addNode)

    addNode.openTextField('', 'end')

    trackAction('addedResizedNode', {method: 'PointerAction'})

    manager.setMode(EDIT_MODES.navigate)
  }

  move = (event: RenderEngineEvent): void => {
    const {manager, state} = this
    const {control} = event

    logFlood('move', state)

    if (!state) return

    const {startPosition} = state

    const isOffGrid = control && manager.mode === EDIT_MODES.addNode

    const addNode = manager.getAddNode()
    addNode.setCache(false)

    const position = manager.getPositionParent(addNode, event)

    // allow creating nodes moving from bottom right to top left
    const x = Math.min(position.x, startPosition.x)
    const y = Math.min(position.y, startPosition.y)
    const width = Math.max(position.x - startPosition.x, startPosition.x - position.x)
    const height = Math.max(position.y - startPosition.y, startPosition.y - position.y)
    addNode.move(x, y, !isOffGrid)
    addNode.resize(width, height, !isOffGrid)
  }
}

export {NodeAddResize}
