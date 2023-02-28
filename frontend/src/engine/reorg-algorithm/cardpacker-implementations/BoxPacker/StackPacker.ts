import CONFIG from '../../../CONFIG'
import PixiNode from '../../../PixiNode'
import {lexicografical} from '../../compareStrategies'
import ICardPacker from '../../ICardPacker'
import {ceilToCellSize, floorToCellSize} from '../../PixiNodeMeasure'
import Card2dStack from './Card2dStack'
import RefRectangle from './RefRectangle'

class StackPacker implements ICardPacker {
  private packingData: Map<string, Card2dStack>

  private dar: number

  constructor(dar = 1.5) {
    this.dar = dar
    this.packingData = new Map<string, Card2dStack>()
  }

  /**
   * @override
   */
  public reset(): void {
    this.packingData.clear()
  }

  /**
   * @override
   */
  public place(card: PixiNode): void {
    const maxHeight = this.approximateHeight([...card.childNodes])
    const cards: RefRectangle<PixiNode>[] = [...card.childNodes].sort(lexicografical).map(child => {
      return {
        ref: child,
        dim1expansion: ceilToCellSize(child.width),
        dim2expansion: ceilToCellSize(child.height),
        dim1start: child.x,
        dim2start: child.y,
      }
    })
    const packingData = new Card2dStack(maxHeight, cards)
    StackPacker.packAccordingToPackingData(packingData)
    this.packingData.set(card.id, packingData)
  }

  /**
   * @override
   */
  public expandChildren(card: PixiNode, width: number, height: number): PixiNode[] {
    const packingData = this.packingData.get(card.id)
    if (packingData === undefined) return []

    packingData.expandTo(floorToCellSize(width), floorToCellSize(height))
    StackPacker.packAccordingToPackingData(packingData)

    return packingData.cardOrder.filter(c => !c.isLeaf())
  }

  /**
   * Approximates the maximal height (in grid cells) to achieve the desired aspect ratio (dar)
   * @param order  Array of PixieNodes
   * @returns the number of gridcells (15.6) that may not be exceeded
   */
  private approximateHeight(order: PixiNode[]): number {
    let totalArea = 0.0
    let maxHeight = 0.0
    order.forEach(card => {
      totalArea += card.width * card.height
      maxHeight = Math.max(maxHeight, card.height)
    })
    const result = Math.max(maxHeight, Math.sqrt((totalArea * 2.0) / this.dar))
    return ceilToCellSize(result)
  }

  private static packAccordingToPackingData(packingData: Card2dStack) {
    const rects = packingData.getCardRectangles()
    rects.forEach(cardRect => {
      cardRect.ref.move(
        cardRect.dim1start * CONFIG.nodes.gridSize,
        cardRect.dim2start * CONFIG.nodes.gridSize,
        false,
        [],
      )
      cardRect.ref.resize(
        cardRect.dim1expansion * CONFIG.nodes.gridSize,
        cardRect.dim2expansion * CONFIG.nodes.gridSize,
        false,
      )
    })
  }
}

export default StackPacker
