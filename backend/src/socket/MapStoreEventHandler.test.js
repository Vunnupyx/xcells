import Automerge, {Frontend} from 'automerge'
import ioClientImpl from 'socket.io-client'
import http from 'http'
import ioServer from 'socket.io'
import {fromJS} from 'immutable'
import debug from 'debug'

import MapStoreEventHandler from './MapStoreEventHandler'
import {closeDb, connectDb} from '../db'
import generateAuth from '../../src/controllers/utils/generateAuth'
import * as constants from '../../src/constants'
import {customer, subscriberSocket} from '../utils/test/users'
import sleep from '../utils/test/sleep'
import logger from './middlewares/logger'
import auth from './middlewares/auth'
import InfinityMap from '../models/InfinityMap'
import {subscriberSocketRequest} from '../utils/test/userRequests'
import AutomergeConnection from '../shared/lib/AutomergeConnection'
import {sum} from '../utils/reducer'
import MapChanges from '../models/MapChanges'
import MapImage from '../models/MapImage'
import MapFile from '../models/MapFile'
import User from '../models/User'

const log = debug('infinity:Socket:MapStore:Test')

let httpServer
let server
const address = '0.0.0.0'
const port = 3000
const uri = `http://[${address}]:${port}`

const defaultSocketOptions = {
  'reconnection delay': 0,
  'reopen delay': 0,
  'force new connection': true,
  transportOptions: {
    polling: {
      extraHeaders: {
        cookie: `auth=${generateAuth(subscriberSocket).access_token}`,
      },
    },
  },
}

let originalValues = {}
const handlers = {}

const ioClient = (...args) => {
  const client = ioClientImpl(...args)
  client.on('map/update', data => log(`map/update on client${client.id}`, data))
  client.errorFunc = jest.fn()
  client.on('map/error', client.errorFunc)
  client.ackEmit = (...args) =>
    new Promise(resolve => {
      const ack = jest.fn((...args) => {
        log(`received client ${client.id} ack`, args)
        resolve(args)
      })
      client.emit(...args, ack)
    })
  return client
}

const waitForInitialLoad = (client, changeFunc) =>
  new Promise(resolve => {
    const receiveChanges = ({changes}) => {
      if (changes) {
        client.off('map/update', receiveChanges)

        changeFunc(changes)

        resolve()
      }
    }
    client.on('map/update', receiveChanges)
  })

// setup a backend server
beforeAll(async () => {
  await connectDb()
  httpServer = await http.createServer().listen(port, address)
  server = ioServer(httpServer)
  // this is copied over from the "connect" function, to access the StorageEventHandler object
  server.use(logger)
  server.use(auth)
  server.on('connection', socket => {
    log('new handler', socket.id)
    handlers[socket.id] = new MapStoreEventHandler(socket)
  })
  await InfinityMap.find().limit(1)
  await InfinityMap.deleteMany({userId: subscriberSocket.name})
  await MapChanges.deleteMany({userId: subscriberSocket.name})
  await MapImage.deleteMany({userId: subscriberSocket.name})
  await MapFile.deleteMany({userId: subscriberSocket.name})
}, 60000)

beforeAll(() => {
  originalValues.delete_delay = constants.DOCSET_DELETE_DELAY
  constants.DOCSET_DELETE_DELAY = 0
  originalValues.save_interval = constants.SAVE_TO_DATABASE_INTERVAL
  constants.SAVE_TO_DATABASE_INTERVAL = 0
  originalValues.remove_metrics = constants.REMOVE_METRICS_DELAY
  constants.REMOVE_METRICS_DELAY = 0
})

afterAll(async () => {
  await new Promise(resolve => server.close(resolve))
  await sleep(100)
  await closeDb()
  constants.DOCSET_DELETE_DELAY = originalValues.delete_delay
  constants.SAVE_TO_DATABASE_INTERVAL = originalValues.save_interval
  constants.REMOVE_METRICS_DELAY = originalValues.remove_metrics
})

