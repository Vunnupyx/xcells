import rectIntersectsRect from './rectIntersectsRect'

describe('rectIntersectsRect', () => {
  it('should interset in all directions', () => {
    const middleRect = {x: -1, y: -1, width: 2, height: 2}

    ;[-2, 0].forEach(xStart => {
      ;[-2, 0].forEach(yStart => {
        const rect = {x: xStart, y: yStart, width: 2, height: 2}

        expect(rectIntersectsRect(middleRect, rect)).toBe(true)
      })
    })
  })
  it('sould not intersect "touch" rects', () => {
    const middleRect = {x: -1, y: -1, width: 2, height: 2}

    ;[-2, 0, 1].forEach(xStart => {
      ;[-2, 0, 1].forEach(yStart => {
        const rect = {x: xStart, y: yStart, width: 1, height: 1}

        expect(rectIntersectsRect(middleRect, rect)).toBe(xStart === 0 && yStart === 0)
      })
    })
  })
})
