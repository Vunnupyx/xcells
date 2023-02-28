import sleep from '../utils/sleep'
import Publisher from './Publisher'
import range from '../shared/utils/range'

describe('async subscription', () => {
  let publisher

  beforeEach(() => {
    publisher = new Publisher()
  })

  it('should fire after subscribe() and not after unsubscribe()', async () => {
    const subscriber = jest.fn()

    publisher.subscribe(subscriber)
    expect(subscriber).toHaveBeenCalledTimes(1)

    await publisher.fireSubscriptions()

    expect(subscriber).toHaveBeenCalledTimes(2)

    publisher.unsubscribe(subscriber)
    await publisher.fireSubscriptions()

    expect(subscriber).toHaveBeenCalledTimes(2)
  })

  it('should not fire after using unsubscribe function returned by subscribe', async () => {
    const subscriber = jest.fn()

    const unsubscribe = publisher.subscribe(subscriber)
    expect(subscriber).toHaveBeenCalledTimes(1)

    await publisher.fireSubscriptions()

    expect(subscriber).toHaveBeenCalledTimes(2)

    unsubscribe()
    await publisher.fireSubscriptions()

    expect(subscriber).toHaveBeenCalledTimes(2)
  })

  it('should allow subscriptions and update them when fired', async () => {
    let waited = false

    const subscriber = jest.fn(async subscribedProvider => {
      expect(subscribedProvider).toBe(publisher)
      await sleep(100)
      waited = true
    })

    expect(publisher.subscriptions.size).toBe(0)

    publisher.subscribe(subscriber)

    expect(publisher.subscriptions.size).toBe(1)

    const firePromise = publisher.fireSubscriptions()

    expect(subscriber).toHaveBeenCalledTimes(1)

    await firePromise

    expect(subscriber).toHaveBeenCalledTimes(2)
    expect(waited).toBe(true)
  })

  it('should wait for all subscribers', async () => {
    const COUNT = 100

    const waitedList = range(COUNT).map(() => false)

    const subscribers = range(COUNT).map(i =>
      jest.fn(async () => {
        await sleep(10)
        waitedList[i] = true
        return i
      }),
    )

    subscribers.forEach(s => publisher.subscribe(s))
    subscribers.forEach(s => expect(s).toHaveBeenCalledTimes(1))

    const result = await publisher.fireSubscriptions()

    waitedList.forEach(waited => expect(waited).toBe(true))
    subscribers.forEach(s => expect(s).toHaveBeenCalledTimes(2))
    expect(result).toEqual(range(COUNT))
  })

  it('should unsubscribe all subscribers on destruction', () => {
    publisher.subscribe(() => null)

    expect(publisher.subscriptions.size).toBe(1)

    publisher.destroy()

    expect(publisher.subscriptions.size).toBe(0)
  })

  it('should not fail if a subscriber throws an exceptions', async () => {
    const subscriber = () => {
      throw new Error('test error')
    }

    expect(() => publisher.subscribe(subscriber)).not.toThrow()

    expect(() => publisher.fireSubscriptions()).not.toThrow()
  })
})
