import debug from 'debug'

import {remove, setBorderColor, setColor, setEdgeColor, setFile, setImage} from '../../store/actions'
import {MOVE_DIRECTIONS, ZOOM_DIRECTIONS} from '../RenderEngineControl'
import {externalWarning} from '../../components/AppNotifications'

import EDIT_MODES from './EDIT_MODES'
import type PixiRenderEngine from '../PixiRenderEngine'
import type EventManager from './EventManager'
import indentedText from '../utils/renderer/indentedText'
import {MapContentData} from '../types'
import {api} from '../../hooks/useApi'
import type PixiNode from '../PixiNode'
import type CommonTextField from '../elements/CommonTextField'
import {track} from '../../contexts/tracking'

const log = debug('app:Event:Keyboard')
const logError = log.extend('ERROR*', '::')

const MAP_MIME_TYPE = 'application/json'
const CHATGPT_QUERY = '/chatgpt '

type FileTypes = 'image' | 'file'

interface TrackDetails {
  action: string
  key: string
  color?: string
  selected?: number
  nestingParents?: number
}

const numberOfNestingParents = (node: PixiNode, depth = 0): number => {
  if (!node.isRoot || !node) {
    depth = numberOfNestingParents(node.parentNode, (depth += 1))
  }
  return depth
}

const trackAction = ({action, key, color, selected, nestingParents}: TrackDetails) => {
  track({action, details: {method: 'keyboard', key, color, selected, nestingParents}})
}

class KeyboardEvents {
  engine: PixiRenderEngine

  manager: EventManager

  bindElement: HTMLElement

  isDownHandled: Record<number, boolean> = {}

  constructor(engine: PixiRenderEngine, manager: EventManager, bindElement: HTMLElement) {
    log('new keyboard events', engine)
    this.engine = engine
    this.manager = manager
    this.bindElement = bindElement
    this.addEventListeners()
  }

  destroy(): void {
    this.removeEventListeners()
  }

  addEventListeners(): void {
    const {bindElement} = this
    bindElement.addEventListener('keyup', this.up)
    bindElement.addEventListener('keydown', this.down)
    bindElement.addEventListener('copy', this.copy)
    bindElement.addEventListener('paste', this.paste)
    bindElement.addEventListener('cut', this.cut)
    document.body.addEventListener('keyup', this.up)
    document.body.addEventListener('keydown', this.down)
    document.body.addEventListener('copy', this.copy)
    document.body.addEventListener('paste', this.paste)
    document.body.addEventListener('cut', this.cut)
  }

  removeEventListeners(): void {
    const {bindElement} = this
    bindElement.removeEventListener('keyup', this.up)
    bindElement.removeEventListener('keydown', this.down)
    bindElement.removeEventListener('copy', this.copy)
    bindElement.removeEventListener('paste', this.paste)
    bindElement.removeEventListener('cut', this.cut)
    document.body.removeEventListener('keyup', this.up)
    document.body.removeEventListener('keydown', this.down)
    document.body.removeEventListener('copy', this.copy)
    document.body.removeEventListener('paste', this.paste)
    document.body.removeEventListener('cut', this.cut)
  }

  copy = (event: ClipboardEvent): void => {
    const {getFocus, manager} = this
    const {control} = this.engine

    const node = [...manager.selectedNodes].pop()
    if (!node) return

    const {isFocusedRenderEngine, isFocusedButton} = getFocus(document.activeElement || document.body)
    if (!isFocusedButton && !isFocusedRenderEngine) return

    log('copy', node)
    trackAction({action: 'nodeCopy', key: 'Ctrl+C', selected: manager.selectedNodes.size})

    const selectedSiblings = [...node.parentNode.childNodes].filter(n => n.state.isSelected)

    event.clipboardData?.setData('text/plain', selectedSiblings.flatMap(n => indentedText(n)).join('\n'))
    event.clipboardData?.setData('application/json', JSON.stringify(selectedSiblings.map(n => control.copyNode(n))))
    event.preventDefault()
    event.stopPropagation()
  }

