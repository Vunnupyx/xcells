import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import NODE_ELEMENT_TYPES from '../../../elements/node/NODE_ELEMENT_TYPES'

import type PixiNode from '../../../PixiNode'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeEdit')

type State = {
  node: PixiNode
  wasEdited: boolean
}

class NodeEditSelectAll extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.node

  selection = 'selectAll'

  state: State | null = null

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    this.state = {node, wasEdited: node.state.isEdited}
  }

  up = (event: RenderEngineEvent): void => {
    const {type} = event.target || {}
    const {selection} = this
    const {node, wasEdited} = this.state || {}

    if (!node) return

    log('up', node, selection)

    const {isSelected} = node.state

    if (isSelected && !wasEdited && !(type === NODE_ELEMENT_TYPES.text && (node.isUrl || node.isEmail))) {
      node.openTextField(undefined, selection)
      trackAction('editNodeSelect', {method: 'PointerAction', selection})
    }
  }
}

export {NodeEditSelectAll}
