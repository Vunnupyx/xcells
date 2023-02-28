jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())
const fetchMock = require('node-fetch')

import {publicRequest} from '../utils/test/userRequests'
import * as constants from '../constants'
import generateAuth from './utils/generateAuth'
import {subscriber} from '../utils/test/users'

describe('wordpress authentication', () => {
  let oldAuthUrl
  let oldRefreshUrl

  const auth = generateAuth(subscriber)
  const {access_token, refresh_token, ...reducedAuth} = auth

  beforeAll(() => {
    oldAuthUrl = constants.USER_AUTH_URL
    oldRefreshUrl = constants.USER_REFRESH_URL
    constants.USER_AUTH_URL = 'http://example.com/auth'
    constants.USER_REFRESH_URL = 'http://example.com/refresh'
    fetchMock.post(constants.USER_AUTH_URL, auth).post(constants.USER_REFRESH_URL, auth)
  })

  afterAll(() => {
    constants.USER_AUTH_URL = oldAuthUrl
    constants.USER_REFRESH_URL = oldRefreshUrl
    fetchMock.reset()
  })

  it('should authenticate the user', async () => {
    const response = await publicRequest.post('/auth').send({username: 'notValidated', password: 'notValidated'})

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data).toMatchObject(reducedAuth)
  })

  it('should refresh the authentication token', async () => {
    const response = await publicRequest.post('/auth/refresh').set('Cookie', ['refresh_token=notValidated']).send()

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data).toMatchObject(reducedAuth)
  })
})
