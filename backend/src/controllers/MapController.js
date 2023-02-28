import Automerge from 'automerge'
import {fromJS} from 'immutable'
import debug from 'debug'
import {Counter} from 'prom-client'
import {Readable} from 'stream'
import archiver from 'archiver'

import InfinityMap from '../models/InfinityMap'
import MapImage from '../models/MapImage'
import MapChanges from '../models/MapChanges'
import MapFile from '../models/MapFile'
import Thumbnail from '../models/Thumbnail'
import generateId from '../shared/utils/generateId'
import fileToBase64 from '../utils/fileToBase64'
import {EXPORT_FILE_SIZE_LIMIT, IMPORT_JSON_SIZE_LIMIT} from '../constants'
import User from '../models/User'
import {ACCESS_ROLES, COMPACT_CHUNK_SIZE, ROLES} from '../shared/config/constants'
import runAsync from '../shared/utils/runAsync'

const HANDLE_IMPORT_ASYNC_SIZE = 1000000

const log = debug('infinity:Controller:map')
const logError = log.extend('ERROR', '::')

const loadMapCounter = new Counter({
  name: 'infinity_rest_map_get_count',
  help: 'Number of map loads via get rest (read only)',
  labelNames: ['mapId'],
})

/**
 * helper function to save image and document data from an import
 * @param Model MapImage or MapFile model
 * @param options
 * @param options.data base64 encoded file data
 * @param options.filename
 * @param options.metadata md5sum, contentType, etc.
 * @returns {Promise<void>}
 */
const saveFile = async (Model, {data, filename, metadata}) => {
  const readable = new Readable()
  readable._read = () => {}
  readable.push(Buffer.from(data, 'base64'))
  readable.push(null)

  const file = await Model.write({filename, metadata}, readable)

  return file._id
}

