import React, {useEffect, useState} from 'react'
import debug from 'debug'
import useMapStore from '../../../hooks/useMapStore'
import CollaborationStore from '../../../engine/collaboration/CollaborationStore'
import useEngine from '../../engine/useEngine'
import useAuth from '../../../hooks/useAuth'
import CollaborationContext from './CollaborationContext'

const log = debug('app:CollaborationStoreProvider')

const CollaborationStoreProvider = ({children}) => {
  const {isWriteable, mapId} = useMapStore()
  const {auth} = useAuth()
  const username = auth.wp_user?.data?.user_login || auth.name || 'anonym'
  const {app, viewport} = useEngine(false)
  const [collaborationStore, setCollaborationStore] = useState()

  useEffect(() => {
    if (isWriteable) {
      log('create a new collaboration store')
      setCollaborationStore(new CollaborationStore(mapId, username))
    } else {
      setCollaborationStore(false)
    }
  }, [isWriteable, setCollaborationStore, mapId, username])

  useEffect(() => {
    return () => {
      if (collaborationStore) {
        collaborationStore.close()
      }
    }
  }, [collaborationStore])

  useEffect(() => {
    if (collaborationStore?.enabled && app && app.renderer && viewport) {
      const eventHandler = event => {
        collaborationStore.ownPointerPosition = viewport.toLocal(event.data.global)
      }

      const {interaction} = app.renderer.plugins
      interaction.on('pointermove', eventHandler)
      interaction.on('pointerdown', eventHandler)
      return () => {
        interaction.off('pointermove', eventHandler)
        interaction.off('pointerdown', eventHandler)
      }
    }
    return () => {}
  }, [app, viewport, collaborationStore])

  return <CollaborationContext.Provider value={collaborationStore}>{children}</CollaborationContext.Provider>
}

export default CollaborationStoreProvider
