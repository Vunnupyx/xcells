import {Debugger} from 'debug'

type TMetric = {sum: number; count: number; max: number; min: number}

export const durationMetrics = new Map<string, TMetric>()

const logDuration = (log: Debugger, message: string): (() => void) => {
  const start = performance.now()

  if (!durationMetrics.has(message)) {
    durationMetrics.set(message, {sum: 0, count: 0, max: -Infinity, min: Infinity})
  }

  return () => {
    const durationMS = performance.now() - start

    log(`${message} ${durationMS}ms`)

    const metric = durationMetrics.get(message)

    if (!metric) return

    metric.sum += durationMS
    metric.count += 1
    metric.max = Math.max(metric.max, durationMS)
    metric.min = Math.min(metric.min, durationMS)
  }
}

export default logDuration
