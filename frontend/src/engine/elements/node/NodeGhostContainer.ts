import * as PIXI from 'pixi.js'
import NodeChildGhost from './NodeChildGhost'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import NodeChildExpandGhost from './NodeChildExpandGhost'
import {IDisplayObjectTypeCategoryNode} from '../types'

const siblingGhostFilter = (node: PixiNode): boolean => node.state.isSelected && !node.state.isMoving

class NodeGhostContainer extends PIXI.Container implements IDisplayObjectTypeCategoryNode {
  isMasked = true

  type = NODE_ELEMENT_TYPES.childGhostContainer

  category = TARGET_CATEGORIES.node

  static isShown(node: PixiNode) {
    if (!node.engine.store.isWriteable || !node.engine.eventManager.state.showGhosts) return false

    return (node.state.isSelected && !node.isCollapsed) || Boolean([...node.childNodes].find(siblingGhostFilter))
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeGhostContainer
  }

  redraw(): void {
    const {node} = this
    const {isCollapsed, childNodes, scale, headerHeight} = this.node
    const {childrenPaddingLeft} = CONFIG.nodes
    const {isSelected} = this.node.state
    const {eventManager} = this.node.engine

    this.removeChildren()

    if (!eventManager.state.showGhosts) return

    const ghosts = []

    ;[...childNodes].filter(siblingGhostFilter).forEach(selectedChild => {
      const {candidate: childGhostPosition, nodeAbove} = node.getFreeChildPosition(selectedChild)
      ghosts.push(new NodeChildGhost(childGhostPosition, node, nodeAbove))

      if (selectedChild.hasExpandGhost()) {
        ghosts.push(new NodeChildExpandGhost(selectedChild))
      }
    })

    // if this node is selected, create a new node
    if (isSelected && !isCollapsed && (!node.image || (node.image && node.childNodes.size > 0))) {
      const {candidate, nodeAbove} = node.getFreeChildPosition({parentNode: node})
      ghosts.push(new NodeChildGhost(candidate, node, nodeAbove))
    }

    if (ghosts.length > 0) {
      this.scale = new PIXI.Point(scale, scale) as PIXI.ObservablePoint
      this.y = headerHeight
      this.x = childrenPaddingLeft

      ghosts.forEach(g => this.addChild(g))
    }
  }
}

export default NodeGhostContainer
