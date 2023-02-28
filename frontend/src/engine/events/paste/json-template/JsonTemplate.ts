import {generateNodeId} from '../../../../shared/utils/generateId'
import {MapContentData, NodeData, NodeId} from '../../../types'
import CONFIG from '../../../CONFIG'

class JsonTemplate {
  public map: MapContentData

  private static readonly TEMPLATE_NODE: NodeData = {
    id: '',
    children: [],
    title: '',
    color: CONFIG.nodes.defaultBackground,
    scale: 0.6666666666666666,
    x: 0,
    y: 0,
    width: 358.8,
    height: 156,
  }

  constructor(json: unknown) {
    this.map = {
      nodes: {},
      root: '',
    }
    this.map.root = this.parse('JSON-Object', json)
  }

  get template(): MapContentData {
    return this.map
  }

  parse = (title: string, element: unknown): string => {
    const node = this.generateNode(title)
    this.map.nodes[node.id] = node

    if (!element) {
      this.map.nodes[node.id].title += ': undefined'
      return node.id
    }

    if (typeof element === 'object') {
      Object.entries(element as Record<string, unknown>).forEach(([key, value]) => {
        this.map.nodes[node.id].children?.push(this.parse(key, value))
      })
    } else if (Array.isArray(element)) {
      element.forEach((value, index) => {
        this.map.nodes[node.id].children?.push(this.parse(index.toString(), value))
      })
    } else {
      this.map.nodes[node.id].title += `: ${element as string}`
    }
    return node.id
  }

  generateRootNode = (): NodeData => {
    return this.generateNode('JSON-Object')
  }

  generateNode = (title: string): NodeData => {
    return {...JsonTemplate.TEMPLATE_NODE, children: [], id: generateNodeId(), title}
  }

  addNodeTo = (node: NodeData, parentId: NodeId): void => {
    this.map.nodes[node.id] = node
    this.map.nodes[parentId].children?.push(node.id)
  }
}

export default JsonTemplate
