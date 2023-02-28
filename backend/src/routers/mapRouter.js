import Router from '@koa/router'

import MapController from '../controllers/MapController'
import fileRouter from './fileRouter'
import imageRouter from './imageRouter'
import UploadImapController from '../controllers/UploadImapController'
import pathRouter from './pathRouter'
import TemplateController from '../controllers/TemplateController'

const mapRouter = new Router({prefix: '/maps'})

mapRouter
  .get('/', MapController.list)
  .post('/', MapController.create)
  .post('/import/imapping', UploadImapController.create)
  .post('/import', MapController.import)
  .use('/from/template/:templateId', TemplateController.load)
  .use('/from/template/:templateId', TemplateController.authorizationRead)
  .post('/from/template/:templateId', MapController.fromTemplate)

  .use('/:mapId', MapController.load)
  .use('/:mapId', MapController.authorization)
  .get('/:mapId', MapController.get)
  .put('/:mapId', MapController.replace)
  .patch('/:mapId', MapController.update)
  .delete('/:mapId', MapController.delete)

  .get('/:mapId/export', MapController.exportJson)
  .get('/:mapId/export/json', MapController.exportJson)
  .get('/:mapId/export/zip', MapController.exportZip)
  .get('/:mapId/share', MapController.shareRead)
  .post('/:mapId/share', MapController.shareWrite)
  .get('/:mapId/share/access', MapController.shareAccessGet)
  .post('/:mapId/share/access', MapController.shareAccessPost)
  .get('/:mapId/share/public', MapController.sharePublicGet)
  .post('/:mapId/share/public', MapController.sharePublicPost)
  .post('/:mapId/category', MapController.addCategory)
  .get('/:mapId/writeable', MapController.writeable)
  .post('/:mapId/repair', MapController.repair)
  .get('/:mapId/nodeLimit', MapController.nodeLimit)
  .get('/:mapId/exists', MapController.exists)

  .post('/:mapId/copy', MapController.copy)

  .use('/:mapId', fileRouter.routes(), fileRouter.allowedMethods())
  .use('/:mapId', imageRouter.routes(), imageRouter.allowedMethods())
  .use('/:mapId', pathRouter.routes(), pathRouter.allowedMethods())

export default mapRouter
