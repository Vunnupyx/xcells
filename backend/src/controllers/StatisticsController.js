import {ROLES} from '../shared/config/constants'
import InfinityMap from '../models/InfinityMap'
import User from '../models/User'

const toCsv = arrayOfArrays =>
  arrayOfArrays.map(array => array.map(field => String(field).replace([';', '\n', '\r'], '')).join(';')).join('\n')

export const userStatisticsAllMaps = async (userId = null) => {
  const mapNodeCount = {$size: {$ifNull: [{$objectToArray: '$nodes'}, []]}}
  const mapEdgeCount = {$size: {$ifNull: [{$objectToArray: '$edges'}, []]}}
  const mapSharedWith = {
    $ifNull: ['$share.access.subjectId', []],
  }
  const biggestMapCount = {$size: {$ifNull: [{$objectToArray: '$nodes'}, []]}}
  const sharedWithCount = {$size: {$ifNull: ['$share.access', []]}}
  const lastMapChange = {$max: '$updatedAt'}

  const pipeline = [
    {
      $project: {
        userId: 1,
        mapId: 1,
        createdAt: 1,
        updatedAt: 1,
        mapNodeCount,
        mapEdgeCount,
        mapSharedWith,
        title: 1,
        biggestMapCount,
        sharedWithCount,
      },
    },
    {
      $facet: {
        categorizedBySharedMap: [
          {
            $unwind: '$mapSharedWith',
          },
          {
            $group: {
              _id: '$mapSharedWith',
              mapShareCount: {$sum: 1},
            },
          },
        ],
        categorizedByOwnMap: [
          {
            $group: {
              _id: '$userId',
              mapId: {$addToSet: '$mapId'},
              mapCount: {$sum: 1},
              nodeCount: {$sum: '$mapNodeCount'},
              edgeCount: {$sum: '$mapEdgeCount'},
              biggestMapCount: {$max: '$biggestMapCount'},
              sharedWithCount: {$sum: '$sharedWithCount'},
              lastMapChange,
            },
          },
        ],
      },
    },
    {$project: {result: {$concatArrays: ['$categorizedBySharedMap', '$categorizedByOwnMap']}}},
    {$unwind: {path: '$result'}},
    {$replaceRoot: {newRoot: '$result'}},
    {
      $group: {
        _id: '$_id',
        mapCount: {$sum: '$mapCount'},
        mapShareCount: {$sum: '$mapShareCount'},
        nodeCount: {$sum: '$nodeCount'},
        edgeCount: {$sum: '$edgeCount'},
        mapIds: {$addToSet: '$mapId'},
        sharedWithCount: {$sum: '$sharedWithCount'},
        biggestMapCount: {$max: '$biggestMapCount'},
        lastMapChange: {$max: '$lastMapChange'},
      },
    },
  ]

  if (userId) {
    const filterUser = {$match: {$or: [{userId}, {'share.access.subjectId': userId}]}}
    const finalFilterUser = {$match: {_id: userId}}
    pipeline.unshift(filterUser)
    pipeline.push(finalFilterUser)
    return (await InfinityMap.aggregate(pipeline))[0]
  }

  console.log(await InfinityMap.aggregate(pipeline))
  return await InfinityMap.aggregate(pipeline)
}

