// import Automerge from 'automerge'
import {closeDb, connectDb} from '../../db'

import InfinityMap from '../../models/InfinityMap'
import {IMAGE_POSITIONS} from '../../shared/config/constants'
// import MapChanges from '../models/map-changes'

const run = async () => {
  await connectDb()

  const cursor = InfinityMap.find({imagePosition: null}).cursor()

  for (let map = await cursor.next(); map !== null; map = await cursor.next()) {
    console.log(`map ID: ${map._id}`)
    let changed = false
    if (map.nodes) {
      map.nodes.forEach(node => {
        console.log(`node and image ID: ${node.id} ${node.image}`)
        if (node.image) {
          changed = true
          if (node.id.startsWith('urn:imapping')) {
            node.imagePosition = IMAGE_POSITIONS.body
          } else {
            node.imagePosition = IMAGE_POSITIONS.stretch
          }
        }
      })
    }

    if (changed) {
      // const changes = MapChanges.find({mapId: map.mapId})

      await map.save()
    }
  }

  await closeDb()
}

run()
