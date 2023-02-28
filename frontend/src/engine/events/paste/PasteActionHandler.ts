import debug from 'debug'
import {TApplicationOptions} from '../../types'
import AbstractEventBinder from '../binding/AbstractEventBinder'

import EventManager from '../EventManager'
import AbstractPasteAction from './AbstractPasteAction'
import * as pasteActions from './actions'
import {PASTE_ACTION_TYPES, PasteActionType, DataTransferContent} from './types'

const log = debug('app:Event:PasteActionHandler')

export class PasteActionHandler extends AbstractEventBinder {
  /**
   * All actions dealing with pasted text
   */
  textActions: AbstractPasteAction[]

  /**
   * All actions dealing with pasted files
   */
  fileActions: AbstractPasteAction[]

  /**
   * Attach the manager to the instance, initialize actions and register default bindings
   * @param manager
   */
  constructor(manager: EventManager, options: TApplicationOptions) {
    super(manager)

    const {createActions} = this

    log('initialize', this)

    this.textActions = createActions(manager, PASTE_ACTION_TYPES.text)

    const disabledFileActions = options.isPdfMetadataImportOptionEnabled ? [] : ['PastePdfFile']
    this.fileActions = createActions(manager, PASTE_ACTION_TYPES.file, disabledFileActions)
  }

  /**
   * Instantiate the action classes, because they need the event manager
   * @private
   * @param manager
   * @returns {string: PointerAction}
   */
  createActions = (
    manager: EventManager,
    type: PasteActionType,
    disabledClasses: string[] = [],
  ): AbstractPasteAction[] => {
    const actionArray = Object.entries(pasteActions)
      .filter(action => !disabledClasses.includes(action[0]))
      .map(action => {
        const PointerActionCls = action[1]
        return new PointerActionCls(manager)
      }) as AbstractPasteAction[]
    const actions = actionArray.filter(action => action.type === type)
    log('created actions', actions)
    return actions
  }

  /**
   * @param content of the dataTransfer
   * @returns an array of all actions matching the content
   */
  getActions = (content: DataTransferContent): AbstractPasteAction[] => {
    const {files, text, types} = content
    const acceptsData = (action: AbstractPasteAction) => action.accepts(content)
    if (files && files.length > 0) {
      return this.fileActions.filter(acceptsData)
    }
    if (types.includes('text/plain') && text) {
      return this.textActions.filter(acceptsData)
    }
    return []
  }
}
