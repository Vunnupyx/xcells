import createDeduplicator from './createDeduplicator'

const TIMEOUT = 5

describe('createDeduplicator', () => {
  let callCount
  let deduplicator
  const fn = () => (callCount += 1)

  beforeEach(() => {
    callCount = 0
    deduplicator = createDeduplicator(TIMEOUT)
  })

  it('should execute in first call', () => {
    deduplicator('test', fn)

    expect(callCount).toBe(1)
  })

  it('should not call twice', () => {
    deduplicator('test', fn)
    deduplicator('test', fn)

    expect(callCount).toBe(1)
  })

  it('should be called again after some time', async () => {
    deduplicator('test', fn)

    expect(callCount).toBe(1)

    await new Promise(resolve => {
      setTimeout(resolve, TIMEOUT + 5)
    })
    deduplicator('test', fn)

    expect(callCount).toBe(2)
  })
})
