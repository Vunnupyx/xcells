import type * as PIXI from 'pixi.js'

const drawRounded45DegreeLine = (
  graphics: PIXI.Graphics,
  start: PIXI.Point,
  length: number,
  strength: number,
): void => {
  const radius = strength / 2
  graphics.drawCircle(start.x, start.y, radius)
  const dEndpoint = length / Math.sqrt(2)
  const dPolygon = radius / Math.sqrt(2)
  graphics.drawCircle(start.x + dEndpoint, start.y - dEndpoint, strength / 2)
  graphics.drawPolygon([
    start.x - dPolygon,
    start.y - dPolygon,
    start.x + dPolygon,
    start.y + dPolygon,
    start.x + dEndpoint + dPolygon,
    start.y - dEndpoint + dPolygon,
    start.x + dEndpoint - dPolygon,
    start.y - dEndpoint - dPolygon,
  ])
}

export default drawRounded45DegreeLine
