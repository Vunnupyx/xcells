import Router from '@koa/router'

import apiRouter from './apiRouter'
import unauthRouter from './unauthRouter'

const appRouter = new Router()

appRouter.use(unauthRouter.routes()).use(apiRouter.routes()).use(apiRouter.allowedMethods())

export default appRouter
