import Router from '@koa/router'

import IntegrationController from '../controllers/IntegrationController'

const integrationRouter = new Router({prefix: '/integration'})

integrationRouter
  .use(IntegrationController.authorization)
  .get('/openai', IntegrationController.get)
  .put('/openai', IntegrationController.updateOpenai)

export default integrationRouter
