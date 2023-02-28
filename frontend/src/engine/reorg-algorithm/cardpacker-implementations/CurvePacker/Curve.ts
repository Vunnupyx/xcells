import {Point} from 'pixi.js'

/**
 * Curve with parameter in [0;1]. With the scale attribute it should be possible to scale
 * the curve linearly in size. The CurvePacker y-reflects the curve later to match the
 * coordinate system in a node.
 */
export interface ICurve {
  /**
   * @param t curve parameter in [0;1]
   * @returns Point on the curve specified by parameter t
   */
  point(t: number): Point

  /**
   * @param n number of points
   * @returns a list of n parameter defining the arrangement of points along
   * the curve, i.e. uniform distributed points. The closer the parameters are
   * the larger will be the curve
   */
  getParameterList(n: number): number[]

  /**
   * The scale defines the curves size, i.e. radius of a circle
   */
  set scale(s: number)
  get scale(): number
  setRectangleDims?(rectWidth: number, rectHeight: number): void
}

export function affinLinTrans(fromStart: number, fromEnd: number, toStart: number, toEnd: number, t: number): number {
  const inZeroOne = (t - fromStart) / (fromEnd - fromStart)
  return toStart + (toEnd - toStart) * inZeroOne
}

export function getUniformDistributedParameter(start: number, end: number, n: number): number[] {
  return [...Array(n).keys()].map(i => affinLinTrans(0, n - 1, start, end, i))
}
