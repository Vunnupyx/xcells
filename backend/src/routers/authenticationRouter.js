import Router from '@koa/router'

import AuthController from '../controllers/AuthController'

const authenticationRouter = new Router()

authenticationRouter
  .post('/auth', AuthController.auth)
  .post(['/refresh', '/auth/refresh'], AuthController.refresh)
  .get('/auth/login', AuthController.login)
  .post('/auth/signup', AuthController.signup)
  .post('/auth/logout', AuthController.logout)

export default authenticationRouter
