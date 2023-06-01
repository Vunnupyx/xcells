import Router from '@koa/router'
import jwt from 'koa-jwt'

import {API_BASE_PATH} from '../shared/config/constants'

import userRouter from './userRouter'
import errorRouter from './errorRouter'
import mapRouter from './mapRouter'
import templateRouter from './templateRouter'
import UserController from '../controllers/UserController'
import {JWT_SECRET} from '../constants'
import extractUserId from '../middlewares/extractUserId'
import authenticationRouter from './authenticationRouter'
import syncRouter from './syncRouter'
import statisticsRouter from './statisticsRouter'
import urlThumbnailRouter from './urlThumbnailRouter'
import integrationRouter from './integrationRouter'

const apiRouter = new Router({prefix: API_BASE_PATH})

apiRouter
  .use(authenticationRouter.routes(), authenticationRouter.allowedMethods())
  .use(jwt({key: 'auth', cookie: 'auth', secret: JWT_SECRET, passthrough: true, debug: true}))
  .use(extractUserId)
  .use(syncRouter.routes(), syncRouter.allowedMethods())
  .use(errorRouter.routes(), errorRouter.allowedMethods())
  .use(UserController.authorization)
  .use(mapRouter.routes(), mapRouter.allowedMethods())
  .use(templateRouter.routes(), templateRouter.allowedMethods())
  .use(userRouter.routes(), userRouter.allowedMethods())
  .use(statisticsRouter.routes(), statisticsRouter.allowedMethods())
  .use(urlThumbnailRouter.routes(), urlThumbnailRouter.allowedMethods())
  .use(integrationRouter.routes(), integrationRouter.allowedMethods())

export default apiRouter
