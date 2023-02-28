import {checkIsAttached, getAllAttachedX, nodesAttachedInX, nodesAttachedInY} from './nodesAttached'

// +---+---+---+---+
// |111|211|311|411|
// +---+---+---+---+

const square111 = {x: 1, y: 1, width: 1, height: 1}
const square211 = {x: 2, y: 1, width: 1, height: 1}
const square311 = {x: 3, y: 1, width: 1, height: 1}
const square411 = {x: 4, y: 1, width: 1, height: 1}

const square121 = {x: 1, y: 2, width: 1, height: 1}

const rect1221 = {x: 1, y: 2, width: 2, height: 1}
const rect2112 = {x: 2, y: 1, width: 1, height: 2}
const rect2221 = {x: 2, y: 2, width: 2, height: 1}

describe('nodesAttachedInX', () => {
  it('should find attached left', () => {
    expect(nodesAttachedInX(square111, square211)).toBe(true)
  })

  it('should find attached right', () => {
    expect(nodesAttachedInX(square211, square111)).toBe(true)
  })

  it('should not decide attached if too high', () => {
    expect(nodesAttachedInX(square111, rect2112)).toBe(false)
  })

  it('should not decide attached if no aligned', () => {
    expect(nodesAttachedInX(rect2112, rect2221)).toBe(false)
  })
})

describe('nodesAttachedInY', () => {
  it('should find attached top', () => {
    expect(nodesAttachedInY(square111, square121)).toBe(true)
  })

  it('should find attached bottom', () => {
    expect(nodesAttachedInY(square121, square111)).toBe(true)
  })

  it('should not decide attached if too wide', () => {
    expect(nodesAttachedInY(square111, rect2112)).toBe(false)
  })

  it('should not decide attached if no aligned', () => {
    expect(nodesAttachedInY(rect2112, rect1221)).toBe(false)
  })
})

describe('getAllAttachedX', () => {
  it('should find connected nodes', () => {
    const attachedNodes = getAllAttachedX(square211, [square111, square411, square311])

    expect(attachedNodes.length).toBe(3)
    expect(attachedNodes).not.toContain(square211)
    expect(attachedNodes).toContain(square111)
    expect(attachedNodes).toContain(square311)
    expect(attachedNodes).toContain(square411)
  })
})

describe('isAttached', () => {
  it('should detect when nodes are connected', () => {
    expect(checkIsAttached(square211, [square111, square411, square311])).toBe(true)
  })
  it('should detect when no nodes are connected', () => {
    expect(checkIsAttached(square111, [square411, square311])).toBe(false)
  })
})
