import WebSocket from 'ws'
import debug from 'debug'

import {setupWSConnection} from './y-websocket-server/utils'
import server from './server'

const log = debug('infinity:app:websocket:listener*')

const initWebsocket = () => {
  const wss = new WebSocket.Server({
    noServer: true,
  })

  wss.on('connection', (request, socket, head) => {
    setupWSConnection(request, socket, head)
  })

  server.on('upgrade', (request, socket, head) => {
    const {url} = request

    if (url.match(/.*\/websocket\/.*/gm)) {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        log(`handle upgrade for URL: ${url}`)
        wss.emit('connection', ws, request)
      })
    }
  })
}

export default initWebsocket
