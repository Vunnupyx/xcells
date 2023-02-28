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

export default statisticsRouter
