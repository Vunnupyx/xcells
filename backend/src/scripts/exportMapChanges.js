import debug from 'debug'

import {closeDb, connectDb} from '../db'
import MapChanges from '../models/MapChanges'

const log = debug('infinity:scripts:exportMapChanges')

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.log(`usage: ${process.argv[0]} ${process.argv[1]} <mapId>`)
  process.exit(1)
}

const [mapId] = args

const dumpChanges = async () => {
  try {
    await connectDb()

    const changes = await MapChanges.findOne({mapId})

    if (!changes) {
      console.error('Did not find the map')
      return
    }

    console.log(JSON.stringify(changes.toJSON().changes))
  } catch (e) {
    log.extend(':ERROR')('error while exporting map changes', e)
  } finally {
    await closeDb()
  }
}

dumpChanges()
