import debug from 'debug'
import {
  AutomergeList,
  EdgeContent,
  EdgeData,
  MapContentData,
  MapStoreAction,
  NodeContent,
  NodeData,
  NodeId,
  NodeTagData,
  NodeTagId,
} from '../engine/types'

import {generateEdgeId, generateNodeId, generateTagId} from '../shared/utils/generateId'
import CONFIG from '../engine/CONFIG'
import {duplicateNode, applyTemplate} from './utils'

const log = debug('app:MapStore:actions')
const logError = log.extend('ERROR', '::')

const {create} = CONFIG.nodes

export const move = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeMove',
  reducer: doc => {
    const {id, parent = false, x = 0, y = 0} = node

    const storeNode = doc.nodes[id]

    storeNode.x = x
    storeNode.y = y

    // a non root element move
    if (parent && storeNode.parent && parent !== storeNode.parent) {
      if (parent === id) {
        throw new Error('a node cannot be its own parent')
      }

      const oldParent = doc.nodes[storeNode.parent]
      if (oldParent.children) oldParent.children.deleteAt(oldParent.children.indexOf(id))

      storeNode.parent = parent

      const newParent = doc.nodes[parent]
      if (!newParent.children) newParent.children = [] as unknown as AutomergeList<NodeId>
      newParent.children.push(id)
    }
  },
})

export const resize = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeResize',
  reducer: doc => {
    const {id, width, height} = node
    const storeNode = doc.nodes[id]

    storeNode.width = width
    storeNode.height = height
  },
})

export const edit = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeEdit',
  reducer: doc => {
    const {id, title} = node
    if (title === undefined) return

    if (id === doc.root) {
      if (doc.title !== title) doc.title = title
    }
    if (doc.nodes[id].title !== title) doc.nodes[id].title = title
  },
})

export const setColor = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeSetColor',
  reducer: doc => {
    const {id, color} = node
    if (color && doc.nodes[id].color !== color) {
      doc.nodes[id].color = color
    } else if (!color && doc.nodes[id].color) {
      delete doc.nodes[id].color
    }
  },
})

export const setBorderColor = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeSetBorderColor',
  reducer: doc => {
    const {id, borderColor} = node
    if (borderColor && doc.nodes[id].borderColor !== borderColor) {
      doc.nodes[id].borderColor = borderColor
    } else if (!borderColor && doc.nodes[id].borderColor) {
      delete doc.nodes[id].borderColor
    }
  },
})

export const add = (node: NodeContent): MapStoreAction => ({
  node,
  name: 'nodeAdd',
  reducer: doc => {
    const {
      parent,
      x,
      y,
      width = create.width,
      height = create.height,
      scale = create.scale,
      title,
      gridOptions,
      color,
      borderColor,
    } = node

    const createId = () => {
      let index = generateNodeId()
      while (index in doc.nodes) {
        index = generateNodeId()
      }
      return index
    }

    if (!doc.nodes) doc.nodes = {}

    const id = node.id || createId()

    if (doc.nodes[id]) {
      throw new Error(`Element with id ${id} already exists`)
    }

    doc.nodes[id] = {
      id,
      x,
      y,
      width,
      scale,
    }

    if (height) doc.nodes[id].height = height
    if (gridOptions) doc.nodes[id].gridOptions = gridOptions

    if (parent) {
      if (parent === id) {
        throw new Error('a node cannot be its own parent')
      }
      // add a non root node
      doc.nodes[id].parent = parent
      const parentNode = doc.nodes[parent]
      if (!parentNode.children) parentNode.children = [] as unknown as AutomergeList<NodeId>
      parentNode.children.push(id)
    } else if (!doc.root) {
      // first item means this will be root
      doc.root = id
    } else {
      throw new Error('Cannot create a root element: already exists')
    }

    if (title) edit({id, title, height}).reducer(doc)
    if (color) setColor({id, color}).reducer(doc)
    if (borderColor) setBorderColor({id, borderColor}).reducer(doc)
  },
})

export const rescale = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeScale',
  reducer: doc => {
    const {id, scale} = node
    if (scale !== undefined) {
      if (scale <= 0) throw new Error('scale cannot be zero or less')
      if (doc.nodes[id].scale !== scale) doc.nodes[id].scale = scale
    }
  },
})

export const editTable = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeEditTable',
  reducer: doc => {
    const {id, gridOptions} = node
    if (gridOptions && doc.nodes[id].gridOptions !== gridOptions) {
      doc.nodes[id].gridOptions = gridOptions
    } else if (!gridOptions && doc.nodes[id].gridOptions) {
      delete doc.nodes[id].gridOptions
    }
  },
})

