import React, {useEffect, useState} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import {useQueryCache} from 'react-query'

import useSnackbar from '../../hooks/useSnackbar'
import useApiMutation from '../../hooks/useApiMutation'
import ProgressModal from '../ProgressModal'
import sleep from '../../utils/sleep'

/**
 * This page is only needed to unload the RenderEngine and the store, to allow a deletion of the map.
 * The problem with this method is: someone could send an url to delete a map to a user. So when navigating to
 * this page, you need to add a state with the mapId to the location: `push('/path/to/here', {mapId})`
 * @todo remove this with a propper solution
 * @returns {JSX.Element|null}
 * @constructor
 */
const DeleteMapPage = () => {
  const {mapId} = useParams()
  const [deleted, setDeleted] = useState(false)
  const {location} = useHistory()
  const {success, error} = useSnackbar()
  const queryCache = useQueryCache()

  // TODO: this has to move into the mapstore, as we need to inform other connected users
  const [deleteMap] = useApiMutation({
    url: `/maps/${mapId}`,
    method: 'delete',
    onSuccess: () => {
      success(<FormattedMessage id="mapDeleteSuccessful" />)
    },
    onError: err => {
      error(
        <>
          <FormattedMessage id="mapDeleteFailed" />
          {': '}
          {err.message}
        </>,
      )
    },
  })

  useEffect(() => {
    let mounted = true
    const run = async () => {
      // give the backend some time to clean up
      await sleep(11000)
      await deleteMap()
      await queryCache.invalidateQueries(['maps'])
      if (mounted) setDeleted(true)
    }
    run()
    return () => (mounted = false)
  }, [queryCache, setDeleted, deleteMap])

  if (!mapId || deleted || location.state?.mapId !== mapId) return <Redirect to="/maps" />

  return (
    <ProgressModal open>
      <FormattedMessage id="homeDeleteMapMessage" />
    </ProgressModal>
  )
}

export default DeleteMapPage
