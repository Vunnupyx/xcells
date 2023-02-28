import PixiNode from '../../../PixiNode'

import Lan from '../../../../intl/map.en'
import {DataTransferContent, PASTE_ACTION_TYPES} from '../types'
import AbstractPasteAction from '../AbstractPasteAction'

class PasteText extends AbstractPasteAction {
  type = PASTE_ACTION_TYPES.text

  name = Lan.pasteActionNames.pasteText

  accepts = ({text}: DataTransferContent): boolean => {
    return text !== undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  paste = (node: PixiNode, {text}: DataTransferContent, onMessage: (id: string) => void): void => {
    const {manager} = this
    const style = {title: text}
    manager.setNodeProperties(node, style, true)
  }
}

export {PasteText}
