import Automerge from 'automerge'
// import MapChanges from '../models/map-changes'

const clientDocSet = new Automerge.DocSet()
clientDocSet.setDoc('doc', Automerge.from({intitialized: 'client'}))

const serverDocSet = new Automerge.DocSet()
serverDocSet.setDoc('doc', Automerge.load(Automerge.save(clientDocSet.getDoc('doc'))))

const clientSend = (...args) => {
  console.log('clientSend', ...args)

  serverConnection.receiveMsg(...args)
}
const serverSend = (...args) => {
  console.log('serverSend', ...args)

  clientConnection.receiveMsg(...args)
}

const clientConnection = new Automerge.Connection(clientDocSet, clientSend)

const serverConnection = new Automerge.Connection(serverDocSet, serverSend)

serverConnection.open()
clientConnection.open()

clientDocSet.setDoc(
  'doc',
  Automerge.change(clientDocSet.getDoc('doc'), doc => {
    doc.test = 'TEST'
  }),
)

serverDocSet.setDoc(
  'doc',
  Automerge.change(serverDocSet.getDoc('doc'), doc => {
    doc.serverTest = 'SERVER_TEST'
  }),
)

console.log('clientDoc', clientDocSet.getDoc('doc'))
console.log('serverDoc', serverDocSet.getDoc('doc'))
