import {Transform} from 'stream'
import {Parser as N3Parser} from 'n3'
import {parseStringPromise} from 'xml2js'
import {Parse as ZipParse} from 'unzipper'
import mime from 'mime/lite'
import path from 'path'
import Automerge from 'automerge'
import {AllHtmlEntities} from 'html-entities'
import {convert as htmlConvert} from 'html-to-text'
import debug from 'debug'

import InfinityMap from '../models/InfinityMap'
import MapImage from '../models/MapImage'
import MapChanges from '../models/MapChanges'
import {generateEdgeId, generateNodeId} from '../shared/utils/generateId'
import {IMAGE_POSITIONS} from '../shared/config/constants'
import ReadableStreamClone from '../shared/lib/readable-stream-clone'
import runAsync from '../shared/utils/runAsync'

const log = debug('infinity:UploadImapController')
const logError = log.extend('ERROR', '::')

const HANDLE_IMPORT_ASYNC_SIZE = 1500000

const SCALE_MULTIPLIER_X = 1.5
const SCALE_MULTIPLIER_Y = 1.5
const Y_SHIFT = 6

const colorTable = {
  B: '@blue',
  G: '@green',
  Y: '@yellow',
  R: '@red',
  O: '@orange',
  W: undefined,
}

const entityDecode = new AllHtmlEntities().decode

const parser = new N3Parser({format: 'N-Triples'})

const parseRdf = async stream => {
  return await new Promise((resolve, reject) => {
    const returnList = []
    parser.parse(stream, (error, quad) => {
      if (error) {
        reject(error)
      }
      if (quad) {
        const {subject, predicate, object} = quad
        returnList.push({
          subject: subject.value,
          predicate: predicate.value.replace('http://ont.semanticdesktop.org/ontologies/2007/imapping#', ''),
          object: object.value.replace('http://ont.semanticdesktop.org/ontologies/2007/imapping#', ''),
        })
      } else {
        resolve(returnList)
      }
    })
  })
}