const userStatisticsAllUsers = async () => {
  const users = Object.fromEntries((await userStatisticsAllMaps()).map(data => [data._id, data]))

  return Object.fromEntries(
    (await User.find()).map(user => {
      const userId = user.id
      const statistics = users[userId] || {}

      return [
        userId,
        {
          id: userId,
          name: user.name || '',
          mail: user.mail || '',
          roles: user.roles || [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          limitMaps: user.limitMaps || null,
          limitNodes: user.limitNodes || null,
          lastMapChange: statistics?.lastMapChange || null,
          biggestMapCount: statistics?.biggestMapCount || null,
          mapCount: statistics?.mapCount || 0,
          mapShareCount: statistics?.mapShareCount || 0,
          sharedWithCount: statistics?.sharedWithCount || 0,
          mapIds: statistics?.mapIds || null,
          sharedMaps: statistics?.sharedMaps || 0,
          nodeCount: statistics?.nodeCount || 0,
          edgeCount: statistics?.edgeCount || 0,
          meta: user.meta || {},
          comment: user.comment,
        },
      ]
    }),
  )
}

const StatisticsController = {
  authorization: (ctx, next) => {
    const {auth} = ctx.state

    if (!auth?.roles.includes(ROLES.administrator)) {
      ctx.throw(403, 'This endpoint is only available for administrators.')
    }

    return next()
  },
  userLoad: async (id, ctx, next) => {
    const statisticsUser = await User.findOne({id: id})
    ctx.statisticsUser = statisticsUser
    if (!statisticsUser) ctx.throw(404, 'User not found.')

    return await next()
  },
  mapsServe: async ctx => {
    const cursor = InfinityMap.find().cursor()

    const lines = [['mapId', 'userId', 'title', 'nodeCount', 'edgeCount', 'shareCount']]
    for (let obj = await cursor.next(); obj !== null; obj = await cursor.next()) {
      const json = obj.toJSON()
      lines.push([
        json.mapId,
        json.userId,
        json.title,
        Object.keys(json.nodes || {}).length,
        Object.keys(json.edges || {}).length,
        json.share?.access.length || 0,
      ])
    }

    ctx.body = lines
  },
  mapsCsv: async ctx => {
    ctx.set('Content-disposition', "attachment; filename*=UTF-8''maps.csv")
    ctx.type = 'text/csv'
    ctx.body = toCsv(ctx.state.lines)
  },
  userActivity: async ctx => {
    ctx.body = await userStatisticsAllMaps()
  },
  userList: async ctx => {
    ctx.body = await userStatisticsAllUsers()
  },
  userStatistics: async ctx => {
    const {statisticsUser} = ctx
    if (!statisticsUser) ctx.throw(404, 'User not found.')

    const {id} = statisticsUser
    const statistics = await userStatisticsAllMaps(id)

    ctx.body = {
      id: statisticsUser.id,
      name: statisticsUser.name,
      mail: statisticsUser.mail,
      roles: statisticsUser.roles,
      comment: statisticsUser.comment,
      createdAt: statisticsUser.createdAt,
      updatedAt: statisticsUser.updatedAt,
      lastMapChange: statistics?.lastMapChange || null,
      limitMaps: statisticsUser.limitMaps || null,
      limitNodes: statisticsUser.limitNodes || null,
      biggestMapCount: statistics?.biggestMapCount || 0,
      mapCount: statistics?.mapCount || 0,
      mapShareCount: statistics?.mapShareCount || 0,
      sharedWithCount: statistics?.sharedWithCount || 0,
      mapIds: statistics?.mapIds || null,
      nodeCount: statistics?.nodeCount || 0,
      edgeCount: statistics?.edgeCount || 0,
      meta: statisticsUser.meta || {},
    }
  },
  userComment: async ctx => {
    const {statisticsUser} = ctx
    const payload = await ctx.request.json()
    statisticsUser.comment = payload.data
    await statisticsUser.save()
    ctx.body = {success: true}
  },

  userMapStatistics: async ctx => {
    const {statisticsUser} = ctx
    if (!statisticsUser) ctx.throw(400, 'User not found.')
    const userId = statisticsUser.id
    const filterUser = {$match: {$or: [{userId}, {'share.access.subjectId': userId}]}}

    const mapNodeCount = {$size: {$ifNull: [{$objectToArray: '$nodes'}, []]}}
    const mapEdgeCount = {$size: {$ifNull: [{$objectToArray: '$edges'}, []]}}
    const sharedWithCount = {$size: {$ifNull: ['$share.access', []]}}
    const role = {
      $ifNull: [
        {
          $reduce: {
            input: {
              $filter: {
                input: '$share.access',
                as: 'shared',
                cond: {$eq: ['$$shared.subjectId', userId]},
              },
            },
            initialValue: null,
            in: '$$this.role',
          },
        },
        'owner',
      ],
    }

    const publicMap = {$ifNull: ['$share.public.enabled', false]}
    const hiddenMap = {$ifNull: ['$share.public.hidden', true]}
    const exportData = {
      $project: {
        userId: 1,
        mapId: 1,
        createdAt: 1,
        updatedAt: 1,
        mapNodeCount,
        mapEdgeCount,
        title: 1,
        role: role,
        sharedWithCount,
        public: publicMap,
        hidden: hiddenMap,
      },
    }

    const titleCondition = {
      $cond: {if: {$eq: ['$public', true]}, then: '$title', else: undefined},
    }

    const filterTitle = {
      $project: {
        userId: 1,
        mapId: 1,
        createdAt: 1,
        updatedAt: 1,
        mapNodeCount: 1,
        mapEdgeCount: 1,
        title: titleCondition,
        sharedWithCount: 1,
        public: 1,
        hidden: 1,
        role: 1,
      },
    }

    const sort = {$sort: {updatedAt: -1}}

    ctx.body = await InfinityMap.aggregate([filterUser, exportData, filterTitle, sort])
  },

  userWaitlist: async ctx => {
    ctx.body = await User.find({confirmed: false}, {id: 1, name: 1, mail: 1})
  },

  activateUser: async ctx => {
    const {statisticsUser} = ctx
    if (statisticsUser.confirmed) ctx.throw(400, 'User is not pending activation')
    statisticsUser.confirmed = true
    await statisticsUser.save()
    ctx.body = {success: true}
  },
}

export default StatisticsController
