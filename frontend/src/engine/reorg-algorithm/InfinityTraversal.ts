import CONFIG from '../CONFIG'
import EventManager from '../events/EventManager'
import PixiNode from '../PixiNode'
import ICardPacker from './ICardPacker'
import {getDimsToFitContent, getHeaderDims} from './PixiNodeMeasure'

class InfinityTraversal {
  public static readonly INFINITE_DEPTH = -1

  private rootNode: PixiNode

  private packer: ICardPacker

  private changedNodes: Map<string, PixiNode>

  private manager: EventManager

  constructor(rootNode: PixiNode, packer: ICardPacker) {
    this.rootNode = rootNode
    this.packer = packer
    this.changedNodes = new Map<string, PixiNode>()
    this.manager = this.rootNode.engine.eventManager
  }

  private reset(): void {
    this.changedNodes.clear()
    if (this.packer.reset) {
      this.packer.reset()
    }
  }

  /**
   * @final
   */
  public pack(depth: number = InfinityTraversal.INFINITE_DEPTH, withExpand = true): PixiNode[] {
    this.reset()

    // packing of all reachable children
    this.rearrangeRecursive(this.rootNode, depth)
    if (withExpand) this.expandRecursive(this.rootNode, depth)
    this.deflateRecursive(this.rootNode, depth)

    // adjusting siblings and parents of rootnode
    if (!this.rootNode.isRoot) {
      const {width, height} = getDimsToFitContent(
        this.rootNode.title,
        this.rootNode.width,
        this.rootNode.childrenDimensions,
      )
      this.manager.initNodeResize(this.rootNode)
      this.manager.nodeResize(this.rootNode, width, height)

      this.manager.moveNodes.forEach((map, resizeCard) => {
        this.changedNodes.set(resizeCard.id, resizeCard)
        map.forEach((_, moveCard) => {
          this.changedNodes.set(moveCard.id, moveCard)
        })
      })
    }

    // zoom to rootnode
    this.rootNode.zoomTo()

    return Array.from(this.changedNodes.values())
  }

  private rearrangeRecursive(card: PixiNode, depth: number): void {
    if (!this.changedNodes.has(card.id)) this.changedNodes.set(card.id, card)

    if (card.isLeaf()) {
      if (!card.hasContent()) {
        const {width, height} = getDimsToFitContent(card.title, card.width, card.childrenDimensions)
        card.resize(width, height, true)
      }
      // else: leaves with images or files attached remain untouched
      return
    }

    if (depth === 0) return

    const {childNodes: children} = card

    children.forEach(child => {
      this.rearrangeRecursive(child, depth - 1)
    })

    children.forEach(child => InfinityTraversal.inflate(child))
    this.packer.place(card)

    if (!card.isRoot) {
      const {width, height} = getDimsToFitContent(card.title, card.width, card.childrenDimensions)
      card.resize(width, height, true)
    }
  }

  private static inflate(card: PixiNode): void {
    card.resize(card.width + CONFIG.nodes.gridSize, card.height + CONFIG.nodes.gridSize, false)
  }

  private static deflate(card: PixiNode): void {
    card.resize(card.width - CONFIG.nodes.gridSize, card.height - CONFIG.nodes.gridSize, false)
  }

  private expandRecursive(card: PixiNode, depth: number): void {
    if (!this.packer.expandChildren) return
    if (depth === 0) return

    let {width, height} = card.childrenDimensions
    if (!card.isRoot) {
      const nonRootCard: PixiNode = card
      const {width: headerWidth, height: headerHeight} = getHeaderDims(nonRootCard.title, nonRootCard.width)
      const contentWidth = nonRootCard.width - 2 * CONFIG.nodes.childrenPaddingLeft
      const contentHeight = nonRootCard.height - CONFIG.nodes.childrenPaddingLeft

      /**
       * '/ card.scale' to transform into child dimensions
       * '- gridsize' to consider the deflate later
       */
      width = Math.max(headerWidth, contentWidth) / card.scale - 2 * CONFIG.nodes.gridSize
      height = (contentHeight - headerHeight) / card.scale - 2 * CONFIG.nodes.gridSize
    }

    const childrenToExpand = this.packer.expandChildren(card, width, height)
    childrenToExpand.forEach(child => {
      this.expandRecursive(child, depth - 1)
    })
  }

  private deflateRecursive(card: PixiNode, depth: number): void {
    if (depth === 0) return

    card.childNodes.forEach(child => {
      InfinityTraversal.deflate(child)
      this.deflateRecursive(child, depth - 1)
    })
  }
}

export default InfinityTraversal
