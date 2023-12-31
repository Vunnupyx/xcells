import debug from 'debug'
import {collectDefaultMetrics} from 'prom-client'
import util from 'util'

import server from './server'
import io from './io'
import {closeDb, connectDb} from './db'
import initWebsocket from './websocket'
import * as constants from './constants'
import MapStoreEventHandler from './socket/MapStoreEventHandler'

if (process.env.NODE_ENV === 'production') {
  // replace default log with on that does not add line breaks
  debug.log = function log(...args) {
    return process.stderr.write(`${util.formatWithOptions({breakLength: Infinity}, ...args)}\n`)
  }
}

const log = debug('infinity:main')
const logError = log.extend('ERROR*', '::')

collectDefaultMetrics()

let shuttingDown
const shutDown = async () => {
  // receiving this twice for whatever reason
  if (shuttingDown) return
  shuttingDown = true
  log('Shutting down')
  // closes also the http server
  io.close(error => (error ? logError('Could not close sockets: ', error) : log('Sockets and HTTP server closed.')))
  await closeDb()
  log('Shut down complete')
}

const startUp = async () => {
  try {
    log('Starting application')
    await connectDb()
    log('Connect Socket events')
    MapStoreEventHandler.connect(io)
    log(`Starting HTTP Server on port ${constants.PORT}`)
    log('Configuration', constants)
    const httpServer = server.listen(constants.PORT)
    await new Promise((resolve, reject) => {
      httpServer.once('listening', resolve)
      httpServer.once('listening', () => httpServer.off('error', reject))
      httpServer.once('error', reject)
      httpServer.once('error', () => httpServer.off('listening', resolve))
    })
    log('HTTP Server started.')
    return httpServer
  } catch (e) {
    console.error('Error while starting the app.', e)
    await closeDb()
    process.exit(2)
  }
}

const EXIT_EVENT_NAMES = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM']

EXIT_EVENT_NAMES.forEach(eventName => {
  process.on(eventName, async (...args) => {
    log(`received signal '${eventName}' from process. Exiting...`, args)
    await shutDown()
    process.exit(0)
  })
})

process.on('exit', async (...args) => {
  log('received event "exit" from process. Exiting...', args)
  if (!shuttingDown) console.error('App exiting without shutdown!')
})
process.on('uncaughtException', async (...args) => {
  log('uncaught exception', ...args)
  await shutDown()
  process.exit(1)
})

initWebsocket()
startUp()
