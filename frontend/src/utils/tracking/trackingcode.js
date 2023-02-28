import debug from 'debug'
import md5 from 'md5'

import {Mixpanel} from './mixpanel'

const log = debug('app:tracking:trackingcode')

export const hashUserId = userId => {
  const hashed = userId && userId !== 'public' ? md5(userId) : undefined
  return hashed
}

const trackingcode = (action, props, userId) => {
  log('tracking called', userId, navigator.userAgent, action)

  const hashedUserId = hashUserId(userId)

  const mixpanelPropsWithUser = hashedUserId ? {...props, userId: hashedUserId} : {...props, publicUser: true}
  // TODO: Check if session is older then some time and you are still loged in if mixpanel still can identify you
  Mixpanel.track(action, mixpanelPropsWithUser)
}

export const identify = userId => {
  const hashed = hashUserId(userId)
  Mixpanel.identify(hashed)
}

export const setMixpanelUserProfile = userData => {
  const hashed = hashUserId(userData.id)
  if (hashed) Mixpanel.setMixpanelUserProfile(userData, hashed)
}

export const setMixpanelUserProfileStats = (id, prop) => {
  Mixpanel.setMixpanelUserProfileStats(id, prop)
}

export const logOut = () => {
  Mixpanel.logOut()
}

export default trackingcode
