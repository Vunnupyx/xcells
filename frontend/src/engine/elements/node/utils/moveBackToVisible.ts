import config from '../../../../styles/config'
import type PixiNode from '../../../PixiNode'

const {outOfBorderThreshold, outOfBorderOffset} = config.nodes

const moveBackToVisible = (node: PixiNode): boolean => {
  if (node.parentNode.isRoot) return false

  // move node back into viewport, if it ended up moved out in x < 0 or y < 0 direction
  if (node.x + node.width < outOfBorderThreshold || node.y + node.height < outOfBorderThreshold) {
    const newX = node.x + node.width < outOfBorderThreshold ? -node.width + outOfBorderOffset : node.x
    const newY = node.y + node.height < outOfBorderThreshold ? -node.height + outOfBorderOffset : node.y

    node.move(newX, newY)
    return true
  }
  return false
}

export default moveBackToVisible
