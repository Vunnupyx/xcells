import Automerge, {FreezeObject} from 'automerge'
import Socket from 'socket.io-client'
import debug from 'debug'

import CONFIG from '../engine/CONFIG'
import {SOCKET_ACK_TIMEOUT, SOCKET_OPTIONS} from '../shared/config/socket'

import {add} from './actions'
import AutomergeConnection from '../shared/lib/AutomergeConnection'
import {subscribe} from '../intl/links'
import createDeduplicator from '../utils/createDeduplicator'

import {
  AutomergeMapData,
  EdgeDatas,
  Logger,
  MapData,
  MapId,
  MapStore,
  MapStoreAction,
  MapStoreActions,
  MapStoreSubscriber,
  NodeData,
  NodeDatas,
  NodeId,
  NodeTagDatas,
  Settings,
} from '../engine/types'
import TranslatableError from '../utils/TranslatableError'

/**
 * The MapStore class handles an imap object, provides a way to dispatch actions
 * and syncs changes to the server and other clients.
 *
 */
class MapStoreWrite implements MapStore {
  docSet: Automerge.DocSet<MapData> = new Automerge.DocSet()

  connection: AutomergeConnection

  subscriptions: Set<MapStoreSubscriber> = new Set()

  ackTimeoutRefs: Set<NodeJS.Timeout> = new Set()

  isLoading = true

  isWriteable = true

  isClosed = false

  isWithHistory = true

  token = ''

  auth: {limitNodes?: number} = {}

  gotUpdate: {timestamp: number} | null = null

  isLastUpdateSuccessful: boolean | null = null

  error: Error | null = null

  mapId: string

  settings: Settings | undefined

  log: Logger

  logError: Logger

  socketLog: Logger

  socketLogError: Logger

  logActions: Logger

  socketOptions: SocketIOClient.ConnectOpts

  socket: SocketIOClient.Socket | null = null

  private limitNodes: number | boolean

  private errorDeduplicater = createDeduplicator(CONFIG.mapStoreErrorDelay)

  private trackingFunction: (param: string) => void = () => undefined

  constructor(
    mapId: MapId,
    limitNodes: number | boolean,
    myUsername: string,
    socketOptions: SocketIOClient.ConnectOpts = {},
  ) {
    this.mapId = mapId

    const log = debug('app:MapStore').extend('socketId', '@').extend(mapId, '#')
    this.log = log
    this.logError = log.extend('ERROR*', '::')
    this.logActions = log.extend('actions')
    this.socketLog = log.extend('Socket')
    this.socketLogError = log.extend('Socket').extend('ERROR*', '::')

    this.log('Create a new writeable MapStore', mapId)

    this.socketOptions = {
      ...SOCKET_OPTIONS,
      ...socketOptions,
    }
    this.docSet.registerHandler(this.fireSubscriptions)
    this.connection = new AutomergeConnection(this.docSet, this.sendMsg)

    this.limitNodes = limitNodes
  }

  setAuth = (auth: {limitNodes?: number}): void => {
    this.auth = auth
  }

  setSettings = (settings: Settings | undefined): void => {
    this.settings = settings
  }

  setTrackingFunction = (trackingFunction: (param: string) => void): void => {
    this.trackingFunction = trackingFunction
  }

  disconnect = (): void => {
    const {ackTimeoutRefs, socket, connection} = this

    if (!socket) return

    this.log('disconnect', socket.id)

    connection.close()

    socket
      .off('disconnect', this.onDisconnect)
      .off('reconnect', this.onReconnect)
      .off('reconnecting', this.onReconnecting)
      .off('reconnect_failed', this.onReconnectFailed)
      .off('error', this.onError)
      .off('connect', this.onConnect)
      .off('connect_error', this.onConnectError)
      .off('connect_timeout', this.onConnectTimeout)
      .off('message', this.onMessage)
      .off('pong', this.onPong)
      .off('map/update', this.onMapUpdate)
      .off('map/error', this.onMapError)

    if (ackTimeoutRefs.size === 0) {
      socket.disconnect()
    } else {
      this.log('prevent disconnect as acks still standing out', socket.id)
      setTimeout(() => {
        this.log('finally closing connection', socket.id)
        socket.disconnect()
      }, SOCKET_ACK_TIMEOUT)
    }

    this.socket = null
  }