export const setImage = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeSetImage',
  reducer: doc => {
    const {id, image} = node
    if (image && doc.nodes[id].image !== image) {
      doc.nodes[id].image = image
    } else if (!image && doc.nodes[id].image) {
      delete doc.nodes[id].image
    }
  },
})

export const setImagePosition = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeSetImagePosition',
  reducer: doc => {
    const {id, imagePosition} = node
    if (imagePosition && doc.nodes[id].imagePosition !== imagePosition) {
      doc.nodes[id].imagePosition = imagePosition
    } else if (!imagePosition && doc.nodes[id].imagePosition) {
      delete doc.nodes[id].imagePosition
    }
  },
})

export const setFile = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeSetFile',
  reducer: doc => {
    const {id, file} = node
    if (file && doc.nodes[id].file !== file) {
      doc.nodes[id].file = file
    } else if (!file && doc.nodes[id].file) {
      delete doc.nodes[id].file
    }
  },
})

export const remove = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeRemove',
  reducer: doc => {
    const {id} = node
    if (id in doc.nodes) {
      let {children} = doc.nodes[id]
      while (children && children.length) {
        const subChildren = [] as unknown as AutomergeList<NodeId>
        children.forEach(childId => {
          if (doc.nodes[childId]?.children) subChildren.push(...(doc.nodes[childId].children as Array<NodeId>))
          const {edges} = doc
          if (edges) {
            Object.entries(edges).forEach(([edgeId, edge]) => {
              if (edge.start === childId || edge.end === childId) {
                log('remove node: remove child node edge', {childId, node, edgeId, edge})
                delete edges[edgeId]
              }
            })
          }
          log('remove node: remove child node')
          if (childId in doc.nodes) {
            delete doc.nodes[childId]
          } else {
            logError(`child '${childId}' not found in nodes`)
          }
        })
        children = subChildren
      }

      const parentNodeId = doc.nodes[id].parent
      if (!parentNodeId) throw new Error(`Missing parent in node with id '${id}'`)

      const parentChildren = doc.nodes[parentNodeId].children

      if (!parentChildren) throw new Error(`Missing children in node with id '${parentNodeId}', parent of '${id}'`)

      parentChildren.deleteAt(parentChildren.indexOf(id))
      delete doc.nodes[id]
      log('remove node', {id, node})

      const {edges} = doc
      if (edges) {
        Object.entries(edges).forEach(([edgeId, edge]) => {
          if (edge.start === id || edge.end === id) {
            log('remove node: remove edge', {id, node, edgeId, edge})
            delete edges[edgeId]
          }
        })
      }
    }
  },
})

export const duplicate = (node: NodeData, idRef?: {current: unknown}): MapStoreAction => ({
  node,
  name: 'nodeDuplicate',
  reducer: doc => {
    const {parent, id} = node

    if (!parent) throw new Error(`Error duplicating node '${id}': Cannot duplicate root node (node has no parent)`)

    const firstId = duplicateNode(doc, doc, id, parent, true)

    const firstNode = doc.nodes[firstId]

    if (!firstNode) throw new Error(`Error duplicating node '${id}': duplicate node was not created`)

    firstNode.x = (firstNode.x || 0) + 10
    firstNode.y = (firstNode.y || 0) + 10

    const parentChildren = doc.nodes[parent].children

    if (!parentChildren) throw new Error(`Error duplicating node '${id}': parent has no children`)

    parentChildren.push(firstId)

    // idRef is a somehow dirty hack to return the created id back to the function that dispatched it
    if (idRef) idRef.current = firstId
  },
})

export const all = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeAll',
  reducer: doc => {
    ;[move, resize, edit, rescale, setImage, setImagePosition, setFile, setColor]
      .map(action => action(node))
      .forEach(({reducer}) => {
        reducer(doc)
      })
  },
})

export const reorgNode = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeReorgRec',
  reducer: doc => {
    ;[move, resize]
      .map(action => action(node))
      .forEach(({reducer}) => {
        reducer(doc)
      })
  },
})

