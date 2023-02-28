import React, {createContext, useEffect, useMemo, useRef, useState} from 'react'
import debug from 'debug'
import {ROLES} from '../shared/config/constants'

import trackingcode, {logOut} from '../utils/tracking/trackingcode'
import {MOUSEMOVEINTERVALLTOTRACK} from '../utils/tracking/mixpanel'
import useAuth from '../hooks/useAuth'

const log = debug('app:tracking')

export const TrackingContext = createContext()

const trackingParameterRef = {current: null}
const userIdRef = {current: null}
const userRole = {current: null}

export const track = ({action, details}) => {
  if (!userRole.current?.includes(ROLES.administrator)) {
    trackingcode(action, {...details, ...trackingParameterRef.current}, userIdRef.current)
  }
}

export const trackAction = (action, details) => track({action, details})

export const TrackingContextProvider = ({children}) => {
  const [trackingParameter, setTrackingParameter] = useState({})
  const auth = useAuth()
  const oldUserId = useRef()

  useEffect(() => {
    let lastTrackedActiveTime = new Date(0)

    const logActive = () => {
      const currentTime = new Date()
      if (currentTime.getTime() > lastTrackedActiveTime.getTime() + MOUSEMOVEINTERVALLTOTRACK) {
        if (!userRole.current?.includes(ROLES.administrator))
          trackingcode('active', trackingParameter, userIdRef.current)
        lastTrackedActiveTime = currentTime
      }
    }

    window.addEventListener('mousemove', logActive)
    log('Add window listener')

    return () => {
      window.removeEventListener('mousemove', logActive)
      log('Remove window listener')
    }
  }, [trackingParameter])

  const userId = auth.isLoggedIn ? auth.auth.userId : undefined
  const role = auth.isLoggedIn ? auth.auth.roles : undefined

  useEffect(() => {
    trackingParameterRef.current = trackingParameter
  }, [trackingParameter])

  useEffect(() => {
    userIdRef.current = userId
    userRole.current = role
  }, [userId, role])

  useEffect(() => {
    // Reset mixpanel after log out
    if (oldUserId.current && !userId) logOut()
    oldUserId.current = userId
  }, [userId])

  const value = useMemo(() => ({setTrackingParameter, track}), [setTrackingParameter])

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}
