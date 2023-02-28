import {RectangleData} from '../../types'

const rectInsideRect = (inside: RectangleData, outside: RectangleData): boolean =>
  inside.x > outside.x &&
  inside.y > outside.y &&
  inside.x + inside.width < outside.x + outside.width &&
  inside.y + inside.height < outside.y + outside.height

export default rectInsideRect
