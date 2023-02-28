import debug from 'debug'

import PointerActionHover from '../PointerActionHover'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import type PixiNode from '../../../PixiNode'

const log = debug('app:Event:NodeTextHover')
const logFlood = log.extend('FLOOD', '::')

type State = {
  node: PixiNode
}

class NodeTextHover extends PointerActionHover {
  isChanging = false

  category = TARGET_CATEGORIES.node

  state: State | null = null

  getCursor(): string | null {
    if (!this.state?.node) return null
    if (this.state.node.isUrl && this.state.node.state.isSelected) return 'pointer'
    if (this.manager.store.isWriteable) return 'text'
    return null
  }

  move = (event: RenderEngineEvent): void => {
    const {node: targetNode} = event.target

    logFlood('move', targetNode)

    if (targetNode) {
      if (this.state?.node !== targetNode) {
        this.state = {node: targetNode}
      }
    } else {
      this.state = null
    }
  }

  reset = (): void => {
    this.state = null
  }
}

export {NodeTextHover}
