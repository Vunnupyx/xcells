import Socket from 'socket.io'
import server from './server'
import {SOCKET_OPTIONS} from './shared/config/socket'

const io = new Socket(server, SOCKET_OPTIONS)

export default io
