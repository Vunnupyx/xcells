import Router from '@koa/router'
import UserController from '../controllers/UserController'

const userRouter = new Router()

userRouter
  .get('/users/search', UserController.search)
  .get('/users/search/mail', UserController.searchMail)
  .get('/users/:userId', UserController.get)
  .get('/current-user-statistics', UserController.currentUserStatistics)

export default userRouter
