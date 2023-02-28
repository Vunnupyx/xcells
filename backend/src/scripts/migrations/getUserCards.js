import debug from 'debug'

import {closeDb, connectDb} from '../../db'
import InfinityMap from '../../models/InfinityMap'
import ClientError from '../../models/ClientError'
import MapChanges from '../../models/MapChanges'
import Template from '../../models/Template'
import MapFile from '../../models/MapFile'
import MapImage from '../../models/MapImage'
import Thumbnail from '../../models/Thumbnail'

const log = debug('infinity:migrations:setUserId::INFO')
const logError = debug('infinity:migrations:setUserId::ERROR')

const stringifyUserId = async cursor => {
  for (let obj = await cursor.next(); obj !== null; obj = await cursor.next()) {
    log(`obj ID: ${obj._id}`, typeof obj.userId)
    if (obj.userId) {
      if (typeof obj.userId !== 'string') {
        const userId = obj.userId.toString()
        obj.userId = 'none'
        obj.userId = userId
        log('save as string', obj._id, obj.isModified())
        try {
          await obj.save()
        } catch (e) {
          logError(`could not save ${obj._id}`, e.message)
        }
      } else {
        log('user id already a string')
      }
    } else {
      logError('ERROR: NO USER ID FOUND')
    }
  }
}

const stringifyFridFsUserId = async cursor => {
  for (let obj = await cursor.next(); obj !== null; obj = await cursor.next()) {
    log(`obj ID: ${obj._id}`)
    if (obj.metadata) {
      if (typeof obj.metadata.userId !== 'string') {
        const userId = obj.metadata.userId.toString()
        obj.metadata.userId = 'none'
        obj.metadata.userId = userId
        log('saved as string', obj._id, obj.isModified())
        try {
          await obj.save()
        } catch (e) {
          logError(`could not save ${obj._id}`, e.message)
        }
      } else {
        log('user id already a string')
      }
    } else {
      logError('ERROR: NO USER ID FOUND')
    }
  }
}

const run = async () => {
  await connectDb()

  const models = [InfinityMap, ClientError, MapChanges, Template]

  for (const m of models) {
    log('###################################################')
    log(`Working on ${m.modelName}`)
    await stringifyUserId(m.find().cursor())
  }

  const gridFsModels = [MapFile.model, MapImage.model, Thumbnail.model]

  for (const m of gridFsModels) {
    log('###################################################')
    log(`Working on ${m.modelName}`)
    await stringifyFridFsUserId(m.find().cursor())
  }

  await closeDb()
}

run()
