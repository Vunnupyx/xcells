export const getParents = (id, nodes) => {
  let parent = nodes[nodes[id].parent]
  const parents = []
  while (parent) {
    parents.unshift(parent)
    parent = nodes[parent.parent]
  }

  return parents
}

export const parentIsCollapsed = parents => !parents.every(p => !p.collapsed)

export const absolutePosition = (parents, node) => {
  // parents are ordered from top node to nearest parent
  return [...parents, node].reduce(
    (parent, n) => ({
      x: parent.x + n.x * parent.scale,
      y: parent.y + parent.headerHeight * parent.parentScale + n.y * parent.scale,
      scale: parent.scale * n.scale,
      parentScale: parent.scale,
      headerHeight: n.headerHeight,
      depth: parent.depth + 1,
      visible: !parent.collapsed && parent.visible,
    }),
    {x: 0, y: 0, scale: 1, parentScale: 1, headerHeight: 0, depth: 0, visible: true},
  )
}

export const haveIntersection = (r1, r2) =>
  r2.x <= r1.x + r1.width && r2.x + r2.width >= r1.x && r2.y <= r1.y + r1.height && r2.y + r2.height >= r1.y

export const rectContains = (rect, p) =>
  rect.x <= p.x && p.x <= rect.x + rect.width && rect.y <= p.y && p.y <= rect.y + rect.height

export const intersectLineAndBox = (insidePoint, outsidePoint, widthBound, heightBound) => {
  let normalize
  const dx = outsidePoint.x - insidePoint.x
  const dy = outsidePoint.y - insidePoint.y

  normalize = widthBound / Math.abs(dx)
  if (Math.abs(dy * normalize) > heightBound) normalize = heightBound / Math.abs(dy)

  return {
    x: insidePoint.x + dx * normalize,
    y: insidePoint.y + dy * normalize,
  }
}

export const intersectMidpoints = (startPosition, startSize, endPosition, endSize) => {
  const lineStart = {
    x: startPosition.x + startSize.w / 2.0,
    y: startPosition.y + startSize.h / 2.0,
  }
  const lineEnd = {
    x: endPosition.x + endSize.w / 2.0,
    y: endPosition.y + endSize.h / 2.0,
  }

  return {
    startIntersect: intersectLineAndBox(lineStart, lineEnd, startSize.w / 2.0, startSize.h / 2.0),
    endIntersect: intersectLineAndBox(lineEnd, lineStart, endSize.w / 2.0, endSize.h / 2.0),
  }
}

export const lineIntersect = (startPosition, startSize, startTitleSize, endPosition, endSize, endTitleSize) => {
  // check wether one box is inside the other, meaning one is a parent of the other
  if (
    startPosition.x >= endPosition.x &&
    startPosition.y >= endPosition.y &&
    startPosition.x <= endPosition.x + endSize.w &&
    startPosition.y <= endPosition.y + endSize.h
  ) {
    // second box is parent of first
    return {
      startIntersect: {x: startPosition.x + startSize.w / 2.0, y: startPosition.y},
      endIntersect: {x: endPosition.x + endSize.w / 2.0, y: endPosition.y + endTitleSize},
    }
  }

  if (
    startPosition.x <= endPosition.x &&
    startPosition.y <= endPosition.y &&
    startPosition.x + startSize.w >= endPosition.x &&
    startPosition.y + startSize.h >= endPosition.y
  ) {
    // first box is parent of second
    return {
      startIntersect: {x: startPosition.x + startSize.w / 2.0, y: startPosition.y + startTitleSize},
      endIntersect: {x: endPosition.x + endSize.w / 2.0, y: endPosition.y},
    }
  }

  return intersectMidpoints(startPosition, startSize, endPosition, endSize)
}
