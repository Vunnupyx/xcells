import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import {API_BASE_PATH} from '../../../../shared/config/constants'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import {trackAction} from '../../../../contexts/tracking'

const log = debug('app:Event:NodeDownloadFile')

class NodeDownloadFile extends PointerActionClick {
  isChanging = false

  category = TARGET_CATEGORIES.node

  cursor = 'pointer'

  down = (event: RenderEngineEvent): void => {
    const {node} = event.target || {}

    if (!node) return

    log('down', node)

    this.state = {node}
  }

  up = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {node} = event.target || {}

    if (!node) return

    log('up', node)

    const {file} = node
    const {mapId} = manager.engine.store
    const {protocol, host} = window.location

    if (file) {
      trackAction('downloadFile', {method: 'PointerAction'})
      window.open(`${protocol}//${host}${API_BASE_PATH}/maps/${mapId}/files/${file}`, '_blank')
    }
  }
}

export {NodeDownloadFile}
