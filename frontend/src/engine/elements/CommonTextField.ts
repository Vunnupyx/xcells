import debug from 'debug'

import textFieldStyle from './CommonTextField.module.css'
import type PixiNode from '../PixiNode'
import type PixiEdge from '../PixiEdge'
import {NODE_TOOLBAR_BUTTON_CLASS} from '../../shared/config/constants'

const log = debug('app:RenderEngine:CommonTextField')
const logFlood = log.extend('FLOOD', '::')

const clickedOnNodeToolbar = (event: FocusEvent) => {
  if (!event.relatedTarget) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const target = event.relatedTarget as any
  if (!('className' in target)) return false
  const classes = target.className as string
  return classes.includes(NODE_TOOLBAR_BUTTON_CLASS)
}

abstract class CommonTextField {
  pixiElement: PixiNode | PixiEdge

  textField: HTMLDivElement | null = null

  textFieldMask: HTMLDivElement | null = null

  // textFieldEdges or textFieldNodes
  textFieldCollection: Set<PixiNode | PixiEdge>

  constructor(pixiElement: PixiNode | PixiEdge, textFieldCollection: Set<PixiNode | PixiEdge>) {
    this.pixiElement = pixiElement
    this.textFieldCollection = textFieldCollection
  }

  private moveCursorToEnd(): void {
    const {textField} = this
    if (!textField) return

    if (!textField) return

    textField.focus()

    const range = document.createRange()
    const selection = window.getSelection()

    if (!selection) return

    range.selectNodeContents(textField)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
    textField.focus()
    range.detach()

    // set scroll to the end if multiline
    textField.scrollTop = textField.scrollHeight
  }

  openTextField = (content?: string, cursorPosition?: string): void => {
    // set content before initialisation, so its easy to handle below and to set the content of the textfield for saving
    const {pixiElement} = this
    const {engine} = this.pixiElement

    if (content || content === '') {
      if (cursorPosition === 'selectAll') {
        pixiElement.title = content
      } else if (cursorPosition === 'start') {
        pixiElement.title = `${content}${pixiElement.title}`
      } else {
        // end and undefined
        pixiElement.title = `${pixiElement.title || ''}${content}`
      }
    }

    const {
      engine: {
        viewport,
        store: {isWriteable},
        textFieldContainer,
      },
      title,
      id,
    } = this.pixiElement

    const {moveTextField, textFieldCollection} = this

    textFieldCollection.add(this.pixiElement)
    pixiElement.setState({isEdited: true})

    this.log('open text field', {content, title, cursorPosition})

    if (!this.textField) {
      this.textField = document.createElement('div')
      // make it identifiable in events
      this.textField.className = textFieldStyle.engineTextField
      // @ts-ignore @todo: replace with attribute or something like that
      this.textField.ref = this
      if (isWriteable) this.textField.setAttribute('contenteditable', 'true')
      this.textField.setAttribute('draggable', 'false')
      // this is needed to allow to focus the element
      this.textField.setAttribute('tabindex', '0')

      const closeIfPossible = () => {
        this.log('unfocused text field', id)
        if (this.textField && this.textField !== document.activeElement) {
          this.closeTextField()
        }
      }
      this.textField?.addEventListener('pointerleave', closeIfPossible)
      this.textField?.addEventListener('focusout', (event: FocusEvent) => {
        if (clickedOnNodeToolbar(event)) return
        closeIfPossible()
      })
      this.textField.addEventListener('input', () => {
        if (!this.textField) return

        const {innerText} = this.textField

        this.log('inner text of textfield', innerText)

        this.pixiElement.title = innerText.replace(/(?:\r\n|\r|\n)$/, '') // .replace(/\r\n|\r|\n/g, ' ')

        moveTextField()
        engine.scheduleRender()
      })

      this.textField.addEventListener('paste', (event: ClipboardEvent) => {
        // get plain text from clipboard
        const text = event.clipboardData?.getData('text/plain') /* .replace(/\r\n|\r|\n/g, ' ') */ || ''

        if (document.queryCommandSupported('insertText')) {
          document.execCommand('insertText', false, text)
          event.preventDefault()
        } else {
          // Insert text at the current position of caret
          const range = document.getSelection()?.getRangeAt(0)

          if (range) {
            this.log('paste: range')
            range.deleteContents()

            const textNode = document.createTextNode(text)
            range.insertNode(textNode)
            range.selectNodeContents(textNode)
            range.collapse(false)

            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(range)

            event.preventDefault()
          }
        }

        this.pixiElement.title = this.textField?.innerText.replaceAll(/(\n\n)|(\r\r)|(\r\n\r\n)/g, '\n')

        moveTextField()
        engine.scheduleRender()
      })

      this.textFieldMask = document.createElement('div')
      this.textFieldMask.appendChild(this.textField)
      textFieldContainer.appendChild(this.textFieldMask)
    }

    this.textField.innerHTML = (title || '').replace(/\r\n|\r|\n/g, '<br>')

    moveTextField()
    viewport.on('moved', moveTextField)

    if (cursorPosition) {
      setTimeout(() => {
        if (!this.textField) return

        const range = document.createRange()
        range.selectNodeContents(this.textField)
        if (cursorPosition !== 'selectAll') {
          range.collapse(cursorPosition === 'start')
        }

        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      })
    }

    this.moveCursorToEnd()
    engine.scheduleRender()
  }

  closeTextField(abort = false): void {
    const {textFieldMask, pixiElement} = this
    const {engine} = this.pixiElement
    const {isTemporary} = this.pixiElement.state

    if (!textFieldMask) return

    this.log('close text field', abort)

    if (isTemporary && !pixiElement.hasChanges()) {
      pixiElement.destroy()
      engine.eventManager.resetNodes()
    } else if (abort) {
      this.log('abort text field')
      pixiElement._title = null
      pixiElement.redraw()
      pixiElement.setState({isEdited: false})
    } else {
      if (isTemporary) {
        engine.eventManager.saveNodes()
      }
      this.saveTextField()
      pixiElement.setState({isEdited: false})
    }

    this.deleteTextField()

    engine.scheduleRender()
  }

  deleteTextField(): void {
    const {
      engine: {viewport, textFieldContainer},
    } = this.pixiElement

    const {moveTextField, textFieldMask, textFieldCollection} = this

    if (!textFieldMask) return

    textFieldCollection.delete(this.pixiElement)

    this.textFieldMask = null
    this.textField = null

    textFieldContainer.removeChild(textFieldMask)

    viewport.off('moved', moveTextField)
  }

  abstract moveTextField(): void

  abstract saveTextField(): void

  log(message: string, ...args: unknown[]): void {
    const {id} = this.pixiElement
    log(id, message, ...args)
  }

  logFlood(message: string, ...args: unknown[]): void {
    const {id} = this.pixiElement
    logFlood(id, message, ...args)
  }
}

export default CommonTextField
