import {Redirect, useHistory, useParams} from 'react-router-dom'
import React, {useEffect, useState} from 'react'
import {FormattedMessage} from 'react-intl'
import useSnackbar from '../../hooks/useSnackbar'
import useApiMutation from '../../hooks/useApiMutation'
import sleep from '../../utils/sleep'
import ProgressModal from '../ProgressModal'

const MapRepairPage = () => {
  const {mapId} = useParams()
  const [done, setDone] = useState(false)
  const {location} = useHistory()
  const {success, error} = useSnackbar()

  // TODO: this has to move into the mapstore, as we need to inform other connected users
  const [compactMap] = useApiMutation({
    url: `/maps/${mapId}/repair`,
    onSuccess: () => {
      success(<FormattedMessage id="mapRepairSuccessful" />)
    },
    onError: err => {
      error(
        <>
          <FormattedMessage id="mapRepairFailed" />
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
      await compactMap()
      if (mounted) setDone(true)
    }
    run()
    return () => (mounted = false)
  }, [setDone, compactMap])

  if (!mapId || done || location.state?.mapId !== mapId) return <Redirect to="/maps" />

  return (
    <ProgressModal>
      <FormattedMessage id="mapRepairInProgressMessage" />
    </ProgressModal>
  )
}

export default MapRepairPage
