import debug from 'debug'

import {api} from '../hooks/useApi'

import {
  EdgeDatas,
  MapData,
  MapId,
  MapStore,
  MapStoreSubscriber,
  NodeDatas,
  NodeTagDatas,
  Settings,
} from '../engine/types'
import TranslatableError from '../utils/TranslatableError'

const log = debug('app:MapStoreReadOnly')
const logError = log.extend('ERROR*', '::')

/**
 * The MapStore class handles an imap object, provides a way to dispatch actions
 * and syncs changes to the server and other clients.
 *
 */
class MapStoreReadOnly implements MapStore {
  subscriptions: Set<MapStoreSubscriber> = new Set()

  isLoading = true

  isWriteable = false

  isSync = true

  isWithHistory = false

  mapId: string

  settings: Settings | undefined

  error: Error | null = null

  map: MapData = {nodes: {}, root: '', mapId: '', tags: []}

  constructor(mapId: MapId, options = {}) {
    log('Create a new MapStoreReadOnly.', mapId, options)

    this.mapId = mapId

    this.load()
  }

  subscribe = (fn: MapStoreSubscriber): void => {
    log('subscribe')
    this.subscriptions.add(fn)
    fn(this)
  }

  unsubscribe = (fn: MapStoreSubscriber): void => {
    log('unsubscribe')
    if (this.subscriptions.has(fn)) {
      this.subscriptions.delete(fn)
    }
  }

  reconnect = (): void => undefined

  fireSubscriptions = (): void => {
    // TODO: actions cannot handle async subscriptions
    // TODO: we need to return a promise, so caller is able to wait for changes to be applied
    // return new Promise(resolve => {
    //   // run the subscriptions async, so we don't trigger them multiple times per change
    //   if (this.fireSubscriptionRef === null) {
    //     this.fireSubscriptionRef = setTimeout(() => {
    log('fire subscriptions')
    this.subscriptions.forEach(fn => fn(this))
    // this.fireSubscriptionRef = null
    //       resolve()
    //     })
    //   }
    // })
  }

  load = async (): Promise<void> => {
    const {fireSubscriptions, mapId} = this

    try {
      this.map = await api.get(`/maps/${mapId}`)
    } catch (e) {
      this.error = new Error(`Error occured while loading the map: ${(e as Error).message}.`)
    } finally {
      this.isLoading = false
      fireSubscriptions()
    }
  }

  close = (): void => {
    this.map = {nodes: {}, root: '', mapId: ''}
    this.fireSubscriptions()
  }

  dispatch = (): void => {
    this.readOnlyError()
  }

  readOnlyError = (): void => {
    const message = 'Store in read only mode'
    logError(message)
    this.error = new TranslatableError(message, 'mapStoreReadOnly')
    this.fireSubscriptions()
  }

  get isConnected(): boolean {
    return !this.isLoading
  }

  get root(): string {
    return this.map?.root || ''
  }

  get nodes(): NodeDatas {
    return this.map?.nodes || {}
  }

  get edges(): EdgeDatas | undefined {
    return this.map?.edges
  }

  get title(): string | undefined {
    return this.map?.title
  }

  get tags(): NodeTagDatas {
    return this.map.tags || []
  }

  get id(): MapId {
    return this.mapId
  }

  canUndo = false

  undo = (): void => {
    log('undo')
    this.readOnlyError()
  }

  canRedo = false

  redo = (): void => {
    log('redo')
    this.readOnlyError()
  }

  isNodeDeletable = (): boolean => false
}

export default MapStoreReadOnly
