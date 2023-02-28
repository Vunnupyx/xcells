import mixpanel from 'mixpanel-browser'
import debug from 'debug'

const log = debug('app:tracking:mixpanel')
// const logError = log.extend(':ERROR')

const PRODPROJECTTOKEN = '3e176fb815ea9babf31ff67d62c4c2e8'
const DEVPROJECTTOKEN = '7a7bcced8ceeceac92c461b76e6c628b'
const APIHOSTEUROPE = 'https://api-eu.mixpanel.com'
export const MOUSEMOVEINTERVALLTOTRACK = 300000

// eslint-disable-next-line no-restricted-globals
const domain = location.origin.split('//')[1].split(/\.|\/|:/)[0]
const prod = domain === 'app'
const isMergeRequest = domain.startsWith('dev-merge-')
const isLocalhost = domain === 'localhost'
const envCheck = domain !== 'localhost'

// Only deactivate tracking when app runs on local machine
log('Is Mixpanel using the prod environment? ', prod)

mixpanel.init(prod ? PRODPROJECTTOKEN : DEVPROJECTTOKEN, {
  api_host: APIHOSTEUROPE,
  debug: isMergeRequest || isLocalhost,
  property_blacklist: ['$current_url'],
})

const getHighestRole = roles => {
  if (roles.includes('administrator')) return 'administrator'
  if (roles.includes('org_subscriber')) return 'org_subscriber'
  if (roles.includes('customer')) return 'customer'
  return 'subscriber'
}

const actions = {
  identify: id => {
    //  TODO Call this only when consent was provided
    // if (envCheck && id)
    mixpanel.identify(id)
  },
  setMixpanelUserProfile: (userData, id) => {
    mixpanel.identify(id)
    const highestRole = getHighestRole(userData.roles)
    mixpanel.people.set({
      userId: userData.id,
      role: highestRole,
      mapShareCount: userData.mapShareCount,
      mapCount: userData.mapCount,
      nodeCount: userData.nodeCount,
      createdAt: userData.createdAt,
    })
    mixpanel.people.set_once({
      fieldsOfWork: userData.fieldsOfWork,
    })
  },
  setMixpanelUserProfileStats: (id, prop) => {
    mixpanel.identify(id)
    mixpanel.people.set({
      ...prop,
    })
  },
  track: (name, props = {}) => {
    log('mixpanel tracking', name, props)
    if (envCheck) mixpanel.track(name, {...props})
  },
  logOut: () => {
    if (envCheck) mixpanel.reset()
  },
}

export const Mixpanel = actions
