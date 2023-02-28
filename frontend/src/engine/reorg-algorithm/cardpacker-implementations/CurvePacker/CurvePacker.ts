import {Point, Rectangle} from 'pixi.js'
import PixiNode from '../../../PixiNode'
import {getPolarComparator} from '../../compareStrategies'
import ICardPacker from '../../ICardPacker'
import {ICurve} from './Curve'

function getMaxCardDims(cards: PixiNode[]): {cardWidth: number; cardHeight: number} {
  const maxWidth = Math.max(...cards.map(c => c.width))
  const maxHeight = Math.max(...cards.map(c => c.height))
  cards.forEach(c => c.resize(maxWidth, maxHeight, false))
  return {cardWidth: maxWidth, cardHeight: maxHeight}
}

class CurvePacker implements ICardPacker {
  private curve: ICurve

  constructor(curve: ICurve) {
    this.curve = curve
  }

  /**
   * @override
   */
  public place(card: PixiNode): void {
    const order = [...card.childNodes].sort(getPolarComparator(card))
    const {cardWidth, cardHeight} = getMaxCardDims(order)

    if (this.curve.setRectangleDims) {
      this.curve.setRectangleDims(cardWidth, cardHeight)
    }

    const rectangles = this.findNonIntersectingArrangement(cardWidth, cardHeight, order.length)
    CurvePacker.transformToNodeCS(rectangles)
    CurvePacker.packAccordingTo(order, rectangles, cardWidth, cardHeight)
  }

  private findNonIntersectingArrangement(cardWidth: number, cardHeight: number, n: number): Rectangle[] {
    const tList = this.curve.getParameterList(n)
    this.curve.scale = 0.0

    let rects = []
    do {
      this.curve.scale += 1.0
      rects = this.getRectangles(cardWidth, cardHeight, tList)
    } while (CurvePacker.rectanglesIntersect(rects))

    return rects
  }

  private getRectangles(cardWidth: number, cardHeight: number, tlist: number[]): Rectangle[] {
    const rectangleFromCenter = (center: Point, width: number, height: number): Rectangle => {
      return new Rectangle(center.x - width / 2.0, center.y - height / 2.0, width, height)
    }

    return tlist.map(t => this.curve.point(t)).map(center => rectangleFromCenter(center, cardWidth, cardHeight))
  }

  private static rectanglesIntersect(rects: Rectangle[]): boolean {
    const intersect = (a: Rectangle, b: Rectangle): boolean => {
      return [
        {x: a.left, y: a.bottom},
        {x: a.right, y: a.bottom},
        {x: a.right, y: a.top},
        {x: a.left, y: a.top},
      ].some(({x, y}) => b.contains(x, y))
    }

    for (let i = 1; i < rects.length; i += 1) {
      if (intersect(rects[i - 1], rects[i])) {
        return true
      }
    }
    return false
  }

  private static transformToNodeCS(rectangles: Rectangle[]): void {
    // mirrow y
    rectangles.forEach(r => (r.y *= -1))

    // shift to (0,0)
    const minX = Math.min(...rectangles.map(r => r.left))
    const minY = Math.min(...rectangles.map(r => r.bottom))
    rectangles.forEach(r => {
      r.x -= minX
      r.y -= minY
    })
  }

  private static packAccordingTo(order: PixiNode[], rects: Rectangle[], cardWidth: number, cardHeight: number) {
    order.forEach((card, i) => {
      card.resize(cardWidth, cardHeight)
      card.move(rects[i].left, rects[i].bottom, false, [])
    })
  }
}

export default CurvePacker
