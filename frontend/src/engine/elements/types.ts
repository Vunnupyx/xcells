import EDGE_ELEMENT_TYPES from './edge/EDGE_ELEMENT_TYPES'
import NODE_ELEMENT_TYPES from './node/NODE_ELEMENT_TYPES'
import {TargetCategories, TargetCategoryEdge, TargetCategoryGhost, TargetCategoryNode} from '../TARGET_CATEGORIES'
import type PixiEdge from '../PixiEdge'
import type PixiNode from '../PixiNode'
import {RenderNodeCandidate} from '../types'
import GHOST_ELEMENT_TYPES from './node/GHOST_ELEMENT_TYPES'

export interface IRedraw {
  redraw(): void
}

export interface IRedrawWithDetailLevel {
  redraw(detailLevel: number): void
}

export interface IDisplayObjectTypeCategory {
  type: EDGE_ELEMENT_TYPES | NODE_ELEMENT_TYPES | GHOST_ELEMENT_TYPES
  category: TargetCategories
  edge?: PixiEdge
  node?: PixiNode
  candidate?: RenderNodeCandidate
}

export interface IDisplayObjectTypeCategoryNode extends IDisplayObjectTypeCategory {
  type: NODE_ELEMENT_TYPES
  category: TargetCategoryNode
  node: PixiNode
}

export interface IDisplayObjectTypeCategoryEdge extends IDisplayObjectTypeCategory {
  type: EDGE_ELEMENT_TYPES
  category: TargetCategoryEdge
  edge: PixiEdge
}

export interface IDisplayObjectTypeCategoryGhost extends IDisplayObjectTypeCategory {
  type: GHOST_ELEMENT_TYPES
  category: TargetCategoryGhost
  candidate: RenderNodeCandidate
}

export interface IRenderDetailLevel {
  detailLevel: number
}
