import {generateEdgeId, generateNodeId} from '../shared/utils/generateId'
import {MapContentData, MapData, NodeData, NodeId} from '../engine/types'

const createId = (doc: MapContentData): NodeId => {
  let index = generateNodeId()
  while (index in doc.nodes) {
    index = generateNodeId()
  }
  return index
}

const addNode = (doc: MapContentData, copyNode: NodeData, parent?: NodeId): [NodeId, NodeId[]] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {children: oldChildren = [], id: oldId, parent: oldParent, tags, ...nodeRest} = copyNode
  const id = createId(doc)
  doc.nodes[id] = {
    id,
    ...nodeRest,
  }
  if (tags) doc.nodes[id].tags = [...tags]
  if (parent) doc.nodes[id].parent = parent
  return [id, [...oldChildren]]
}

const copyInto = (
  firstId: string,
  firstOldChildren: string[],
  doc: MapData | MapContentData,
  docFrom: MapData | MapContentData,
  withEdgesToOutside: boolean,
) => {
  let childrenMap = new Map([[firstId, firstOldChildren]])
  const nodeIdMapping = new Map([[firstId, firstId]])
  while (childrenMap.size > 0) {
    const subChildrenMap = new Map()
    childrenMap.forEach((previousOldChildren, newParentId) => {
      previousOldChildren.forEach(oldChildId => {
        const [newChildId, oldChildren] = addNode(doc, docFrom.nodes[oldChildId], newParentId)
        if (doc.nodes[newParentId].children) doc.nodes[newParentId].children?.push(newChildId)
        else doc.nodes[newParentId].children = [newChildId]
        nodeIdMapping.set(oldChildId, newChildId)
        subChildrenMap.set(newChildId, oldChildren)
      })
    })
    childrenMap = subChildrenMap
  }

  Object.values(docFrom.edges || {}).forEach(edge => {
    const {start, end, ...restEdge} = edge

    const oldNodeId = [...nodeIdMapping.keys()].find(
      nodeId =>
        (nodeId === start || nodeId === end) &&
        // other node of edge is also inside or we also copy outside edges
        (nodeIdMapping.has(nodeId !== start ? start : end) || withEdgesToOutside),
    )

    if (oldNodeId) {
      let newStart
      let newEnd
      if (nodeIdMapping.has(oldNodeId !== start ? start : end)) {
        // start and end are inside the copied card
        newStart = oldNodeId === start ? nodeIdMapping.get(oldNodeId) : nodeIdMapping.get(start)
        newEnd = oldNodeId === end ? nodeIdMapping.get(oldNodeId) : nodeIdMapping.get(end)
      } else {
        // add edge to outside
        newStart = oldNodeId === start ? nodeIdMapping.get(oldNodeId) : start
        newEnd = oldNodeId === end ? nodeIdMapping.get(oldNodeId) : end
      }

      if (!newStart || !newEnd) throw new Error(`Could not find ${newStart} or ${newEnd} when duplicating edges`)

      const newEdgeId = generateEdgeId(newStart, newEnd)
      if (!doc.edges) doc.edges = {}
      doc.edges[newEdgeId] = {
        ...restEdge,
        id: newEdgeId,
        start: newStart,
        end: newEnd,
      }
    }
  })
}

// mutates the given object
// TODO: copy edges too, but respect a switch to decide if they should connect to nodes outside the duplicated node
//  (for duplication) or not (for templating)
export const duplicateNode = (
  doc: MapData | MapContentData,
  docFrom: MapData | MapContentData,
  copyRootId: NodeId,
  parent?: NodeId,
  withEdgesToOutside = false,
): NodeId => {
  const [firstId, firstOldChildren] = addNode(doc, docFrom.nodes[copyRootId], parent)

  copyInto(firstId, firstOldChildren, doc, docFrom, withEdgesToOutside)

  return firstId
}

/**
 * Inserts the template into the node with targetNodeId. This id/node has to exist in doc.
 */
export const applyTemplate = (
  doc: MapData | MapContentData,
  targetNodeId: string,
  template: MapData | MapContentData,
  withEdgesToOutside = false,
): NodeId => {
  const targetNode = doc.nodes[targetNodeId]
  const templateRootNode = template.nodes[template.root]
  if (templateRootNode.width) targetNode.width = templateRootNode.width
  if (templateRootNode.height) targetNode.height = templateRootNode.height
  if (templateRootNode.image) targetNode.image = templateRootNode.image
  if (templateRootNode.imagePosition) targetNode.imagePosition = templateRootNode.imagePosition
  if (templateRootNode.file) targetNode.file = templateRootNode.file
  if (templateRootNode.title) targetNode.title = templateRootNode.title
  if (templateRootNode.color) targetNode.color = templateRootNode.color
  if (templateRootNode.borderColor) targetNode.borderColor = templateRootNode.borderColor
  if (templateRootNode.scale) targetNode.scale = templateRootNode.scale

  copyInto(targetNodeId, templateRootNode.children || [], doc, template, withEdgesToOutside)

  return targetNodeId
}
