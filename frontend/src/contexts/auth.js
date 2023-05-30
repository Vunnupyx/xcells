import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {FormattedMessage} from 'react-intl'
import {useQueryCache} from 'react-query'
import {useCookie, useLocalStorage} from 'react-use'
import debug from 'debug'

import Button from '@material-ui/core/Button'

import {useHistory} from 'react-router-dom'
import Link from '@material-ui/core/Link'
import LoginDialog from '../components/dialogs/LoginDialog'
import useSnackbar from '../hooks/useSnackbar'
import useApiMutation from '../hooks/useApiMutation'
import useApiQueryStatic from '../hooks/useApiQueryStatic'
import {identify, setMixpanelUserProfile} from '../utils/tracking/trackingcode'
import SignupDialog from '../components/dialogs/SignupDialog'

const log = debug('app:auth')
const logError = log.extend('ERROR', '::')

const THIRTY_SECONDS_MS = 30 * 1000
const ONE_DAY_MS = 24 * 3600 * 1000

const LOCALSTORAGE_NAMES = {
  payload: 'auth:payload',
  isLoggedIn: 'auth:isLoggedIn',
}

// delete obsolete auth storage
localStorage.removeItem('auth')

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
  const [auth, setAuth] = useLocalStorage(LOCALSTORAGE_NAMES.payload, {})
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage(LOCALSTORAGE_NAMES.isLoggedIn, false)
  const {error, warning} = useSnackbar()
  const queryCache = useQueryCache()
  const [showLogginDialog, setShowLoginDialog] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const {push} = useHistory()
  const {data: loginData} = useApiQueryStatic({url: '/auth/login'})
  const [isRefreshed, setIsRefreshed] = useState(false)

  // if an old authentication token is still in the browser, it could expire and wouldn't be deleted
  // TODO: this can be removed after 30 days after the SSO release
  const [, , deleteOldAuthCookie] = useCookie('auth')
  useEffect(() => {
    deleteOldAuthCookie()
  }, [deleteOldAuthCookie])

  const {expiresAt} = auth
  const userId = auth?.wp_user?.ID
  const userEmail = auth?.wp_user?.data?.user_email

  useApiQueryStatic({
    url: '/current-user-statistics',
    refetchInterval: 60 * 6000,
    onSuccess: userData => {
      setMixpanelUserProfile(userData)
    },
    enabled: isLoggedIn,
  })

  // TODO: store these in an cookie too, so we have a fallback when localStorage is disabled, e.g. corporate networks
  const [refresh] = useApiMutation({
    url: '/auth/refresh',
    onSuccess: async data => {
      setAuth(data)
      setIsLoggedIn(true)
      identify(userId)
    },
    onError: err => {
      if ([401, 403].includes(err.status)) {
        setIsLoggedIn(false)
      } else {
        logError(err.message || `Unknown error while trying to refresh login: ${err.status}`)
      }
    },
  })

  // reload on every page load
  useEffect(() => {
    refresh()
      .then(() => setIsRefreshed(true))
      .catch(() => setIsRefreshed(true))
  }, [refresh, setIsRefreshed])

  // track login
  const loginRef = useRef(null)
  useEffect(() => {
    if (isLoggedIn && userId && loginRef.current !== null && loginRef.current !== isLoggedIn) {
      const event = new CustomEvent('infinity:login', {detail: userId})
      document.dispatchEvent(event)
    }
    return () => (loginRef.current = isLoggedIn)
  }, [isLoggedIn, userId])

  const [logout] = useApiMutation({
    url: '/auth/logout',
    onSuccess: data => {
      setIsLoggedIn(false)

      if (data.url) {
        fetch(data.url, {method: 'post', credentials: 'include'})
          .then(async response => {
            if (response.status !== 200) {
              logError(`Error while logging out if wordpress: ${await response.text()}`)
            }
          })
          .catch(err => logError(`Error while logging out if wordpress: ${err.message}`))
      }

      queryCache.clear()
      identify(undefined)
      Object.values(LOCALSTORAGE_NAMES).forEach(n => localStorage.removeItem(n))
      push('/maps')
    },
  })

  const login = useCallback(() => {
    if (!loginData) {
      warning(<FormattedMessage id="login.noLoginData" />)
    } else if (loginData.redirect) {
      window.location.assign(loginData.url)
    } else {
      setShowLoginDialog(true)
    }
  }, [loginData, setShowLoginDialog, warning])

  const signup = useCallback(() => {
    setShowSignupDialog(true)
    setShowLoginDialog(true)
  }, [setShowSignupDialog, setShowLoginDialog])

  // refresh regularly and logout if the session is expired
  useEffect(() => {
    if (isRefreshed && expiresAt) {
      const now = Date.now()
      if (expiresAt < now) {
        log('session expired', expiresAt, now)
        error(<FormattedMessage id="authSessionExpired" />, {
          action: (
            <Button onClick={login}>
              <FormattedMessage id="button.login" />
            </Button>
          ),
        })
        setIsLoggedIn(false)
      } else {
        const waitMilliseconds = Math.min(expiresAt - now - THIRTY_SECONDS_MS, ONE_DAY_MS)
        log('set expire timeout', waitMilliseconds)
        const ref = setTimeout(() => {
          log('token about to expire, refreshing', expiresAt, now, waitMilliseconds)
          refresh()
        }, waitMilliseconds)
        return () => clearTimeout(ref)
      }
    }
    return () => undefined
  }, [isRefreshed, refresh, login, expiresAt, error, setIsLoggedIn])

  const LoginLink = useCallback(
    linkName => (
      <Link onClick={login} href="#">
        {linkName}
      </Link>
    ),
    [login],
  )

  const SignupLink = useCallback(
    linkName => (
      <Link onClick={signup} href="#">
        {linkName}
      </Link>
    ),
    [signup],
  )

  const value = useMemo(
    () => ({auth, userId, userEmail, logout, login, signup, LoginLink, SignupLink, refresh, isLoggedIn, isRefreshed}),
    [auth, userId, userEmail, logout, login, signup, LoginLink, SignupLink, refresh, isLoggedIn, isRefreshed],
  )

  if (!isRefreshed) return null

  const onClose = () => {
    setShowLoginDialog(false)
    setShowSignupDialog(false)
  }

  const dialog = showSignupDialog ? (
    <SignupDialog
      open
      onClose={onClose}
      setAuth={setAuth}
      refresh={refresh}
      onLogin={() => setShowSignupDialog(false)}
    />
  ) : showLogginDialog ? (
    <LoginDialog
      open
      onClose={() => setShowLoginDialog(false)}
      setAuth={setAuth}
      refresh={refresh}
      onSignup={() => setShowSignupDialog(true)}
    />
  ) : null

  return (
    <AuthContext.Provider value={value}>
      {dialog}
      {children}
    </AuthContext.Provider>
  )
}