const MapController = {
  load: async (ctx, next) => {
    const {mapId} = ctx.params

    const map = await InfinityMap.findOne({mapId})

    if (!map) {
      ctx.throw(404, 'Map not found.')
    }

    ctx.state.map = map

    await next()
  },
  authorization: async (ctx, next) => {
    const {method} = ctx
    const {userId, map} = ctx.state

    if (!userId && !map.isPublic()) {
      ctx.throw(401, 'Authentication needed.')
    }

    const {access = []} = map.share || {}

    const user = User.findOne({id: userId})

    if (!user) {
      ctx.throw(401, 'User not found.')
    }

    const roleBinding = access.find(
      ({subjectId, subjectType}) =>
        (subjectType === 'user' && subjectId === userId) || (subjectType === 'mail' && subjectId === user.mail),
    )

    const isOwner = map.userId?.toString() === userId || roleBinding?.role === ACCESS_ROLES.owner
    const isWriteable = isOwner || roleBinding?.role === ACCESS_ROLES.contributor || map.isPublicWriteable()
    const isReadable = isWriteable || roleBinding?.role === ACCESS_ROLES.reader || map.isPublic()

    if (method.toUpperCase() === 'GET' && !isReadable) {
      ctx.throw(403, 'Access denied.')
    }

    ctx.state.access = {isOwner, isWriteable, isReadable}

    await next()
  },
  list: async ctx => {
    const {userId} = ctx.state
    const {public: publicString} = ctx.query

    const isPublic = publicString !== 'false'

    if (!isPublic && !userId) ctx.throw(401, 'Authentication needed.')

    const query = isPublic
      ? {
          'share.public.enabled': true,
          $or: [{'share.public.hidden': false}, {'share.public.hidden': {$exists: false}}],
        }
      : {$or: [{userId}, {'share.access.subjectId': userId, 'share.access.subjectType': 'user'}]}
    const project = isPublic ? {nodes: 0, edges: 0, share: 0} : {nodes: 0, edges: 0}

    ctx.body = await InfinityMap.find(query, project).sort([['updatedAt', 'descending']])
  },
  get: async ctx => {
    const {mapId} = ctx.params
    const {map} = ctx.state

    loadMapCounter.labels(mapId).inc()

    ctx.body = map
  },
  exists: async ctx => {
    const {mapId} = ctx.params

    const mapChanges = await MapChanges.findOne({mapId})

    ctx.body = {exists: mapChanges}
  },
  delete: async ctx => {
    const {mapId} = ctx.params
    const {isOwner} = ctx.state.access

    if (!isOwner) {
      ctx.throw(403, 'You are not an owner of this map.')
    }

    const unlinkObjects = async model => {
      const objs = await model.find({'metadata.mapId': mapId})
      await Promise.all(objs.map(obj => obj.unlink()))
    }

    await Promise.all([
      InfinityMap.deleteOne({mapId}),
      MapChanges.deleteMany({mapId}),
      unlinkObjects(MapImage),
      unlinkObjects(MapFile),
      unlinkObjects(Thumbnail),
    ])

    ctx.body = {success: true}
  },
  replace: ctx => {
    ctx.throw(400, 'Use the websocket methods.')
  },
  update: ctx => {
    ctx.throw(400, 'Use the websocket methods.')
  },
  create: async ctx => {
    const {userId} = ctx.state
    const {limitMaps = 0} = ctx.state.auth

    //workaround org_subscriber with no map limit TODO: do it on wordpress
    if (
      limitMaps &&
      (await InfinityMap.find({userId}).countDocuments()) >= limitMaps &&
      !ctx.state.auth.roles.includes(ROLES.org_subscriber)
    ) {
      ctx.throw(402, `Map limit reached (${limitMaps})`)
    }

    const mapId = generateId()

    log('create new map', {mapId, userId})

    const oldDoc = Automerge.init()
    const newDoc = Automerge.change(oldDoc, 'create', doc => (doc.mapId = mapId))
    const mapChange = new MapChanges({mapId, userId, changes: Automerge.getChanges(oldDoc, newDoc)})
    await mapChange.save()

    await new InfinityMap({...newDoc, userId}).save()

    ctx.body = {mapId}
  },
  copy: async ctx => {
    const {userId, map} = ctx.state

    const newMapId = generateId()

    const {title, nodes, edges = {}, root} = JSON.parse(JSON.stringify(map))

    const newMapData = {title, nodes, edges, root, mapId: newMapId, userId}

    await new InfinityMap(newMapData).save()

    const compactDoc = Automerge.change(Automerge.init(), 'copyMap', doc => Object.assign(doc, newMapData))

    const changes = Automerge.Frontend.getBackendState(compactDoc).getIn(['opSet', 'history']).toJS()

    await new MapChanges({mapId: newMapId, userId, changes}).save()

    ctx.body = {mapId: newMapId}
  },
  import: async ctx => {
    const {length} = ctx.request
    const bigMap = length > HANDLE_IMPORT_ASYNC_SIZE

    const {userId} = ctx.state
    const {images = [], documents = [], ...mapData} = await ctx.request.json(IMPORT_JSON_SIZE_LIMIT)

    const {mapId: originalMapId, title, nodes, edges = {}, tags, root} = mapData

    const isNewIdNeeded = originalMapId ? await InfinityMap.find({mapId: originalMapId}, {_id: 1}) : true

    const mapId = isNewIdNeeded ? generateId() : originalMapId

    if (bigMap) {
      ctx.res.statusCode = 200
      ctx.response.set('Content-Type', 'application/json; charset=utf-8')
      ctx.res.end(`{"mapId": "${mapId}", "wait": true}\n`)
    }

    const newImageIds = new Map()
    await Promise.all(
      images.map(async image => {
        const oldId = image._id
        image.metadata.mapId = mapId
        const newId = `${await saveFile(MapImage, image)}`
        newImageIds.set(oldId, newId)
      }),
    )

    const newDocumentIds = new Map()
    await Promise.all(
      documents.map(async document => {
        const oldId = document._id
        document.metadata.mapId = mapId
        const newId = `${await saveFile(MapFile, document)}`
        newDocumentIds.set(oldId, newId)
      }),
    )

    for (const node of Object.values(nodes)) {
      if (node.image) {
        const oldId = node.image
        if (newImageIds.has(oldId)) {
          node.image = newImageIds.get(oldId)
        } else {
          log(`image with id ${oldId} was not found in export`)
          delete node.image
        }
      }
      if (node.file) {
        const oldId = node.file
        if (newImageIds.has(oldId)) {
          node.file = newDocumentIds.get(oldId)
        } else {
          log(`file with id ${oldId} was not found in export`)
          delete node.file
        }
      }
    }

    const newMapData = {title, nodes, edges, root, mapId, userId}
    if (tags) newMapData.tags = tags

    await new InfinityMap(newMapData).save()

    const compactDoc = Automerge.change(Automerge.init(), 'import', doc => Object.assign(doc, newMapData))

    const changes = Automerge.Frontend.getBackendState(compactDoc).getIn(['opSet', 'history']).toJS()

    await new MapChanges({mapId, userId, changes}).save()

    if (!bigMap) ctx.body = {mapId}

    log(`JSON import with id ${mapId} is done.`)
  },
  exportJson: async ctx => {
    const {mapId, title, nodes, edges, tags, root} = ctx.state.map.toJSON()
    const {isWriteable} = ctx.state.access

    if (!isWriteable) {
      ctx.throw(403, 'Only users with write access can export maps.')
    }

    const exportMap = {mapId, title, nodes, edges, root}
    if (tags) exportMap.tags = tags

    const imageList = await MapImage.find({'metadata.mapId': mapId, length: {$lt: EXPORT_FILE_SIZE_LIMIT}})
    const images = await Promise.all((imageList || []).map(fileToBase64))

    const documentList = await MapFile.find({'metadata.mapId': mapId, length: {$lt: EXPORT_FILE_SIZE_LIMIT}})
    const documents = await Promise.all((documentList || []).map(fileToBase64))

    const filename = `InfinityMaps-${mapId}-${title}.json`
    ctx.set('Content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)

    ctx.body = {...exportMap, images, documents}
  },
  exportZip: async ctx => {
    const {mapId, title, nodes, edges, tags, root} = ctx.state.map.toJSON()
    const {isWriteable} = ctx.state.access

    if (!isWriteable) {
      ctx.throw(403, 'Only users with write access can export maps.')
    }

    const archive = archiver('zip')
    archive.on('end', () => log(`zip export of ${mapId} successful`))
    archive.on('warning', error => logError(`warning when exporting ${mapId} to zip: ${error}`))
    archive.on('error', error => {
      const message = `failed to export ${mapId} to zip: ${error}`
      logError(message)
      ctx.throw(500, message)
    })

    const exportMap = {mapId, title, nodes, edges, root}
    if (tags) exportMap.tags = tags
    archive.append(JSON.stringify(exportMap), {name: 'mapdata.json'})

    const metaData = {version: 1, images: {}, files: {}}

    const imageList = (await MapImage.find({'metadata.mapId': mapId})) || []
    imageList.forEach(image => {
      metaData.images[image._id] = image.toJSON()

      archive.append(image.read(), {name: `${image._id}-${image.filename || 'unknown.jpg'}`})
    })

    const fileList = (await MapFile.find({'metadata.mapId': mapId})) || []
    fileList.forEach(file => {
      metaData.files[file._id] = file.toJSON()

      archive.append(file.read(), {name: `${file._id}-${file.filename || 'unknown.jpg'}`})
    })
    archive.append(JSON.stringify(metaData), {name: 'metadata.json'})

    const filename = `InfinityMaps-${mapId}-${title}.zip`
    ctx.set('Content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)

    archive.finalize()

    ctx.body = archive
  },
  shareRead: async ctx => {
    const {map} = ctx.state

    ctx.body = map.share
  },
  shareWrite: async ctx => {
    ctx.throw(400, 'This endpoint is obsolete.')
  },
  sharePublicGet: async ctx => {
    const {map} = ctx.state
    ctx.body = map.share?.public || {}
  },
  sharePublicPost: async ctx => {
    const {map, auth} = ctx.state
    const payload = await ctx.request.json()
    const {isOwner} = ctx.state.access

    if (!isOwner) {
      ctx.throw(403, 'Only owners are allowed to share maps.')
    } else if (!('enabled' in payload)) {
      ctx.throw(400, 'Badly formatted request.')
    } else if (payload.writeable && !payload.hidden && !auth?.roles.includes(ROLES.administrator)) {
      ctx.throw(403, 'Only administrators can set maps public writeable')
    }

    if (!map.share) map.share = {}

    map.share.public = payload
    await map.save()

    ctx.body = {success: true}
  },
  shareAccessGet: async ctx => {
    const {map} = ctx.state
    ctx.body = map.share?.access || []
  },
  shareAccessPost: async ctx => {
    const {map} = ctx.state
    const payload = await ctx.request.json()
    const {isOwner} = ctx.state.access

    if (!isOwner) {
      ctx.throw(403, 'Only owners are allowed to share maps.')
    } else if (!Array.isArray(payload)) {
      ctx.throw(400, 'Badly formatted request.')
    }

    if (!map.share) map.share = {}

    map.share.access = payload
    await map.save()

    ctx.body = {success: true}
  },
  writeable: async ctx => {
    const {isWriteable: writeable} = ctx.state.access

    ctx.body = {writeable}
  },
  nodeLimit: async ctx => {
    const {userId} = ctx.state.map

    let nodeLimit = false
    const user = await User.findOne({id: userId})
    if (user?.limitNodes) nodeLimit = user.limitNodes

    // Workaround for unfinished db TODO: Remove it
    if (ctx.state?.userId === userId && ctx.state?.auth) nodeLimit = ctx.state.auth.limitNodes

    //workaround role org_subscriber with unlimited maps/cards
    if (user.roles.includes(ROLES.org_subscriber)) nodeLimit = false

    ctx.body = {nodeLimit: nodeLimit}
  },
  repair: async ctx => {
    const {map} = ctx.state

    const {mapId} = map

    const mapChanges = await MapChanges.findOne({mapId})

    if (!mapChanges) {
      ctx.throw(400, 'No changes found.')
    }

    const originalOpsSize = mapChanges.changes.map(c => c.ops?.length || 0).reduce((l, acc) => acc + l, 0)
    const originalChangesSize = mapChanges.changes.length

    const fullDoc = Automerge.applyChanges(Automerge.init(), fromJS(mapChanges.toJSON().changes))

    // split the data up, to reduce the size of single changes
    const {nodes, edges = {}, root, ...mapRest} = JSON.parse(JSON.stringify(fullDoc))

    // cleanup inconsistencies in nodes
    // collect all parents as displayed: always the last parent, that has a node as parent, is displayed
    const parents = Object.fromEntries(
      Object.values(nodes)
        .filter(node => node.id !== root)
        .map(node => {
          const {id} = node
          const lastParent = Object.values(nodes)
            .filter(node => node.children?.includes(id))
            .map(node => node.id)
            .pop()
          return [id, lastParent || root]
        }),
    )

    Object.values(nodes).forEach(node => {
      if (node.parent !== root && node.x < 0 && node.x <= node.width) node.x = 0
      if (node.parent !== root && node.y < 0 && node.y <= node.height) node.y = 0

      // recreate children
      const children = Object.entries(parents)
        .filter(([, parent]) => node.id === parent)
        .map(([id]) => id)
      if (children.length > 0) {
        if (node.children.length !== children.length || node.children.find(n => !children.includes(n))) {
          log(`update children of node ${node.id} from ${node.children} to ${children}`)
          node.children = children
        }
      } else if (node.children?.length) {
        log(`node ${node.id} had children '${node.children}', but none were found in repair`)
        delete node.children
      }

      // set the correct parent
      if (node.id !== root && node.parent !== parents[node.id]) {
        log(`correct parent of node ${node.id} from ${node.parent} to ${parents[node.id]}`)
        node.parent = parents[node.id]
      }
    })

    let repairedDoc = Automerge.change(Automerge.init(), 'repair', doc =>
      Object.assign(doc, {...mapRest, root, nodes: {}}),
    )

    // cleanup edges with missing start or end node
    const cleanedEdges = Object.fromEntries(
      Object.entries(edges).filter(([, edge]) => edge.start in nodes && edge.end in nodes),
    )

    repairedDoc = Automerge.change(repairedDoc, 'repairAddEdges', doc => (doc.edges = cleanedEdges))

    const nodeList = Object.values(nodes)
    for (let i = 0; i < nodeList.length; i += COMPACT_CHUNK_SIZE) {
      const chunk = nodeList.slice(i, i + COMPACT_CHUNK_SIZE)
      log('repair: loading chunk', chunk.length, i, COMPACT_CHUNK_SIZE)
      // eslint-disable-next-line no-await-in-loop,no-loop-func
      repairedDoc = await runAsync(() =>
        Automerge.change(repairedDoc, 'repairAddNodes', doc => chunk.forEach(n => (doc.nodes[n.id] = n))),
      )
    }

    const changes = Automerge.Frontend.getBackendState(repairedDoc).getIn(['opSet', 'history']).toJS()
    const reducedOpsSize = changes.map(c => c.ops?.length || 0).reduce((l, acc) => acc + l, 0)
    const reducedChangesSize = changes.length

    await MapChanges.findOneAndUpdate({mapId}, {$set: {changes}})

    ctx.body = {
      originalOpsSize,
      originalChangesSize,
      reducedOpsSize,
      reducedChangesSize,
    }
  },
  addCategory: async ctx => {
    const {map} = ctx.state
    const request = await ctx.request.json()

    const {category} = request

    if (typeof category !== 'string' && category !== null) {
      ctx.abort(400, 'category has to be string')
    }

    map.category = category
    await map.save()

    ctx.body = {success: true}
  },
  fromTemplate: async ctx => {
    const {userId, template} = ctx.state

    const newMapId = generateId()

    const {name: title, nodes, edges = {}, root} = JSON.parse(JSON.stringify(template))

    const newMapData = {title, nodes, edges, root, mapId: newMapId, userId}

    await new InfinityMap(newMapData).save()

    const compactDoc = Automerge.change(Automerge.init(), 'fromTemplate', doc => Object.assign(doc, newMapData))

    const changes = Automerge.Frontend.getBackendState(compactDoc).getIn(['opSet', 'history']).toJS()

    await new MapChanges({mapId: newMapId, userId, changes}).save()

    ctx.body = {mapId: newMapId}
  },
}

export default MapController