  pasteFile = async (file: File, nodes: PixiNode[], type: FileTypes): Promise<void> => {
    const {mapId} = this.engine
    const {addDispatch} = this.manager

    try {
      const isRoot = [...nodes].every(n => n.isRoot)
      if (isRoot) {
        externalWarning('warningDoNotPasteOnRootPleaseSelectCard')
        return
      }

      const {_id: fileId} = await api.post(`/maps/${mapId}/${type}s`, {
        body: file,
        params: {filename: file.name},
      })

      const action = type === 'image' ? setImage : setFile
      await addDispatch(
        [...nodes].map(node => {
          node[type] = fileId
          return action(node)
        }),
      )
    } catch (e) {
      logError(`Could not upload pasted ${type}: ${(e as Error).message}`)
    }
  }

  paste = (event: ClipboardEvent): void => {
    const {pasteJsonString, pasteFile, pasteText, getFocus, manager} = this
    const {isWriteable} = this.engine.store
    const {hoverNode, selectedNodes} = this.manager

    if (!isWriteable || !event.clipboardData) return

    const {isFocusedRenderEngine, isFocusedButton} = getFocus(document.activeElement || document.body)

    const targetNode = hoverNode || [...selectedNodes].pop()

    if (!targetNode) {
      logError('No node hovered.')
      return
    }

    const nodes = targetNode.state.isSelected ? [...selectedNodes] : [targetNode]

    if (manager.selectedNodes.size === 0) return
    if (!isFocusedButton && !isFocusedRenderEngine) return

    const jsonString = event.clipboardData.getData(MAP_MIME_TYPE)

    if (jsonString) {
      pasteJsonString(jsonString, nodes)

      event.preventDefault()
      event.stopPropagation()
    } else if (event.clipboardData.files.length > 0) {
      const image = Array.from(event.clipboardData.files).find(f => f.type.startsWith('image/'))

      if (image) pasteFile(image, nodes, 'image')

      const file = Array.from(event.clipboardData.files).find(f => !f.type.startsWith('image/'))

      if (file) pasteFile(file, nodes, 'file')

      event.preventDefault()
      event.stopPropagation()
    } else if (event.clipboardData?.types.includes('text/plain')) {
      const text = event.clipboardData?.getData('text/plain') // .replace(/\r\n|\r|\n/g, ' ')

      if (text) {
        pasteText(text, nodes)
        event.preventDefault()
        event.stopPropagation()
      }
    }
    trackAction({action: 'nodePaste', key: 'Ctrl+V', selected: selectedNodes.size})
  }

  pasteText = (text: string, nodes: PixiNode[]): void => {
    const {engine, manager} = this

    const targetNode = nodes[nodes.length - 1]

    if (!targetNode.state.isSelected) {
      manager.selectSingleNode(targetNode)
    }

    if (text.includes('\n')) {
      manager.importer.runImport(new Blob([text], {type: 'text/plain'}), targetNode.id).then()
    } else {
      targetNode.openTextField(text, 'selectAll')
    }
    engine.scheduleRender().then()
  }

  pasteJsonString = (jsonString: string, nodes: PixiNode[]): void => {
    const {manager} = this
    const {control} = this.engine

    if (!jsonString) return

    const isArray = jsonString.trim().startsWith('[')

    let rawData: MapContentData[]
    try {
      rawData = isArray ? JSON.parse(jsonString) : [JSON.parse(jsonString)]
    } catch (e) {
      logError(`Cannot parse json content of clipboard: ${(e as Error).message}`)
      return
    }

    // make sure important data is present
    const filteredData = rawData.filter(data => data.nodes && data.root)

    if (filteredData.length === 0) {
      logError('No data found in pasted json string')
      return
    }
    if (filteredData.length < rawData.length) {
      logError(`Only ${filteredData.length} of ${rawData.length} pasted nodes are usable`, filteredData, rawData)
    }

    log('paste', filteredData)

    const actions = filteredData.flatMap(m => control.pasteNode(m, nodes))

    manager.addDispatch(actions)
  }

