require('dotenv').config();

const {env} = process

export const PORT = process.env.PORT || 3001

export const FRONTEND_PATH = env.FRONTEND_PATH || '../frontend/build'

export const JWT_SECRET = env.JWT_SECRET || 'GrFYK5ftZDtCg7ZGwxZ1JpSxyyJ9bc8uJijvBD1DYiMoS64ZpnBSrFxsNuybN1iO'

export let JWT_TTL = Number(env.JWT_TTL || 86400)

export const {
  MONGO_USERNAME = 'infinity',
  MONGO_PASSWORD,
  MONGO_DATABASE = 'infinity',
  MONGO_HOST = 'localhost',
  MONGO_PORT = '27017',
} = env
const mongoUrl = `${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`
const mongoAuth = MONGO_PASSWORD ? `${MONGO_USERNAME}:${MONGO_PASSWORD}@` : ''

export const MONGO_URI = env.MONGO_URI || `mongodb://${mongoAuth}${mongoUrl}`

export let USER_AUTH_URL = env.USER_AUTH_URL || false

export let USER_LOGIN_URL = env.USER_LOGIN_URL || false

export let USER_LOGOUT_URL = env.USER_LOGOUT_URL || false

export let USER_LOGIN_COOKIE_HOST =
  env.USER_LOGIN_COOKIE_HOST || process.env.NODE_ENV === 'production' ? '.infinitymaps.io' : false

export let USER_REFRESH_URL = env.USER_REFRESH_URL || false

export let DOCSET_DELETE_DELAY = env.DOCSET_DELETE_DELAY || 10000

export let SAVE_TO_DATABASE_INTERVAL = env.SAVE_TO_DATABASE_INTERVAL || 10000

export let REMOVE_METRICS_DELAY = env.REMOVE_METRICS_DELAY || 65000

export const IMPORT_JSON_SIZE_LIMIT = env.IMPORT_JSON_SIZE_LIMIT || '300mb'

export const SYNC_USER_ID = env.SYNC_USER_ID || (env.NODE_ENV !== 'production' ? 'wp-sync-user' : undefined)

export const DOCS_SERVICE_URL = env.DOCS_SERVICE_URL || 'http://localhost:3100/image'

export const PDF_SERVICE_URL = env.PDF_SERVICE_URL || 'http://localhost:3102/image'

export const HTML_SERVICE_URL = env.HTML_SERVICE_URL || 'http://localhost:3101/image'

export const RESIZE_SERVICE_URL = env.RESIZE_SERVICE_URL || 'http://localhost:3103/image'

export const EXPORT_FILE_SIZE_LIMIT = env.EXPORT_FILE_SIZE_LIMIT || 20 * 1024 * 1024

export const POOL_MAX_SIZE = env.POOL_MAX_SIZE || 100

export const POOL_MIN_SIZE = env.POOL_MIN_SIZE || 0

export const POOL_MAX_IDLE_TIME = env.POOL_MAX_IDLE_TIME || 30000
