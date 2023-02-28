import debug from 'debug'

import {IPointData} from 'pixi.js'
import {move, rescale} from '../../../../store/actions'
import PointerActionDrag from '../PointerActionDrag'
import {length, ORIGIN} from '../../../../utils/points'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import moveBackToVisible from '../../../elements/node/utils/moveBackToVisible'
import type PixiNode from '../../../PixiNode'
import {RenderEngineEvent} from '../../../types'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeResize')
const logFlood = log.extend('FLOOD', '::')

type State = {
  startLength?: number
  startScale?: number
  fromNorthEast?: IPointData
  node?: PixiNode
  isResizing?: boolean
  isMoved?: boolean
  isScaling?: boolean
}

class NodeResize extends PointerActionDrag {
  isChanging = true

  category = TARGET_CATEGORIES.node

  dragCursor = 'nwse-resize'

  state: State = {}

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('start resize', node)

    const position = event.data.getLocalPosition(node.parentNode.elements.childrenContainer)

    node.container.zIndex = Number.MAX_SAFE_INTEGER

    this.state = {
      startLength: length(event.data.getLocalPosition(node.container), ORIGIN),
      startScale: node.scale,
      // - size - nodepos + pos
      fromNorthEast: {
        x: -node.width - node.x + position.x,
        y: -node.height - node.y + position.y,
      },
      node,
    }
  }

  up = (): void => {
    const {manager} = this
    const {isResizing, isScaling, node, isMoved} = this.state || {}

    if (!node) return

    log('stop resize', node)

    if (isMoved && (isResizing || isScaling)) {
      const isMovedBack = moveBackToVisible(node)

      const actions = []
      if (isMovedBack) actions.push(move(node))
      if (isResizing) {
        manager.saveNodes()
      }
      if (isScaling) actions.push(rescale(node))
      manager.addDispatch(actions)
      trackAction('nodeResizeOrScale', {method: 'PointerAction', isMovedBack, isResizing, isScaling})
    }
  }

  move = (event: RenderEngineEvent): void => {
    const {manager, state} = this
    const {fromNorthEast, startLength, startScale, node} = this.state || {}
    const {control} = event
    const {shiftKey} = event.data.originalEvent

    if (!node || !state) return

    if (!fromNorthEast || startLength === undefined || !startScale) throw Error('State of NodeResize.move incomplete')

    state.isMoved = true
    // ctrl will scale AND resize, shift only scale and ctrl + shift scale and resize at the same time,
    // independent from the grid
    const isScaling = control || shiftKey
    const isResizing = !shiftKey

    logFlood('move', {isScaling, isResizing, event, shiftKey, control})

    if (isResizing) {
      logFlood('resize')
      if (!state.isResizing) {
        manager.initNodeResize(node)
      }

      const position = event.data.getLocalPosition(node.parentNode.elements.childrenContainer)
      // - nodepos + pos - fromNE
      const width = -node.x + position.x - fromNorthEast.x
      const height = -node.y + position.y - fromNorthEast.y
      if (control) {
        node.resize(width, height, false)
      } else {
        manager.nodeResize(node, width, height)
      }
      state.isResizing = true
    }
    if (isScaling) {
      const movedLength = length(event.data.getLocalPosition(node.container), ORIGIN)
      logFlood('scale', (movedLength / startLength) * startScale)
      node.scaling((movedLength / startLength) * startScale, !control)
      state.isScaling = true
    }
  }
}

export {NodeResize}
