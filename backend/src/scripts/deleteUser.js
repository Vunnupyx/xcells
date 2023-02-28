import debug from 'debug'

import {closeDb, connectDb} from '../db'
import InfinityMap from '../models/InfinityMap'
import MapController from '../controllers/MapController'
import Template from '../models/Template'
import User from '../models/User'

const log = debug('infinity:scripts:deleteUser')
const logError = log.extend('ERROR*', '::')

const args = process.argv.slice(2)

const validGroups = ['customer', 'subscriber', 'org_subscriber', 'administrator']

if (args.length !== 1) {
  console.log(`usage: ${process.argv[0]} <userId>`)
  console.log(`groups: ${validGroups.join(',')}`)
  process.exit(1)
}

const [userId] = args

const deleteUser = async () => {
  try {
    log('delete all user related content', userId)

    await connectDb()

    const mapIds = (await InfinityMap.find({userId}, {mapId: 1})).map(({mapId}) => mapId)

    if (mapIds) {
      // use map controller to delete map related stuff
      await Promise.all(
        mapIds.map(mapId => {
          const ctx = {params: {mapId}, state: {access: {isOwner: true}}}

          log('deleting map', mapId)

          return MapController.delete(ctx)
        }),
      )
    }

    await Template.deleteMany({userId})

    await User.deleteOne({userId})

    log(`successfully deleted user ${userId}`)
    await closeDb()
  } catch (e) {
    logError('Error while saving the user', e)
    await closeDb()
  }
}

deleteUser()
