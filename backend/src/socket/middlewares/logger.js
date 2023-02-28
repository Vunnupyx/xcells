import debug from 'debug'

const getMapId = data => (data && (data.docId || data.mapId || (typeof data === 'string' && data))) || 'unknown'
const getDetails = (name, data) => (name.startsWith('map/') ? `MapId: ${getMapId(data)}` : '')

const logger = (socket, next) => {
  const {mapId} = socket.handshake.query
  const log = debug('infinity:Socket:Middleware:Logger').extend(socket.id, '@').extend(mapId, '#')
  const logEmit = log.extend('Emit')
  const logReceive = log.extend('Receive')

  log('new connection')

  const _emit = socket.emit.bind(socket)

  socket.emit = (name, data, ...rest) => {
    const {userId} = socket.state
    logEmit(userId, `'${name}' ${getDetails(name, data)}`)
    _emit(name, data, ...rest)
  }

  const socketLogger = (packet, next) => {
    const [name, data] = packet
    const start = process.hrtime()
    next()
    const [seconds, nanoseconds] = process.hrtime(start)
    const duration = seconds * 1000 + nanoseconds / 1000000
    const {userId} = socket.state
    logReceive(userId, `'${name}' ${getDetails(name, data)} (${duration}ms)`)
  }

  socket.use(socketLogger)
  next()
}

export default logger
