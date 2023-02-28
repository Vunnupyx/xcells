import {ImageDims, upload} from '../../../../utils/datatransferAndFiles'
import CONFIG from '../../../CONFIG'
import PixiNode from '../../../PixiNode'
import {NodeData} from '../../../types'
import {DataTransferContent, PASTE_ACTION_TYPES} from '../types'

import Lan from '../../../../intl/map.en'
import AbstractPasteAction from '../AbstractPasteAction'

class PasteImage extends AbstractPasteAction {
  type = PASTE_ACTION_TYPES.file

  name = Lan.pasteActionNames.pasteImage

  imageDims?: ImageDims = undefined

  private findImage = (files: File[]): File | undefined => {
    const isImage = (f: File) => f.type.startsWith('image/')
    return files.find(isImage)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accepts = ({files}: DataTransferContent): boolean => {
    if (!files) return false
    return this.findImage(files) !== undefined
  }

  paste = async (node: PixiNode, {files}: DataTransferContent, onMessage: (id: string) => void): Promise<void> => {
    if (!files) return

    const image = this.findImage(files)
    if (!image) return

    const result = await upload(image, this.manager.store.mapId, onMessage)
    if (!result) return

    const {
      apiAnswer: {_id: id},
      fileType,
      metadata: {width: imgWidth, height: imgHeight},
    } = result

    const targetWidth = CONFIG.nodes.dragImageSettings.style.width
    const aspectRation = imgWidth && imgHeight ? imgWidth / imgHeight : 1
    const targetHeight = targetWidth / aspectRation

    const style = {
      ...CONFIG.nodes.dragImageSettings.style,
      height: targetHeight,
    } as NodeData
    style[fileType] = id

    this.manager.setNodeProperties(node, style, true)
  }
}

export {PasteImage}
