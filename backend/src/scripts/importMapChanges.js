import Automerge from 'automerge'
import fs from 'fs/promises'

import {closeDb, connectDb} from '../db'
import InfinityMap from '../models/InfinityMap'
import MapChanges from '../models/MapChanges'

const args = process.argv.slice(2)

if (args.length !== 2) {
  console.log(`usage: ${process.argv[0]} ${process.argv[1]} <path-to-import-file> <user-id>`)
  process.exit(1)
}

const [filePath, userId] = args

const compact = async () => {
  try {
    await connectDb()

    const changes = JSON.parse(await fs.readFile(filePath))

    const doc = Automerge.applyChanges(Automerge.init(), changes)

    const {mapId} = doc

    await new InfinityMap({mapId, userId}).save()

    await new MapChanges({mapId, userId, changes}).save()

    console.log(`imported ${changes.length} changes for map ${mapId}`)
  } catch (e) {
    console.error('error while exporting map', e)
  } finally {
    await closeDb()
  }
}

compact()
