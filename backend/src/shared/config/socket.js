module.exports = {
  SOCKET_OPTIONS: {
    // careful: somehow changing this does not work with websockets
    path: '/socket.io',
    // security risc: https://github.com/advisories/GHSA-j4f2-536g-r55m
    maxHttpBufferSize: 1e6,
  },
  SOCKET_ACK_TIMEOUT: 5000,
}
