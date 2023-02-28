import debug from 'debug'

const logError = debug('app:measureTime')

const measureTime =
  (nameOrFn, fn) =>
  (...args) => {
    const name = typeof nameOrFn === 'function' && nameOrFn.name ? nameOrFn.name : nameOrFn.toString()
    const measureFn = typeof nameOrFn === 'function' ? nameOrFn : fn

    const start = performance.now()

    const returnValue = measureFn(...args)
    logError(`Function ${name} took ${performance.now() - start} ms`)

    return returnValue
  }

export default measureTime
