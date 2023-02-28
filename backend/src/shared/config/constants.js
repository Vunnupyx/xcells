const {env} = process

export const API_BASE_PATH = '/api/v1'

export const ROLES = {
  subscriber: 'subscriber',
  org_subscriber: 'org_subscriber',
  customer: 'customer',
  administrator: 'administrator',
}

export const ACCESS_ROLES = {
  owner: 'owner',
  contributor: 'contributor',
  reader: 'reader',
}

export const IMAGE_POSITIONS = {
  crop: 'crop',
  body: 'body',
  stretch: 'stretch',
  fullWidth: 'fullWidth',
  // bottomLeft: 'bottomLeft',
  // repeat: 'repeat',
}

export let COMPACT_CHUNK_SIZE = env.COMPACT_CHUNK_SIZE || 10

export let LOAD_CHUNK_SIZE = env.LOAD_CHUNK_SIZE || 1000
