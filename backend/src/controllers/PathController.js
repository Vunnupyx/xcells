import debug from 'debug'
import MapPath from '../models/MapPath'

const log = debug('infinity:Path:Controller')

const PathController = {
  load: async (ctx, next) => {
    const {pathId} = ctx.params

    const path = await MapPath.findOne({_id: pathId})

    if (!path) {
      ctx.throw(404, 'Path not found.')
    }

    ctx.state.path = path

    await next()
  },

  list: async ctx => {
    const {mapId} = ctx.params
    ctx.body = await MapPath.find({mapId})
  },

  get: async ctx => {
    const {path} = ctx.state

    ctx.body = path
  },

  create: async ctx => {
    const request = await ctx.request.json()
    const {mapId, _id, nodes, title} = request

    log('create new path', {mapId, _id})

    const path = _id ? await MapPath.findOne({_id}) : new MapPath({_id, mapId, nodes, title})

    path.nodes = nodes

    await path.save()
    ctx.body = {_id: path._id}
  },

  delete: async ctx => {
    const {pathId} = ctx.params

    log('delete path', {pathId})

    const result = await MapPath.deleteOne({_id: pathId})

    log('delete result ', result)
    if (result.deletedCount === 0) {
      ctx.throw(500, 'Cannot delete path')
    }

    ctx.body = {success: true}
  },
}

export default PathController
