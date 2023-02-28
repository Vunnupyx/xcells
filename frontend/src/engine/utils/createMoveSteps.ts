import CONFIG from '../CONFIG'
import {Dimensions} from '../types'

const {gridSize} = CONFIG.nodes
const halfGridSize = gridSize / 2

const createMoveSteps = (node: Dimensions, width: number, height: number): [number, number][] => {
  const diffWidth = Math.abs(width - node.width)
  const diffHeight = Math.abs(height - node.height)
  const steps = Math.ceil(diffWidth > diffHeight ? diffWidth / halfGridSize : diffHeight / halfGridSize)

  const widthStep = (width - node.width) / steps
  const heightStep = (height - node.height) / steps

  if (steps === 0) return []

  return Array(steps - 1)
    .fill(1)
    .map((_, i) => i + 1)
    .map(index => [node.width + index * widthStep, node.height + index * heightStep] as [number, number])
    .concat([[width, height]])
}

export default createMoveSteps
