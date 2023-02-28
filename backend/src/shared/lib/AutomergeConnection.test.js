import {fromJS} from 'immutable'
import Automerge from 'automerge'
import debug from 'debug'

import AutomergeConnection, {less} from './AutomergeConnection'
import sleep from '../../utils/test/sleep'

const log = debug('infinity:AutomergeConnection:Test')

const id = 'id'

const createConnections = (docSet1, docSet2) => {
  if (!docSet1.getDoc(id)) docSet1.setDoc(id, Automerge.init())

  let connection1
  let connection2

  const sendMsg1 = async msg => {
    log(`${connection1.enabled ? '' : 'not '}sending message from connection 1 to 2`, msg)
    if (connection1.enabled) {
      try {
        await connection2.receiveMsg(msg)
      } catch {
        log('send from connection 1 to connection 2 throw an exception')
        connection1.catched = (connection1.catched || 0) + 1
      }
    }
  }

  const sendMsg2 = async msg => {
    log(`${connection2.enabled ? '' : 'not '}sending message from connection 2 to 1`, msg)
    if (connection2.enabled) {
      try {
        await connection1.receiveMsg(msg)
      } catch {
        log('send from connection 2 to connection 1 throw an exception')
        connection2.catched = (connection2.catched || 0) + 1
      }
    }
  }

  connection1 = new AutomergeConnection(docSet1, sendMsg1)
  connection2 = new AutomergeConnection(docSet2, sendMsg2)

  connection1.enabled = true
  connection2.enabled = true

  connection1.open()
  connection2.open()

  return [connection1, connection2]
}

const getChangesLength = docSet => Automerge.getChanges(Automerge.init(), docSet.getDoc(id)).length

