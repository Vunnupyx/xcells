/* eslint-disable class-methods-use-this */
import {Point} from 'pixi.js'
import {affinLinTrans, getUniformDistributedParameter, ICurve} from './Curve'

/**
 * Curve around circle, starting from top going clockwise
 * @see https://www.desmos.com/calculator/ncxvdm3wy1 for a visualization
 */
class CircleCurve implements ICurve {
  /**
   * is the radius of the circle
   */
  private radius = 1.0

  private rectWidth = 1.0

  private rectHeight = 1.0

  private t1 = 0.321750554397

  private t2 = 1.2490457724

  private static INPUT_TO_FIRST_QUADRANT_OPTIONS = [
    {
      tFromStart: 0.0,
      tFromEnd: 0.25,
      tToStart: Math.PI / 2.0,
      tToEnd: 0.0,
      mirrowX: true,
      mirrowY: false,
    },
    {
      tFromStart: 0.25,
      tFromEnd: 0.5,
      tToStart: 0.0,
      tToEnd: Math.PI / 2.0,
      mirrowX: true,
      mirrowY: true,
    },
    {
      tFromStart: 0.5,
      tFromEnd: 0.75,
      tToStart: Math.PI / 2.0,
      tToEnd: 0.0,
      mirrowX: false,
      mirrowY: true,
    },
    {
      tFromStart: 0.75,
      tFromEnd: 1.0,
      tToStart: 0.0,
      tToEnd: Math.PI / 2.0,
      mirrowX: false,
      mirrowY: false,
    },
  ]

  /**
   * @param t in [0;1]
   * @returns point around circle
   * todo: perform mirrow in packer
   */
  public point(t: number): Point {
    const quadrantIndex = Math.min(Math.floor(t * 4.0), 3)
    const {tFromStart, tFromEnd, tToStart, tToEnd, mirrowX, mirrowY} =
      CircleCurve.INPUT_TO_FIRST_QUADRANT_OPTIONS[quadrantIndex]
    const toFirstQuadrant = affinLinTrans(tFromStart, tFromEnd, tToStart, tToEnd, t)
    const p = this.pointOnFirstQuadrant(toFirstQuadrant)
    return new Point(mirrowX ? -p.x : p.x, mirrowY ? -p.y : p.y)
  }

  public getParameterList(n: number): number[] {
    const list = getUniformDistributedParameter(0.0, 1.0, n + 1)
    list.pop()
    return list
  }

  set scale(s: number) {
    this.radius = s
    this.updateMarker()
  }

  get scale(): number {
    return this.radius
  }

  public setRectangleDims(rectWidth: number, rectHeight: number): void {
    this.rectWidth = rectWidth
    this.rectHeight = rectHeight
    this.updateMarker()
  }

  private updateMarker(): void {
    this.t1 = Math.atan2(this.rectHeight, 2 * this.radius + this.rectWidth)
    this.t2 = Math.atan2(2 * this.radius + this.rectHeight, this.rectWidth)
  }

  /**
   * @param t 0 <= t <= pi/2
   * @return points in (positiv,positiv)-Quadrant starting from 0°
   */
  private pointOnFirstQuadrant(t: number): Point {
    const halfw = this.rectWidth / 2.0
    const halfh = this.rectHeight / 2.0
    const halfpi = Math.PI / 2.0
    if (t <= 0 && t <= this.t1) {
      const y = affinLinTrans(0, this.t1, 0, halfh, t)
      return new Point(this.radius + halfw, y)
    }
    if (t <= this.t2) {
      const transformedT = affinLinTrans(this.t1, this.t2, 0, halfpi, t)
      return new Point(halfw + this.radius * Math.cos(transformedT), halfh + this.radius * Math.sin(transformedT))
    }
    const x = affinLinTrans(this.t2, halfpi, halfw, 0, t)
    return new Point(x, this.radius + halfh)
  }
}

export default CircleCurve
