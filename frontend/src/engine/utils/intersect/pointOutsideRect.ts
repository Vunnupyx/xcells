import {IPointData, IRectangleData} from '../../types'

export function pointOutsideRect(point: IPointData, rect: IRectangleData) {
  const {x, y, width, height} = rect
  return point.x < x || point.y < y || point.x > x + width || point.y > y + height
}
