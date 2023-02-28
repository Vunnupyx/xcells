import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'

const log = debug('app:Event:EdgeEdit')

class EdgeEdit extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.edge

  down = (event: RenderEngineEvent): void => {
    const {edge} = event.target || {}

    if (!edge) return

    log('down', edge)

    this.state = {edge}
  }

  up = (event: RenderEngineEvent): void => {
    const {edge} = event.target || {}

    if (!edge) return

    log('up', edge)

    const {textField} = edge
    const {isSelected} = edge.state

    if (!textField && isSelected) {
      edge.openTextField(edge.title, 'selectAll')
    }
  }
}

export {EdgeEdit}
