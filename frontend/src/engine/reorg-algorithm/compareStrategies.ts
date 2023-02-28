import PixiNode from '../PixiNode'

export function lexicografical(a: PixiNode, b: PixiNode): number {
  if (a.x < b.x) {
    return -1
  }
  if (a.x > b.x) {
    return 1
  }
  if (a.y < b.y) {
    return -1
  }
  if (a.y > b.y) {
    return 1
  }
  return 0
}

function centerOfCard(card: PixiNode): {x: number; y: number} {
  return {
    x: card.x + card.width / 2.0,
    y: card.y + card.height / 2.0,
  }
}

export function getPolarComparator(card: PixiNode): (a: PixiNode, b: PixiNode) => number {
  const {x: cx, y: cy} = centerOfCard(card)
  return (a: PixiNode, b: PixiNode) => {
    const {x: cxa, y: cya} = centerOfCard(a)
    const {x: cxb, y: cyb} = centerOfCard(b)

    const thetaA = Math.atan2(cxa - cx, cya - cy)
    const thetaB = Math.atan2(cxb - cx, cyb - cy)

    return thetaA - thetaB
  }
}
