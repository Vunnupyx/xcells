import {ROLES} from '../../shared/config/constants'
import {SYNC_USER_ID} from '../../constants'

export const subscriber = {
  name: 'subscriberUser',
  id: 'subscriberUser',
  mail: 'subscriber@example.com',
  password: 'unused',
  roles: [ROLES.subscriber],
  limitMaps: 10,
  limitNodes: 300,
  confirmed: true,
}

export const org_subscriber = {
  name: 'org_subscriberUser',
  id: 'org_subscriberUser',
  mail: 'org_subscriber@example.com',
  password: 'unused',
  roles: [ROLES.org_subscriber],
  limitMaps: 0,
  limitNodes: 0,
}

export const subscriberSocket = {
  ...subscriber,
  mail: 'subscriberUserSocket@example.com',
  id: 'subscriberUserSocket',
  name: 'subscriberUserSocket',
}

export const customer = {
  id: 'customerUser',
  name: 'customerUser',
  mail: 'customer@example.com',
  password: 'unused',
  roles: [ROLES.customer],
  limitMaps: 10,
  limitNodes: 1500,
}

export const administrator = {
  id: 'administratorUser',
  name: 'administratorUser',
  mail: 'administrator@example.com',
  password: 'unused',
  roles: [ROLES.subscriber, ROLES.administrator],
  limitMaps: 0,
  limitNodes: 0,
}

export const syncuser = {
  id: SYNC_USER_ID,
  name: SYNC_USER_ID,
  mail: 'sync@example.com',
}
