import debug from 'debug'

import {
  addTemplate,
  attachTag,
  deleteCheckBox,
  detachTag,
  duplicate,
  remove,
  removeEdge,
  reorgNode,
  resize,
  setBorderColor,
  setCheckBox,
  setColor,
  setEdgeColor,
  setFile,
  setImage,
  setImagePosition,
  editTable,
} from '../store/actions'
import rectInsideRect from './utils/intersect/rectInsideRect'

import {duplicateNode} from '../store/utils'
import {
  ImagePositions,
  MapContentData,
  MapStoreAction,
  MapStoreActions,
  NodeTagId,
  NODE_VISIBLE,
  NodeId,
  GridOptions,
} from './types'
import CONFIG from './CONFIG'

import type PixiRenderEngine from './PixiRenderEngine'
import type PixiNode from './PixiNode'
import type MapStoreWrite from '../store/MapStoreWrite'
import MapStoreReadOnly from '../store/MapStoreReadOnly'
import PixiEdge from './PixiEdge'
import InfinityTraversal from './reorg-algorithm/InfinityTraversal'
import ICardPacker from './reorg-algorithm/ICardPacker'

const log = debug('app:RenderEngine:Control')

export const MOVE_DIRECTIONS = {
  right: 'right',
  left: 'left',
  up: 'up',
  down: 'down',
}

export const ZOOM_DIRECTIONS = {
  in: -1,
  out: 1,
}

class RenderEngineControl {
  engine: PixiRenderEngine

  store: MapStoreWrite | MapStoreReadOnly

  constructor(engine: PixiRenderEngine) {
    this.engine = engine
    this.store = engine.store
  }

  removeSelected = (): void => {
    const {store} = this
    const {eventManager} = this.engine
    const {selectedNodes, selectedEdges} = this.engine.eventManager
    log('remove', {selectedNodes, selectedEdges})

    // remove only those selected nodes that do not have a selected (transitive) parent
    const getTransitiveParentIds = (node: PixiNode): string[] => {
      const parents = []
      let temp = node
      while (temp.parentNode && !temp.parentNode.isRoot) {
        parents.push(temp.parentNode)
        temp = temp.parentNode
      }
      return parents.map(p => p.id)
    }
    const intersect = (a: string[], b: string[]): boolean => {
      return a.some(id => b.includes(id))
    }

    const nodesToRemove = [...this.engine.eventManager.selectedNodes].filter(({isRoot}) => !isRoot)
    const nodeIdsToRemove = nodesToRemove.map(node => node.id)
    const selectedNodesWithSelectedParents = nodesToRemove.filter(node =>
      intersect(getTransitiveParentIds(node), nodeIdsToRemove),
    )
    const selectedNodesWithoutSelectedParents = nodesToRemove.filter(
      node => !intersect(getTransitiveParentIds(node), nodeIdsToRemove),
    )
    selectedNodesWithSelectedParents.forEach(node => eventManager.unselectNode(node))
    store.dispatch(
      [...selectedNodesWithoutSelectedParents]
        .map<MapStoreAction>(node => remove(node))
        .concat([...selectedEdges].map(edge => removeEdge(edge))),
    )
    eventManager.selectFromHistory()
  }

  setColor = (colorName: string): void => {
    const {dispatch} = this.store
    const {selectedNodes, selectedEdges} = this.engine.eventManager
    log('color', {selectedNodes, selectedEdges, colorName})
    dispatch(
      [...selectedNodes]
        .map<MapStoreAction>(node => {
          node.color = colorName ? `@${colorName}` : undefined
          return setColor(node)
        })
        .concat(
          [...selectedEdges].map(edge => {
            edge.color = colorName ? `@${colorName}` : undefined
            return setEdgeColor(edge)
          }),
        ),
    )
  }

  setBorderColor = (colorName: string): void => {
    const {dispatch} = this.store
    const {selectedNodes} = this.engine.eventManager
    log('border color', {selectedNodes, colorName})
    dispatch(
      [...selectedNodes].map(node => {
        node.borderColor = colorName ? `@${colorName}` : undefined
        return setBorderColor(node)
      }),
    )
  }

  setImageWithPositionAndSize = (
    image: string,
    imagePosition: ImagePositions,
    width: number,
    height: number,
    nodes = this.engine.eventManager.selectedNodes,
  ): void => {
    const {dispatch} = this.store
    log('image', {nodes, image})
    const aspectRation = width / height

    dispatch(
      [...nodes]
        .map(node => {
          node.image = image
          node.imagePosition = imagePosition

          const actions = [setImage(node), setImagePosition(node)]

          const imageHeight = node.width / aspectRation
          const imageHeightInGridSize = Math.ceil(imageHeight / CONFIG.nodes.gridSize) * CONFIG.nodes.gridSize
          const newHeight = node.headerHeight + imageHeightInGridSize
          if (newHeight > node.height) {
            node.resize(node.width, newHeight)
            actions.push(resize(node))
          }

          return actions
        })
        .flat(),
    )
  }