export const addEdge = (edge: EdgeContent): MapStoreAction => ({
  edge,
  name: 'edgeAdd',
  reducer: doc => {
    // ignore the given id, as we create on that identifies start and end node
    const {start, end, title, id: givenId} = edge

    const id = givenId || generateEdgeId(start, end)

    if (!doc.edges) doc.edges = {}

    if (!(start in doc.nodes) || !(end in doc.nodes)) {
      throw new Error(`Either start (${start}) or end (${end}) node of this link does not exist`)
    }

    if (start === end) {
      throw new Error(`The connection has the same start and end (${start})`)
    }

    if (doc.edges[id]) {
      throw new Error(`A connection from '${start}' to '${end}' already exists`)
    }

    doc.edges[id] = {
      id,
      start,
      end,
    }

    if (title) doc.edges[id].title = title
  },
})

export const addTemplate = (node: NodeData, template: MapContentData): MapStoreAction => ({
  node,
  template,
  name: 'templateAdd',
  reducer: doc => {
    const {root: copyRootId} = template
    const parent = node.id

    const templateRoot = duplicateNode(doc, template, copyRootId, parent)

    doc.nodes[templateRoot].x = 0
    doc.nodes[templateRoot].y = 0

    const parentNode = doc.nodes[parent]
    if (!parentNode.children) parentNode.children = [] as unknown as AutomergeList<NodeId>
    parentNode.children.push(templateRoot)
  },
})

export const fromTemplate = (node: NodeData, template: MapContentData): MapStoreAction => ({
  node,
  template,
  name: 'templateAdd',
  reducer: doc => {
    applyTemplate(doc, node.id, template)
  },
})

export const removeEdge = (edge: EdgeData): MapStoreAction => ({
  edge,
  name: 'edgeRemove',
  reducer: doc => {
    const {id} = edge

    if (!doc.edges) return

    if (id in doc.edges) {
      delete doc.edges[id]
    }
  },
})

export const setEdgeColor = (edge: EdgeData): MapStoreAction => ({
  edge,
  name: 'edgeSetColor',
  reducer: doc => {
    const {id, color} = edge

    if (!doc.edges) throw new Error(`Error setting color to edge ${id}: no edges found`)

    const storeEdge = doc.edges[id]

    if (!storeEdge) throw new Error(`Error setting color to edge ${id}: edge not found`)

    if (color && storeEdge.color !== color) {
      doc.edges[id].color = color
    } else if (color === undefined && doc.edges[id].color) {
      delete doc.edges[id].color
    }
  },
})

export const editEdge = (edge: EdgeData): MapStoreAction => ({
  edge,
  name: 'nodeEditEdge',
  reducer: doc => {
    const {id, title} = edge

    if (!doc.edges) throw new Error(`Error setting color to edge ${id}: no edges found`)

    if (title === undefined && doc.edges[id].title !== undefined) {
      delete doc.edges[id].title
    } else if (doc.edges[id].title !== title) {
      doc.edges[id].title = title
    }
  },
})

export const createTag = (tag: NodeTagData): MapStoreAction => ({
  tag,
  name: 'nodeCreateTag',
  reducer: doc => {
    const createId = () => {
      let index = generateTagId()
      while (index in doc.nodes) {
        index = generateTagId()
      }
      return index
    }

    const {id = createId(), name, color} = tag
    if (!name) throw new Error('No name given to create tag')
    if (!color) throw new Error('No color given to create tag')
    if (doc.tags?.find(otherTag => otherTag.name === name)) throw new Error(`Tag with the name ${name} already exists`)
    if (id && doc.tags?.find(otherTag => otherTag.id === id)) throw new Error(`Tag with this id ${id} already exists`)

    if (!doc.tags) doc.tags = [] as unknown as AutomergeList<NodeTagData>

    doc.tags.push({id, name, color})
  },
})

export const changeTagColor = (tag: NodeTagData): MapStoreAction => ({
  tag,
  name: 'nodeChangeTagColor',
  reducer: doc => {
    const {id, color} = tag

    if (!doc.tags) throw new Error('Cannot change color of tag: No tags found')
    if (!id) throw new Error('Cannot change color of tag: No id given')

    const storeTag = doc.tags.find(t => t.id === id)
    if (!storeTag) throw new Error(`Cannot change color of tag: Could not find tag with id ${id}`)
    storeTag.color = color
  },
})

export const changeTagName = (tag: NodeTagData): MapStoreAction => ({
  tag,
  name: 'nodeChangeTagName',
  reducer: doc => {
    const {id, name} = tag

    if (!doc.tags) throw new Error('Cannot change name of tag: No tags found')
    if (!id) throw new Error('Cannot change name of tag: No id given')

    const storeTag = doc.tags.find(t => t.id === id)
    if (!storeTag) throw new Error(`Cannot change name of tag: Could not find tag with id ${id}`)
    storeTag.name = name
  },
})

