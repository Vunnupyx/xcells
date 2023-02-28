module.exports = {
  SOCKET_OPTIONS: {
    // careful: somehow changing this does not work with websockets
    path: '/socket.io',
    timeout: 20000,
  },
  SOCKET_ACK_TIMEOUT: 80000,
}
