import mongoose from 'mongoose'

import createSchema from './utils/createSchema'
import {Edge, Node} from './InfinityMap'

const Share = createSchema(
  {
    public: Boolean,
  },
  {_id: false, timestamps: false},
)

const InfinityTemplateSchema = createSchema({
  userId: {type: String, required: true, index: true},
  name: {type: String, required: true},
  keywords: [String],
  nodes: {type: Map, of: Node, required: true},
  edges: {type: Map, of: Edge},
  root: {type: String, required: true},
  share: Share,
})

InfinityTemplateSchema.methods.isPublic = function () {
  return this.share && !!this.share.public
}

const Template = mongoose.model('Template', InfinityTemplateSchema)

export default Template