  reconnect = (): void => {
    const {disconnect, socketOptions, mapId, socket} = this

    if (socket) {
      disconnect()
    }

    // set mapId for nginx sessions hashing:
    // https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#custom-nginx-upstream-hashing
    this.socket = Socket({
      forceNew: true,
      ...socketOptions,
      query: {...(socketOptions.query as Record<string, unknown>), mapId},
    })

    this.log('reconnect', {socketOptions, mapId, socketId: this.socket.id})

    this.socket
      .on('map/update', this.onMapUpdate)
      .on('map/error', this.onMapError)
      .on('disconnect', this.onDisconnect)
      .on('reconnect', this.onReconnect)
      .on('reconnecting', this.onReconnecting)
      .on('reconnect_failed', this.onReconnectFailed)
      .on('error', this.onError)
      .on('connect', this.onConnect)
      .on('connect_error', this.onConnectError)
      .on('connect_timeout', this.onConnectTimeout)
      .on('message', this.onMessage)
      .on('pong', this.onPong)
  }

  onMessage = (message: string): void => {
    this.socketLog('Message received.', message)
  }

  onReconnecting = (attempt: number): void => {
    this.socketLog(`Reconnecting (attempt ${attempt}) ...`)
    this.fireSubscriptions()
  }

  onConnectTimeout = (): void => this.socketLog('Connection with backend timeout.')

  onPong = (): void => this.socketLog('Pong.')

  onReconnectFailed = (): void => {
    const {fireSubscriptions, reconnect} = this
    // this will never happen, as currently reties are set to infinity
    this.socketLogError('Reconnection failed.')
    reconnect()
    fireSubscriptions()
  }

  onConnect = (): void => {
    const {fireSubscriptions, connection} = this
    this.socketLog('Connection with backend established')
    connection.open()
    fireSubscriptions()
  }

  onConnectError = (errorMessage: string): void => {
    const {fireSubscriptions} = this
    this.socketLogError('Error when trying to connect to backend', errorMessage)
    fireSubscriptions()
  }

  onError = (errorMessage: string): void => {
    const {fireError} = this
    this.socketLogError(`Error from backend ${errorMessage}`)
    fireError(`Error from backend connection ${errorMessage}`, 'mapStoreSocketMapError')
  }

  // @todo: add type for AutomergeConnection messages
  onMapUpdate = async (msg: Record<string, unknown>): Promise<void> => {
    const {connection, isLoading, isClosed, dispatch} = this

    if (isClosed) return

    this.log('onMapUpdate', msg)

    await connection.receiveMsg(msg)

    if (isLoading && msg.changes) {
      this.isLoading = false
    }

    if (this.map && !this.map.root) {
      dispatch(add({...CONFIG.nodes.create, ...CONFIG.nodes.createRoot}))
    }
  }

  onMapError = (error: string): void => {
    const {fireError} = this
    // disable the loading state, when we receive for example a login error
    this.log('onMapError', error)

    this.isLoading = false
    fireError(`Received an error from the store backend: ${error}`, 'mapStoreSocketMapError')
  }

  onDisconnect = (): void => {
    const {fireSubscriptions, connection} = this
    this.socketLog('onDisconnect')
    connection.close()
    fireSubscriptions()
  }

  onReconnect = (): void => {
    const {fireSubscriptions, connection} = this
    this.socketLog('onReconnect')
    connection.close()
    connection.open()
    fireSubscriptions()
  }

  subscribe = (fn: MapStoreSubscriber): void => {
    const {subscriptions} = this
    this.log('subscribe')
    subscriptions.add(fn)
    fn(this)
  }

  unsubscribe = (fn: MapStoreSubscriber): void => {
    const {subscriptions} = this
    this.log('unsubscribe')
    if (subscriptions.has(fn)) {
      subscriptions.delete(fn)
    }
  }

