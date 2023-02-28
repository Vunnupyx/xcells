import React, {useCallback, useMemo} from 'react'
import {useSnackbar as useSnackbarOrig} from 'notistack'
import debug from 'debug'
import {FormattedMessage} from 'react-intl'
import {useConfig} from '../styles/config'

const logError = debug('app:Snackbar::ERROR*')

// TODO: translate error messages: allow error objects to have an id, and then return that translation
const extractMessageFromError = error => {
  if (error instanceof Error) {
    if (error.id) {
      return (
        <span>
          <FormattedMessage id={error.id} values={error.values} />
        </span>
      )
    }
    return <span>{error.message || error.toString()}</span>
  }
  return <span>{error || 'Unknown error'}</span>
}

// TODO: add debugging mode
const useSnackbar = () => {
  const snackbar = useSnackbarOrig()
  const {
    snackbar: {errorDuration, successDuration, warningDuration, infoDuration},
  } = useConfig()

  const {enqueueSnackbar} = snackbar

  const createEnqueueSnackbar = useCallback(
    (variant, autoHideDuration) => (text, options) =>
      enqueueSnackbar(extractMessageFromError(text), {
        variant,
        autoHideDuration,
        ...options,
      }),
    [enqueueSnackbar],
  )

  const success = useMemo(
    () => createEnqueueSnackbar('success', successDuration),
    [createEnqueueSnackbar, successDuration],
  )

  const error = useCallback(
    (text, options) => {
      createEnqueueSnackbar('error', errorDuration)(text, options)
      // stack is in an `new Error()` object
      // TODO: remove following line, and send errors to backend
      logError('error bar called', text, (text instanceof Error ? text : new Error()).stack)
    },
    [createEnqueueSnackbar, errorDuration],
  )

  const warning = useMemo(
    () => createEnqueueSnackbar('warning', warningDuration),
    [createEnqueueSnackbar, warningDuration],
  )

  const info = useMemo(() => createEnqueueSnackbar('info', infoDuration), [createEnqueueSnackbar, infoDuration])

  return useMemo(() => ({...snackbar, success, error, warning, info}), [snackbar, success, error, warning, info])
}

export default useSnackbar