  setImagePosition = (imagePosition: ImagePositions, nodes = this.engine.eventManager.selectedNodes): void => {
    const {dispatch} = this.store
    log('image position', {nodes, imagePosition})
    dispatch(
      [...nodes].map(node => {
        node.imagePosition = imagePosition
        return setImagePosition(node)
      }),
    )
  }

  setFile = (image: string, nodes = this.engine.eventManager.selectedNodes): void => {
    const {dispatch} = this.store
    log('file', {nodes, image})
    dispatch(
      [...nodes].map(node => {
        node.file = image
        return setFile(node)
      }),
    )
  }

  goNode = (direction: string): void => {
    const {eventManager} = this.engine
    const {lastSelectedNode} = eventManager

    if (!lastSelectedNode) return

    const horiz = direction === MOVE_DIRECTIONS.left || direction === MOVE_DIRECTIONS.right ? 'x' : 'y'
    const vertical = direction === MOVE_DIRECTIONS.left || direction === MOVE_DIRECTIONS.up ? -1 : 1

    const nextNode = lastSelectedNode.siblingNodes
      .filter(node => node[horiz] * vertical > lastSelectedNode[horiz] * vertical)
      .sort((n1, n2) =>
        (lastSelectedNode.x - n1.x) ** 2 + (lastSelectedNode.y - n1.y) ** 2 >
        (lastSelectedNode.x - n2.x) ** 2 + (lastSelectedNode.y - n2.y) ** 2
          ? -1
          : 1,
      )
      .pop()

    log('got to node', {direction, lastSelected: lastSelectedNode, horiz, vertical, nextNode})

    if (nextNode) eventManager.selectSingleNode(nextNode)
  }

  selectRoot = (): void => {
    const {rootNode, eventManager} = this.engine
    if (rootNode) eventManager.selectSingleNode(rootNode)
  }

  selectParent = (): void => {
    const {eventManager} = this.engine
    const {lastSelectedNode} = eventManager

    log('select parent', {lastSelected: lastSelectedNode})

    if (lastSelectedNode && !lastSelectedNode.isRoot) eventManager.selectSingleNode(lastSelectedNode.parentNode)
  }

  selectChild = (): void => {
    const {eventManager} = this.engine
    const {lastSelectedNode} = eventManager

    if (!lastSelectedNode) return

    const topLeftChild = [...lastSelectedNode.childNodes]
      .sort((n1, n2) => (n1.x ** 2 + n1.y ** 2 < n2.x ** 2 + n2.y ** 2 ? 1 : -1))
      .pop()

    log('selectChild', {topLeftChild})

    if (topLeftChild) {
      eventManager.selectSingleNode(topLeftChild)
    }
  }

  zoom = (direction: typeof ZOOM_DIRECTIONS[keyof typeof ZOOM_DIRECTIONS]): void => {
    const {mountRef, viewport, zoomAtPoint} = this.engine
    const {keyboardZoomFactor} = CONFIG
    const {width, height} = mountRef?.getBoundingClientRect() || {width: 0, height: 0}
    const position = {
      clientX: width / 2,
      clientY: height / 2,
      scale: viewport.scale.x * keyboardZoomFactor ** direction,
    }
    log('zoom', {direction, width, height, position})
    zoomAtPoint(position)
  }

  zoomToSelected = (): void => {
    const {zoomToNode, zoomToEdge} = this
    const {lastSelectedNode, lastSelectedEdge} = this.engine.eventManager

    if (lastSelectedNode) zoomToNode(lastSelectedNode)
    else if (lastSelectedEdge) zoomToEdge(lastSelectedEdge)
  }

  zoomToEdge = (edge: PixiEdge): void => {
    const startNodePosition = edge.startNode.isInViewport()
    const endNodePosition = edge.endNode.isInViewport()

    log('zoom to edge', edge)

    let node
    if (startNodePosition === NODE_VISIBLE.NO) {
      node = edge.startNode
    } else if (endNodePosition === NODE_VISIBLE.NO) {
      node = edge.endNode
    } else if (startNodePosition === NODE_VISIBLE.OVER) {
      if (endNodePosition === NODE_VISIBLE.OVER) {
        node = edge.startNode
      } else {
        node = edge.endNode
      }
    } else {
      node = edge.startNode
    }

    if (startNodePosition === NODE_VISIBLE.CENTER) {
      node = edge.endNode
    }
    if (endNodePosition === NODE_VISIBLE.CENTER) {
      node = edge.startNode
    }

    this.zoomToNode(node)
  }

  zoomToNode = (node: PixiNode, padding = CONFIG.nodes.zoomToNodePadding): void => {
    log('zoom to node', node)
    node.zoomTo(padding).then()
    this.engine.emit('zoom-to-node', {node})
  }

  goToNode = (nodeId: NodeId): void => {
    const {root, renderNodes} = this.engine
    const id = nodeId || root

    if (id && id in renderNodes) renderNodes[id].zoomTo().then()
  }

  goToViewport = (x: number, y: number, scale: number): Promise<void> => {
    return this.engine.animateViewport({x, y, scale})
  }

