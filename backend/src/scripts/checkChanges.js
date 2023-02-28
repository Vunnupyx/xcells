/**
 * This script is meant to analyse the automerge Append Only Log for errors
 * In the example used here, a whole workday was lost by jana, when creating a map for a client
 */

import Automerge from 'automerge'
import {fromJS} from 'immutable'
import crypto from 'crypto'
import {changes} from '/home/rlutz/data/infinity/changes/jana-20210107.json'

changes.splice(1136, 1)
changes.splice(1413, 1)
changes.splice(1417, 1)
changes.splice(1463, 1)
changes.splice(1495, 1)
changes.splice(1510, 1)
changes.splice(1538, 1)
changes.splice(1568, 1)
changes.splice(1597, 1)
changes.splice(1608, 1)
changes.splice(3305, 1)

const loadedDoc = Automerge.applyChanges(Automerge.init(), fromJS(changes))

console.log(JSON.stringify(loadedDoc).replace("'", "\\'"))

const loadedChanges = Automerge.Frontend.getBackendState(loadedDoc).getIn(['opSet', 'history']).toJS()

const index = process.argv[2]

const original = {length: changes.length, changesLength: changes[index].ops.length, changes: changes[index].ops}

const loaded = {
  length: loadedChanges.length,
  changesLength: loadedChanges[index].ops.length,
  changes: loadedChanges[index].ops,
}

console.log(`index: ${index}, original changes: `, original, 'new changes: ', loaded)

const hash = crypto.createHash('md5')
const hashLoaded = crypto.createHash('md5')

for (const i of Array(3572).keys()) {
  // if (changes[i].ops.length !== loadedChanges[i].ops.length || changes[i].actor !== loadedChanges[i].actor) {
  if (JSON.stringify(changes[index]) === JSON.stringify(loadedChanges[i])) {
    console.log(
      'found at',
      i,
      'for',
      index,
      hash.update(JSON.stringify(changes[index]), 'utf8').digest('hex').toString(),
      hashLoaded.update(JSON.stringify(loadedChanges[i]), 'utf8').digest('hex').toString(),
    )
    break
  }
}

let lastChangeJson = JSON.stringify(changes.shift())
let i = 0
for (const change of changes) {
  i += 1
  const currentChangeJson = JSON.stringify(change)
  if (lastChangeJson === currentChangeJson) {
    console.log('same as before: ', i)
  }
  lastChangeJson = currentChangeJson
}

for (const i of Array(changes.length).keys()) {
  const loadChanges = changes.slice(0, i)

  const doc = Automerge.applyChanges(Automerge.init(), fromJS(loadChanges))

  console.log('for', i, 'from', loadChanges.length, 'nodes length:', Object.keys(doc.nodes || {}).length)
}
