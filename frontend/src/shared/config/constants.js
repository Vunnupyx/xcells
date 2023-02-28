// const {env} = process

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
  body: 'body',
  crop: 'crop',
  stretch: 'stretch',
  fullWidth: 'fullWidth',
  // bottomLeft: 'bottomLeft',
  // repeat: 'repeat',
}

export const LOAD_CHUNK_SIZE = 1000

export const NODE_TOOLBAR_BUTTON_CLASS = 'node-toolbar-button'
