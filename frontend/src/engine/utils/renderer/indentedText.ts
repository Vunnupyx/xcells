import type PixiNode from '../../PixiNode'

const indentedText = (startNode: PixiNode): string[] => {
  const startDepth = startNode.depth

  const lines: string[] = []

  let children: PixiNode[] = [startNode]

  const stack: PixiNode[][] = []

  while (children && children.length > 0) {
    const node = children.pop() as PixiNode

    lines.push(`${' '.repeat(2 * (node.depth - startDepth))}${node.title || ''}`)

    if (node.childNodes.size > 0) {
      if (children.length > 0) stack.push(children)
      children = [...node.childNodes].sort((a, b) => -a.x + b.x || -a.y + b.y)
    } else if (children.length === 0) {
      children = stack.pop() || []
    }
  }

  return lines
}

export default indentedText
