import * as Y from 'yjs'
import EventEmitter from 'events'
import {Awareness} from 'y-protocols/awareness.js'
import {WebsocketProvider} from 'y-websocket'

import {MapId} from '../types'
import generateId from '../../shared/utils/generateId'
import {CollaboratorPointer} from './CollaboratoinPointer'
import CollaboratorPointerPosition from './CollaboratorPointerPosition'
import Collaborator from './Collaborator'

const MAX_WAIT_FOR_INIT_MS = 1000

const getWebsocketUrl = (mapId: string) => {
  const secureConnection = window.location.protocol.includes('s')
  const protocol = secureConnection ? 'wss' : 'ws'

  // Workaround for broken setupProxy
  const {host} = window.location
  return `${protocol}://${host}/websocket/map-yjs-${mapId}/yjs`
}

class CollaborationStore extends EventEmitter {
  readonly enabled = true

  private isInitialised = false

  private _collaboratorPointers = new Map<string, CollaboratorPointer>()

  private readonly ydoc = new Y.Doc()

  private readonly provider: WebsocketProvider

  private readonly awareness: Awareness

  private readonly userId: string

  private mapId: MapId

  private color = -1

  private readonly collisionId: number

  // 0 if there is no collision
  private collisionWith = 0

  private _ownPointerPosition = new CollaboratorPointerPosition(0, 0)

  private myLoginName: string

  private nameExtension = 1

  private myDisplayName: string

  constructor(mapId: MapId, myLoginName: string) {
    super()
    const {ydoc, init} = this

    this.collisionId = generateId()
    this.userId = `${myLoginName}${this.collisionId}`
    this.mapId = mapId
    this.myLoginName = myLoginName
    this.myDisplayName = myLoginName

    const provider = new WebsocketProvider(getWebsocketUrl(mapId), `map-yjs-${mapId}`, ydoc, {params: {mapId}})

    const {awareness} = provider

    awareness.once('change', init)
    // Init if this instance is the only one
    setTimeout(init, MAX_WAIT_FOR_INIT_MS)

    this.provider = provider
    this.awareness = awareness
  }

  private init = (): void => {
    const {isInitialised, findColor, awareness, refreshCollaborators, updateOthers} = this
    if (isInitialised) return

    this.color = findColor()
    updateOthers()
    awareness.on('change', refreshCollaborators)
    this.isInitialised = false
  }

  private refreshCollaborators = (): void => {
    const {_collaboratorPointers: collaboratorPointers, awareness, color: myColor} = this
    const refreshed = new Set<string>()

    let collaboratorsChanged = false
    this.collisionWith = 0

    const awarenessValues = Array.from(awareness.getStates().values())
    awarenessValues.forEach(element => {
      const {user} = element
      if (!user || user.id === this.userId) return
      const {colorIndex} = user
      if (myColor === colorIndex) {
        const {collisionId} = user
        if (collisionId) this.collisionWith = collisionId
      }

      const collaborator = new Collaborator(user.id, colorIndex, user.name)
      const position = user.cursor
      if (position) {
        refreshed.add(collaborator.id)

        const collaboratorPointer = new CollaboratorPointer(collaborator, position)

        if (!collaboratorPointers.has(collaborator.id)) {
          collaboratorPointers.set(collaborator.id, collaboratorPointer)
          collaboratorsChanged = true
        } else {
          const existingPointer = collaboratorPointers.get(collaborator.id)
          if (!existingPointer) throw new Error(`Collaborator ${collaborator.id} not found.`)

          existingPointer.collaborator.colorIndex = colorIndex
          existingPointer.position = position
          existingPointer.collaborator.userName = user.name
          existingPointer.collaborator.nameExtension = user.nameExtension
        }
      }
    })

    collaboratorPointers.forEach((value, key) => {
      if (!refreshed.has(key)) {
        collaboratorPointers.delete(key)
        collaboratorsChanged = true
      }
    })

    const {collisionWith, resolveCollision, updateOthers} = this
    if (collisionWith) {
      resolveCollision()
      updateOthers()
    }

    if (collaboratorsChanged) {
      this.emit('collaborators-change')
    }
  }

  private updateOthers = (): void => {
    const {_ownPointerPosition} = this
    this.ownPointerPosition = _ownPointerPosition
  }

  private resolveCollision = () => {
    const {collisionWith, collisionId, findColor, updateOthers} = this
    if (collisionId < collisionWith) return
    this.color = findColor()
    updateOthers()
  }

  private findColor = (): number => {
    const {awareness} = this
    const used = new Set<number>()

    const awarenessValues = Array.from(awareness.getStates().values())
    awarenessValues.forEach(element => {
      const {user} = element
      if (!user || typeof user.colorIndex !== 'number') return
      used.add(user.colorIndex)
    })

    const sorted = Array.from(used).sort()
    let result = 0
    for (let i = 0; i < sorted.length; i += 1) {
      if (result < sorted[i]) break
      result = sorted[i] + 1
    }
    return result
  }

  get collaboratorPointers(): Array<CollaboratorPointer> {
    const {_collaboratorPointers} = this
    return [..._collaboratorPointers.values()]
  }

  set ownPointerPosition(pointerPosition: CollaboratorPointerPosition) {
    const {awareness, color, userId, collisionId, myDisplayName, nameExtension} = this
    this._ownPointerPosition = pointerPosition

    // quit if color isn't set
    if (color === -1) return

    awareness.setLocalStateField('user', {
      id: userId,
      name: myDisplayName,
      nameExtension,
      colorIndex: color,
      cursor: pointerPosition,
      collisionId,
    })
  }

  close = (): void => {
    const {provider, awareness, refreshCollaborators} = this
    awareness.off('change', refreshCollaborators)
    provider.disconnect()
  }
}

export default CollaborationStore