  cut = (event: ClipboardEvent): void => {
    const {copy, getFocus, manager} = this
    const {selectedNodes} = this.engine.eventManager
    const {isWriteable} = this.engine.store
    if (!isWriteable) return

    const node = [...selectedNodes].pop()
    if (!node) return

    const {isFocusedRenderEngine, isFocusedButton} = getFocus(document.activeElement || document.body)
    if (!isFocusedButton && !isFocusedRenderEngine) return

    log('copy', node)

    copy(event)

    const selectedSiblings = [...node.parentNode.childNodes].filter(n => n.state.isSelected)
    manager.addDispatch(selectedSiblings.map(n => remove(n)))

    event.preventDefault()
    event.stopPropagation()
  }

  getFocus = (target: Element): Record<string, boolean> => {
    const {bindElement, engine} = this

    const isFocusedTextField = Boolean(target.parentElement?.parentElement === engine.textFieldContainer)
    // @ts-ignore could be a svg Element selected, thats why target is not a "HTMLElement"
    const isFocusedNonEmptyTextField = Boolean(isFocusedTextField && target.innerText?.replace(/\n$/g, ''))
    const isFocusedRenderEngine = Boolean(target === bindElement || target === document.body)
    const isFocusedEngineOrEmptyTextField = Boolean(
      (isFocusedTextField && !isFocusedNonEmptyTextField) || isFocusedRenderEngine,
    )
    const isFocusedButton = Boolean(target.tagName === 'BUTTON')

    return {
      isFocusedTextField,
      isFocusedNonEmptyTextField,
      isFocusedRenderEngine,
      isFocusedEngineOrEmptyTextField,
      isFocusedButton,
    }
  }

