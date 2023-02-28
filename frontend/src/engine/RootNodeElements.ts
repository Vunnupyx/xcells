import * as PIXI from 'pixi.js'

import Elements from './elements/Elements'
import NodeGhostContainer from './elements/node/NodeGhostContainer'
import NodeChildren from './elements/node/NodeChildren'
import NODE_ELEMENT_TYPES from './elements/node/NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from './TARGET_CATEGORIES'
import type PixiRootNode from './PixiRootNode'
import type PixiNode from './PixiNode'
import CONFIG from './CONFIG'
import NODE_DETAILS from './elements/node/NODE_DETAILS'
import NODE_DETAIL_LEVELS from './elements/node/NODE_DETAIL_LEVELS'

class RootNodeElements extends Elements {
  type = NODE_ELEMENT_TYPES.container

  category = TARGET_CATEGORIES.node

  sortableChildren = true

  elements: {
    ghostContainer: NodeGhostContainer
    children: NodeChildren
  }

  childrenContainer: PIXI.Container

  constructor(public node: PixiRootNode) {
    super()

    // the NodeChildren container has this padding left, so compensate by moving to the left. Then the
    // background grid points aline to the cards
    this.x = -CONFIG.nodes.childrenPaddingLeft

    // @TODO: fix typing by creating a "ParentNode" type
    const pixiNode = node as unknown as PixiNode

    const ghostContainer = new NodeGhostContainer(pixiNode)
    this.addChild(ghostContainer)
    const children = new NodeChildren(pixiNode)
    this.addChild(children)
    this.childrenContainer = children

    this.elements = {
      children,
      ghostContainer,
    }
  }

  redraw(): void {
    const {elements} = this
    elements.ghostContainer.redraw()
    elements.children.redraw(NODE_DETAILS[NODE_DETAIL_LEVELS.normal])
  }
}

export default RootNodeElements
