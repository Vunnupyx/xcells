export type TDelayer = (key: string, fn: () => void) => void

const createDeduplicator = (timeout: number): TDelayer => {
  const lastCalls: Record<string, number> = {}

  const isScheduled = (key: string) => !lastCalls[key] || lastCalls[key] + timeout < Date.now()

  return (key: string, fn: () => void): void => {
    if (isScheduled(key)) {
      lastCalls[key] = Date.now()
      fn()
    }
  }
}

export default createDeduplicator
