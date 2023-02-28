import * as PIXI from 'pixi.js'
import {IPointData} from 'pixi.js'
import debug from 'debug'
import CONFIG from '../../../CONFIG'
import {move} from '../../../../store/actions'
import PointerActionDrag from '../PointerActionDrag'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import moveBackToVisible from '../../../elements/node/utils/moveBackToVisible'
import {RenderEngineEvent} from '../../../types'
import type PixiNode from '../../../PixiNode'
import {track} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeMove')
const logFlood = log.extend('FLOOD', '::')

type State = {
  node: PixiNode
  dragNodes: Set<PixiNode>
  dragStart: PIXI.IPointData
  nodesStarts: Map<PixiNode, PIXI.IPointData>
  startNode?: PixiNode
  turned?: boolean
  isTurned?: boolean
  isMoved?: boolean
}

class NodeMove extends PointerActionDrag {
  isChanging = true

  category = TARGET_CATEGORIES.node

  cursor = 'grab'

  dragCursor = 'grabbing'

  state: State | null = null

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node || node.isRoot) return

    log('down', node)

    const dragNodes = node.state.isSelected
      ? new Set([...node.parentNode.childNodes].filter(n => n.state.isSelected))
      : new Set([node])

    this.state = {
      dragStart: event.data.getLocalPosition(node.parentNode.elements.childrenContainer),
      nodesStarts: new Map(Array.from(dragNodes).map(n => [n, {x: n.x, y: n.y}])),
      node,
      dragNodes,
    }
  }

  turnDragNodes = (position: PIXI.IPointData): void => {
    const {state, manager} = this

    if (!state) return

    const {dragNodes, node} = state

    if (node) {
      node.turn(CONFIG.nodes.dragRotate, position)
    }

    if (dragNodes) {
      ;[...dragNodes]
        .filter(n => n !== node)
        .forEach(n => {
          const middlePoint = {
            x: Math.round(n.width / 2),
            y: Math.round(n.height / 2),
          }

          n.container.zIndex = Number.MAX_SAFE_INTEGER
          n.turn(CONFIG.nodes.dragRotate, middlePoint)
        })

      dragNodes.forEach(n => {
        n.container.interactive = false
        n.container.interactiveChildren = false
        n.setState({isMoving: true})
      })
    }

    state.isTurned = true

    manager.engine.scheduleRender()
  }

  up = (): void => {
    const {manager, state} = this

    if (!state) return
    log('up', state)
    // let childNodes = 0
    // state.dragNodes.forEach(arg => (childNodes += this.getNumberOfNestedChilds(arg) - 1))
    const childNodes = [...state.dragNodes]
      .map(dragNode => this.getNumberOfNestedChilds(dragNode))
      .reduce((acc, v) => acc + v, 0)

    const {dragNodes, node} = state

    track({
      action: 'nodeMove',
      details: {selected: state.dragNodes.size, childNodes, nestingParents: this.getNumberOfNestingParents(node) - 1},
    })
    manager.clearDecollapse()
    if (node.parentNode.isCollapsed) {
      manager.nodeDecollapse(node.parentNode)
    }

    dragNodes.forEach(n => {
      moveBackToVisible(n)
      n.setState({isMoving: false})
    })

    manager.addDispatch([...dragNodes].map(n => move(n))).then()
    manager.nodeGrow(node.parentNode)
    manager.saveNodes().then()
  }

  move = (event: RenderEngineEvent): void => {
    const {manager, state, turnDragNodes} = this
    const {node: targetNode} = event.target
    const {control} = event

    logFlood('move', targetNode, state)

    if (!targetNode || !state) return

    const {node: dragNode, dragNodes, isMoved, isTurned} = state

    if (!isTurned) {
      turnDragNodes(event.data.getLocalPosition(dragNode.container))
    }

    // on the first move the dragNodes are still interactive and thus also be the target
    if (dragNodes.has(targetNode)) return

    // this start node is a node where movements start without it being the parent node. Dont change the parent in that
    // situation, for example when duplicating nodes
    // if we didnt move yet, we have no startNode yet, as only the dragNode is target on the down event
    if (!isMoved) {
      if (targetNode !== dragNode.parentNode) state.startNode = targetNode
    } else if (state.startNode && targetNode !== state.startNode && !targetNode.isChildOf(state.startNode)) {
      // reset the startNode, if we moved into another node, that is not a child of the start node, so you can move
      // out to then move back in again. The start node is also deleted from the state, as it is not relevant anymore
      delete state.startNode
    }

    const {nodesStarts, dragStart, startNode} = state

    const parentNode = startNode ? dragNode.parentNode : targetNode

    if (parentNode !== dragNode.parentNode) {
      dragNodes.forEach(n => n.setParent(parentNode))
      parentNode.setCache(false)
      log('new parent in move node', dragNode.id, parentNode.id, state)

      // recollapse the old decollapsed node
      manager.recollapse()
      if (parentNode.isCollapsed) {
        manager.decollapse(parentNode)
      }
    }

    const position = event.data.getLocalPosition(parentNode.elements.childrenContainer)

    const dragNodeStart = nodesStarts.get(dragNode) as IPointData

    dragNode.move(
      dragNodeStart.x + position.x - dragStart.x,
      dragNodeStart.y + position.y - dragStart.y,
      !control,
      dragNode.siblingNodes.filter(sibling => !dragNodes.has(sibling)),
    )

    const deltaX = dragNode.x - dragNodeStart.x
    const deltaY = dragNode.y - dragNodeStart.y

    Array.from(dragNodes)
      .filter(n => n !== dragNode)
      .forEach(n =>
        n.move(
          (nodesStarts.get(n) as IPointData).x + deltaX,
          (nodesStarts.get(n) as IPointData).y + deltaY,
          !control,
          n.siblingNodes.filter(sibling => !dragNodes.has(sibling) || sibling === dragNode),
        ),
      )

    state.isMoved = true
  }

  reset = (): void => {
    const {state} = this

    if (!state) return

    const {dragNodes} = state

    log('reset')

    if (dragNodes) {
      dragNodes.forEach(n => {
        n.turn(0, {x: 0, y: 0})
        n.container.interactive = n.isCached
        n.container.interactiveChildren = true
      })
    }
    this.state = null
  }

  getNumberOfNestedChilds = (node: PixiNode): number =>
    node.childNodes.size + [...node.childNodes].map(this.getNumberOfNestedChilds).reduce((acc, v) => acc + v, 0)

  getNumberOfNestingParents = (node: PixiNode, depth = 0): number => {
    if (!node.isRoot || !node) {
      depth = this.getNumberOfNestingParents(node.parentNode, (depth += 1))
    }
    return depth
  }
}

export {NodeMove}
