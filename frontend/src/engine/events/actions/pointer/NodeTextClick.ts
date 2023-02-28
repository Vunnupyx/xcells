import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeTextClick')

class NodeTextClick extends PointerActionClick {
  isChanging = false

  category = TARGET_CATEGORIES.node

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    this.state = {node}
  }

  up = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('up', node)

    const {title, isUrl, isEmail} = node
    const {isSelected} = node.state

    if (title && !isSelected) {
      if (isUrl) {
        trackAction('followLinkUrl', {method: 'PointerAction'})
        window.open((title.startsWith('http') ? '' : 'http://') + title, '_blank')
      }
      if (isEmail) {
        trackAction('followLinkEmail', {method: 'PointerAction'})
        window.open(`mailto:${title}`)
      }
    }
  }
}

export {NodeTextClick}
