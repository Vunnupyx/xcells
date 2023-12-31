import Automerge from 'automerge'
import fs from 'fs/promises'
import {Readable} from 'stream'
import debug from 'debug'

import {closeDb, connectDb} from '../db'
import InfinityMap from '../models/InfinityMap'
import MapImage from '../models/MapImage'
import MapFile from '../models/MapFile'
import MapChanges from '../models/MapChanges'

const log = debug('infinity:scripts:exportMap')

const args = process.argv.slice(2)

if (args.length !== 2) {
  console.log(`usage: ${process.argv[0]} ${process.argv[1]} <path-to-import-file> <user-id>`)
  process.exit(1)
}

const [filePath, userId] = args

const saveFile = async (Model, {data, _id, filename, metadata}) => {
  const file = new Model({_id, filename, metadata})
  const readable = new Readable()
  readable._read = () => {}
  readable.push(Buffer.from(data, 'base64'))
  readable.push(null)

  await file.write(readable)
}

const compact = async () => {
  try {
    await connectDb()

    const {images, documents, ...mapData} = JSON.parse(await fs.readFile(filePath))
    const {mapId} = mapData

    await Promise.all(images.map(image => saveFile(MapImage, image)))
    await Promise.all(documents.map(image => saveFile(MapFile, image)))

    await new InfinityMap({...mapData, userId}).save()

    const compactDoc = Automerge.from(mapData)

    const changes = Automerge.Frontend.getBackendState(compactDoc).getIn(['opSet', 'history']).toJS()

    await new MapChanges({mapId, userId, changes}).save()
  } catch (e) {
    log.extend(':ERROR')('error while exporting map', e)
  } finally {
    await closeDb()
  }
}

compact()
