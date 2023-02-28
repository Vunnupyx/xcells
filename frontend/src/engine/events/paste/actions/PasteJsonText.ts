import debug from 'debug'
import PixiNode from '../../../PixiNode'
import StackPacker from '../../../reorg-algorithm/cardpacker-implementations/BoxPacker/StackPacker'
import InfinityTraversal from '../../../reorg-algorithm/InfinityTraversal'
import JsonTemplate from '../json-template/JsonTemplate'

import Lan from '../../../../intl/map.en'
import AbstractPasteAction from '../AbstractPasteAction'
import {DataTransferContent, PASTE_ACTION_TYPES} from '../types'

const log = debug('infinity:app:rest*')
const logError = log.extend('ERROR*', '::')

class PasteJsonText extends AbstractPasteAction {
  type = PASTE_ACTION_TYPES.text

  name = Lan.pasteActionNames.pasteJson

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accepts = ({text}: DataTransferContent): boolean => {
    if (!text) return false
    try {
      JSON.parse(text)
      return true
    } catch (e) {
      return false
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  paste = (node: PixiNode, {text}: DataTransferContent, onMessage: (id: string) => void): void => {
    if (!text) return

    try {
      const object = JSON.parse(text)
      const template = new JsonTemplate(object)
      this.manager.setNodeTemplate(node, template.template)
    } catch (e) {
      logError(`text could not be converted to json-object: ${text}`)
    }
  }

  afterPaste = (node: PixiNode): void => {
    this.manager.engine.control.reorgNodes(InfinityTraversal.INFINITE_DEPTH, new StackPacker(Number.MIN_VALUE), node)
  }
}

export {PasteJsonText}
