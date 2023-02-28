// const Automerge = require('automerge')
// const {fromJS} = require('immutable')

// console.log(JSON.stringify(JSON.parse(Automerge.save(Automerge.from({test: "test"}))), 0, 2))

// const oldDoc = Automerge.init()
// let newDoc = Automerge.change(oldDoc, doc => doc.test = 'test')
// newDoc = Automerge.change(newDoc, doc => doc.test2 = 'test2')
// newDoc = Automerge.change(newDoc, doc => doc.test = 'test3')
// newDoc = Automerge.change(newDoc, doc => doc.test2 = 'test4')
// const fromDoc = Automerge.from({test: "test"})

// console.log(JSON.stringify(Automerge.getChanges(oldDoc, newDoc), 0, 2))
// console.log(JSON.stringify(Automerge.getChanges(oldDoc, fromDoc), 0, 2))

// console.log(JSON.stringify(JSON.parse(Automerge.save(newDoc)), 0, 2))
// console.log(JSON.stringify(JSON.parse(Automerge.save(fromDoc)), 0, 2))

// console.log(JSON.stringify(Automerge.Frontend.getBackendState(newDoc), 0, 2))

// const m = {deps: {}}

// const c = JSON.parse('[ { "diffs" : [ ], "ops" : [ { "action" : "set", "obj" : "00000000-0000-0000-0000-000000000000", "key" : "mapId", "value" : "6gmTp8pLfp7" } ], "actor" : "086955c2-4c2b-4137-969a-b8fe0cef264f", "seq" : 1, "deps" : {  }, "message" : "map.create" } ]')

// console.log(fromJS(c).get(0).get('deps').set('test', 1))
// const mongoose = require('mongoose')
//
// const schema = mongoose.Schema({test: String})
//
// const model = mongoose.model('Test', schema)
//
// const CONNECT_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/imaps'
// // mongoose.connect(CONNECT_URL, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// //   useCreateIndex: true,
// //   useFindAndModify: false,
// // })
//
// const test = new model()
//
// test.set({test: 'TEST'})
//
// // test.save()
//
// console.log(test.toObject())
// console.log(test.toJSON())
// console.log(Automerge.getChanges(Automerge.init(), Automerge.from(test.toObject()))[0])
// console.log(Automerge.getChanges(Automerge.init(), Automerge.from(test.toJSON()))[0])
//
// // mongoose.disconnect()

// const doc1 = Automerge.from({nodes: {n: {test: 1}}})
//
// const doc2 = Automerge.change(doc1, 'mutate test', doc => {
//   doc.nodes.n.test = 2
// })
//
// const doc3 = Automerge.change(doc2, 'mutate test', doc => {
//   doc.nodes.n.test = 1
// })
//
// console.log(doc1.nodes.n, doc3.nodes.n, doc1.nodes.n === doc3.nodes.n, doc1.nodes === doc3.nodes)
//
// const doc = Automerge.init()
//
// const changedDoc = Automerge.change(doc, 'aChange', doc => (doc.test = 'test'))
//
// const undoneDoc = Automerge.undo(changedDoc)
//
// console.log(
//   Automerge.getHistory(undoneDoc).map(({change, snapshot}) => {
//     console.log(change)
//     console.log(snapshot)
//   }),
// )
