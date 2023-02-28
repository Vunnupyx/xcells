import {useContext, useMemo} from 'react'
import {useQuery} from 'react-query'
import debug from 'debug'

import {ApiContext} from '../contexts/api'

const logError = debug('app:useApiQuery::ERROR*')

const useApiQuery = ({name: givenName, url: givenUrl, fn, query, ...options}) => {
  const api = useContext(ApiContext)
  const url = `${givenUrl}${query ? '?' : ''}${new URLSearchParams(query)}`
  const load = useMemo(() => fn || (p => api.get(url, p)), [fn, api, url])
  let queryKey
  if (givenName) {
    queryKey = [givenName]
  } else if (givenUrl) {
    queryKey = givenUrl.split('/').filter(n => n)
  } else {
    queryKey = [fn.toString()]
  }

  if (query) {
    queryKey.push(query)
  }

  return useQuery(queryKey, load, {
    retry: (count, error) => error.status >= 500 && count < 3,
    onError: error => {
      logError(`Error in calling ${url}: ${error}`)
    },
    cacheTime: 10000,
    staleTime: 10000,
    ...options,
  })
}

export default useApiQuery
