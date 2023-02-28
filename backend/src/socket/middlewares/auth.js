import jwt from 'jsonwebtoken'
import debug from 'debug'
import cookie from 'cookie'
import {JWT_SECRET} from '../../constants'
import InfinityMap from '../../models/InfinityMap'
import {ACCESS_ROLES} from '../../shared/config/constants'

const log = debug('infinity:Socket:Middleware:Auth')

const auth = async (socket, next) => {
  const {auth: token} = cookie.parse(socket.handshake.headers.cookie || '')
  const {mapId} = socket.handshake.query

  log('authentication', {token, mapId})

  try {
    let auth
    try {
      auth = jwt.verify(token, JWT_SECRET)
    } catch {
      auth = {}
    }

    const userId = auth.sub?.toString()

    // check access
    const map = await InfinityMap.findOne({mapId}, {userId: 1, share: 1})

    if (!map) {
      const message = `Could not find map changes for map ${mapId}`
      socket.emit('map/error', message)
      next(new Error(message))
      return
    }

    const {access = []} = map.share || {}

    const roleBinding = access.find(({subjectId, subjectType}) => subjectType === 'user' && subjectId === userId)

    const isOwner = map.userId?.toString() === userId || roleBinding?.role === ACCESS_ROLES.owner
    const isWriteable = isOwner || roleBinding?.role === ACCESS_ROLES.contributor || map.isPublicWriteable()
    const isReadable = isWriteable || roleBinding?.role === ACCESS_ROLES.reader || map.isPublic()

    socket.state = {mapId, auth, userId, roles: auth.roles, access: {isOwner, isWriteable, isReadable}}

    if (!isReadable) {
      const message = `Access denied for ${userId} to load map ${mapId}`
      next(new Error(message))
      return
    }

    next()
  } catch (e) {
    next(e)
  }
}

export default auth