  zoomToNodeById = (nodeId: string): void => {
    const {zoomToNode} = this
    const {renderNodes} = this.engine
    const node = renderNodes[nodeId]
    if (!node) return
    zoomToNode(node)
  }

  zoomOutViewport = (): void => {
    const {zoomToNode} = this
    const {viewport, rootNode} = this.engine

    if (!rootNode) return

    const view = viewport.getVisibleBounds()

    let nodes: PixiNode[] = [rootNode]
    let zoomNode: PixiNode = rootNode

    while (nodes.length) {
      const nextZoomNode = nodes.find(node => rectInsideRect(view, node.getViewportPosition()))

      if (nextZoomNode) {
        zoomNode = nextZoomNode
        nodes = [...nextZoomNode.childNodes]
      } else {
        break
      }
    }

    zoomToNode(zoomNode)
  }

  deleteImage = (): void => {
    const {dispatch} = this.engine.store
    const {selectedNodes} = this.engine.eventManager

    dispatch(
      [...selectedNodes].map(node => {
        node.image = undefined
        return setImage(node)
      }),
    )
  }

  deleteFile = (): void => {
    const {dispatch} = this.engine.store
    const {selectedNodes} = this.engine.eventManager

    dispatch(
      [...selectedNodes].map(node => {
        node.file = undefined
        return setFile(node)
      }),
    )
  }

  editTable = (gridOptions: GridOptions): void => {
    const {dispatch} = this.engine.store
    const {selectedNodes} = this.engine.eventManager
    dispatch(
      [...selectedNodes].map(node => {
        node.dirty = false
        node.gridOptions = gridOptions
        return editTable(node)
      }),
    )
  }

  duplicateNode = (): void => {
    const {eventManager} = this.engine
    const {dispatch} = this.engine.store
    const {lastSelectedNode} = this.engine.eventManager

    log('copyNode', {lastSelected: lastSelectedNode})

    if (lastSelectedNode && !lastSelectedNode.isRoot) {
      const idRef: {current: string} = {current: ''}
      dispatch(duplicate(lastSelectedNode, idRef))
      eventManager.selectSingleNode(idRef.current)
      eventManager.setHoverNode(idRef.current)
    }
  }

  copyNode = (node?: PixiNode): MapContentData => {
    const {map} = this.engine.store
    const copyNode = node || this.engine.eventManager.lastSelectedNode

    if (!copyNode) throw new Error('No node to copy found')
    if (!map) throw new Error('No map loaded')

    const {id: copyRootId} = copyNode

    const copy: MapContentData = {
      nodes: {},
      edges: {},
      root: '',
    }

    copy.root = duplicateNode(copy, map, copyRootId)

    log('copy node', {copy, copyRootId})

    return copy
  }

  pasteNode = (copy: MapContentData, targetNodes = [...this.engine.eventManager.selectedNodes]): MapStoreActions => {
    const templateActions = targetNodes.map(node => addTemplate(node, copy))

    // decollapse collapsed selected nodes
    const decollapseActions = targetNodes
      .filter(node => node.isCollapsed)
      .map(node => {
        node.decollapse()
        return resize(node)
      })

    log('paste node', {templateActions, decollapseActions, copy, nodes: targetNodes})

    return [...templateActions, ...decollapseActions]
  }

  reorgNodes = (recDepth: number, packer: ICardPacker, node?: PixiNode, withExpand = true): void => {
    const {dispatch} = this.engine.store
    const {lastSelectedNode} = this.engine.eventManager

    const targetNode = node || lastSelectedNode

    if (!targetNode) return

    const it = new InfinityTraversal(targetNode, packer)
    const changedNodes = it.pack(recDepth, withExpand)

    dispatch(changedNodes.map(n => reorgNode(n)))
  }

  toggleTag = (id: NodeTagId): void => {
    const {dispatch, tags} = this.engine.store
    const {lastSelectedNode} = this.engine.eventManager

    const tag = tags.find(t => t.id === id)

    if (!tag) throw new Error(`Cannot find tag '${id}' to attach to node`)
    if (!lastSelectedNode) throw new Error('Cannot attach tag without selecting a node to attach to')

    if (lastSelectedNode.tags.includes(id)) {
      dispatch(detachTag(lastSelectedNode, tag))
    } else {
      dispatch(attachTag(lastSelectedNode, tag))
    }
  }

  removeCheckBox = (): void => {
    const {dispatch} = this.engine.store
    const {selectedNodes} = this.engine.eventManager

    if (selectedNodes.size === 0) throw new Error('Cannot remove checkbox without selected nodes')

    dispatch([...selectedNodes].map(node => deleteCheckBox(node)))
  }

  setCheckBox = (checked: boolean): void => {
    const {dispatch} = this.engine.store
    const {selectedNodes} = this.engine.eventManager

    if (selectedNodes.size === 0) throw new Error('Cannot remove checkbox without selected nodes')

    dispatch(
      [...selectedNodes].map(node => {
        node.checked = checked
        return setCheckBox(node)
      }),
    )
  }
}

export default RenderEngineControl