export const deleteTag = (tag: NodeTagData): MapStoreAction => ({
  tag,
  name: 'nodeDeleteTag',
  reducer: doc => {
    const {id} = tag

    if (!doc.tags) throw new Error('Cannot delete tag: No tags found')
    if (!id) throw new Error('Cannot delete tag: No id given')

    const storeTag = doc.tags.find(t => t.id === id)
    if (!storeTag) throw new Error(`Cannot change name of tag: Could not find tag with id ${id}`)
    doc.tags.deleteAt(doc.tags.indexOf(storeTag))
  },
})

export const attachTag = (node: NodeData, tag: NodeTagData): MapStoreAction => ({
  node,
  tag,
  name: 'nodeAttachTag',
  reducer: doc => {
    const {id: tagId} = tag
    const {id: nodeId} = node

    if (!doc.tags) throw new Error('Cannot attach tag to node: No tags found')
    if (!tagId) throw new Error('Cannot attach tag to node: No tag id given')
    if (!nodeId) throw new Error('Cannot attach tag to node: No node id given')

    const storeNode = doc.nodes[nodeId]
    if (!storeNode) throw new Error(`Cannot attach tag to node: Could not find node with id ${nodeId}`)

    const storeTag = doc.tags.find(t => t.id === tagId)
    if (!storeTag) throw new Error(`Cannot attach tag to node: Could not find tag with id ${tagId}`)

    if (!storeNode.tags) storeNode.tags = [] as unknown as AutomergeList<NodeTagId>
    storeNode.tags.push(tagId)
  },
})

export const detachTag = (node: NodeData, tag: NodeTagData): MapStoreAction => ({
  node,
  tag,
  name: 'nodeAttachTag',
  reducer: doc => {
    const {id: tagId} = tag
    const {id: nodeId} = node

    if (!doc.tags) throw new Error('Cannot detach tag to node: No tags found')
    if (!tagId) throw new Error('Cannot detach tag to node: No tag id given')
    if (!nodeId) throw new Error('Cannot detach tag to node: No node id given')

    const storeNode = doc.nodes[nodeId]
    if (!storeNode) throw new Error(`Cannot detach tag to node: Could not find node with id ${nodeId}`)

    const storeTag = doc.tags.find(t => t.id === tagId)
    if (!storeTag) throw new Error(`Cannot detach tag to node: Could not find tag with id ${tagId}`)

    if (!storeNode.tags) throw new Error(`Cannot detach tag to node: no tags defined on node ${nodeId}`)
    const tags = storeNode.tags as unknown as AutomergeList<NodeTagId>
    tags.deleteAt(tags.indexOf(tagId))
  },
})

export const setCheckBox = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeSetCheckbox',
  reducer: doc => {
    const {id, checked} = node
    if (!id) throw new Error('Cannot add checkbox: No node id given')

    const storeNode = doc.nodes[id]
    if (!storeNode) throw new Error(`Cannot attach tag to node: Could not find node with id ${id}`)

    storeNode.checked = checked
  },
})

export const deleteCheckBox = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeSetCheckbox',
  reducer: doc => {
    const {id} = node
    if (!id) throw new Error('Cannot delete checkbox: No node id given')

    const storeNode = doc.nodes[id]
    if (!storeNode) throw new Error(`Cannot delete checkbox: Could not find node with id ${id}`)

    delete storeNode.checked
  },
})

export const addPrompt = (node: NodeData, id: NodeId): MapStoreAction => ({
  node,
  name: 'nodeAddPrompt',
  reducer: doc => {
    const {id: parentId} = node
    const parentNode = doc.nodes[parentId]
    if (!parentNode.prompts) parentNode.prompts = [] as unknown as AutomergeList<NodeId>

    if (!(id in doc.nodes)) {
      throw new Error(`Prompts (${id}) does not exist`)
    }

    parentNode.prompts.push(id)
  },
})

export const removePrompts = (node: NodeData): MapStoreAction => ({
  node,
  name: 'nodeRemovePrompts',
  reducer: doc => {
    const {id} = node
    if (id in doc.nodes) {
      const {prompts} = doc.nodes[id]
      if (prompts && prompts.length) {
        prompts.forEach(childId => {
          if (childId in doc.nodes) {
            remove(doc.nodes[childId]).reducer(doc)
          }
        })
        delete doc.nodes[id].prompts
      }
    }
  },
})
