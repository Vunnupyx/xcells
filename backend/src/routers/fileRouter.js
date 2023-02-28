import Router from '@koa/router'

import MapFileController from '../controllers/FileController'
import fileThumbnailRouter from './fileThumbnailRouter'

const fileRouter = new Router({prefix: '/files'})

fileRouter
  .get('/', MapFileController.list)
  .post('/', MapFileController.create)

  .use('/:fileId', MapFileController.load)
  .use('/:fileId', MapFileController.authorization)

  .get('/:fileId', MapFileController.get)
  .delete('/:fileId', MapFileController.delete)

  .use('/:fileId', fileThumbnailRouter.routes(), fileThumbnailRouter.allowedMethods())

export default fileRouter
