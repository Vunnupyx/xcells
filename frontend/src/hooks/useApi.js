import debug from 'debug'

import {API_BASE_PATH} from '../shared/config/constants'

const log = debug('app:api')
const logError = log.extend(':ERROR*')

const request = async (method, path, options) => {
  const {body: givenBody, params, headers = {}, ...otherOptions} = options || {}
  const isJson = givenBody && typeof givenBody === 'object' && !(givenBody instanceof Blob) && !givenBody.prototype
  const body = isJson ? JSON.stringify(givenBody) : givenBody

  if (isJson) {
    headers['Content-Type'] = 'application/json'
  }

  const url = new URL(`${window.location.protocol}//${window.location.host}${API_BASE_PATH}${path}`)
  Object.entries(params || {}).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url, {
    redirect: 'error',
    method,
    ...otherOptions,
    body,
    headers,
  })

  const type = response.headers.get('content-type')

  let data
  if (!type || type.includes('text/')) {
    data = await response.text()
  } else if (type.startsWith('application/json')) {
    data = await response.json()
  } else {
    data = await response.blob()
  }

  if (response.ok) {
    return data || {}
  }

  if (!options?.ignoreErrors) {
    const errorMessage = data?.message || data || `Unknown error while fetching ${url}`

    const error = new Error(errorMessage)

    error.status = response.status
    error.data = data

    logError('API fetch failed', {errorMessage, data, response})
    throw error
  }

  return undefined
}

export const api = {
  get: (...args) => request('get', ...args),
  post: (...args) => request('post', ...args),
  put: (...args) => request('put', ...args),
  patch: (...args) => request('patch', ...args),
  delete: (...args) => request('delete', ...args),
  request,
}

const useApi = () => api

export default useApi
