import Automerge from 'automerge'
import {fromJS} from 'immutable'
import debug from 'debug'
import {Mutex} from 'async-mutex'
import {Counter, exponentialBuckets, Gauge, Histogram} from 'prom-client'

import MapChanges from '../models/MapChanges'
import InfinityMap from '../models/InfinityMap'
import {DOCSET_DELETE_DELAY, REMOVE_METRICS_DELAY, SAVE_TO_DATABASE_INTERVAL} from '../constants'
import AutomergeConnection from '../shared/lib/AutomergeConnection'
import {sum} from '../utils/reducer'

import logger from './middlewares/logger'
import auth from './middlewares/auth'
import prometheus from './middlewares/prometheus'
import {LOAD_CHUNK_SIZE} from '../shared/config/constants'
import runAsync from '../shared/utils/runAsync'
import User from '../models/User'

const log = debug('infinity:Socket:MapStoreEventHandler')

const metrics = {
  receivedChanges: new Counter({
    name: 'infinity_mapstore_received_changes_count',
    help: 'Number of changes received',
    labelNames: ['mapId'],
  }),

  nodes: new Gauge({
    name: 'infinity_mapstore_node_count',
    help: 'Number of changes received',
    labelNames: ['mapId'],
  }),

  edges: new Gauge({
    name: 'infinity_mapstore_edge_count',
    help: 'Number of changes received',
    labelNames: ['mapId'],
  }),

  mapLoadDuration: new Histogram({
    name: 'infinity_mapstore_map_load_duration_seconds',
    help: 'Duration of loading a map',
    buckets: exponentialBuckets(0.002, 2, 20),
    labelNames: ['mapId'],
  }),

  mapSaveCount: new Counter({
    name: 'infinity_mapstore_replace_changes_count',
    help: 'Number times changes in database where replaced',
    labelNames: ['mapId'],
  }),

  mapSaveDuration: new Histogram({
    name: 'infinity_mapstore_map_save_duration_seconds',
    help: 'Duration of saving a map',
    buckets: exponentialBuckets(0.002, 2, 20),
    labelNames: ['mapId'],
  }),

  connectedClients: new Gauge({
    name: 'infinity_mapstore_connected_clients',
    help: 'Number of clients connected',
    labelNames: ['mapId'],
  }),

  errorCount: new Counter({
    name: 'infinity_mapstore_error_count',
    help: 'Number of handled errors',
    labelNames: ['mapId'],
  }),
}

class MapStoreEventHandler {
  static docSets: {[key: string]: Automerge.DocSet} = {}

  static mutexes = {}

  static closeRefs = {}

  static saveMapRefs = {}

  docSet: Automerge.DocSet = null

  connection: AutomergeConnection = null

  constructor(socket) {
    // need to set this first, to be able to extract mapId and userId
    this.socket = socket

    const {userId, mapId, init, errorHandler} = this

    this.log = log.extend(userId, '/').extend(socket.id, '@').extend(mapId, '#')
    this.logError = this.log.extend('ERROR*', '::')

    this.log('new handler')

    this._onMapUpdate = errorHandler(this.onUpdate)
    this._onDisconnect = errorHandler(this.destroy)
    this._onError = (...params) => this.logError(`received error  for ${socket.id}`, ...params)

    socket.on('map/update', this._onMapUpdate).on('disconnect', this._onDisconnect).on('error', this._onError)

    errorHandler(init)()
  }

  init = () => {
    const {docSets, mutexes, closeRefs} = MapStoreEventHandler
    const {mapId, errorHandler, loadDocSet} = this

    // this docSet will saved later
    const docSet = docSets[mapId] || this.log('create docset') || new Automerge.DocSet()
    this.docSet = docSet

    this.log('create new connection')

    this.connection = new AutomergeConnection(docSet, msg => this.socket.emit('map/update', msg))
    this.connection.open()

    // client count cannot be destructured, as it changed above
    metrics.connectedClients.labels(mapId).set(this.clientCount)

    this.log('created connection')

    // clear a close event, that would wipe all static data
    if (closeRefs[mapId]) {
      clearTimeout(closeRefs[mapId])
      delete closeRefs[mapId]
    }

    // create a mutex for this map, if it does not exist
    if (!(mapId in mutexes)) {
      this.log('create new mutex')
      mutexes[mapId] = new Mutex()
    }
    this.mutex = mutexes[mapId]

    // check if map is in the docsets or if a valid doc is loaded
    if (!(mapId in docSets) || !docSets[mapId].getDoc(mapId)) {
      // set docset early/synchronous, so it will be available for other parts of the instance and for other backend
      docSets[mapId] = docSet

      this.log('created docset')

      // dispatch asynchronously
      errorHandler(loadDocSet)(docSet)
    }
  }