describe('automerge connection lifecycle', () => {
  it('should communicate changes', async () => {
    const docSet1 = new Automerge.DocSet()
    const docSet2 = new Automerge.DocSet()

    createConnections(docSet1, docSet2)

    docSet1.setDoc(
      id,
      Automerge.change(docSet1.getDoc(id), doc => (doc.test1 = true)),
    )

    await sleep(100)

    docSet2.setDoc(
      id,
      Automerge.change(docSet2.getDoc(id), doc => (doc.test2 = true)),
    )

    await sleep(100)

    expect(docSet1.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(docSet2.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(getChangesLength(docSet1)).toBe(2)
    expect(getChangesLength(docSet2)).toBe(2)
  })

  it('should allow packet loss with close and open (reconnect)', async () => {
    const docSet1 = new Automerge.DocSet()
    const docSet2 = new Automerge.DocSet()

    const [con1] = createConnections(docSet1, docSet2)

    con1.enabled = false

    docSet1.setDoc(
      id,
      Automerge.change(docSet1.getDoc(id), doc => (doc.test1 = true)),
    )

    con1.close()
    con1.enabled = true
    con1.open()

    await sleep(100)

    expect(docSet1.getDoc(id)).toMatchObject({test1: true})
    expect(docSet2.getDoc(id)).toMatchObject({test1: true})
    expect(getChangesLength(docSet1)).toBe(1)
    expect(getChangesLength(docSet2)).toBe(1)
  })

  it('should allow packet loss without close and open', async () => {
    const docSet1 = new Automerge.DocSet()
    const docSet2 = new Automerge.DocSet()

    const [con1] = createConnections(docSet1, docSet2)

    // first create the document at the second connection
    docSet1.setDoc(
      id,
      Automerge.change(docSet1.getDoc(id), doc => (doc.test1 = false)),
    )

    await sleep(100)

    expect(docSet1.getDoc(id)).toMatchObject({test1: false})
    expect(docSet2.getDoc(id)).toMatchObject({test1: false})

    con1.enabled = false

    docSet1.setDoc(
      id,
      Automerge.change(docSet1.getDoc(id), doc => (doc.test1 = true)),
    )

    con1.enabled = true

    await sleep(100)

    expect(docSet1.getDoc(id)).toMatchObject({test1: true})
    expect(docSet2.getDoc(id)).toMatchObject({test1: false})

    docSet2.setDoc(
      id,
      Automerge.change(docSet2.getDoc(id), doc => (doc.test2 = true)),
    )

    await sleep(100)

    expect(docSet1.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(docSet2.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(getChangesLength(docSet1)).toBe(3)
    expect(getChangesLength(docSet2)).toBe(3)
  })

  it('should allow initial sync via other methods', async () => {
    const docSet1 = new Automerge.DocSet()
    const docSet2 = new Automerge.DocSet()

    docSet1.setDoc(
      id,
      Automerge.change(Automerge.init(), doc => (doc.test1 = true)),
    )

    docSet2.setDoc(id, docSet1.getDoc(id))

    createConnections(docSet1, docSet2)

    docSet2.setDoc(
      id,
      Automerge.change(docSet2.getDoc(id), doc => (doc.test2 = true)),
    )

    await sleep(100)

    expect(docSet1.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(docSet2.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(getChangesLength(docSet1)).toBe(2)
    expect(getChangesLength(docSet2)).toBe(2)
  })

  it('should handle changes that arrive several times', async () => {
    const docSet1 = new Automerge.DocSet()
    const docSet2 = new Automerge.DocSet()

    const [con1, con2] = createConnections(docSet1, docSet2)

    con1._sendMsg = msg => {
      con2.receiveMsg(msg)
      con2.receiveMsg(msg)
      con2.receiveMsg(msg)
    }

    docSet1.setDoc(
      id,
      Automerge.change(docSet1.getDoc(id), doc => {
        doc.test1 = true
        doc.test2 = true
      }),
    )

    await sleep(100)

    expect(docSet1.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(docSet2.getDoc(id)).toMatchObject({test1: true, test2: true})
    expect(getChangesLength(docSet1)).toBe(1)
    expect(getChangesLength(docSet2)).toBe(1)
  })

  it('should fail when incomplete changes are send', async () => {
    const docSet1 = new Automerge.DocSet()
    const docSet2 = new Automerge.DocSet()

    const [con1] = createConnections(docSet1, docSet2)

    // initialize connection and sync
    docSet1.setDoc(
      id,
      Automerge.change(docSet1.getDoc(id), doc => (doc.test1 = false)),
    )

    // remove one change from the message
    const origSendMsg = con1._sendMsg
    con1._sendMsg = msg => {
      log('sending message from connection 1 to 2', msg)
      msg.changes.shift()
      origSendMsg(msg)
      con1._sendMsg = origSendMsg
    }

    const firstChangeDoc = Automerge.change(docSet1.getDoc(id), doc => (doc.test1 = true))
    const secondChangeDoc = Automerge.change(firstChangeDoc, doc => (doc.test2 = true))
    docSet1.setDoc(id, secondChangeDoc)

    await sleep(100)

    expect(con1.catched).toBe(1)
  })
})

describe('less function for clock comparison', () => {
  it('should detect missing clocks', () => {
    const clock1 = fromJS({
      '9ac4d547-a94a-499f-98f1-2d142cdc8c9d': 1,
      '68dc935b-53c0-4570-827d-cdb67662e94f': 3,
      '5712df5c-fcce-422e-a38c-ea37667fed90': 8,
    })
    const clock2 = fromJS({
      '9ac4d547-a94a-499f-98f1-2d142cdc8c9d': 1,
      '68dc935b-53c0-4570-827d-cdb67662e94f': 3,
      '5712df5c-fcce-422e-a38c-ea37667fed90': 8,
      'ea411a62-7f92-4a5b-9755-b11ae5cda46f': 31,
    })

    expect(less(clock1, clock2)).toEqual('ea411a62-7f92-4a5b-9755-b11ae5cda46f')
    expect(less(clock2, clock1)).toEqual(undefined)
    expect(less(fromJS({}), fromJS({}))).toEqual(undefined)
    expect(less(clock1, clock1)).toEqual(undefined)
  })
})
