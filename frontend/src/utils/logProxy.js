import debug from 'debug'

const logArgument = a => {
  if (typeof a === 'function') return 'function'
  if (a && a.toString) return a.toString()
  return typeof a
}

const logProxy = obj => {
  const log = debug(`app:${obj.constructor.name}`)

  const logProxyHandler = {
    get(target, propName) {
      if (typeof target[propName] === 'function' && !target[`__${propName}`]) {
        target[`__${propName}`] = target[propName]
        target[propName] = (...args) => {
          log(`${propName}(${args.map(logArgument).join(',')})`)
          return target[`__${propName}`].call(target, ...args)
        }
      }
      return target[propName]
    },
  }

  return new Proxy(obj, logProxyHandler)
}

export default logProxy
