import mongoose from 'mongoose'

import createSchema from './utils/createSchema'

const Openai = createSchema(
  {
    apiKey: String,
    model: String,
    user: String,
    suffix: String,
  },
  {_id: false, timestamps: false},
)

const IntegrationSchema = createSchema({
  userId: {type: String, required: true, index: true},
  openai: Openai,
})

const Integration = mongoose.model('Integration', IntegrationSchema)

export default Integration