const importImappingFile = async ctx => {
  const {length} = ctx.request
  const bigMap = length > HANDLE_IMPORT_ASYNC_SIZE

  const {userId} = ctx.state
  const mapId = generateNodeId()

  const map = new InfinityMap({userId, mapId})

  const imageIds = {}
  let triples
  let usedImages
  let xml

  let readStream1
  let readStream2

  try {
    readStream1 = new ReadableStreamClone(ctx.req)
    readStream2 = new ReadableStreamClone(ctx.req)
  } catch (e) {
    ctx.throw(400, 'Imapping file invalid')
    return // this is implicit, as the function above will throw an exception
  }

  try {
    await new Promise((resolve, reject) =>
      readStream1
        .pipe(ZipParse())
        .pipe(
          Transform({
            objectMode: true,
            transform: async (entry, e, cb) => {
              if (entry.type === 'File' && entry.path === 'layout.rdf.nt') {
                triples = await parseRdf(entry)
                cb()
              } else {
                entry.autodrain()
                cb()
              }
            },
          }),
        )
        .on('error', e => reject(e))
        .on('finish', () => resolve()),
    )
  } catch (e) {
    ctx.throw(400, 'Imapping file invalid: RDF file corrupt')
    return // this is implicit, as the function above will throw an exception
  }

  usedImages = triples.filter(e => e.predicate === 'BackgroundPicturePath').map(e => e.object)

  await new Promise((resolve, reject) =>
    readStream2
      .pipe(ZipParse())
      .pipe(
        Transform({
          objectMode: true,
          transform: async (entry, e, cb) => {
            if (entry.type !== 'File') {
              entry.autodrain()
              cb()
            } else if (entry.path === 'layout.rdf.nt') {
              // already handled in readStream1
              entry.autodrain()
              cb()
            } else if (entry.path === 'content.cds.xml') {
              xml = await new Promise((resolve, reject) => {
                try {
                  let text = ''
                  entry.on('data', data => (text += data))

                  entry.resume()

                  entry.on('end', async () => {
                    cb()
                    resolve(await parseStringPromise(text))
                  })
                } catch (e) {
                  reject(e)
                  entry.autodrain()
                  cb()
                }
              })
            } else if (entry.path.startsWith('backgroundimagefolder/') && usedImages.includes(entry.path)) {
              const filename = path.basename(entry.path)

              const image = await MapImage.write(
                {
                  filename,
                  metadata: {mapId, contentType: mime.getType(filename), userId},
                },
                entry,
              )
              imageIds[`backgroundimagefolder/${filename}`] = image._id

              cb()
            } else {
              entry.autodrain()
              cb()
            }
          },
        }),
      )
      .on('error', e => reject(e))
      .on('finish', () => resolve()),
  )

  if (!xml) {
    ctx.throw(400, 'Imapping file invalid: XML file missing')
    return // this is implicit, as the function above will throw an exception
  }
  if (!triples) {
    ctx.throw(400, 'Imapping file invalid: RDF file missing')
    return // this is implicit, as the function above will throw an exception
  }

  const runImport = async () => {
    try {
      const xmlRoot = xml['org.semanticdesktop.swecr.model.memory.xml.XModel']

      const clean = text => htmlConvert(text, {wordwrap: false}).trim()

      const contentsTemp = xmlRoot.contentItems[0].contentitem
        .filter(({content}) => content)
        .map(({uri, content}) => [uri, content[0]])
        .reduce((acc, [uri, content]) => ({...acc, [uri]: clean(content)}), {})

      const contents = xmlRoot.nameItems[0].nameitem
        .filter(({name}) => name)
        .map(({uri, name}) => [uri, name[0]])
        .reduce((acc, [uri, name]) => ({...acc, [uri]: name}), contentsTemp)

      const relationNames = xmlRoot.relations[0].relation
        .filter(({name}) => name)
        .map(({uri, name}) => [uri, name[0]])
        .reduce((acc, [uri, name]) => ({...acc, [uri]: name}), {})

      const statementNames = xmlRoot.statements[0].statement
        .filter(({p}) => p)
        .map(({uri, p}) => [uri, p[0]])
        .reduce((acc, [uri, p]) => ({...acc, [uri]: p}), {})

      // rootBodyId the body of the root node
      let rootBodyId
      const attributes = {}

      triples.forEach(({subject: id, predicate: p, object: o}) => {
        if (o.endsWith('#rootItem')) {
          rootBodyId = id
        }
        if (!id.startsWith('http://') && !p.startsWith('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')) {
          if (!attributes[id]) {
            attributes[id] = {}
          }
          attributes[id][p] = o
        }
      })

      let root
      if (rootBodyId) {
        root = Object.entries(attributes)
          .filter(([, att]) => att.hasBody === rootBodyId)
          .map(([id]) => id)
        if (root.length) {
          root = root[0]
        }
      }

      if (!root) {
        console.error(`Could not find the root node on map ${map._id}`)
        root = 'urn:imapping/root'
      }

      const edges = Object.fromEntries(
        Object.values(attributes)
          .filter(a => a.linksTo)
          .map(a => [
            generateEdgeId(a.linksFrom, a.linksTo),
            {
              id: generateEdgeId(a.linksFrom, a.linksTo),
              start: a.linksFrom,
              end: a.linksTo,
              title: entityDecode(relationNames[statementNames[a.representsCdsStatement]] || 'untitled'),
            },
          ]),
      )

      const rgbHex = /[A-F0-9]{6}/

      const childrenIds = Object.entries(attributes)
        .map(([id, {hasParent: parentId}]) => ({id, parentId}))
        .filter(({parentId}) => parentId)
        .reduce((acc, {id, parentId}) => ({...acc, [parentId]: [...(acc[parentId] || []), id]}), {})

      const getParentId = id => attributes[id].hasParent

      const getColor = id => {
        const color = attributes[attributes[id].hasBody].itemColor || false

        if (!color && getParentId(id)) {
          return getColor(getParentId(id))
        }

        if (color) {
          if (color[0] in colorTable) {
            return colorTable[color[0]]
          }
          const htmlColor = parseInt(color).toString(16).toUpperCase()
          if (htmlColor.length === 6 && rgbHex.test(htmlColor)) {
            return `#${htmlColor}`
          }
          console.error(`Could not get color for node ${id} in map ${map._id}`)

          return undefined
        }
        return undefined
      }

      const extractNode = id => {
        const attr = attributes[id]
        const body = attributes[attr.hasBody]
        const imageId = body['BackgroundPicturePath']

        const x = attr.hasPositionX * SCALE_MULTIPLIER_X || 0
        const y_shift = attr.hasPositionY >= Y_SHIFT ? Y_SHIFT : 0
        const y = (attr.hasPositionY - y_shift) * SCALE_MULTIPLIER_Y || 0
        const scale = attr.hasItemScale || 1
        const width = body.hasBellyWidth * SCALE_MULTIPLIER_X
        const expanded = attr.hasExpansionStatus === 'Expanded'
        const children = childrenIds[id]
        const image = imageIds[imageId]
        const imagePosition = imageId in imageIds ? IMAGE_POSITIONS.body : undefined
        const height =
          Number(body.hasHeadHeight) +
          (expanded || children || image ? Number(body.hasBellyHeight) : 0) * SCALE_MULTIPLIER_Y
        const title = entityDecode(contents[body['representsCdsItem']]) || undefined
        const color = getColor(id)

        return Object.fromEntries(
          Object.entries({
            id,
            title,
            image,
            imagePosition,
            parent: getParentId(id),
            scale,
            children,
            color,
            x,
            y,
            width,
            height,
          }).filter(([, value]) => value !== undefined),
        )
      }

      const nodes = {}
      let children = [root]
      // working in a while loop, because we are infinity and the call stack allows only 100 recursions
      while (children.length) {
        children.forEach(id => (nodes[id] = extractNode(id)))
        children = children.map(parentId => childrenIds[parentId]).reduce((flatList, l = []) => flatList.concat(l), [])
      }

      // remove x and y from root to set default to 0
      nodes[root].x = 0
      nodes[root].y = 0

      map.set({
        title: nodes[root].title,
        root,
        edges,
        nodes,
      })

      await map.save()

      // write starting changes to the automerge storage
      const changes = Automerge.getChanges(Automerge.init(), Automerge.from(JSON.parse(JSON.stringify(map.toJSON()))))
      const mapChanges = new MapChanges({mapId, changes, userId})
      await mapChanges.save()
    } catch (e) {
      logError(`Could not import map ${mapId}: ${e.message}`)
      if (!map.isNew) {
        await map.delete()
      }

      await Promise.all(
        Object.values(imageIds).map(async imageId => {
          const image = await MapImage.findOne({_id: imageId})
          await image.unlink()
        }),
      )
      throw e
    }
    log(`Imap import with id ${mapId} is done.`)
  }

  if (bigMap) {
    log('Big map will loaded asynchronously.')
    ctx.body = {mapId, wait: true}
    runAsync(runImport).then(() => log('done'))
  } else {
    ctx.body = {mapId}
    await runImport()
  }
}

const UploadImapController = {
  create: importImappingFile,
}

export default UploadImapController
