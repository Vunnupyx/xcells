import {upload} from '../../../../utils/datatransferAndFiles'
import CONFIG from '../../../CONFIG'
import PixiNode from '../../../PixiNode'

import Lan from '../../../../intl/map.en'
import AbstractPasteAction from '../AbstractPasteAction'
import {DataTransferContent, PASTE_ACTION_TYPES} from '../types'

class PasteFile extends AbstractPasteAction {
  type = PASTE_ACTION_TYPES.file

  name = Lan.pasteActionNames.pasteFile

  private findFile = (files: File[]): File | undefined => {
    const isImage = (f: File) => f.type.startsWith('image/')
    return files.find(file => !isImage(file))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accepts = ({files}: DataTransferContent): boolean => {
    if (!files) return false
    return this.findFile(files) !== undefined
  }

  paste = async (node: PixiNode, {files}: DataTransferContent, onMessage: (id: string) => void): Promise<void> => {
    if (!files) return

    const file = this.findFile(files)
    if (!file) return

    const result = await upload(file, this.manager.store.mapId, onMessage)
    if (!result) return

    const style = {
      file: result.apiAnswer._id,
      title: file.name,
      ...CONFIG.nodes.addFileSettings.style,
    }
    this.manager.setNodeProperties(node, style, true)
  }
}

export {PasteFile}
