import React, {useCallback} from 'react'
import {useHistory} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'

import Button from '@material-ui/core/Button'

import useSnackbar from '../hooks/useSnackbar'
import useApiMutation from '../hooks/useApiMutation'

// @refresh reset
class ErrorCatcher extends React.Component {
  state: {error: Error, errorInfo: Object} = {error: null, errorInfo: null}

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const {callback} = this.props

    this.setState({error, errorInfo}, () => callback({error: error.toString(), backtrace: error.stack, errorInfo}))
  }

  render() {
    const {children} = this.props
    const {error, errorInfo} = this.state

    if (error) {
      return (
        <>
          <h3>Error: {error.message}</h3>
          <pre>{error.stack}</pre>
          <br />
          <pre>{errorInfo.componentStack}</pre>
          <a href="/maps">
            <Button variant="contained">
              <FormattedMessage id="buttonHome" />
            </Button>
          </a>{' '}
          <Button variant="contained" onClick={() => window.location.reload(false)}>
            <FormattedMessage id="buttonReload" />
          </Button>
        </>
      )
    }

    return children || null
  }
}

const ErrorBound = ({children}) => {
  const {
    location: {pathname},
  } = useHistory()
  const {success} = useSnackbar()
  const [sendErrors] = useApiMutation({url: '/errors', method: 'post'})

  const callback = useCallback(
    async description => {
      await sendErrors({
        body: {
          path: pathname,
          ...description,
        },
      })

      success(<FormattedMessage id="errorErrorToBackendSuccess" />)
    },
    [success, sendErrors, pathname],
  )

  return <ErrorCatcher callback={callback}>{children}</ErrorCatcher>
}

export default ErrorBound
