import * as PIXI from 'pixi.js'

import {HORIZONTAL_CONTAINER_ALIGN, HorizontalContainer} from '../../pixi/HorizontalContainer'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import {IDisplayObjectTypeCategoryNode} from '../types'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NodeCheckBox from './NodeCheckBox'
import NodeTag from './NodeTag'
import {NodeDetail} from './NODE_DETAILS'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'

const OPTIONS = {
  space: CONFIG.nodes.headerMarkup.space,
  align: HORIZONTAL_CONTAINER_ALIGN.center,
  lineHeight: CONFIG.nodes.gridSize,
  marginLeft: CONFIG.nodes.gridSize,
  marginRight: CONFIG.nodes.gridSize,
} as const

class NodeHeaderMarkups extends HorizontalContainer implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.headerMarkups

  category = TARGET_CATEGORIES.node

  sortableChildren = true

  elements: {
    checkbox?: NodeCheckBox
    tags: Map<string, NodeTag>
  } = {
    tags: new Map(),
  }

  static isShown(node: PixiNode): boolean {
    return NodeCheckBox.isShown(node) || NodeTag.isShown(node)
  }

  constructor(public node: PixiNode) {
    super(OPTIONS)
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeHeaderMarkups
  }

  redrawTo(graphics: PIXI.Graphics, nodeDetail: NodeDetail) {
    const {elements} = this
    if (elements.checkbox) {
      elements.checkbox.redrawTo(graphics, nodeDetail, this)
    }
    if (elements.tags.size > 0) {
      elements.tags.forEach(nodeTag => {
        nodeTag.redrawTo(graphics, nodeDetail, this)
      })
    }
  }

  redrawCheckbox(): void {
    const {node, elements} = this
    if (NodeCheckBox.isShown(node)) {
      if (!elements.checkbox) {
        elements.checkbox = new NodeCheckBox(node)
        this.addChild(elements.checkbox)
      }
      elements.checkbox.redraw()
    } else if (elements.checkbox) {
      this.removeChild(elements.checkbox)
      delete elements.checkbox
    }
  }

  redrawTags(nodeDetail: NodeDetail): void {
    const {node, elements} = this
    if (NodeTag.isShown(node)) {
      node.tags.forEach((tag, i) => {
        let nodeTag = elements.tags.get(tag)
        if (!nodeTag) {
          nodeTag = new NodeTag(node, i)
          elements.tags.set(tag, nodeTag)
          this.addChild(nodeTag)
        }
        nodeTag.redraw(nodeDetail)
      })
      Object.entries(elements.tags).forEach(([tag, nodeTag]) => {
        if (!node.tags.includes(tag)) {
          this.removeChild(nodeTag)
          elements.tags.delete(tag)
        }
      })
    } else if (elements.tags) {
      elements.tags.forEach(nodeTag => {
        this.removeChild(nodeTag)
      })
      elements.tags.clear()
    }
  }

  redraw(nodeDetail: NodeDetail): void {
    const {height} = this
    const {headerHeight, width} = this.node
    this.y = headerHeight - CONFIG.nodes.text.paddingBottom - height
    this.x = CONFIG.nodes.text.paddingLeft
    this.width = width
    this.redrawCheckbox()
    this.redrawTags(nodeDetail)
    this.sortChildren()
  }
}

export default NodeHeaderMarkups
