import React, {useEffect} from 'react'
import {FormattedMessage} from 'react-intl'
import useSnackbar from '../hooks/useSnackbar'

/** Snackbar notifications from outside React hooks */
const AppNotifications = () => {
  const {warning} = useSnackbar()

  useEffect(() => {
    const listener = e => {
      if (e.detail && e.detail.translationId) {
        warning(<FormattedMessage id={e.detail.translationId} />)
      }
    }

    window.addEventListener('app-warning', listener)
    return () => window.removeEventListener('app-warning', listener)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

/** Show warning from outside React context (e.g. from Paste event) */
export const externalWarning = (translationId, target) => {
  const customEvent = new CustomEvent('app-warning', {bubbles: true, detail: {translationId}})
  if (target === undefined || target === null) {
    target = document.getElementById('root')
  }
  if (target == null) {
    throw new Error('No target (and no root element as fallback) for externalWarning')
  }
  target.dispatchEvent(customEvent)
}

export default AppNotifications
