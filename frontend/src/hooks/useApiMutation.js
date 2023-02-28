import React, {useContext, useMemo} from 'react'
import {useMutation} from 'react-query'
import {FormattedMessage} from 'react-intl'
import useSnackbar from './useSnackbar'
import {ApiContext} from '../contexts/api'

const useApiMutation = ({url, method = 'post', fn, successMessage, errorMessage, ...options}) => {
  const api = useContext(ApiContext)
  const load = useMemo(() => fn || (p => api[method](url, p)), [fn, api, method, url])
  const {error, success} = useSnackbar()

  return useMutation(load, {
    onError: err =>
      error(
        errorMessage || (
          <>
            <FormattedMessage id="errorRequestHandling" />: {err.message || err.toString()}
          </>
        ),
      ),
    onSuccess: () => (successMessage ? success(successMessage) : true),
    ...options,
  })
}

export default useApiMutation
