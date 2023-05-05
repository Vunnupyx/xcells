import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'

import * as constants from '../constants'
import User from '../models/User'
import generateAuth from './utils/generateAuth'
import escapeRegexString from './utils/escapeRegexString'

import {createHash} from 'crypto'
import {emailer} from '../email'

const shaHash = str => {
  const shasum = createHash('sha1')
  shasum.update(str)
  return shasum.digest('hex')
}

const postJson = (url, body) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })

const getDomain = ctx => constants.USER_LOGIN_COOKIE_HOST || ctx.header.host.split(':')[0]

const AuthController = {
  auth: async ctx => {
    const {username, password} = await ctx.request.json()

    let auth

    if (constants.USER_AUTH_URL) {
      const response = await postJson(constants.USER_AUTH_URL, {username, password})

      auth = await response.json()

      ctx.status = response.status
    } else {
      if (!username || !password) {
        ctx.throw(400, 'Username and password required.')
      }

      const usernameRegex = new RegExp(`^${escapeRegexString(username)}$`, 'i')
      const user = await User.findOne({name: usernameRegex}, {password: 1, confirmed: 1})
      if (!user) {
        ctx.throw(401, 'User not found.')
      } else if (!(await user.comparePassword(password))) {
        ctx.throw(401, 'Wrong password.')
      } else if (!user.confirmed) {
        ctx.throw(403, 'Error: Pending Activation')
      }

      auth = generateAuth(await User.findOne({name: usernameRegex}))
    }

    const {refresh_token, access_token, ...restAuth} = auth || {}

    if (refresh_token)
      ctx.cookies.set('refresh_token', refresh_token, {
        maxAge: auth.expires_in * 1000,
        domain: getDomain(ctx),
      })

    // @TODO: remove access token from response, currently still used to detect reconnects of the mapstore
    ctx.body = {tokenHash: shaHash(access_token), ...restAuth}
  },
  refresh: async ctx => {
    const refreshToken = ctx.cookies.get('refresh_token')

    if (!refreshToken) {
      ctx.throw(401, 'No refresh token found.')
    }

    let auth

    if (constants.USER_REFRESH_URL) {
      const response = await postJson(constants.USER_REFRESH_URL, {token: refreshToken})

      ctx.status = response.status
      auth = await response.json()
    } else {
      if (!refreshToken) {
        ctx.throw(400, 'No token received.')
      }

      try {
        const {sub: name} = jwt.verify(refreshToken, constants.JWT_SECRET)

        const user = await User.findOne({name})

        auth = generateAuth(user)
      } catch (e) {
        ctx.throw(401, 'Refresh JWT invalid.')
      }
    }

    const {refresh_token, access_token, ...authRest} = auth

    if (access_token) ctx.cookies.set('auth', access_token, {maxAge: auth.expires_in * 1000, domain: getDomain(ctx)})

    // enrich the auth object with the payload from the access token:
    const payload = jwt.decode(access_token)

    ctx.body = {
      ...authRest,
      tokenHash: shaHash(access_token),
      payload,
      expiresAt: payload.exp * 1000, // set value in ms as most stuff is based on ms
      userId: payload.sub,
      roles: payload.roles,
      limitMaps: payload.limitMaps,
      limitNodes: payload.limitNodes,
      name: auth?.wp_user?.data?.display_name,
    }
  },
  login: ctx => {
    if (constants.USER_LOGIN_URL) {
      ctx.body = {redirect: true, url: constants.USER_LOGIN_URL}
    } else {
      ctx.body = {redirect: false}
    }
  },

  signup: async ctx => {
    const {username, mail, password} = await ctx.request.json()
    if (!username || !password || !mail) {
      ctx.throw(400, 'Username, email and password required.')
    }

    //simplify checking later on
    const serializedUsername = username.toLowerCase().replace(/ /g, '')
    const serializedMail = mail.toLowerCase().replace(/ /g, '')

    if (!serializedUsername || !serializedMail || password.length < 7) {
      ctx.throw(400, 'Username, email and password required.')
    }
    const usernameRegex = new RegExp(`^${escapeRegexString(serializedUsername)}$`, 'i')
    const mailRegex = new RegExp(`^${escapeRegexString(serializedMail)}$`, 'i')

    const existingUsers = await User.find({$or: [{mail: mailRegex}, {name: usernameRegex}]})
      .limit(1)
      .exec()

    if (existingUsers.length > 0) {
      if (existingUsers[0].name === username) {
        ctx.throw(400, 'Username already exists.')
      } else if (existingUsers[0].mail === mail) {
        ctx.throw(400, 'Email already exists.')
      }
    }

    const user = new User({
      id: username,
      name: username,
      mail: mail,
      password,
      confirmed: false,
    })
    await user.save()
    try {
      await emailer.notifyAdminForNewUser(mail, username)
      await emailer.notifyUserForSignup(mail, username)
    } catch (err) {
      console.log(err)
    }
    ctx.body = {success: true}
  },

  logout: ctx => {
    const body = {success: true}

    if (constants.USER_LOGOUT_URL) {
      body.url = constants.USER_LOGOUT_URL
    } else {
      ctx.cookies.set('refresh_token', '', {maxAge: 1, domain: getDomain(ctx)})
      ctx.cookies.set('auth', '', {maxAge: 1, domain: getDomain(ctx)})
    }

    ctx.body = body
  },
}

export default AuthController