// TODO: test customer life cycle
describe('automerge document life cycle', () => {
  let client1
  let client2
  let client3
  let clientLast
  let mapId
  let socketOptions

  beforeAll(() => User.deleteOne({id: subscriberSocket.id}))

  afterAll(() => User.deleteOne({id: subscriberSocket.id}))

  // setup client connections
  beforeAll(async () => {
    // create the user, if it does not exist
    if (!(await User.findOne({id: subscriberSocket.id}))) {
      await new User(subscriberSocket).save()
    }

    // create a map using the rest api
    const response = await subscriberSocketRequest.post('/maps').send()
    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data.mapId).toBeDefined()
    mapId = data.mapId

    log('map id', mapId)

    socketOptions = {...defaultSocketOptions, query: {mapId}}
  })

  afterAll(() => {
    if (client1.connected) {
      client1.disconnect()
    }
    if (client2.connected) {
      client2.disconnect()
    }
    if (client3.connected) {
      client3.disconnect()
    }
    if (clientLast.connected) {
      clientLast.disconnect()
    }
  })

  let map
  let connection1
  let connection2
  let mapSet1
  let mapSet2

  it('should open a document', async () => {
    log('#1')
    client1 = ioClient(uri, socketOptions)
    mapSet1 = new Automerge.DocSet()
    connection1 = new AutomergeConnection(mapSet1, msg => client1.emit('map/update', msg))
    client1.on('map/update', msg => connection1.receiveMsg(msg))
    connection1.open()

    await waitForInitialLoad(client1, changes => {
      map = Automerge.applyChanges(Automerge.init(), fromJS(changes))

      expect(map.mapId).toBe(mapId)

      mapSet1.setDoc(mapId, map)
    })
    const clientId = client1.id

    expect(client1.errorFunc).toHaveBeenCalledTimes(0)
    expect(map).toEqual({mapId: mapId})
    expect(MapStoreEventHandler.docSets[mapId].getDoc(mapId)).toEqual(map)
    expect(handlers[clientId].docSet.getDoc(mapId)).toEqual(map)
    expect(handlers[clientId].clientCount).toBe(1)
  }, 20000) // high timeout because ci pipeline sometimes fails because of a timeout connecting to the db

  it('should connect second client to document', async () => {
    log('#2', mapId)
    client2 = ioClient(uri, socketOptions)
    mapSet2 = new Automerge.DocSet()
    connection2 = new AutomergeConnection(mapSet2, msg => client2.emit('map/update', msg))
    client2.on('map/update', msg => connection2.receiveMsg(msg))

    connection2.open()

    await waitForInitialLoad(client2, changes => {
      expect(Automerge.applyChanges(Automerge.init(), fromJS(changes))).toEqual(map)
    })

    const clientId = client2.id

    expect(client2.errorFunc).toHaveBeenCalledTimes(0)
    expect(MapStoreEventHandler.docSets[mapId].getDoc(mapId)).toEqual(map)
    expect(handlers[clientId].docSet.getDoc(mapId)).toEqual(map)
    expect(handlers[clientId].clientCount).toBe(2)
  })

  it('should add some infos to map', async () => {
    log('#3', mapId)
    const message = 'test changes'
    const newMap = Automerge.change(map, message, doc => {
      doc.root = 'test'
      doc.title = 'test2'
      doc.nodes = {test: {id: 'test', width: 200, height: 200}}
    })

    mapSet1.setDoc(mapId, newMap)

    // wait for sync of changes
    await new Promise(resolve => {
      const checkDone = value => {
        if (value.changes && value.changes[0].message === message) {
          client2.off('map/update', checkDone)
          resolve(value)
        }
      }
      client2.on('map/update', checkDone)
    })

    // wait for automerge connection to update docset
    await sleep(100)

    expect(client1.errorFunc).toHaveBeenCalledTimes(0)
    expect(client2.errorFunc).toHaveBeenCalledTimes(0)

    expect(mapSet1.getDoc(mapId)).toMatchObject(JSON.parse(JSON.stringify(newMap)))
    expect(mapSet2.getDoc(mapId)).toMatchObject(JSON.parse(JSON.stringify(newMap)))
    expect(MapStoreEventHandler.docSets[mapId].getDoc(mapId)).toEqual(newMap)

    // wait for map to be saved
    while (mapId in MapStoreEventHandler.saveMapRefs) {
      await sleep(1)
    }
    expect((await InfinityMap.findOne({mapId: mapId})).toJSON()).toMatchObject(JSON.parse(JSON.stringify(newMap)))
  })

  it('should fail when an exception occurs', async () => {
    log('#4')
    const errorMessage = 'a test error occurred'

    const throwException = () => {
      log('throw EXCEPTION')
      throw new Error(errorMessage)
    }

    handlers[client1.id].socket.on('map/test', handlers[client1.id].errorHandler(throwException))

    const [ackSuccess, ackMessage] = await client1.ackEmit('map/test')

    expect(ackSuccess).toBe(false)
    expect(ackMessage).toContain(errorMessage)

    expect(client1.errorFunc).toHaveBeenCalledTimes(0)

    client1.emit('map/test')

    const errorPromise = new Promise(resolve => client1.once('map/error', resolve))

    expect(errorPromise).resolves.toContain(errorMessage)
    await sleep(100)
    expect(client1.errorFunc).toHaveBeenCalledTimes(1)
    client1.errorFunc.mockClear()
  })

  it('should close all connections', async () => {
    log('#5')
    expect(handlers[client2.id].clientCount).toEqual(2)
    expect(handlers[client1.id].clientCount).toEqual(2)

    const clientId1 = client1.id

    client1.disconnect()

    while (handlers[clientId1].connection) {
      await sleep(1)
    }

    const clientId2 = client2.id

    expect(handlers[clientId2].clientCount).toEqual(1)

    client2.disconnect()

    // wait until cleanup function is called
    while (handlers[clientId2].connection) {
      await sleep(1)
    }

    // wait until handler stored stuff to the database
    while (mapId in MapStoreEventHandler.closeRefs) {
      await sleep(1)
    }
    expect(client1.errorFunc).toHaveBeenCalledTimes(0)
    expect(client2.errorFunc).toHaveBeenCalledTimes(0)
    expect(MapStoreEventHandler.closeRefs).not.toHaveProperty(mapId)
    expect(MapStoreEventHandler.docSets).not.toHaveProperty(mapId)
    expect(MapStoreEventHandler.mutexes).not.toHaveProperty(mapId)
  })

  it('should not allow other users', async () => {
    log('#6')
    const otherUserSocketOptions = {
      defaultSocketOptions,
      transportOptions: {
        polling: {
          extraHeaders: {
            cookie: `auth=${generateAuth(customer).access_token}`,
          },
        },
      },
      query: {mapId},
    }
    client3 = ioClient(uri, otherUserSocketOptions)

    const errorPromise = new Promise(resolve => client3.once('error', resolve))

    await expect(errorPromise).resolves.toContain('Access denied')

    client3.disconnect()
  })

  it('should reconnect and resync when connection gets lost', async () => {
    log('#7')

    // connect client
    const mapSet = new Automerge.DocSet()
    clientLast = ioClient(uri, socketOptions)
    let connection = new AutomergeConnection(mapSet, msg => {
      log('sending msg to backend', msg)
      clientLast.emit('map/update', msg, () => true)
    })
    clientLast.on('map/update', msg => {
      log('received msg from backend', msg)
      connection.receiveMsg(msg)
    })

    connection.open()
    await waitForInitialLoad(clientLast, changes => {
      log('received CHANGES', changes)
      const loadedMap = Automerge.applyChanges(Automerge.init(), fromJS(changes))
      mapSet.setDoc(mapId, loadedMap)
    })

    let clientId = clientLast.id

    // wait for async AutomergeConnection communication to complete
    await sleep(100)

    expect(handlers[clientId].clientCount).toEqual(1)
    expect(MapStoreEventHandler.docSets[mapId].getDoc(mapId)).toEqual(mapSet.getDoc(mapId))
    expect(handlers[clientId].docSet.getDoc(mapId)).toEqual(mapSet.getDoc(mapId))
    expect(handlers[clientId].socket.id).toEqual(clientLast.id)
    expect(Object.keys(MapStoreEventHandler.mutexes)).toContain(mapId)
    expect(Object.keys(MapStoreEventHandler.docSets)).toContain(mapId)

    // disconnect server from client
    clientLast.disconnect()
    connection.close()

    await new Promise(resolve => handlers[clientId].socket.once('disconnect', resolve))

    // wait until handler stored stuff to the database
    while (mapId in MapStoreEventHandler.closeRefs) {
      await sleep(1)
    }

    expect(handlers[clientId].clientCount).toEqual(0)
    expect(Object.keys(MapStoreEventHandler.docSets)).not.toContain(mapId)
    expect(Object.keys(MapStoreEventHandler.mutexes)).not.toContain(mapId)

    // make changes to client
    const newTitle = 'this is a new title for testing purposes'
    const newMap = Automerge.change(mapSet.getDoc(mapId), doc => {
      doc.title = newTitle
    })
    mapSet.setDoc(mapId, newMap)

    // reconnect which should trigger a resync
    clientLast.connect()
    connection.open()

    // add one to the clientId as we reconnected which creates a new handler
    clientId = await new Promise(resolve => clientLast.once('connect', () => resolve(clientLast.id)))

    while (!handlers[clientId]) {
      log('cannot find handler', clientId)
      await sleep(1)
    }

    await waitForInitialLoad(handlers[clientId].socket, c => log(c[0]))

    // wait for async AutomergeConnection communication to complete
    await sleep(100)

    expect(clientLast.errorFunc).toHaveBeenCalledTimes(0)
    expect(Object.keys(MapStoreEventHandler.docSets)).toContain(mapId)
    expect(Object.keys(MapStoreEventHandler.mutexes)).toContain(mapId)
    expect(MapStoreEventHandler.docSets[mapId].getDoc(mapId)).toEqual(mapSet.getDoc(mapId))
    expect(handlers[clientId].docSet.getDoc(mapId)).toEqual(mapSet.getDoc(mapId))

    clientLast.disconnect()
    while (handlers[clientId].connection) {
      await sleep(1)
    }
  })

  it('test', () => {
    let newDoc = Automerge.change(Automerge.init(), doc => (doc.test = 'test'))
    newDoc = Automerge.change(newDoc, doc => (doc.test2 = 'test2'))
    newDoc = Automerge.change(newDoc, doc => (doc.test3 = 'test3'))
    newDoc = Automerge.change(newDoc, doc => (doc.test4 = 'test4'))
    newDoc = Automerge.change(newDoc, doc => (doc.test5 = 'test2'))
    newDoc = Automerge.applyChanges(Automerge.init(), Automerge.getChanges(Automerge.init(), newDoc))
    newDoc = Automerge.change(newDoc, doc => (doc.test6 = 'test3'))
    newDoc = Automerge.change(newDoc, doc => (doc.test7 = 'test4'))
    newDoc = Automerge.change(newDoc, doc => (doc.test8 = 'test2'))
    newDoc = Automerge.change(newDoc, doc => (doc.test9 = 'test3'))
    newDoc = Automerge.change(newDoc, doc => (doc.test10 = 'test4'))
    newDoc = Automerge.applyChanges(Automerge.init(), Automerge.getChanges(Automerge.init(), newDoc))
    newDoc = Automerge.change(newDoc, doc => (doc.test11 = 'test2'))
    newDoc = Automerge.change(newDoc, doc => (doc.test12 = 'test3'))
    newDoc = Automerge.change(newDoc, doc => (doc.test13 = 'test4'))
    newDoc = Automerge.change(newDoc, doc => (doc.test14 = 'test2'))
    newDoc = Automerge.change(newDoc, doc => (doc.test19 = 'test4'))
    newDoc = Automerge.applyChanges(Automerge.init(), Automerge.getChanges(Automerge.init(), newDoc))
    newDoc = Automerge.change(newDoc, doc => (doc.test15 = 'test3'))
    newDoc = Automerge.change(newDoc, doc => (doc.test16 = 'test4'))
    newDoc = Automerge.change(newDoc, doc => (doc.test17 = 'test2'))
    newDoc = Automerge.change(newDoc, doc => (doc.test18 = 'test3'))
    newDoc = Automerge.change(newDoc, doc => (doc.test19 = 'test5'))

    const changes = Automerge.getChanges(Automerge.init(), newDoc)

    // this was to test, what happens, when a change is missing
    // this will cause Automerge to stop merging
    // changes.splice(5, 1)

    let finalDoc = Automerge.applyChanges(Automerge.init(), changes)

    const clock = Frontend.getBackendState(finalDoc).getIn(['opSet', 'clock'])
    const history = Automerge.getHistory(finalDoc)

    expect(history.length).toEqual(20)
    expect(clock.valueSeq().reduce(sum)).toEqual(history.length)
    expect(changes.length).toEqual(history.length)
  })
})
