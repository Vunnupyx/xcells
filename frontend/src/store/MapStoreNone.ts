import debug from 'debug'
import {MapId, MapStore} from '../engine/types'
import TranslatableError from '../utils/TranslatableError'

const log = debug('app:MapStoreNone')
const logError = log.extend('ERROR*', '::')

/**
 * The MapStore class handles an imap object, provides a way to dispatch actions
 * and syncs changes to the server and other clients.
 *
 */
class MapStoreNone implements MapStore {
  isLoading = true

  isWriteable = false

  isSync = false

  isWithHistory = false

  mapId: string

  error: Error | null = null

  constructor(mapId: MapId, options = {}) {
    log('Create a new MapStoreNone.', mapId, options)

    this.mapId = mapId
  }

  subscribe = (): void => {
    log('subscribe noop')
  }

  unsubscribe = (): void => {
    log('unsubscribe noop')
  }

  reconnect = (): void => undefined

  close = (): void => undefined

  dispatch = (): void => {
    this.noneError()
  }

  noneError = (): void => {
    const message = 'No store created yet'
    logError(message)
    this.error = new TranslatableError(message, 'mapStoreNone')
  }

  isConnected = false

  root = ''

  nodes = {}

  edges = undefined

  title = undefined

  tags = []

  canUndo = false

  undo = (): void => {
    log('undo')
    this.noneError()
  }

  canRedo = false

  redo = (): void => {
    log('redo')
    this.noneError()
  }

  isNodeDeletable = (): boolean => false
}

export default MapStoreNone
