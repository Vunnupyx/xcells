import debug from 'debug'

import {closeDb, connectDb} from '../db'
import InfinityMap from '../models/InfinityMap'
import MapImage from '../models/MapImage'
import MapFile from '../models/MapFile'

const log = debug('infinity:scripts:exportMap')

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.log(`usage: ${process.argv[0]} ${process.argv[1]} <mapId>`)
  process.exit(1)
}

const [mapId] = args

const readToBuffer = readStream =>
  new Promise((resolve, reject) => {
    const data = []
    readStream.on('data', chunk => data.push(chunk))
    readStream.on('error', reject)
    readStream.on('end', () => resolve(Buffer.concat(data)))
  })

const fileToBase64 = async file => {
  const data = Buffer.from(await readToBuffer(file.read())).toString('base64')
  return {...file.toJSON(), data}
}

const compact = async () => {
  try {
    await connectDb()

    const map = await InfinityMap.findOne({mapId}, {mapId: 1, title: 1, nodes: 1, edges: 1, root: 1, _id: 0})

    if (!map) {
      console.error('Did not find the map')
      return
    }
    const imageList = await MapImage.find({'metadata.mapId': mapId})
    const images = await Promise.all((imageList || []).map(fileToBase64))

    const documentList = await MapFile.find({'metadata.mapId': mapId})
    const documents = await Promise.all((documentList || []).map(fileToBase64))

    console.log(JSON.stringify({...map.toJSON(), images, documents}))
  } catch (e) {
    log.extend(':ERROR')('error while exporting map', e)
  } finally {
    await closeDb()
  }
}

compact()
