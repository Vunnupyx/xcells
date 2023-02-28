import rectInsideRect from './rectInsideRect'

describe('rectInsideRect', () => {
  const bigRect = {x: 0, y: 0, width: 10, height: 10}

  it('should detect inside rects', () => {
    const rect = {x: 1, y: 1, width: 8, height: 8}
    const intersect = rectInsideRect(rect, bigRect)

    expect(intersect).toBe(true)
  })

  it('should dismiss rect outside top', () => {
    const rect = {x: 1, y: -1, width: 8, height: 8}
    const intersect = rectInsideRect(rect, bigRect)

    expect(intersect).toBe(false)
  })
  it('should dismiss rect outside left', () => {
    const rect = {x: -1, y: 1, width: 8, height: 8}
    const intersect = rectInsideRect(rect, bigRect)

    expect(intersect).toBe(false)
  })
  it('should dismiss rect outside bottom', () => {
    const rect = {x: 1, y: 5, width: 8, height: 8}
    const intersect = rectInsideRect(rect, bigRect)

    expect(intersect).toBe(false)
  })
  it('should dismiss rect outside right', () => {
    const rect = {x: 5, y: 1, width: 8, height: 8}
    const intersect = rectInsideRect(rect, bigRect)

    expect(intersect).toBe(false)
  })
})
