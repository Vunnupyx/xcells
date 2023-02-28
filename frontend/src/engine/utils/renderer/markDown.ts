import type PixiNode from '../../PixiNode'

const leafFilter = (child: PixiNode): boolean => child.childNodes.size === 0
const branchFilter = (child: PixiNode): boolean => child.childNodes.size > 0

const renderLeaf = (child: PixiNode) => {
  if (child.title) {
    return `${child.title}\n\n`
  }
  return ''
}

const renderHeadLine = (child: PixiNode, headlineIndex: number) =>
  child.title ? `${'#'.repeat(headlineIndex + 1)} ${child.title}\n\n` : ''

const renderListItem = (child: PixiNode, depthIndex: number) =>
  child.title ? `${' '.repeat(depthIndex * 2)}* ${child.title}\n` : ''

const sortNodes = (nodes: Iterable<PixiNode>) => [...nodes].sort((a, b) => -a.x + b.x || -a.y + b.y)

const renderListChildren = (listChildren: PixiNode[], depth: number): string => {
  // when there are still children remain, render them in a list
  return listChildren
    .map(child => {
      const sortedSubChildren = sortNodes(child.childNodes)

      return renderListItem(child, depth) + renderListChildren(sortedSubChildren, depth + 1)
    })
    .join('')
}

const renderHeaderChildren = (children: PixiNode[], headlineIndex: number): string => {
  let output = ''

  const leafChildren = children.filter(leafFilter)
  output += leafChildren.map(renderLeaf).join('')

  const branchChildren = children.filter(branchFilter)
  output += branchChildren
    .map(child => {
      const newHeadlineIndex = headlineIndex + 1

      const sortedChildren = sortNodes(child.childNodes)

      const headline = renderHeadLine(child, headlineIndex)

      if (newHeadlineIndex < 6) {
        return headline + renderHeaderChildren(sortedChildren, newHeadlineIndex)
      }

      const subLeafChildren = sortedChildren.filter(leafFilter)
      const subBranchChildren = sortedChildren.filter(branchFilter)

      return `${headline}${subLeafChildren.map(renderLeaf)}${renderListChildren(subBranchChildren, 0)}\n`
    })
    .join('')

  return output
}

const markDown = (startNode: PixiNode): string => {
  return renderHeaderChildren([startNode], 0)
}

export default markDown