  fireSubscriptions = (): void => {
    const {subscriptions} = this

    this.log('fire subscriptions')
    subscriptions.forEach(fn => fn(this))
  }

  close = (): Promise<void> =>
    new Promise(resolve => {
      const {mapId, disconnect, ackTimeoutRefs, docSet, fireSubscriptions, isClosed, socket} = this

      if (isClosed || !socket) {
        resolve()
        return
      }

      this.isClosed = true

      this.log('close')

      socket.once('disconnect', resolve)

      disconnect()

      ackTimeoutRefs.forEach(clearTimeout)
      docSet.removeDoc(mapId)
      fireSubscriptions()
    })

  dispatch = (actionOrActions: MapStoreAction | MapStoreActions): void => {
    const {isConnected, map, nodes, fireError, isClosed} = this

    if (!isConnected || isClosed) {
      fireError('Changes cannot be saved, not connected to backend', 'mapStoreSocketChangesNotSaved')
    }

    const requestActions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions]

    // helper methods
    const /* find */ addActionForId =
        (id: NodeId) =>
        ({node: innerNode, name: innerName}: MapStoreAction) =>
          innerName === 'nodeAdd' && id === innerNode?.id
    const /* filter */ actionsWithUnaddedNode = ({node, name}: MapStoreAction) =>
        name !== 'nodeAdd' &&
        node &&
        (!node.id || !nodes || !(node.id in nodes)) &&
        (!node.id || !requestActions.find(addActionForId(node.id)))
    const /* fiter */ isFirstAddActionOfItsNode = (action: MapStoreAction, _: number, arr: MapStoreAction[]) => {
        const {node} = action
        if (!node || !node.id) return false
        const firstAddActionOfNode = arr.find(addActionForId(node.id))
        return firstAddActionOfNode === action
      }
    const /* map */ toAddAction = ({node}: MapStoreAction) => add(node as NodeData)
    const /* filter */ unnecessaryAddAction = ({node, name}: MapStoreAction) =>
        name === 'nodeAdd' && (!node || (node.id && nodes && node.id in nodes))
    // helper

    const actions = [
      ...requestActions
        .filter(actionsWithUnaddedNode)
        .map(toAddAction) // get missing add actions
        .filter(isFirstAddActionOfItsNode), // remove duplicates,
      ...requestActions.filter(a => !unnecessaryAddAction(a)),
    ]

    /* actions = [
      // if the saved node does not exist an there is no action to create it give, create the node
      ...requestActions
        .filter(
          ({node, name}) =>
            name !== 'nodeAdd' &&
            node &&
            (!node.id || !nodes || !(node.id in nodes)) &&
            !requestActions.find(
              ({node: innerNode, name: innerName}) => innerName === 'nodeAdd' && node.id === innerNode?.id,
            ),
        )
        .map(({node}) => add(node as NodeData)),
      ...requestActions,
    ] */

    const names = new Set(actions.map(({name}) => name))

    const dispatchReducer = (doc: AutomergeMapData) =>
      actions.forEach(({name, reducer, node, edge}) => {
        this.logActions(name, {node, edge})
        reducer(doc)
      })

    let newMap
    try {
      newMap = Automerge.change(map, Array.from(names).join(','), dispatchReducer)
    } catch (e) {
      fireError(
        `Error while applying actions ${Array.from(names).join(',')}: ${(e as Error).message}`,
        'mapStoreSocketCannotDispatch',
      )
      if (process.env.NODE_ENV !== 'production') {
        throw e
      }
      return
    }

    const {limitNodes} = this
    const nodeCount = (newMap.nodes && Object.keys(newMap.nodes).length) || 0

