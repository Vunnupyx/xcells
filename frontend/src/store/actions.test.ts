import Automerge from 'automerge'

import * as originalActions from './actions'
import CONFIG from '../engine/CONFIG'

import range from '../shared/utils/range'
import {IMAGE_POSITIONS} from '../shared/config/constants'
import {EdgeData, MapContentData, NodeData, NodeTagData} from '../engine/types'

// wrap actions to check that we tested them all
const calledActions = new Set()
const actions = Object.fromEntries(
  Object.entries(originalActions).map(([name, action]) => [
    name,
    (...args: Parameters<typeof action>) => {
      calledActions.add(name)
      // @ts-ignore complains about args not being tuple, not sure how to solve it
      return action(...args)
    },
  ]),
) as typeof originalActions

const colorValues = [
  '#ffffff',
  '#fff',
  'red',
  'blue',
  // internal colors begin with @
  '@blue',
  '@red',
]

const longTitle = 'long title with special characters !@#$%^&*()[]<>{}\\";\'ßüöä 0123456789'

describe('MapStore actions', () => {
  let map: MapContentData
  beforeEach(() => {
    map = Automerge.from({
      nodes: {
        rootId: {id: 'rootId', title: 'test root node', children: ['childId']},
        childId: {id: 'childId', title: 'test child node', children: [], parent: 'rootId'},
      },
      title: 'test root node',
      root: 'rootId',
    }) as MapContentData
  })

  describe('node related', () => {
    it('should create and add new nodes', () => {
      // map is mutated by the reducer of an action, thats why we have the create a new one for every test
      range(50).forEach(i => {
        const newNode = {
          parent: 'rootId',
          id: `newId${i}`,
          x: i,
          y: i,
          width: 10,
          height: 10,
          scale: 0.1,
          title: 'newTitle',
        }
        map = Automerge.change(map, actions.add(newNode).reducer)

        expect(map.nodes.rootId.children).toContain(newNode.id)
        expect(map.nodes[newNode.id]).toStrictEqual(newNode)
      })

      expect(map.nodes.rootId?.children?.length).toBe(51)
    })

    it('should use default values', () => {
      const newNode = {parent: 'rootId', id: 'newId', x: 0, y: 0, title: 'newTitle'}

      map = Automerge.change(map, actions.add(newNode).reducer)

      expect(map.nodes.rootId.children).toContain('newId')
      expect(map.nodes.newId).toMatchObject(newNode)
      expect(map.nodes.newId.scale).toBe(CONFIG.nodes.create.scale)
      expect(map.nodes.newId.width).toBe(CONFIG.nodes.create.width)
    })

    it('should edit node', () => {
      const editNode = {id: 'childId', title: 'title edited'}

      map = Automerge.change(map, actions.edit(editNode).reducer)

      expect(map.nodes.childId.title).toBe('title edited')
    })

    it('should delete title', () => {
      const editNode = {id: 'childId', title: ''}

      map = Automerge.change(map, actions.edit(editNode).reducer)

      expect(map.nodes.childId.title).toBe('')
    })

    it('should edit node with one space', () => {
      const editNode = {id: 'childId', title: ' '}

      map = Automerge.change(map, actions.edit(editNode).reducer)

      expect(map.nodes.childId.title).toBe(' ')
    })

    it('should edit node with same input', () => {
      const title = 'title'
      const editNode = {id: 'childId', title}

      map = Automerge.change(map, actions.edit(editNode).reducer)

      expect(map.nodes.childId.title).toBe(title)

      range(10).forEach(() => (map = Automerge.change(map, actions.edit(editNode).reducer)))

      expect(map.nodes.childId.title).toBe(title)
    })

    it('should edit node with long text and small size', () => {
      const width = 1
      const height = 1

      const resizeNode = {id: 'childId', width, height}
      const editNode = {
        id: 'childId',
        title: longTitle,
      }

      map = Automerge.change(map, actions.resize(resizeNode).reducer)
      map = Automerge.change(map, actions.edit(editNode).reducer)

      expect(map.nodes.childId.title).toBe(longTitle)
      expect(map.nodes.childId.width).toBe(1)
      expect(map.nodes.childId.height).toBe(1)
    })

    it('should resize node', () => {
      const width = 500
      const height = 500

      const resizeNode = {id: 'childId', width, height}

      map = Automerge.change(map, actions.resize(resizeNode).reducer)

      expect(map.nodes.childId.width).toBe(500)
      expect(map.nodes.childId.height).toBe(500)
    })

    it('should resize node negative', () => {
      const width = -100
      const height = -100

      const resizeNode = {id: 'childId', width, height}

      map = Automerge.change(map, actions.resize(resizeNode).reducer)

      expect(map.nodes.childId.width).toBe(-100)
      expect(map.nodes.childId.height).toBe(-100)
    })

    it('should resize node', () => {
      const resizeValues = [
        [0, 0],
        [100, 100],
        [-100, 100],
        [100, -100],
        [-100, -100],
      ]

      resizeValues.forEach(([width, height]) => {
        const resizeNode = {id: 'childId', width, height}

        map = Automerge.change(map, actions.resize(resizeNode).reducer)

        expect(map.nodes.childId.width).toBe(width)
        expect(map.nodes.childId.height).toBe(height)
      })
    })

    it('should accept color values', () => {
      colorValues.forEach(color => {
        const colorNode = {id: 'childId', color}

        map = Automerge.change(map, actions.setColor(colorNode).reducer)

        expect(map.nodes.childId.color).toBe(color)
      })

      // delete the color
      map = Automerge.change(map, actions.setColor({id: 'childId', color: undefined}).reducer)

      expect(map.nodes.childId.color).toBe(undefined)
    })

    it('should move node', () => {
      const width = 500
      const height = 500

      let moveNode = {parent: 'rootId', id: 'childId', x: 150, y: 150, width, height}

      map = Automerge.change(map, actions.resize(moveNode).reducer)
      map = Automerge.change(map, actions.move(moveNode).reducer)

      expect(map.nodes.childId.x).toBe(150)
      expect(map.nodes.childId.y).toBe(150)

      moveNode = {parent: 'rootId', id: 'childId', x: 400, y: 400, width, height}
      map = Automerge.change(map, actions.move(moveNode).reducer)

      expect(map.nodes.childId.x).toBe(400)
      expect(map.nodes.childId.y).toBe(400)
    })

    it('should rescale node with positive numbers', () => {
      const scaleValues = [0.0001, 0.5, 1, 2, 100, 99999999]

      scaleValues.forEach(scale => {
        const scaleNode = {id: 'childId', scale}

        map = Automerge.change(map, actions.rescale(scaleNode).reducer)

        expect(map.nodes.childId.scale).toBe(scale)
      })
    })

    it('should throw exception when rescale node with negative number or zero', () => {
      const originalScale = map.nodes.childId.scale

      const scaleValues = [-1000, -1, -0.0001, 0]

      scaleValues.forEach(scale => {
        const scaleNode = {id: 'childId', scale}

        expect(() => Automerge.change(map, actions.rescale(scaleNode).reducer)).toThrow()
        expect(map.nodes.childId.scale).toBe(originalScale)
      })
    })

    it('should set an gridOptions to node and delete it again', () => {
      const gridOptions = {
        rowData: [{name: 'Username', type: 'Type'}],
        columnDefs: [{field: 'name'}, {field: 'type'}],
        filterModel: {},
        columnState: [
          {
            aggFunc: null,
            colId: 'name',
            flex: null,
            hide: false,
            pinned: null,
            pivot: false,
            pivotIndex: null,
            rowGroup: false,
            rowGroupIndex: null,
            sort: null,
            sortIndex: null,
            width: 215,
          },
          {
            aggFunc: null,
            colId: 'type',
            flex: null,
            hide: false,
            pinned: null,
            pivot: false,
            pivotIndex: null,
            rowGroup: false,
            rowGroupIndex: null,
            sort: null,
            sortIndex: null,
            width: 215,
          },
        ],
      }

      const tableNode = {id: 'childId', gridOptions} as NodeData

      map = Automerge.change(map, actions.editTable(tableNode).reducer)

      expect(map.nodes.childId.gridOptions).toStrictEqual(gridOptions)

      tableNode.gridOptions = undefined

      map = Automerge.change(map, actions.editTable(tableNode).reducer)

      expect(map.nodes.childId.gridOptions).toBe(undefined)
    })

    it('should set an Image to node and delete it again', () => {
      const image = 'image-id'

      const imageNode = {id: 'childId', image} as NodeData

      map = Automerge.change(map, actions.setImage(imageNode).reducer)

      expect(map.nodes.childId.image).toBe(image)

      imageNode.image = undefined

      map = Automerge.change(map, actions.setImage(imageNode).reducer)

      expect(map.nodes.childId.image).toBe(undefined)
    })

    it('should set a image position to node and delete it again', () => {
      const imagePosition = IMAGE_POSITIONS.stretch

      const positionNode = {id: 'childId', imagePosition} as NodeData

      map = Automerge.change(map, actions.setImagePosition(positionNode).reducer)

      expect(map.nodes.childId.imagePosition).toBe(imagePosition)

      positionNode.imagePosition = undefined

      map = Automerge.change(map, actions.setImagePosition(positionNode).reducer)

      expect(map.nodes.childId.imagePosition).toBe(undefined)
    })

    it('should set a File to node and delete it again', () => {
      const file = 'image-id'

      const imageNode = {id: 'childId', file} as NodeData

      map = Automerge.change(map, actions.setFile(imageNode).reducer)

      expect(map.nodes.childId.file).toBe(file)

      imageNode.file = undefined

      map = Automerge.change(map, actions.setFile(imageNode).reducer)

      expect(map.nodes.childId.file).toBe(undefined)
    })

    it('should set a border color', () => {
      colorValues.forEach(borderColor => {
        const borderColorNode = {id: 'childId', borderColor}

        map = Automerge.change(map, actions.setBorderColor(borderColorNode).reducer)

        expect(map.nodes.childId.color).toBe(undefined)
        expect(map.nodes.childId.borderColor).toBe(borderColor)
      })

      // delete the border color
      map = Automerge.change(map, actions.setBorderColor({id: 'childId', borderColor: undefined}).reducer)

      expect(map.nodes.childId.borderColor).toBe(undefined)
    })

    it('should remove children nodes', () => {
      const removeNode = {id: 'rootId'}
      map = Automerge.change(map, actions.removeChildren(removeNode).reducer)
      expect(map.nodes.rootId.children?.length).toBe(0)
      expect(map.nodes.childId).toBe(undefined)
    })

    it('should not remove any children node, while deleting a non-existed-node', () => {
      const removeNode = {id: 'undefined'}

      map = Automerge.change(map, actions.removeChildren(removeNode).reducer)

      expect(map.nodes.rootId.children?.length).toBe(1)
      expect(map.nodes.rootId.children).toContain('childId')
    })

    it('should remove node', () => {
      // automerge is needed here as the "remove" action uses automerge functionality
      const removeNode = {id: 'childId'}

      map = Automerge.change(map, actions.remove(removeNode).reducer)

      expect(map.nodes.rootId.children?.length).toBe(0)
      expect(map.nodes.childId).toBe(undefined)
    })

    it('should not remove any node, while deleting a non-existed-node', () => {
      const removeNode = {id: 'undefined'}

      map = Automerge.change(map, actions.remove(removeNode).reducer)

      expect(map.nodes.rootId.children?.length).toBe(1)
      expect(map.nodes.rootId.children).toContain('childId')
    })

    it('should duplicate node', () => {
      const duplicateNode = {parent: 'rootId', id: 'childId'}

      map = Automerge.change(map, actions.duplicate(duplicateNode).reducer)

      expect(map.nodes.rootId.children?.length).toBe(2)
      expect(map.nodes.rootId.children).toContain('childId')
    })

    it('should edit, resize, rescale and move node (with all function)', () => {
      const width = 200
      const height = 300
      const scale = 10
      const x = 100
      const y = 1000
      const title = 'Hallo from the other side'

      const editResizeRescaleMoveNode = {parent: 'rootId', id: 'childId', width, height, x, y, title, scale}

      map = Automerge.change(map, actions.all(editResizeRescaleMoveNode).reducer)

      expect(map.nodes.childId.title).toBe(title)
      expect(map.nodes.childId.scale).toBe(scale)
      expect(map.nodes.childId.width).toBe(width)
      expect(map.nodes.childId.height).toBe(height)
      expect(map.nodes.childId.x).toBe(x)
      expect(map.nodes.childId.y).toBe(y)
      expect(map.nodes.rootId.children?.length).toBe(1)
    })

    it('should resize and move node', () => {
      const width = 200
      const height = 300
      const x = 100
      const y = 1000

      const resizeMoveNode = {parent: 'rootId', id: 'childId', width, height, x, y}

      map = Automerge.change(map, actions.reorgNode(resizeMoveNode).reducer)

      expect(map.nodes.childId.width).toBe(width)
      expect(map.nodes.childId.height).toBe(height)
      expect(map.nodes.childId.x).toBe(x)
      expect(map.nodes.childId.y).toBe(y)
      expect(map.nodes.rootId.children?.length).toBe(1)
    })

    it('should duplicate a node', () => {
      const originalCount = Object.keys(map.nodes).length
      const idRef = {current: ''}

      map = Automerge.change(map, actions.duplicate(map.nodes.childId, idRef).reducer)

      const newId = idRef.current

      expect(Object.keys(map.nodes).length).toBeGreaterThan(originalCount)
      expect(map.nodes[newId].parent).toBe(map.nodes.childId.parent)
      expect(map.nodes[newId].title).toBe(map.nodes.childId.title)
      expect(map.nodes.rootId.children).toContain(newId)
      // TODO: check for edges, too, when implemented
    })

    it('should add a template to a node', () => {
      map = Automerge.change(map, actions.addTemplate(map.nodes.childId, map).reducer)

      expect(map.nodes.childId.children).toHaveLength(1)

      const newId = map.nodes.childId.children?.at(0)

      if (!newId) {
        fail('Could not find new child')
      }

      expect(map.nodes[newId].parent).toBe(map.nodes.childId.id)
      expect(map.nodes[newId].title).toBe(map.nodes.rootId.title)
      expect(map.nodes[newId].children).toHaveLength(1)
      // TODO: check for edges, too, when implemented
    })

    it('should set a template to a node', () => {
      const oldChildTitle = map.nodes.childId.title

      map = Automerge.change(map, actions.fromTemplate(map.nodes.childId, map).reducer)

      expect(map.nodes.childId.title).toBe(map.nodes.rootId.title)
      expect(map.nodes.childId.children).toHaveLength(1)

      const newId = map.nodes.childId.children?.at(0)
      if (!newId) {
        fail('Could not find new children.')
      }
      expect(map.nodes[newId].parent).toBe(map.nodes.childId.id)
      expect(map.nodes[newId].title).toBe(oldChildTitle)
      expect(!map.nodes[newId].children || map.nodes[newId].children?.length === 0).toBeTruthy()
      // TODO: check for edges, too, when implemented
    })
  })

  describe('edge related', () => {
    let edge: EdgeData
    beforeEach(() => {
      edge = {id: 'rootId_child', start: 'rootId', end: 'childId', title: 'relation'}
      map = Automerge.change(map, actions.addEdge(edge).reducer)
    })

    it('should add a new edge', () => {
      expect(Object.keys(map.edges || {}).length).toBe(1)
      expect(map.edges && map.edges[edge.id]).toEqual(edge)
    })

    it('should delete edge', () => {
      const originalEdgeCount = Object.keys(map.edges || {}).length

      map = Automerge.change(map, actions.removeEdge(edge).reducer)

      expect(Object.keys(map.edges || {}).length).toBe(originalEdgeCount - 1)
    })

    it('should color edge', () => {
      colorValues.forEach(color => {
        map = Automerge.change(map, actions.setEdgeColor({...edge, color}).reducer)

        expect(map.edges && map.edges[edge.id].color).toBe(color)
      })
    })

    it('should delete color of an edge', () => {
      map = Automerge.change(map, actions.setEdgeColor({...edge, color: undefined}).reducer)

      expect(map.edges && map.edges[edge.id].color).toBe(undefined)
    })

    it('should edit edge title', () => {
      map = Automerge.change(map, actions.editEdge({...edge, title: longTitle}).reducer)

      expect(map.edges && map.edges[edge.id].title).toBe(longTitle)
    })

    it('should delete edge title', () => {
      map = Automerge.change(map, actions.editEdge({...edge, title: undefined}).reducer)

      expect(map.edges && map.edges[edge.id].title).toBe(undefined)
    })
  })

  describe('tags related', () => {
    let tag: NodeTagData

    beforeEach(() => {
      tag = {id: '1', name: 'name', color: '@red'}
      map = Automerge.change(map, actions.createTag(tag).reducer)
    })

    describe('createTag', () => {
      it('should create a new tag', () => {
        expect(map.tags?.length).toBe(1)
        expect(map.tags?.at(0)?.id).toBe(tag.id)
        expect(map.tags?.at(0)?.name).toBe(tag.name)
        expect(map.tags?.at(0)?.color).toBe(tag.color)
      })

      it('should throw an error when adding a tag with the same name', () => {
        expect(() => Automerge.change(map, actions.createTag({...tag, id: '2'}).reducer)).toThrow(/name.*exists/)
      })

      it('should throw an error when adding a tag with the same id', () => {
        expect(() => Automerge.change(map, actions.createTag({...tag, name: 'other'}).reducer)).toThrow(/id.*exists/)
      })
    })

    describe('changeTagColor', () => {
      it('should change tag color', () => {
        const color = '@blue'
        map = Automerge.change(map, actions.changeTagColor({...tag, color}).reducer)

        expect(map.tags?.at(0)?.color).toBe(color)
      })
    })

    describe('changeTagName', () => {
      it('should change tag name', () => {
        const name = 'otherName'
        map = Automerge.change(map, actions.changeTagName({...tag, name}).reducer)

        expect(map.tags?.at(0)?.name).toBe(name)
      })
    })

    describe('deleteTag', () => {
      it('should change tag name', () => {
        map = Automerge.change(map, actions.deleteTag(tag).reducer)

        expect(map.tags?.length).toBe(0)
      })
    })

    describe('attachTag', () => {
      it('should attach a tag to a node', () => {
        const node = map.nodes.rootId

        map = Automerge.change(map, actions.attachTag(node, tag).reducer)

        expect(map.nodes.rootId.tags).toBeDefined()
        expect(map.nodes.rootId.tags?.at(0)).toBe(tag.id)
      })

      it('should copy a tag from node when adding a template', () => {
        const subMap = Automerge.change(map, actions.attachTag(map.nodes.childId, tag).reducer)

        map = Automerge.change(map, actions.addTemplate(map.nodes.childId, subMap).reducer)

        const childId = map.nodes.childId.children?.at(0)
        if (!childId) {
          fail('Could not find new child')
        }
        const subChildId = map.nodes[childId].children?.at(0)
        if (!subChildId) {
          fail('Could not find new grand child')
        }

        expect(map.nodes[subChildId].tags).toHaveLength(1)
        expect(map.nodes[subChildId].tags?.at(0)).toBe(tag.id)
      })
    })

    describe('detachTag', () => {
      it('', () => {
        const node = map.nodes.rootId

        map = Automerge.change(map, actions.attachTag(node, tag).reducer)
        expect(map.nodes.rootId.tags).toBeDefined()
        expect(map.nodes.rootId.tags?.at(0)).toBe(tag.id)

        map = Automerge.change(map, actions.detachTag(node, tag).reducer)

        expect(map.nodes.rootId.tags).toBeDefined()
        expect(map.nodes.rootId.tags?.includes(tag.id)).toBe(false)
      })
    })
  })

  describe('checkbox related', () => {
    let node: NodeData

    beforeEach(() => {
      node = map.nodes.rootId
    })

    describe('setCheckBox', () => {
      it('should enable checkboxes', () => {
        map = Automerge.change(map, actions.setCheckBox({...node, checked: true}).reducer)

        expect(map.nodes.rootId.checked).toBe(true)
      })

      it('should disable checkboxes', () => {
        map = Automerge.change(map, actions.setCheckBox({...node, checked: false}).reducer)

        expect(map.nodes.rootId.checked).toBe(false)
      })
    })

    describe('deleteCheckBox', () => {
      it('should remove the checkbox', () => {
        map = Automerge.change(map, actions.setCheckBox({...node, checked: true}).reducer)

        expect(map.nodes.rootId.checked).toBe(true)

        map = Automerge.change(map, actions.deleteCheckBox({...node, checked: true}).reducer)

        expect('checked' in map.nodes.rootId).toBe(false)
      })
    })
  })
})

describe('all actions', () => {
  it('should be called', () => {
    Object.keys(actions).forEach(name => expect(calledActions).toContain(name))
  })
})
