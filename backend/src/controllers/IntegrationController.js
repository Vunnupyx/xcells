import Integration from '../models/Integration'

const IntegrationController = {
  authorization: async (ctx, next) => {
    const {userId} = ctx.state

    if (!userId) {
      ctx.throw(401, 'Authentication needed.')
    }

    await next()
  },
  get: async ctx => {
    const {userId} = ctx.state

    const integration = await Integration.findOne({userId}, {openai: 1, _id: 0})
    if (!integration) {
      ctx.throw(404, 'Integration not found')
    }
    ctx.body = integration
  },
  updateOpenai: async ctx => {
    const {userId} = ctx.state
    const openai = await ctx.request.json()

    if (!openai || !openai.apiKey) {
      ctx.throw(400, 'Must be a OpenAI API KEY')
    }

    const update = {$set: {userId, openai}}
    const options = {upsert: true}
    await Integration.updateOne({userId}, update, options)

    ctx.body = {success: true}
  },
}

export default IntegrationController
