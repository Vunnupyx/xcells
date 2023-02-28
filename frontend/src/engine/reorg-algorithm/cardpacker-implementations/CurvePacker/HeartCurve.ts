/* eslint-disable class-methods-use-this */
import {Point} from 'pixi.js'
import {ICurve} from './Curve'

/**
 * Heart Curve, starting from the top notch going clockwise
 * @see https://www.desmos.com/calculator/w8odrconcq?lang=de for an explanation
 */
class HeartCurve implements ICurve {
  private size = 1.0

  /**
   * Uniformish distributed parameter along the heart, containing
   *  - 0 (for the top notch of the heart)
   *  - 0.5 (for the bottom peak)
   * all other parameters are distributed 50:50 to the two halfs
   * @param n integer >= 2
   */
  public getParameterList(n: number): number[] {
    const list = []
    const left = Math.floor((n - 2) / 2.0)
    const right = n - 2 - left

    list.push(0.0)
    for (let i = 1; i < right + 1; i += 1) {
      list.push((i / (right + 1)) * 0.5)
    }
    list.push(0.5)
    for (let i = 1; i < left + 1; i += 1) {
      list.push((i / (left + 1)) * 0.5 + 0.5)
    }
    return list
  }

  public point(t: number): Point {
    if (t <= 0.5) {
      return this.halfHeartPoint(2 * t)
    }
    const newT = 1 - 2 * (t - 0.5)
    const {x, y} = this.halfHeartPoint(newT)
    return new Point(-x, y)
  }

  /**
   * Curve for the right half of a heart
   * @param t in [0;1]
   * @returns point on curve
   */
  private halfHeartPoint(t: number): Point {
    t = HeartCurve.toInternParameterSpace(t)
    t = HeartCurve.cor(t)
    return new Point(
      this.scale * (16 * Math.sin(t) ** 3),
      this.scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    )
  }

  /**
   * Bijective function that transforms the curve into a curve
   * with uniform arclength function. Using this transformation
   * in the parameter space, uniform distributed t are mapped
   * to uniform distributed points on the curve.
   * @param t parameter (in uniform parameter space) [0;pi]
   * @returns parameter in parameter space of the original curve [0;pi]
   */
  private static cor(t: number): number {
    return Math.acos((-2.0 / Math.PI) * t + 1)
  }

  /**
   * Transforms a standard curce parameter (in [0;1]) into the parameter
   * space that is used in this curve.
   * @param t in [0;1]
   * @returns parameter in [0;pi]
   */
  private static toInternParameterSpace(t: number): number {
    return Math.PI * t
  }

  get scale(): number {
    return this.size
  }

  set scale(s: number) {
    this.size = s
  }
}

export default HeartCurve
