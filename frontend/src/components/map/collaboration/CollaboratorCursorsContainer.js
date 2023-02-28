import React from 'react'
import CollaboratorsCursor from './CollaboratorsCursor'
import useCollaborationStore from './useCollaborationStore'

const CollaboratorCursorsContainer = () => {
  const collaborationStore = useCollaborationStore()

  const pointers = collaborationStore?.collaboratorPointers || []

  return pointers.map(pointer => <CollaboratorsCursor key={pointer.collaborator.id} collaborationCursor={pointer} />)
}

export default CollaboratorCursorsContainer
