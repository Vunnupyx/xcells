import React, {useCallback, useEffect} from 'react'
import {useLocalStorage} from 'react-use'
import {FormattedMessage} from 'react-intl'

import Button from '@material-ui/core/Button'

import useSnackbar from '../hooks/useSnackbar'

const COOKIE_NOTE_KEY = 'CookieNote'

const CookieNotification = () => {
  const [hasSeen, setSeenCookieNote] = useLocalStorage(COOKIE_NOTE_KEY)
  const {enqueueSnackbar, closeSnackbar} = useSnackbar()

  const onOk = useCallback(() => {
    setSeenCookieNote('seen', {expires: 10 * 365})
    closeSnackbar(COOKIE_NOTE_KEY)
  }, [setSeenCookieNote, closeSnackbar])

  useEffect(() => {
    if (!hasSeen) {
      const options = {
        persist: true,
        preventDuplicate: true,
        key: COOKIE_NOTE_KEY,
        anchorOrigin: {horizontal: 'center', vertical: 'bottom'},
        action: [
          <Button key="close" onClick={() => closeSnackbar(COOKIE_NOTE_KEY)}>
            <FormattedMessage id="buttonCancel" />
          </Button>,
          <Button key="ok" onClick={onOk} id="cookieAccept" color="primary">
            <FormattedMessage id="buttonOk" />
          </Button>,
        ],
      }
      enqueueSnackbar(<FormattedMessage id="cookieNote" />, options)
    } else {
      onOk()
    }
  }, [hasSeen, setSeenCookieNote, enqueueSnackbar, closeSnackbar, onOk])

  return null
}

export default CookieNotification
