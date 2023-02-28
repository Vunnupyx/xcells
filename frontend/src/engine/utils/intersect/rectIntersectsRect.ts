import {isGreaterThan, isLessThan} from '../arithmetics'
import {RectangleData} from '../../types'

const rectIntersectsRect = (r1: RectangleData, r2: RectangleData): boolean =>
  isLessThan(r2.x, r1.x + r1.width) &&
  isGreaterThan(r2.x + r2.width, r1.x) &&
  isLessThan(r2.y, r1.y + r1.height) &&
  isGreaterThan(r2.y + r2.height, r1.y)

export default rectIntersectsRect
