import User from '../models/User'
import InfinityMap from '../models/InfinityMap'
import escapeRegexString from './utils/escapeRegexString'
import {userStatisticsAllMaps} from './StatisticsController'

const UserController = {
  authorization: async (ctx, next) => {
    const {userId} = ctx.state

    if (!userId && ctx.method.toUpperCase() !== 'GET') {
      ctx.throw(401, 'Authentication needed.')
    }

    await next()
  },
  get: async ctx => {
    const {userId} = ctx.params

    if (!userId) {
      ctx.throw(400, 'No username found.')
    }

    const user = await User.findOne({id: userId}, {name: 1})

    if (user) {
      ctx.body = user
    } else {
      ctx.throw(404, 'User not found.')
    }
  },
  currentUserStatistics: async ctx => {
    const userId = ctx.state.auth.sub

    const user = await User.findOne({id: userId})

    const statistics = await userStatisticsAllMaps(userId)

    ctx.body = {
      id: user.id,
      name: user.name,
      mail: user.mail,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastMapChange: statistics?.lastMapChange || null,
      limitMaps: user.limitMaps || null,
      limitNodes: user.limitNodes || null,
      mapCount: statistics?.mapCount || 0,
      mapShareCount: statistics?.mapShareCount || 0,
      nodeCount: statistics?.nodeCount || 0,
      edgeCount: statistics?.edgeCount || 0,
      fieldsOfWork: user.meta.store.fieldsOfWork || null,
    }
  },
  search: async ctx => {
    const {userId} = ctx.state
    const {query} = ctx.query

    if (!query) {
      ctx.throw(400, 'No query given.')
    }

    let regex = new RegExp(`^${escapeRegexString(query)}.*$`, 'i')

    if (query.length < 3) {
      regex = new RegExp(`^${escapeRegexString(query)}$`, 'i')
    }

    const result = []

    const myUsers = await InfinityMap.aggregate([
      {$match: {userId, 'share.access': {$exists: 1}}},
      {$unwind: '$share.access'},
      {$replaceRoot: {newRoot: '$share.access'}},
      {$match: {subjectType: 'user'}},
      {$group: {_id: '$subjectId'}},
      {
        $lookup: {
          from: User.collection.name,
          localField: '_id',
          foreignField: 'id',
          as: 'user',
        },
      },
      {$unwind: '$user'},
      {$replaceRoot: {newRoot: '$user'}},
      {$match: {id: regex}},
      {$project: {name: 1, mail: 1, _id: 0}},
    ])

    if (myUsers) result.push(...myUsers)

    const allUsers = await User.find({name: regex}, {id: 1, name: 1})

    if (allUsers) result.push(...allUsers)

    ctx.body = result
  },
  searchMail: async ctx => {
    const {query} = ctx.query

    if (!query) {
      ctx.throw(400, 'No query given.')
    }

    const user = await User.findOne({mail: new RegExp(`^${escapeRegexString(query)}$`, 'i')}, {id: 1, name: 1})

    if (!user) {
      ctx.throw(404, 'No user found.')
    }

    ctx.body = user
  },
}

export default UserController
