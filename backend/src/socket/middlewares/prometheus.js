import {Gauge, Counter, Histogram, exponentialBuckets} from 'prom-client'

import io from '../../io'

// TODO: add mapId to labels
const metrics = {
  connectedSockets: new Gauge({
    name: 'socket_io_connected',
    help: 'Number of currently connected sockets',
  }),

  duration: new Histogram({
    name: 'socket_io_duration_event_incoming_seconds',
    help: 'Duration of incoming socket events in seconds',
    buckets: exponentialBuckets(0.002, 2, 20),
    labelNames: ['event'],
  }),

  eventsReceivedTotal: new Counter({
    name: 'socket_io_events_received_total',
    help: 'Total count of socket.io received events',
    labelNames: ['event'],
  }),

  eventsSentTotal: new Counter({
    name: 'socket_io_events_sent_total',
    help: 'Total count of socket.io sent events',
    labelNames: ['event'],
  }),

  bytesReceived: new Histogram({
    name: 'socket_io_receive_bytes',
    help: 'Total socket.io bytes received',
    buckets: exponentialBuckets(32, 2, 20),
    labelNames: ['event'],
  }),

  bytesTransmitted: new Histogram({
    name: 'socket_io_transmit_bytes',
    help: 'Total socket.io bytes transmitted',
    buckets: exponentialBuckets(32, 2, 20),
    labelNames: ['event'],
  }),
}

const dataLength = data => {
  try {
    return Buffer.byteLength(typeof data === 'string' ? data : JSON.stringify(data) || '', 'utf8')
  } catch (e) {
    return 0
  }
}

const prometheus = (socket, next) => {
  metrics.connectedSockets.set(Object.keys(io.sockets.sockets).length)

  socket.on('disconnect', () => {
    metrics.connectedSockets.set(Object.keys(io.sockets.sockets).length)
  })

  const _emit = socket.emit.bind(socket)
  socket.emit = (event, data, ...rest) => {
    metrics.eventsSentTotal.labels(event).inc()
    metrics.bytesTransmitted.labels(event).observe(dataLength(data))

    _emit(event, data, ...rest)
  }

  const _onevent = socket.onevent.bind(socket)
  socket.onevent = packet => {
    const [event, data] = packet && packet.data ? packet.data : ['', '']

    metrics.eventsReceivedTotal.labels(event).inc()
    metrics.bytesReceived.labels(event).observe(dataLength(data))

    _onevent(packet)
  }

  const durationMiddleware = (packet, next) => {
    const [event] = packet
    const start = process.hrtime()
    next()
    const [seconds, nanoseconds] = process.hrtime(start)
    const duration = seconds + nanoseconds / 1000000000
    metrics.duration.labels(event).observe(duration)
  }
  socket.use(durationMiddleware)

  next()
}

export default prometheus
