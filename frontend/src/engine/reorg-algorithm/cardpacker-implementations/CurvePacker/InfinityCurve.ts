/* eslint-disable class-methods-use-this */
import {Point} from 'pixi.js'
import {ICurve, affinLinTrans, getUniformDistributedParameter} from './Curve'

/**
 * @see https://www.desmos.com/calculator/5up1rc8ugy for visualization
 */
class InfinityCurve implements ICurve {
  private static INPUT_TO_RIGHT_HALF = [
    {
      tFromStart: 0.0,
      tFromEnd: 0.5,
      mirrowX: false,
    },
    {
      tFromStart: 0.5,
      tFromEnd: 1.0,
      mirrowX: true,
    },
  ]

  private size = 1.0

  point(t: number): Point {
    const quadrantIndex = Math.min(Math.floor(t * 2.0), 1)
    const {tFromStart, tFromEnd, mirrowX} = InfinityCurve.INPUT_TO_RIGHT_HALF[quadrantIndex]
    const toRightHalf = affinLinTrans(tFromStart, tFromEnd, 0.0, 1.0, t)
    const p = this.pointOnRightHalf(toRightHalf)
    return new Point(mirrowX ? -p.x : p.x, p.y)
  }

  getParameterList(n: number): number[] {
    const tList = [0.0]
    const left = Math.ceil((n - 1) / 2.0)
    const right = n - 1 - left

    const rightList = getUniformDistributedParameter(0, 0.5, right + 2)
    rightList.shift()
    rightList.pop()
    tList.push(...rightList)

    const leftList = getUniformDistributedParameter(0.5, 1.0, left + 2)
    leftList.shift()
    leftList.pop()
    tList.push(...leftList)

    return tList
  }

  /**
   * @param t in [0;1]
   */
  private pointOnRightHalf(t: number): Point {
    const halfPi = Math.PI / 2.0
    const transT = affinLinTrans(0, 1, -halfPi, halfPi, t)
    const x = (this.size * Math.cos(transT)) / (1 + Math.sin(transT) ** 2)
    const y = -x * Math.sin(transT)
    return new Point(x, y)
  }

  set scale(s: number) {
    this.size = s
  }

  get scale(): number {
    return this.size
  }
}

export default InfinityCurve