  loadDocSet = async docSet => {
    const {mapId, mutex} = this

    this.log('load docset from database')

    await mutex.runExclusive(async () => {
      const endDuration = metrics.mapLoadDuration.labels(mapId).startTimer()

      // access has been granted in auth middleware

      // fetch changes from database
      const mapChanges = await MapChanges.findOne({mapId})
      if (!mapChanges) {
        throw new Error(`Could not find map with id ${mapId} for fetching changes`)
      }
      const {changes} = mapChanges.toJSON()

      let doc = docSet.getDoc(mapId) || Automerge.init()
      let count = 0
      for (let i = 0; i < changes.length; i += LOAD_CHUNK_SIZE) {
        const chunk = changes.slice(i, i + LOAD_CHUNK_SIZE)
        log('loading chunk', chunk.length, i, LOAD_CHUNK_SIZE)
        count += chunk.length
        // eslint-disable-next-line no-await-in-loop,no-loop-func
        doc = await runAsync(() => Automerge.applyChanges(doc, fromJS(chunk)))

        if (count !== Automerge.getHistory(doc).length) {
          this.logError('chunk was not loaded', i, chunk)
        }
      }

      docSet.setDoc(mapId, doc)

      endDuration()
    })
  }

  onUpdate = async msg => {
    const {mutex, docSet, mapId, connection, errorHandler, saveMap} = this
    const {saveMapRefs} = MapStoreEventHandler
    const {isWriteable} = this.socket.state.access

    const {docId, clock: receivedClock, changes: receivedChanges} = msg
    if (docId !== mapId) {
      throw new Error(`Received update from a wrong map. Expected ${mapId}, got ${docId}`)
    }

    this.log('received update', {changesLength: msg.changes?.length})

    // TODO: when access rights change, we need to intervene here

    if (!connection) {
      throw new Error('This connection has already been closed')
    }

    try {
      await mutex.runExclusive(async () => {
        const oldMap = docSet.getDoc(mapId)

        const map = await InfinityMap.findOne({mapId})
        const {userId: ownerId} = map

        const {limitNodes} = await User.findOne({id: ownerId})

        const newMap = await connection.receiveMsg(msg, false)

        if (limitNodes && newMap.nodes && Object.keys(newMap.nodes).length > limitNodes) {
          throw new Error(`Card limit reached (${limitNodes})`)
        }

        metrics.nodes.labels(mapId).set(Object.keys(newMap.nodes || {}).length || 0)
        metrics.edges.labels(mapId).set(Object.keys(newMap.edges || {}).length || 0)

        // check if all changes where applied
        if (receivedChanges && Object.values(receivedClock).reduce(sum, 0) > Automerge.getHistory(newMap).length) {
          this.logError('Dataloss bug encountered!')
          throw new Error('Possible data loss detected, reconnecting...')
        }

        const changes = Automerge.getChanges(oldMap, newMap)

        // save changes to database
        if (changes?.length) {
          if (!isWriteable) {
            throw new Error('Changes rejected, no writing rights')
          }

          metrics.receivedChanges.labels(mapId).inc(changes.length)

          this.log('saving changes to database', {changesLength: changes.length})

          // save title changes immediately
          if (newMap.title !== oldMap.title) {
            clearTimeout(saveMapRefs[mapId])
            saveMapRefs[mapId] = setTimeout(async () => {
              await errorHandler(saveMap)()
              delete saveMapRefs[mapId]
            })
          } else {
            // save map only in intervals to reduce load on backend on many changes
            if (!saveMapRefs[mapId]) {
              saveMapRefs[mapId] = setTimeout(async () => {
                await errorHandler(saveMap)()
                delete saveMapRefs[mapId]
              }, SAVE_TO_DATABASE_INTERVAL)
            }
          }

          const mapChanges = await MapChanges.findOneAndUpdate({mapId}, {$push: {changes: {$each: changes}}})
          if (!mapChanges) {
            throw new Error('Could not find mapchanges, this map may have been deleted')
          }

          docSet.setDoc(mapId, newMap)
        }
      })
    } catch (e) {
      this.logError(`error saving map changes: ${e.message}`)

      throw e
    }
  }

