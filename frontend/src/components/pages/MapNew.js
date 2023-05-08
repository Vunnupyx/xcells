import React, {useEffect, useState} from 'react'
import {Redirect, useParams} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import Link from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import {useQueryCache} from 'react-query'
import ProgressModal from '../ProgressModal'
import useApiMutation from '../../hooks/useApiMutation'
import {ROLES} from '../../shared/config/constants'
import {subscribe} from '../../intl/links'
import SubscribeDialog from '../dialogs/SubscribeDialog'
import HistoryBackButton from '../wrapped/HistoryBackButton'
import useAuth from '../../hooks/useAuth'
import useMapList from '../../hooks/useMapList'

const MapNew = () => {
  const {mapId: fromMapId, templateId: fromTemplateId} = useParams()
  const queryCache = useQueryCache()

  let url = '/maps'
  if (fromMapId) {
    url = `/maps/${fromMapId}/copy`
  } else if (fromTemplateId) {
    url = `/maps/from/template/${fromTemplateId}`
  }

  const [createMap, {data: createData, isSuccess, isLoading}] = useApiMutation({url})
  const {auth, isLoggedIn, signup, SignupLink} = useAuth()
  const [isCreated, setIsCreated] = useState(false)
  const {data: maps = [], isFetching} = useMapList(false)

  const {mapId} = createData || {}
  const {limitMaps} = auth

  const isReady = Boolean(!isFetching && maps)
  const ownedMaps = maps.filter(map => map.userId === auth.userId).length

  // workaround org_subscriber have unlimited maps TODO: change limit for this role on wordpress
  const reachedMapLimit = Boolean(
    isReady && limitMaps && ownedMaps >= limitMaps && !auth.roles.includes(ROLES.org_subscriber),
  )

  useEffect(() => {
    if (isLoggedIn && isReady && !reachedMapLimit && !isCreated) {
      const doit = async () => {
        await createMap()
        await queryCache.invalidateQueries(['maps'])
      }
      doit()
      setIsCreated(true)
    }
  }, [queryCache, isLoggedIn, isReady, reachedMapLimit, isCreated, setIsCreated, createMap])

  if (!isLoggedIn) {
    return (
      <SubscribeDialog
        open
        onClose={() => null}
        buttons={
          <>
            <HistoryBackButton />
            <Button component={Link} onClick={signup}>
              <FormattedMessage id="buttonRegister" />
            </Button>
          </>
        }
      >
        <FormattedMessage
          id="mapCreateNeedsSubscription"
          values={{
            register: SignupLink,
            subscribe,
          }}
        />
      </SubscribeDialog>
    )
  }

  if (reachedMapLimit) {
    return (
      <SubscribeDialog open onClose={() => {}}>
        <FormattedMessage id="mapCreateReachedMapLimit" values={{limitMaps}} />
      </SubscribeDialog>
    )
  }

  if (isLoading || !isSuccess || isFetching) {
    return (
      <ProgressModal open>
        <FormattedMessage id="mapCreating" /> ...
      </ProgressModal>
    )
  }

  return mapId && isSuccess ? <Redirect to={`/maps/${mapId}`} /> : null
}

export default MapNew
