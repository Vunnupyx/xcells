import 'jest-canvas-mock'

import PixiNode from './PixiNode'
import PixiRootNode from './PixiRootNode'
import CONFIG from './CONFIG'
import type PixiRenderEngine from './PixiRenderEngine'

const {gridSize} = CONFIG.nodes

describe('PixiNode', () => {
  const nodeContainer = {addChild: () => undefined}
  const engine = {
    eventManager: {state: {}},
    store: {isWriteable: false},
    viewport: {},
    nodeContainer,
  } as unknown as PixiRenderEngine
  const rootNode = new PixiRootNode(engine, {id: 'rootNode'}) as unknown as PixiNode
  const node = new PixiNode(engine, {id: 'storeNode'}, rootNode)

  describe('Grid coords', () => {
    it('should map origin on itself', () => {
      const origin = node.getGridCoord({x: 0, y: 0})

      expect(origin.x).toBe(0)
      expect(origin.y).toBe(0)
    })

    it('should map grid point on itself', () => {
      const same = {x: gridSize, y: gridSize}

      const result = node.getGridCoord(same)

      expect(result.x).toBe(same.x)
      expect(result.y).toBe(same.y)
    })

    it('should round mid grid point up', () => {
      const same = {x: gridSize / 2, y: gridSize / 2}

      const result = node.getGridCoord(same)

      expect(result.x).toBe(gridSize)
      expect(result.y).toBe(gridSize)
    })

    it('should round lower points down', () => {
      const same = {x: gridSize / 3, y: gridSize / 3}

      const result = node.getGridCoord(same)

      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })

    it('should put a random point right', () => {
      ;[2, 5, 10, 25, 100, 1000].forEach(factor => {
        const same = {x: gridSize * (factor + 0.2), y: gridSize * (factor + 0.2)}

        const result = node.getGridCoord(same)

        expect(result.x).toBe(gridSize * factor)
        expect(result.y).toBe(gridSize * factor)
      })
    })
  })
})