    if (!limitNodes || nodeCount <= limitNodes) {
      this.map = newMap
    } else {
      fireError('Reached node limit', 'mapStoreLimitReached', {limitNodes, subscribe})
    }
  }

  get isConnected(): boolean {
    // @see socket.io-client/manager.js:533
    // @ts-ignore socket.io.reconnecting is not declared in types, but is used in code
    return Boolean(this.socket?.connected && !this.socket?.io.reconnecting && this.connection.opened)
  }

  get map(): MapData {
    return this.docSet.getDoc(this.mapId) as MapData
  }

  set map(doc: MapData) {
    const {mapId} = this
    if (doc.mapId !== mapId) {
      throw new Error('Assigned wrong map to MapStore')
    }

    this.docSet.setDoc(mapId, doc as FreezeObject<MapData>)
  }

  // expose map attributes
  get id(): MapId {
    return this.mapId
  }

  get root(): string {
    return this.map?.root || ''
  }

  get nodes(): NodeDatas {
    return (this.map?.nodes || {}) as NodeDatas
  }

  get edges(): EdgeDatas {
    return (this.map?.edges || {}) as EdgeDatas
  }

  get title(): string | undefined {
    return this.map?.title
  }

  get tags(): NodeTagDatas {
    return this.map?.tags || []
  }

  get canUndo(): boolean {
    return Boolean(this.map && Automerge.canUndo(this.map as FreezeObject<MapData>))
  }

  undo = (): void => {
    this.log('undo')
    this.map = Automerge.undo(this.map as FreezeObject<MapData>) as MapData
  }

  get canRedo(): boolean {
    return Boolean(this.map && Automerge.canRedo(this.map as FreezeObject<MapData>))
  }

  redo = (): void => {
    this.log('redo')
    this.map = Automerge.redo(this.map as FreezeObject<MapData>) as MapData
  }

  isNodeDeletable = (id: NodeId): boolean => this.root !== id

  emit = (eventName: string, ...args: unknown[]): Promise<void> =>
    new Promise((resolve, reject) => {
      this.log('emiting', eventName, args)
      const {socket, ackTimeoutRefs, fireError} = this

      let givenAck: (b: boolean) => void

      if (args.length > 0 && typeof args[args.length - 1] === 'function') {
        givenAck = args.pop() as (b: boolean) => void
      }

      const timeoutRef = setTimeout(() => {
        ackTimeoutRefs.delete(timeoutRef)
        const error = fireError(
          `Event ${eventName} timed out. Reload if there are any problems.`,
          'mapStoreSocketEventTimeout',
        )
        reject(error)
      }, SOCKET_ACK_TIMEOUT)

      const timeoutAck = (success: boolean, message: string) => {
        clearTimeout(timeoutRef)
        ackTimeoutRefs.delete(timeoutRef)
        if (givenAck) givenAck(success)
        if (!success) {
          const error = fireError(
            `Event ${eventName} could not be handled correctly: ${message}`,
            'mapStoreSocketBackendError',
            {event: eventName, message},
          )
          reject(error)
        } else {
          this.log('update successful')
          resolve()
        }
      }
      ackTimeoutRefs.add(timeoutRef)
      socket?.emit(eventName, ...args, timeoutAck)
    })

  fireError = (message: string, translationId: string, values?: Record<string, unknown>): Error => {
    const {fireSubscriptions, errorDeduplicater} = this

    this.logError(message)
    const error = new TranslatableError(message, translationId, values)

    errorDeduplicater(translationId || message, () => {
      this.error = error
      fireSubscriptions()
    })

    return error
  }

  pulse = (success: boolean): void => {
    this.gotUpdate = {timestamp: Date.now()}
    this.isLastUpdateSuccessful = success
    this.fireSubscriptions()
  }

  // @todo: message from automergeconnection
  sendMsg = (msg: unknown): Promise<void> => this.emit('map/update', msg, this.pulse)

  // TODO: how can we implement this? as this will return false when ever a change
  //  was done until an update from the other side arrives
  get isSync(): boolean {
    const {mapId, map, connection} = this

    const state = Automerge.Frontend.getBackendState(map as FreezeObject<MapData>)

    if (connection._receivedClock.has(mapId)) {
      const changes = Automerge.Backend.getMissingChanges(state, connection._receivedClock.get(mapId))
      return changes.length > 0
    }
    return false
  }

  get changes(): Automerge.State<unknown>[] {
    return Automerge.getHistory(this.docSet.getDoc(this.mapId))
  }
}

export default MapStoreWrite
