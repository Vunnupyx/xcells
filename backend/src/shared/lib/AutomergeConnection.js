import {fromJS, Map as ImMap} from 'immutable'
import Automerge, {Backend, Frontend} from 'automerge'
import debug from 'debug'
import {LOAD_CHUNK_SIZE} from '../config/constants'
import runAsync from '../utils/runAsync'

const log = debug('infinity:AutomergeConnection')
const logError = log.extend('ERROR*', '::')
const logFlood = log.extend('FLOOD', '::')

/**
 * Returns true if all components of `clock1` are less than or equal to those
 * of `clock2` (both clocks given as Immutable.js Map objects). Returns false
 * if there is at least one component in which `clock1` is greater than
 * `clock2` (that is, either `clock1` is overall greater than `clock2`, or the
 * clocks are incomparable).
 */
export const less = (clock1, clock2) =>
  clock1
    .keySeq()
    .concat(clock2.keySeq())
    .find(actorId => clock1.get(actorId, 0) < clock2.get(actorId, 0))

/**
 * Keeps track of the communication with one particular peer. Allows updates for many documents to
 * be multiplexed over a single connection.
 *
 * To integrate a connection with a particular networking stack, two functions are used:
 * * `sendMsg` (callback passed to the constructor, will be called when local state is updated)
 *   takes a message as argument, and sends it out to the remote peer.
 * * `receiveMsg` (method on the connection object) should be called by the network stack when a
 *   message is received from the remote peer.
 *
 *  The documents to be synced are managed by a `DocSet`. Whenever a document is changed locally,
 * call `setDoc()` on the docSet. The connection registers a callback on the docSet, and it figures
 * out whenever there are changes that need to be sent to the remote peer.
 *
 * theirClock is the most recent VClock that we got from peer
 *
 * ourClock is the most recent VClock that we've advertised to the peer (i.e. where we've
 * told the peer that we have it).
 */
class AutomergeConnection {
  constructor(docSet, sendMsg) {
    this._docSet = docSet
    this._sendMsg = sendMsg
    this._receivedClock = new Map()
    this._sendClock = new Map()
    this.opened = false
  }

  open() {
    ;[...this._docSet.docIds].forEach(this.docChanged)
    this._docSet.registerHandler(this.docChanged)
    this.opened = true
  }

  close() {
    this._docSet.unregisterHandler(this.docChanged)
    this._receivedClock = new Map()
    this._sendClock = new Map()
    this.opened = false
  }

  sendMsg(docId, clock, changes) {
    const msg = {docId, clock: clock.toJS()}
    this._sendClock.set(docId, clock)
    if (!this._receivedClock.get(docId)) msg.resync = true
    if (changes) msg.changes = changes
    this._sendMsg(msg)
  }

  docChanged = docId => this.maybeSendChanges(docId)

  maybeSendChanges(docId, forceClockSync = false) {
    const doc = this._docSet.getDoc(docId)
    const state = Frontend.getBackendState(doc)
    const clock = state.getIn(['opSet', 'clock'])

    log(
      'maybe send',
      forceClockSync,
      this._receivedClock.has(docId),
      less(this._receivedClock.get(docId) || ImMap(), clock),
    )

    // when we dont know their state, ask for it
    if (this._receivedClock.has(docId) && less(this._receivedClock.get(docId), clock)) {
      const changes = Backend.getMissingChanges(state, this._receivedClock.get(docId))
      if (changes.length > 0) {
        log('sending changes', changes.length)
        this.sendMsg(docId, clock, changes)
        return
      }
      log('no new changes found', changes.length)
    }

    if (!clock.equals(this._sendClock.get(docId, ImMap())) || forceClockSync) this.sendMsg(docId, clock)
  }

  async receiveMsg(msg, isUpdatingDocSet = true) {
    const theirClock = fromJS(msg.clock)

    if (msg.clock) {
      this._receivedClock.set(msg.docId, theirClock)
    }

    if (msg.changes) {
      // create a new doc object from changes in chunks
      let doc = this._docSet.getDoc(msg.docId) || Automerge.init()
      for (let i = 0; i < msg.changes.length; i += LOAD_CHUNK_SIZE) {
        const chunk = msg.changes.slice(i, i + LOAD_CHUNK_SIZE)
        logFlood('loading chunk', chunk.length, i, LOAD_CHUNK_SIZE)
        // eslint-disable-next-line no-await-in-loop,no-loop-func
        doc = await runAsync(() => Automerge.applyChanges(doc, fromJS(chunk)))
      }
      if (isUpdatingDocSet) this._docSet.setDoc(msg.docId, doc)

      const state = Frontend.getBackendState(doc)
      const currentClock = state.getIn(['opSet', 'clock'])

      log('received changes', msg, currentClock.toJS())

      if (less(currentClock, theirClock)) {
        logError(
          'local clock is still behind after update: theirClock, currentClock',
          theirClock.toJS(),
          currentClock.toJS(),
        )
        throw new Error('Failed to merge all incoming changes.')
      }

      return doc
    }

    if (this._docSet.getDoc(msg.docId)) {
      // we may have initialised the same document locally, check wether we need to send or request any changes
      this.maybeSendChanges(msg.docId, msg.resync)
    } else if (!this._sendClock.has(msg.docId) || msg.resync) {
      // If the remote node has data that we don't or wants an resync, immediately ask for it.
      this.sendMsg(msg.docId, ImMap())
    }

    return this._docSet.getDoc(msg.docId)
  }
}

export default AutomergeConnection
