import path from 'path'
import MapFile from '../models/MapFile'
import Thumbnail from '../models/Thumbnail'

const FileController = {
  load: async (ctx, next) => {
    const {fileId} = ctx.params

    let file = await MapFile.findOne({_id: fileId})

    if (!file) {
      ctx.throw(404, 'File not found.')
    }
    ctx.state.file = file

    await next()
  },
  authorization: async (ctx, next) => {
    const {mapId} = ctx.params
    const {file} = ctx.state

    if (file.metadata.mapId !== mapId) {
      ctx.throw(400, 'File is not associated with this map.')
    }

    await next()
  },
  list: async ctx => {
    const {mapId} = ctx.params
    const {templateId} = ctx.params

    ctx.body = mapId
      ? await MapFile.find({'metadata.mapId': mapId})
      : await MapFile.find({'metadata.templateId': templateId})
  },

  get: async ctx => {
    const {file} = ctx.state

    ctx.body = file.read()
    if (file.filename) ctx.set('Content-disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`)
    ctx.type = file.metadata.contentType || path.extname(file.filename) || 'application/octet-stream'
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
    const file = await MapFile.write({filename, metadata}, ctx.req)

    ctx.body = {_id: file._id}
  },

  delete: async ctx => {
    const {file} = ctx.state
    const {fileId} = ctx.params

    await Thumbnail.deleteMany({metadata: {fileId}})
    await file.unlink()

    ctx.body = {success: true}
  },
}

export default FileController
