import type PixiNode from '../PixiNode'
import createMoveSteps from './createMoveSteps'
import CONFIG from '../CONFIG'

const {gridSize} = CONFIG.nodes
const START_WIDTH = 200
const START_HEIGHT = 200
const node = {width: START_WIDTH, height: START_HEIGHT} as PixiNode

describe('createMoveSteps', () => {
  it('should not create any steps, when input and output size is the same', () => {
    const steps = createMoveSteps(node, START_WIDTH, START_HEIGHT)
    expect(steps.length).toBe(0)
  })
  it('should create one step, when input is below half gridSize', () => {
    const startWidth = START_WIDTH + gridSize / 4
    const startHeight = START_HEIGHT + gridSize / 4
    const steps = createMoveSteps(node, startWidth, startHeight)
    expect(steps.length).toBe(1)
    expect(steps[0][0]).toBe(startWidth)
    expect(steps[0][1]).toBe(startHeight)
  })
  it('should create two step, when input is one gridSize', () => {
    const startWidth = START_WIDTH + gridSize
    const startHeight = START_HEIGHT + gridSize
    const steps = createMoveSteps(node, startWidth, startHeight)
    expect(steps.length).toBe(2)
    expect(steps[0][0]).toBe(START_WIDTH + gridSize / 2)
    expect(steps[0][1]).toBe(START_HEIGHT + gridSize / 2)
    expect(steps[1][0]).toBe(startWidth)
    expect(steps[1][1]).toBe(startHeight)
  })
  it('should handle shrinking, when input is smaller than start sizes', () => {
    const startWidth = START_WIDTH - gridSize
    const startHeight = START_HEIGHT - gridSize
    const steps = createMoveSteps(node, startWidth, startHeight)
    expect(steps.length).toBe(2)
    expect(steps[0][0]).toBe(START_WIDTH - gridSize / 2)
    expect(steps[0][1]).toBe(START_HEIGHT - gridSize / 2)
    expect(steps[1][0]).toBe(startWidth)
    expect(steps[1][1]).toBe(startHeight)
  })
})
