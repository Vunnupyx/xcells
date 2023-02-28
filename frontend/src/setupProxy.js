const {createProxyMiddleware} = require('http-proxy-middleware')
const {SOCKET_OPTIONS} = require('./shared/config/socket')

module.exports = app => {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      // logLevel: 'debug',
    }),
  )

  app.use(
    SOCKET_OPTIONS.path,
    createProxyMiddleware({
      target: 'ws://localhost:3001',
      // logLevel: 'debug',
    }),
  )

  app.use(
    '/websocket',
    createProxyMiddleware({
      target: 'ws://localhost:3001',
      logLevel: 'debug',
    }),
  )
}
