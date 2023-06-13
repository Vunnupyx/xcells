import type * as PIXI from 'pixi.js'
import type {List} from 'automerge'
import {ColumnState} from 'ag-grid-community'
import type PixiNode from './PixiNode'
import type PixiEdge from './PixiEdge'
import type PointerActionClick from './events/actions/PointerActionClick'
import type PointerActionCombination from './events/actions/PointerActionCombination'
import type PointerActionDrag from './events/actions/PointerActionDrag'
import type PointerActionHover from './events/actions/PointerActionHover'
import type PixiRenderEngine from './PixiRenderEngine'
import EDGE_ELEMENT_TYPES from './elements/edge/EDGE_ELEMENT_TYPES'
import NODE_ELEMENT_TYPES from './elements/node/NODE_ELEMENT_TYPES'
import PERFORMANCE_MODE from './PERFORMANCE_MODE'

export type Dimensions = {
  height: number
  width: number
}

export type RectangleData = Dimensions & {
  x: number
  y: number
}

export type MapId = string

export type NodeId = string

export type EdgeId = string

export type ObjectId = string

export type ImagePositions = 'crop' | 'body' | 'stretch'

export type RenderNodeCandidate = {
  x?: number
  y?: number
  height?: number
  width?: number
  parent?: NodeId
  parentNode?: PixiNode
}
/* eslint-disable */
export interface GridOptions {
  rowData?: any[] | null
  columnDefs?: any[] | null
  filterModel?: {
    [key: string]: any
  }
  columnState?: ColumnState[]
}
/* eslint-enable */

export type NodeContent = RenderNodeCandidate & {
  id?: NodeId
  children?: NodeId[]
  image?: ObjectId
  imagePosition?: ImagePositions
  file?: ObjectId
  title?: string
  gridOptions?: GridOptions
  color?: string
  borderColor?: string
  scale?: number
  tags?: string[]
  checked?: boolean
  dirty?: boolean
}

export type NodeData = NodeContent & {
  id: NodeId
}

export type NodeDatas = Record<NodeId, NodeData>

export type EdgeContent = {
  id?: EdgeId
  start: NodeId
  end: NodeId
  title?: string
  color?: string
}

export type EdgeData = EdgeContent & {
  id: EdgeId
  title?: string
  color?: string
}

export type EdgeDatas = Record<EdgeId, EdgeData>

export type NodeTagId = string

export type NodeTagData = {
  id: NodeTagId
  name: string
  color: string
}

export type NodeTagDatas = NodeTagData[]

interface Openai {
  apiKey: string
  model: string
  user: string
  suffix: string
}

export interface Settings {
  openai: Openai
}

export type MapContentData = {
  nodes: NodeDatas
  edges?: EdgeDatas
  root: NodeId
  tags?: NodeTagDatas
}

export type MapData = MapContentData & {
  mapId: string
  title?: string
  settings?: Settings
}

export type AutomergeList<T> = Array<T> & {
  insertAt(index: number, ...args: T[]): List<T>
  deleteAt(index: number, numDelete?: number): List<T>
}

export type AutomergeNodeData = NodeData & {
  children?: AutomergeList<NodeId>
}

export type AutomergeMapData = MapData & {
  nodes: Record<NodeId, AutomergeNodeData>
  tags?: AutomergeList<NodeTagData>
}

export type MapStoreAction = {
  node?: NodeData | NodeContent
  edge?: EdgeData | EdgeContent
  template?: MapContentData
  tag?: NodeTagData
  name: string
  reducer: (doc: AutomergeMapData) => void
}

export type MapStoreActions = MapStoreAction[]

export type MapStoreSubscriber = (m: MapData) => void

export interface MapStore extends MapData {
  isLoading: boolean
  isConnected: boolean
  isSync: boolean
  isWriteable: boolean
  isWithHistory: boolean
  error: Error | null
  subscribe: (fn: MapStoreSubscriber) => void
  unsubscribe: (fn: MapStoreSubscriber) => void
  reconnect: () => void
  close: () => void
  dispatch: (a: MapStoreAction | MapStoreActions) => void
  readonly canUndo: boolean
  undo: () => void
  readonly canRedo: boolean
  redo: () => void
  isNodeDeletable: (id: NodeId) => boolean
}

export type Logger = (m: string, ...args: unknown[]) => void

export type RenderEngineEventMixin = {
  type: EDGE_ELEMENT_TYPES | NODE_ELEMENT_TYPES
  category: string
  node?: PixiNode
  edge?: PixiEdge
  candidate?: RenderNodeCandidate
}

export type RenderEngineEventTarget = PIXI.DisplayObject & RenderEngineEventMixin

export type RenderEngineEvent = PIXI.InteractionEvent & {
  target: RenderEngineEventTarget
  control?: boolean
}

export type RenderEngineSubscriber = (r: PixiRenderEngine) => void

export type PointerBinding = {
  actionName: string
  buttons?: number
  mode?: string | string[]
  element?: string | string[]
  type?: string
}

export type PointerAction = PointerActionClick | PointerActionCombination | PointerActionDrag | PointerActionHover
export type PointerActions = {[key: string]: PointerAction}

export type AnimateViewportParameter = {
  x: number
  y: number
  scale?: number
}

export type IPointData = PIXI.IPointData
export type IRectangleData = PIXI.IPointData & PIXI.ISize

export type TApplicationOptions = {
  performanceMode: PERFORMANCE_MODE
  isAccessibilityEnabled: boolean
  isPdfMetadataImportOptionEnabled: boolean
}

export enum NODE_VISIBLE {
  NO,
  OVER,
  CENTER,
  YES,
}
