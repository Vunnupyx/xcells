// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PasteActionDialog from '../../../components/dialogs/PasteActionDialog'
import PixiNode from '../../PixiNode'
import EventManager from '../EventManager'
import {DataTransferContent, PasteActionType} from './types'

export default abstract class AbstractPasteAction {
  /**
   * To define whether this action deals with text or files
   */
  abstract type: PasteActionType

  /**
   * Name that is displayed in the selection dialog in case multiple
   * actions are possible for the pasted data
   * @see PasteActionDialog
   */
  abstract name: string

  manager: EventManager

  constructor(manager: EventManager) {
    this.manager = manager
  }

  /**
   * Decides whether this action can deal with the pasted content
   */
  abstract accepts: (content: DataTransferContent) => boolean

  /**
   * Actual paste action. The action pastes the content into the node
   */
  abstract paste: (node: PixiNode, content: DataTransferContent, onMessage: (id: string) => void) => void

  /**
   * This method is called when everything is saved after the paste-function
   */
  afterPaste?: (node: PixiNode) => void
}