  /**
   * save read only map
   * @returns {Promise<void>}
   */
  saveMap = async () => {
    const {mutex, mapId} = this

    await mutex.runExclusive(async () => {
      this.log('save the map state for read only usage')

      try {
        const map = await InfinityMap.findOne({mapId}, {nodes: 0, edges: 0})
        if (map) {
          // if it does not exist, it has been deleted
          map.set(this.map)
          await map.save()
        }
      } catch (e) {
        this.logError('Cannot save map to database: ', e.message)
        throw e
      }
    })
  }

  /**
   * disconnect socket, Automerge connection and if we are the last connection, cleanup all static data
   * @returns {Promise<void>}
   */
  destroy = async () => {
    const {closeRefs} = MapStoreEventHandler
    const {mapId, connection, socket, cleanup, errorHandler} = this

    this.log('destroy socket')

    if (!connection) {
      this.log('was already destroyed')
      // already closed
      return
    }

    connection.close()
    this.connection = null

    socket.off('map/update', this._onMapUpdate).off('disconnect', this._onDisconnect).off('error', this._onError)
    socket.disconnect(true)

    // client was changed above inside this function so cannot be extracted before
    metrics.connectedClients.labels(mapId).set(this.clientCount)

    // last instance has to check if it has to save to database
    if (this.clientCount === 0) {
      if (closeRefs[mapId]) {
        clearTimeout(closeRefs[mapId])
      }

      this.log('no clients left, triggering cleanup')

      closeRefs[mapId] = setTimeout(async () => {
        await errorHandler(cleanup)()
        delete closeRefs[mapId]
      }, DOCSET_DELETE_DELAY)
    }
  }

  /**
   * cleanup docset and check to save all changes if they differ
   * @returns {Promise<void>}
   */
  cleanup = async () => {
    const {docSets, mutexes} = MapStoreEventHandler
    const {clientCount, mutex, mapId} = this

    this.log('finally removing map from memory', clientCount)

    // resave whole changes and the map for read only
    await mutex.runExclusive(async () => {
      try {
        const endTimer = metrics.mapSaveDuration.labels(mapId).startTimer()

        const result = await MapChanges.aggregate([
          {$match: {mapId}},
          {$project: {size: {$cond: {if: {$isArray: '$changes'}, then: {$size: '$changes'}, else: 0}}}},
        ])

        // abort if map has been deleted
        if (!result) {
          this.log('This map has been deleted')
          return
        }

        const changes = Automerge.Frontend.getBackendState(this.map).getIn(['opSet', 'history']).toJS()
        // make sure we have more information in the backend version as in the database
        if (result.size < changes.length) {
          this.log('writing changes to database', {databaseSize: result.size, changesSize: changes.length})
          await MapChanges.findOneAndUpdate({mapId}, {$set: {changes}})

          metrics.mapSaveCount.labels(mapId).inc()
          endTimer()
        } else if (result.size > changes.length) {
          this.logError('local changes seem older than changes from database', {
            databaseSize: result.size,
            changesSize: changes.length,
          })
        } else {
          this.log('database and store are in sync')
        }
      } catch (e) {
        this.logError(`cannot save map changes to database on close: ${e}`)
      }
    })

    delete docSets[mapId]
    delete mutexes[mapId]

    // wait for results to be scraped
    setTimeout(() => {
      this.log('finally remove metrics')
      if (!(mapId in docSets)) {
        Object.values(metrics).forEach(m => m.remove(mapId))
      }
    }, REMOVE_METRICS_DELAY)
  }

  errorHandler =
    fn =>
    async (...args) => {
      const {mapId} = this
      const givenAck = args.length && typeof args[args.length - 1] === 'function' ? args.pop() : null

      try {
        await fn(...args)
        if (givenAck) {
          this.log('send ack success')
          givenAck(true)
        }
      } catch (e) {
        this.logError('An error occured', e.message, e.stack)

        metrics.errorCount.labels(mapId).inc()

        if (givenAck) {
          givenAck(false, e.message)
        } else {
          this.socket.emit('map/error', e.message)
        }
      }
    }

  get map() {
    return this.docSet.getDoc(this.mapId)
  }

  get mapId() {
    return this.socket.state.mapId
  }

  get userId() {
    return this.socket.state.userId
  }

  get clientCount() {
    const {docSet} = this
    return docSet.handlers.size
  }

  // NOTE: if you change this function, you also need to change the tests
  static connect = io => {
    // enable primitve logging
    // register middle ware
    io.use(prometheus)
    io.use(logger)
    io.use(auth)

    io.on('connection', socket => {
      new MapStoreEventHandler(socket)
    })
  }
}

export default MapStoreEventHandler
