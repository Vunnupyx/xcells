import {useContext} from 'react'
import CollaborationContext from './CollaborationContext'

const useCollaborationStore = () => useContext(CollaborationContext)

export default useCollaborationStore
