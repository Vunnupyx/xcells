import React, {createContext, useCallback, useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import debug from 'debug'
import md5 from 'md5'

import Link from '@material-ui/core/Link'

import MapStore from '../store/MapStoreWrite'
import useAuth from '../hooks/useAuth'
import useSnackbar from '../hooks/useSnackbar'
import useApiQuery from '../hooks/useApiQuery'
import MapStoreNone from '../store/MapStoreNone'
import MapStoreReadOnly from '../store/MapStoreReadOnly'
import CONFIG from '../engine/CONFIG'
import checkInIframe from '../utils/checkInIframe'
import {useTracking} from '../hooks/useTracking'
import useApiQueryStatic from '../hooks/useApiQueryStatic'

const log = debug('app:MapStoreProvider')
const logError = log.extend('ERROR*', '::')

export const MapStoreContext = createContext()

const linkToShop = content => <Link href="https://infinitymaps.io/shop/">{content}</Link>

export const MapStoreProvider = ({children}) => {
  const {auth, userId, isLoggedIn, isRefreshed, LoginLink, SignupLink} = useAuth()
  const myUsername = auth.wp_user?.data?.user_login || auth.name || 'anonym'
  const snackbar = useSnackbar()
  const {mapId} = useParams()
  const {setTrackingParameter, track} = useTracking()
  const [, forceRender] = useState()
  const {
    nodes: {limitWarningPercent},
  } = CONFIG
  const [showedWarning, setShowedWarning] = useState(-1)

  const {tokenHash, roles} = auth
  const {data: limitNodesData} = useApiQueryStatic({
    url: `/maps/${mapId}/nodeLimit`,
  })
  const limitNodes = limitNodesData ? limitNodesData.nodeLimit : undefined

  const {data: publicPropertiesData} = useApiQueryStatic({
    url: `/maps/${mapId}/share/public`,
  })
  const shareEnabled = publicPropertiesData?.enabled ? publicPropertiesData.enabled : false
  const shareHidden = publicPropertiesData?.hidden ? publicPropertiesData.enabled : false

  const {data: settings} = useApiQueryStatic({
    url: '/integration/openai',
  })

  const [store, setStore] = useState(() => new MapStoreNone())

  const {reconnect, close, subscribe, unsubscribe, setAuth = () => null, error: storeError} = store
  const {error: errorSnackbar} = snackbar

  const {data: {writeable} = {}} = useApiQuery({
    refetchOnWindowFocus: false,
    url: `/maps/${mapId}/writeable`,
    onSettled: (data, error) => {
      if (error) {
        const {status, message} = error
        if (status === 401) {
          if (userId) {
            // means we were authenticated and need to relogin, use will be informed from auth provider
          } else if (!isLoggedIn) {
            errorSnackbar(
              <FormattedMessage
                id="mapLoginNeeded"
                values={{
                  login: LoginLink,
                  register: SignupLink,
                }}
              />,
            )
          }
        } else if (status === 403) {
          errorSnackbar(<FormattedMessage id="mapAccessDenied" values={{login: LoginLink}} />)
        } else {
          logError('unknown error when checking if map is writeable', message, status)
          errorSnackbar(<FormattedMessage id="mapLoadingError" values={{message}} />)
        }
      }
    },
  })

  useEffect(() => {
    if (storeError) errorSnackbar(storeError)
  }, [errorSnackbar, storeError])

  useEffect(() => {
    if (mapId && writeable !== undefined) {
      let newStore
      if (writeable && !checkInIframe()) {
        newStore = new MapStore(mapId, settings, limitNodes, myUsername, {})
        newStore.setTrackingFunction(track)
      } else {
        newStore = new MapStoreReadOnly(mapId)
      }

      setStore(newStore)
    } else {
      setStore(s => (s instanceof MapStoreNone ? s : new MapStoreNone()))
    }
  }, [mapId, writeable, setStore, myUsername, limitNodes, track, settings])

  useEffect(() => {
    if (isRefreshed) {
      reconnect()
    }
  }, [isRefreshed, tokenHash, reconnect])

  useEffect(() => close, [close])

  const subscription = useCallback(() => {
    forceRender({})
  }, [forceRender])

  const trackingSubscription = useCallback(
    mapStore => {
      if (mapStore && shareEnabled && !shareHidden) {
        const {title} = mapStore
        setTrackingParameter({
          mapId: md5(mapId),
          title,
          settings: 'holooo',
        })
      }
    },
    [shareEnabled, shareHidden, setTrackingParameter, mapId],
  )

  useEffect(() => {
    setAuth(auth)
  }, [auth, setAuth])

  useEffect(() => {
    subscribe(subscription)
    subscribe(trackingSubscription)
    return () => {
      unsubscribe(subscription)
      unsubscribe(trackingSubscription)
    }
  }, [subscription, trackingSubscription, subscribe, unsubscribe])

  // show warnings for users that are subscribers
  useEffect(() => {
    if (limitNodes && showedWarning !== limitWarningPercent.length - 1) {
      log('Activating check for node limit warnings', {
        subscribe,
        unsubscribe,
        limitNodes,
        limitWarningPercent,
        roles,
        showedWarning,
        setShowedWarning,
        snackbar,
      })
      const sub = ({nodes}) => {
        for (let index = limitWarningPercent.length - 1; index >= 0; index -= 1) {
          if (index > showedWarning && nodes && Object.keys(nodes).length >= limitWarningPercent[index] * limitNodes) {
            log('too less nodes remaining', {
              nodes,
              percent: limitWarningPercent[index],
            })
            snackbar.warning(
              <span>
                <FormattedMessage
                  id="mapStoreLimitWarning"
                  values={{
                    limitNodes,
                    nodeCount: Object.keys(nodes).length,
                    a: linkToShop,
                  }}
                />
              </span>,
            )
            setShowedWarning(index)
            break
          }
        }
      }
      subscribe(sub)
      return () => unsubscribe(sub)
    }
    return () => {}
  }, [subscribe, unsubscribe, limitNodes, limitWarningPercent, roles, showedWarning, setShowedWarning, snackbar])

  return <MapStoreContext.Provider value={store}>{children}</MapStoreContext.Provider>
}