  down = (event: KeyboardEvent): void => {
    const {engine, manager, getFocus} = this
    const {
      selectedNodes,
      selectedEdges,
      lastSelectedNode,
      selectNode,
      createSibling,
      replyChatGPTAnswer,
      createChildAndSelect,
      scaleUp,
      scaleDown,
      saveTemporaryNode,
    } = this.manager

    const {
      store: {dispatch, undo, redo, canUndo, canRedo, isWriteable},
      config: {colors},
      eventManager: {mode},
      control: {
        removeSelected,
        goNode,
        selectParent,
        selectChild,
        selectRoot,
        duplicateNode,
        zoom,
        zoomToSelected,
        zoomOutViewport,
      },
    } = this.engine

    const control = event.ctrlKey || event.metaKey
    const {key, shiftKey, keyCode, altKey} = event
    const target = event.target as Element

    // @ts-ignore @todo: move this to an html attribute
    const {ref: activeTextField}: {ref: CommonTextField} = target

    const lastSelectEdge = selectedEdges.size > 0 ? [...selectedEdges][selectedEdges.size - 1] : null

    const {
      isFocusedTextField,
      isFocusedNonEmptyTextField,
      isFocusedRenderEngine,
      isFocusedEngineOrEmptyTextField,
      isFocusedButton,
    } = getFocus(target)

    log('down', {
      control,
      shiftKey,
      key,
      keyCode,
      isFocusedTextField,
      isFocusedRenderEngine,
      isFocusedEngineOrEmptyTextField,
      isFocusedNonEmptyTextField,
      canUndo,
      canRedo,
      lastSelectNode: lastSelectedNode,
      lastSelectEdge,
    })

    // do not save the webpage on ctrl+s
    if (control && key === 's') {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (!isFocusedButton && !isFocusedTextField && !isFocusedEngineOrEmptyTextField) return

    let isHandled = true

    if (control && !isFocusedTextField) manager.setState({isCtrlPressed: true})
    if (shiftKey && !isFocusedTextField) manager.setState({isShiftPressed: true})
    if (altKey && !isFocusedTextField) manager.setState({isAltPressed: true})
    // Navigation first, so we can exist, when we are in read only mode
    if (control && !shiftKey && key === 'l') {
      manager.setState(state => ({isShowAllEdges: !state.isShowAllEdges}))
    } else if (key === 'Escape') {
      log('Escape', {mode, isFocusedTextField})
      if (isFocusedTextField) {
        activeTextField.closeTextField()
      } else if (mode !== EDIT_MODES.navigate) {
        manager.setMode(EDIT_MODES.navigate)
      } else {
        zoomOutViewport()
      }
      this.engine.viewport.emit('escape')
    } else if (!shiftKey && control && keyCode === 173) {
      /* "-" and with shift too, no matter the layout */
      zoom(ZOOM_DIRECTIONS.out)
    } else if (!shiftKey && control && (keyCode === 61 || keyCode === 171)) {
      /* "=" (for english) or "+" (for german), see "-" */
      zoom(ZOOM_DIRECTIONS.in)
    } else if ((isFocusedRenderEngine || isFocusedTextField) && !control && key === 'Tab') {
      if (!lastSelectedNode) selectRoot()
      else if (shiftKey) selectParent()
      else if (lastSelectedNode.childNodes.size > 0) selectChild()
      else if (isWriteable && lastSelectedNode) {
        if (lastSelectedNode.state.isTemporary) {
          saveTemporaryNode(lastSelectedNode)
        }
        trackAction({action: 'nodeAdd', key: 'Tab', nestingParents: numberOfNestingParents(lastSelectedNode)})
        createChildAndSelect(lastSelectedNode)
      }
      // tab should also be handled, if we are not doing anything, we are then in read only mode anyway
    } else if (isFocusedRenderEngine && !control && !shiftKey && key === ' ') {
      this.engine.viewport.emit('spacebar')
    } else if (isFocusedEngineOrEmptyTextField && keyCode >= 37 && keyCode <= 40) {
      // arrow keys
      const direction = {
        37: MOVE_DIRECTIONS.left,
        38: MOVE_DIRECTIONS.up,
        39: MOVE_DIRECTIONS.right,
        40: MOVE_DIRECTIONS.down,
      }[keyCode]

      if (direction && !control && !shiftKey) {
        goNode(direction)
      }
    } else if (control && key === 'f') {
      this.engine.viewport.emit('search')
    } else if (!isFocusedTextField && control && !shiftKey && key === 'a') {
      const saveSelected = Array.from(selectedNodes)
      saveSelected.forEach(node => node.siblingNodes.forEach(sibling => selectNode(sibling)))
    } else if (!isWriteable) {
      // if we are not in a writeable state, don't do anything from below
      isHandled = false
    } else if (!isFocusedButton && key === 'Enter') {
      if (control && !shiftKey) {
        zoomToSelected()
      } else if (isFocusedRenderEngine) {
        if (!control && !shiftKey) {
          if (lastSelectedNode) {
            lastSelectedNode.openTextField(undefined, 'selectAll')
          } else if (lastSelectEdge) {
            lastSelectEdge.openTextField(undefined, 'selectAll')
          }
        } else if (!control && shiftKey) {
          if (lastSelectedNode) {
            if (lastSelectedNode.state.isTemporary) {
              saveTemporaryNode(lastSelectedNode)
            }
            createChildAndSelect(lastSelectedNode)
          }
        } else {
          isHandled = false
        }
      } else if (isFocusedTextField) {
        if (!control && !shiftKey) {
          if (lastSelectedNode) {
            const {title} = lastSelectedNode

            if (lastSelectedNode.state.isTemporary) {
              saveTemporaryNode(lastSelectedNode)
            }

            if (typeof title === 'string' && title.startsWith(CHATGPT_QUERY)) {
              const content = title.substring(CHATGPT_QUERY.length)
              replyChatGPTAnswer(content, lastSelectedNode)
              trackAction({
                action: 'nodeAdd',
                key: 'enter',
                nestingParents: numberOfNestingParents(lastSelectedNode) - 1,
              })
            }
          }
        } else if (!control && shiftKey) {
          // line break, handled by text area
          isHandled = false
        }
      } else {
        isHandled = false
      }
    } else if (shiftKey && control && keyCode === 173 /* "-" and with shift too, no matter the layout */) {
      scaleDown()
      trackAction({action: 'nodeScale', key: 'Ctrl+Shift+Plus/Minus'})
    } else if (
      shiftKey &&
      control &&
      (keyCode === 61 || keyCode === 171) /* "=" (for english) or "+" (for german), see "-" */
    ) {
      scaleUp()
      trackAction({action: 'nodeScale', key: 'Ctrl+Shift+Plus/Minus'})
    } else if (control && (key === 'd' || key === 'D')) {
      duplicateNode()
      trackAction({action: 'nodeDuplicate', key: 'Ctrl+D'})
    } else if (!isFocusedEngineOrEmptyTextField && !isFocusedButton) {
      // don't run any stuff below
      isHandled = false
    } else if (control && (key === 'n' || key === 'N')) {
      if (lastSelectedNode) createSibling(lastSelectedNode)
    } else if (!isFocusedTextField && !control && !shiftKey && (key === 'Delete' || key === 'Backspace')) {
      removeSelected()
      const whichType = selectedNodes.size > 0 ? selectedNodes : selectedEdges
      if (lastSelectedNode !== undefined) trackAction({action: 'nodeRemove', key, selected: whichType.size + 1})
      if (selectedEdges.size > 0) trackAction({action: 'edgeRemove', key, selected: whichType.size})
    } else if ((control && shiftKey && key.toLowerCase() === 'z') || (control && key === 'y')) {
      if (canRedo) {
        redo()
        trackAction({action: 'redo', key: 'Ctrl+y'})
      }
    } else if (control && !shiftKey && key === 'z') {
      if (canUndo) {
        undo()
        trackAction({action: 'undo', key: 'Ctrl+z'})
      }
    } else if (control && keyCode >= 48 && keyCode <= 57) {
      // these are the numbers
      const numberPressed = keyCode - 48
      const color = numberPressed === 0 ? undefined : `@${Object.keys(colors)[numberPressed - 1]}`

      if (shiftKey) {
        // border manipulation
        dispatch(
          [...selectedNodes].map(node => {
            node.borderColor = color
            trackAction({
              action: 'nodeSetBorderColor',
              key: 'Ctrl+Shift+6',
              color: color?.replace('@', ''),
              selected: selectedNodes.size,
            })
            return setBorderColor(node)
          }),
        )
      } else {
        // background manipulation
        dispatch(
          [...selectedNodes]
            .map(node => {
              node.color = color
              trackAction({
                action: 'nodeSetColor',
                key: 'Ctrl',
                color: color?.replace('@', ''),
                selected: selectedNodes.size,
              })
              return setColor(node)
            })
            .concat(
              [...selectedEdges].map(edge => {
                edge.color = color
                trackAction({action: 'edgeSetColor', key: 'Ctrl', color, selected: selectedEdges.size})
                return setEdgeColor(edge)
              }),
            ),
        )
      }
    } else if (!isFocusedTextField && !control && key && /^[a-zäßöü0-9]$/.test(key.toLowerCase())) {
      if (lastSelectedNode) {
        lastSelectedNode.openTextField(key, 'end')
      } else if (lastSelectEdge) {
        lastSelectEdge.openTextField(key, 'end')
      } else {
        isHandled = false
      }
    } else {
      isHandled = false
    }

    if (isHandled) {
      engine.scheduleRender()
      event.preventDefault()
    }

    if (document.activeElement !== document.body && isHandled) event.stopPropagation()

    this.isDownHandled[keyCode] = isHandled
  }

  up = (event: KeyboardEvent): void => {
    const {isDownHandled, manager} = this
    const control = event.ctrlKey || event.metaKey
    const {key, shiftKey, keyCode, altKey} = event

    if (!control) manager.setState({isCtrlPressed: false})
    if (!shiftKey) manager.setState({isShiftPressed: false})
    if (!altKey) manager.setState({isAltPressed: false})

    log('up', {control, key})

    if (control && !shiftKey && key === 'l') {
      event.preventDefault()
    }

    if (document.activeElement !== document.body && isDownHandled[keyCode]) event.stopPropagation()
  }
}

export default KeyboardEvents
