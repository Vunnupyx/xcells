import Router from '@koa/router'

import MapImageController from '../controllers/ImageController'

const imageRouter = new Router({prefix: '/images'})

imageRouter
  .get('/', MapImageController.list)
  .post('/', MapImageController.create)

  .use('/:imageId', MapImageController.load)
  .use('/:imageId', MapImageController.authorization)
  .get('/:imageId', MapImageController.get)
  .delete('/:imageId', MapImageController.delete)

export default imageRouter
