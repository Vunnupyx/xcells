import * as plugins from './plugins'
import {IImportPlugin} from './types'
import type EventManager from '../events/EventManager'
import {MapData, NodeDatas, NodeId} from '../types'

const pluginMapping = Object.fromEntries(
  Object.values(plugins)
    .map(Plugin => new Plugin())
    .flatMap<[key: string, value: IImportPlugin]>(plugin => [
      ...plugin.mimeTypes.map<[key: string, value: IImportPlugin]>(mime => [mime, plugin]),
      ...plugin.fileExtensions.map<[key: string, value: IImportPlugin]>(ext => [ext, plugin]),
    ]),
)

export default class ImportHandler {
  manager: EventManager

  constructor(manager: EventManager) {
    this.manager = manager
  }

  addNodeTree(nodes: NodeDatas, addNodeId: NodeId, currentParentId: NodeId): void {
    const {manager} = this

    const nodeCandidate = nodes[addNodeId]

    manager.createChild(currentParentId, nodeCandidate)

    nodeCandidate.children?.forEach(childId => {
      this.addNodeTree(nodes, childId, addNodeId)
    })
  }

  async runImport(data: Blob | File, parentNodeId: NodeId): Promise<MapData[]> {
    const typeOrExtension = data.type || ('name' in data ? data.name.split('.').pop() : undefined)

    if (!typeOrExtension) throw new Error('No file type found.')

    const plugin = pluginMapping[typeOrExtension]

    if (!plugin) {
      throw new Error(`Cannot find plugin for file type ${typeOrExtension}`)
    }

    const mapDatas = await plugin.transform(data)
    mapDatas.forEach(({root, nodes}) => this.addNodeTree(nodes, root, parentNodeId))
    return mapDatas
  }
}
