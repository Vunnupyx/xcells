import {upload} from '../../../../utils/datatransferAndFiles'
import PixiNode from '../../../PixiNode'
import StackPacker from '../../../reorg-algorithm/cardpacker-implementations/BoxPacker/StackPacker'
import InfinityTraversal from '../../../reorg-algorithm/InfinityTraversal'
import PdfTemplate from '../pdf-template/PdfTemplate'

import Lan from '../../../../intl/map.en'
import AbstractPasteAction from '../AbstractPasteAction'
import {DataTransferContent, PASTE_ACTION_TYPES} from '../types'

class PastePdfFile extends AbstractPasteAction {
  type = PASTE_ACTION_TYPES.file

  name = Lan.pasteActionNames.pastePdfFile

  private findPdf = (files: File[]): File | undefined => {
    const isPdf = (f: File) => f.type === 'application/pdf'
    return files.find(isPdf)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accepts = ({files}: DataTransferContent): boolean => {
    if (!files) return false
    return this.findPdf(files) !== undefined
  }

  paste = async (node: PixiNode, {files}: DataTransferContent, onMessage: (id: string) => void): Promise<void> => {
    if (!files) return

    const file = this.findPdf(files)
    if (!file) return

    const result = await upload(file, this.manager.store.mapId, onMessage)
    if (!result) return

    const {_id: fileId} = result.apiAnswer

    const template = await PdfTemplate.from(file, fileId)
    this.manager.setNodeTemplate(node, template)
  }

  afterPaste = (node: PixiNode): void => {
    const outlineNode = PdfTemplate.findOutlineCard(node)
    if (outlineNode && outlineNode.childNodes.size > 0) {
      this.manager.engine.control.reorgNodes(InfinityTraversal.INFINITE_DEPTH, new StackPacker(), outlineNode, false)
    }
    node.zoomTo()
  }
}

export {PastePdfFile}
