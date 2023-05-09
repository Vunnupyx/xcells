import Router from '@koa/router'
import StatisticsController from '../controllers/StatisticsController'

const statisticsRouter = new Router({prefix: '/statistics'})

statisticsRouter
  .use(StatisticsController.authorization)
  .get('/maps', StatisticsController.mapsServe)
  .get('/maps/download', StatisticsController.mapsCsv)
  .param('userId', StatisticsController.userLoad)
  .get('/maps/:userId', StatisticsController.userMapStatistics)
  .get('/users', StatisticsController.userList)
  .get('/users/activity', StatisticsController.userActivity)
  .get('/users/:userId', StatisticsController.userStatistics)
  .post('/users/:userId/comment', StatisticsController.userComment)
  .get('/waitlist', StatisticsController.userWaitlist)
  .get('/waitlist/confirm/:userId', StatisticsController.activateUser)

export default statisticsRouter
