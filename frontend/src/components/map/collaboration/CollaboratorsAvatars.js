import React, {useEffect, useState} from 'react'
import Avatar from '@material-ui/core/Avatar'
import AvatarGroup from '@material-ui/lab/AvatarGroup'
import Tooltip from '@material-ui/core/Tooltip'
import useCollaborationStore from './useCollaborationStore'
import getCollaboratorColor from '../../../engine/collaboration/getCollaboratorColor'

const getInitials = (name: string) => {
  const splits = name.split(' ').filter(s => s)

  if (splits.length === 1) {
    return name.charAt(0).toUpperCase()
  }

  return `${splits[0].charAt(0).toUpperCase()}${splits[splits.length - 1].charAt(0).toUpperCase()}`
}

const CollaboratorAvatar = ({collaborator}) => (
  <Tooltip title={collaborator?.displayName} key={collaborator?.id}>
    <Avatar style={{backgroundColor: getCollaboratorColor(collaborator.colorIndex)}} alt={collaborator?.displayName}>
      {getInitials(collaborator?.displayName)}
    </Avatar>
  </Tooltip>
)

const CollaboratorsAvatars = () => {
  const collaborationStore = useCollaborationStore()
  const [pointers, setPointers] = useState(collaborationStore?.collaboratorPointers)

  useEffect(() => {
    if (collaborationStore) {
      const subscribe = () => {
        setPointers(collaborationStore.collaboratorPointers)
      }
      collaborationStore.on('collaborators-change', subscribe)
      return () => collaborationStore.off('collaborators-change', subscribe)
    }

    return () => undefined
  })

  if (!pointers) return null

  return (
    <AvatarGroup max={7} style={{marginLeft: 10}}>
      {pointers.map(({collaborator}) => (
        <CollaboratorAvatar key={collaborator.id} collaborator={collaborator} />
      ))}
    </AvatarGroup>
  )
}
export default CollaboratorsAvatars
