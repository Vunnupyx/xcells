import {generateNodeId} from '../../../../shared/utils/generateId'
import CONFIG from '../../../CONFIG'
import {MapContentData, NodeData, NodeId} from '../../../types'

export declare type OutlineEntry = {
  title: string
  subEntries: OutlineEntry[]
}

export class PdfOutlineTemplate {
  public map: MapContentData

  private static readonly TEMPLATE_NODE: NodeData = {
    id: '',
    children: [],
    title: '',
    scale: CONFIG.nodes.create.scale,
    x: 0,
    y: 0,
    width: CONFIG.nodes.create.width,
    height: 2 * CONFIG.nodes.gridSize,
  }

  constructor(outline: OutlineEntry) {
    this.map = {
      nodes: {},
      root: '',
    }
    this.map.root = this.parse(outline.title, outline.subEntries)
  }

  get template(): MapContentData {
    return this.map
  }

  parse = (title: string, element: OutlineEntry[]): string => {
    const node = this.generateNode(title)
    this.map.nodes[node.id] = node

    if (!element || element.length <= 0) return node.id

    element.forEach(subEntry => {
      const childNodeId = this.parse(subEntry.title, subEntry.subEntries)
      this.linkNode(childNodeId, node.id)
    })

    return node.id
  }

  generateNode = (title: string): NodeData => {
    return {...PdfOutlineTemplate.TEMPLATE_NODE, children: [], id: generateNodeId(), title}
  }

  linkNode = (nodeId: NodeId, parentId: NodeId): void => {
    this.map.nodes[nodeId].parent = parentId
    this.map.nodes[parentId].children?.push(nodeId)
  }
}

export default PdfOutlineTemplate
