import Automerge from 'automerge'
import debug from 'debug'
import {fromJS} from 'immutable'

import {closeDb, connectDb} from '../db'
import MapChanges from '../models/MapChanges'

const log = debug('infinity:scripts:compactMap')

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.log(`usage: ${process.argv[0]} ${process.argv[1]} <mapId>`)
  process.exit(1)
}

const [mapId] = args

const compact = async () => {
  try {
    await connectDb()
    const mapChanges = await MapChanges.findOne({mapId})
    const oldOpsSize = mapChanges.changes.map(c => c.ops?.length || 0).reduce((l, acc) => acc + l, 0)
    const oldSize = mapChanges.changes.length

    const fullDoc = Automerge.applyChanges(Automerge.init(), fromJS(mapChanges.toJSON().changes))

    const compactDoc = Automerge.from(JSON.parse(JSON.stringify(fullDoc)))

    const changes = Automerge.Frontend.getBackendState(compactDoc).getIn(['opSet', 'history']).toJS()
    const opsSize = changes.map(c => c.ops?.length || 0).reduce((l, acc) => acc + l, 0)

    await MapChanges.findOneAndUpdate({mapId}, {$set: {changes}})

    log(`compacted changes from ${oldSize} to ${changes.length}, operations from ${oldOpsSize} to ${opsSize}`)
  } catch (e) {
    log.extend(':ERROR')('error while compacting map', e)
  } finally {
    await closeDb()
  }
}

compact()
