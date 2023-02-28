import * as PIXI from 'pixi.js'
import Color from 'color'

import type PixiNode from './PixiNode'
import {Dimensions, RectangleData, RenderNodeCandidate} from './types'
import parseColor from './utils/parseColor'
import CONFIG from './CONFIG'
import rectIntersectsRect from './utils/intersect/rectIntersectsRect'
import {checkIsAttached} from './utils/nodesAttached'
import onGrid from './utils/onGrid'

abstract class AbstractPixiNode {
  childNodes: Set<PixiNode> = new Set()

  abstract getColorName(): string

  abstract addChild(child: PixiNode): void

  abstract get childrenDimensions(): Dimensions

  abstract childrenRedrawText(): void

  getActiveBackgroundColor(name?: string): Color {
    return parseColor(name || this.getColorName()).activeBackground
  }

  abstract getBorderColor(name?: string): Color

  abstract getBounds(): RectangleData

  abstract getCornerBottomRight(): PIXI.Point

  getGridCoord({x, y}: PIXI.IPointData, roundFn: (n: number) => number = Math.round): PIXI.Point {
    const {gridSize} = CONFIG.nodes

    return new PIXI.Point(roundFn(x / gridSize) * gridSize, roundFn(y / gridSize) * gridSize)
  }

  getDefaultHeight(): number {
    const {gridSize} = CONFIG.nodes
    return 2 * gridSize
  }

  // @TODO: define storeNode interface and add it here
  getFreeChildPosition(startCandidate: RenderNodeCandidate | PixiNode): {
    candidate: RenderNodeCandidate
    nodeAbove: PixiNode | undefined
  } {
    const {childNodes} = this
    const {
      gridSize,
      text: {paddingLeft},
      create: {width: createWidth},
    } = CONFIG.nodes
    const {x: startX, y: startY, width = Infinity, parentNode, parent} = startCandidate

    const height = this.getDefaultHeight()

    const x =
      startX === undefined && childNodes.size > 0
        ? [...childNodes].reduce((p, n) => Math.min(p, n.x), Infinity)
        : startX || 0

    const y =
      startY === undefined && childNodes.size > 0
        ? [...childNodes].reduce((p, n) => Math.min(p, n.y), Infinity)
        : startY || gridSize

    let maxWidth = width
    if (parentNode) {
      const fullSizeWidth = onGrid((parentNode.width - 2 * paddingLeft - gridSize) / parentNode.scale)
      maxWidth = Math.min(maxWidth, fullSizeWidth)
    }

    if (width === Infinity && maxWidth >= createWidth * 2) {
      maxWidth = createWidth
    }

    const candidate = {height, width: maxWidth, x, y, parent: parentNode ? parentNode.id : parent}

    let cont = true
    let isAttached = false
    let nodeAbove: PixiNode | undefined
    while (cont) {
      const collidingNode = Array.from(childNodes)
        .filter(child => !child.state.isAddNode)
        .find(child => rectIntersectsRect(child, candidate))

      if (collidingNode) {
        candidate.y = collidingNode.y + collidingNode.height
        const newCoords = this.getGridCoord(candidate, Math.ceil)

        candidate.y = Math.max(newCoords.y, collidingNode.y + collidingNode.height)
        candidate.x = x || collidingNode.x
        candidate.width = collidingNode.width

        isAttached = checkIsAttached(collidingNode, collidingNode.siblingNodes)

        if (!isAttached) {
          candidate.y += gridSize
        }
        nodeAbove = collidingNode
      } else {
        cont = false
      }
    }

    return {candidate, nodeAbove}
  }

  abstract getFreeNodePosition(x: number, y: number, collisionNodes: PixiNode[]): PIXI.IPointData | undefined

  isLeaf(): boolean {
    const {childNodes} = this
    return childNodes.size === 0
  }

  abstract isRoot: boolean

  abstract isVisible(): boolean

  abstract hasContent(): boolean

  _offspringCount = 0

  get offspringCount(): number {
    return this._offspringCount
  }

  set offspringCount(value: number) {
    this._offspringCount = value
  }
}

export default AbstractPixiNode
