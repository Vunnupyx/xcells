import path from 'path'
import MapImage from '../models/MapImage'
import Template from '../models/Template'

const ImageController = {
  load: async (ctx, next) => {
    const {imageId} = ctx.params

    let image = await MapImage.findOne({_id: imageId})

    if (!image) {
      ctx.throw(404, 'Image not found.')
    }

    ctx.state.image = image

    await next()
  },
  authorization: async (ctx, next) => {
    const {mapId} = ctx.params
    const {userId, template, image} = ctx.state

    if (!image.metadata.templateId && image.metadata.mapId !== mapId) {
      ctx.throw(403, 'Access denied. Image is not associated with this map.')
    } else if (image.metadata.templateId && image.metadata.userId?.toString() !== userId) {
      const accessTemplate = template || (await Template.findOne({_id: image.metadata.templateId}))
      if (!accessTemplate) {
        ctx.throw(403, 'Access denied.')
      } else if (!accessTemplate.isPublic() && userId) {
        ctx.throw(403, 'Access denied.')
      } else if (!accessTemplate.isPublic() && !userId) {
        ctx.throw(401, 'Authentication needed.')
      }
    }

    await next()
  },

  list: async ctx => {
    const {mapId} = ctx.params
    const {templateId} = ctx.params

    ctx.body = mapId
      ? await MapImage.find({'metadata.mapId': mapId})
      : await MapImage.find({'metadata.templateId': templateId})
  },

  get: async ctx => {
    const {image} = ctx.state

    ctx.body = image.read()
    if (image.filename) ctx.set('Content-disposition', `inline; filename*=UTF-8''${encodeURIComponent(image.filename)}`)
    ctx.type = image.metadata.contentType || path.extname(image.filename) || 'application/octet-stream'
  },

  create: async ctx => {
    // TODO: set count of selected items, so we can determine later if the image can be deleted
    const {
      request: {query: {filename = 'no-file-name-given'} = {}},
      headers: {'content-type': contentType},
      params: {mapId},
      state: {userId},
    } = ctx

    const metadata = {mapId, contentType, userId}
    const image = await MapImage.write({filename, metadata}, ctx.req)

    ctx.body = {_id: image._id}
  },

  delete: async ctx => {
    const {image} = ctx.state

    await image.unlink()
    ctx.body = {success: true}
  },
}

export default ImageController
