import createSchema from './utils/createSchema'
import {model, Schema} from 'mongoose'

const {Types} = Schema

const Operation = new Schema(
  {
    action: String,
    obj: String,
    key: String,
    value: Types.Mixed,
    elem: Number,
    datatype: String,
  },
  {_id: false, minimize: false},
)

const Change = new Schema(
  {
    message: String,
    requestType: String,
    actor: String,
    seq: Number,
    deps: Types.Object,
    ops: [Operation],
    diffs: [Types.Mixed],
  },
  {_id: false, minimize: false},
)

const MapChangeSchema = createSchema(
  {
    mapId: {type: String, index: true, required: true},
    userId: {type: String, index: true},
    changes: [Change],
  },
  {minimize: false},
)

const MapChanges = model('MapChanges', MapChangeSchema)

export default MapChanges
