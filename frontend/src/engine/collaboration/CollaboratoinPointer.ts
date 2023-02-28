import EventEmitter from 'events'
import Collaborator from './Collaborator'
import CollaboratorPointerPosition from './CollaboratorPointerPosition'

export declare interface CollaboratorPointer {
  on(event: 'position-change', listener: (name: string) => void): this
  off(event: 'position-change', listener: (name: string) => void): this
}

export class CollaboratorPointer extends EventEmitter {
  private _collaborator: Collaborator

  private _position: CollaboratorPointerPosition

  constructor(collaborator: Collaborator, position: CollaboratorPointerPosition) {
    super()
    this._collaborator = collaborator
    this._position = position || new CollaboratorPointerPosition()
  }

  get collaborator(): Collaborator {
    const {_collaborator} = this
    return _collaborator
  }

  set position(position: CollaboratorPointerPosition) {
    this._position = position
    this.emit('position-change')
  }

  get position(): CollaboratorPointerPosition {
    const {_position} = this
    return _position
  }
}
