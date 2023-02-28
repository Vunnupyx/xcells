import CONFIG from '../../CONFIG'
import PixiNode from '../../PixiNode'
import {lexicografical} from '../compareStrategies'
import ICardPacker from '../ICardPacker'
import {ceilToCellSize, floorToCellSize} from '../PixiNodeMeasure'

type GridPackingData = {
  gridGrade: number
  order: PixiNode[]
  widths: number[]
  heights: number[]
  totalWidth?: number
  totalHeight?: number
}

class GridPacker implements ICardPacker {
  private packingData: Map<string, GridPackingData>

  constructor() {
    this.packingData = new Map<string, GridPackingData>()
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
    const packingData = GridPacker.calcIntPackingData(card)
    const {intWidth, intHeight} = GridPacker.packAccordingToPackingData(packingData)
    packingData.totalWidth = intWidth
    packingData.totalHeight = intHeight
    this.packingData.set(card.id, packingData)
  }

  private static calcIntPackingData(card: PixiNode): GridPackingData {
    const order = [...card.childNodes].sort(lexicografical)
    const n = order.length
    const gridGrade = Math.ceil(Math.sqrt(n))
    const widths = new Array(gridGrade).fill(0)
    const heights = new Array(gridGrade).fill(0)

    for (let i = 0; i < n; i += 1) {
      const wId = Math.floor(i / gridGrade)
      widths[wId] = Math.max(widths[wId], ceilToCellSize(order[i].width))
      heights[i % gridGrade] = Math.max(heights[i % gridGrade], ceilToCellSize(order[i].height))
    }

    return {gridGrade, order, widths, heights}
  }

  private static prefixSum(arr: number[]): void {
    if (arr.length <= 1) return
    for (let i = 1; i < arr.length; i += 1) {
      arr[i] += arr[i - 1]
    }
  }

  private static packAccordingToPackingData(packingData: GridPackingData): {intWidth: number; intHeight: number} {
    const {gridGrade, order, widths, heights} = packingData

    const moveX = GridPacker.getMoveArray(widths)
    const moveY = GridPacker.getMoveArray(heights)

    for (let i = 0; i < order.length; i += 1) {
      const wId = Math.floor(i / gridGrade)
      order[i].resize(widths[wId] * CONFIG.nodes.gridSize, heights[i % gridGrade] * CONFIG.nodes.gridSize, true)
      order[i].move(moveX[wId] * CONFIG.nodes.gridSize, moveY[i % gridGrade] * CONFIG.nodes.gridSize, true, [])
    }

    return {intWidth: moveX[gridGrade], intHeight: moveY[gridGrade]}
  }

  private static getMoveArray(coos: number[]): number[] {
    const move = [...coos]
    move.unshift(0)
    GridPacker.prefixSum(move)
    return move
  }

  /**
   * @override
   */
  public expandChildren(card: PixiNode, width: number, height: number): PixiNode[] {
    if (!this.packingData.has(card.id)) return []

    const {gridGrade, order, widths, heights, totalWidth, totalHeight} = <GridPackingData>this.packingData.get(card.id)
    const freeHorSpace = floorToCellSize(width) - (totalWidth || 0)
    const freeVertSpace = floorToCellSize(height) - (totalHeight || 0)

    for (let i = 0; i < freeHorSpace; i += 1) {
      widths[i % gridGrade] += 1
    }
    for (let i = 0; i < freeVertSpace; i += 1) {
      heights[i % gridGrade] += 1
    }

    const newPackingData = {gridGrade, order, widths, heights}
    GridPacker.packAccordingToPackingData(newPackingData)

    return order.filter(c => !c.isLeaf())
  }
}

export default GridPacker
