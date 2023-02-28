import debug from 'debug'
import type PixiRenderEngine from '../PixiRenderEngine'

const log = debug('app:GestureEvents')

type State = {
  startScale: number
  clientX: number
  clientY: number
}

type GestureEvent = UIEvent & {
  scale: number
  clientX: number
  clientY: number
}

class GestureEvents {
  engine: PixiRenderEngine

  state: State | null = null

  bindElement: HTMLElement

  constructor(engine: PixiRenderEngine, bindElement: HTMLElement) {
    this.engine = engine
    this.bindElement = bindElement

    this.addEventListeners()
  }

  addEventListeners(): void {
    const {bindElement} = this
    bindElement.addEventListener('gesturestart', this.start)
    bindElement.addEventListener('gesturechange', this.change)
    bindElement.addEventListener('gestureend', this.end)
    // TODO: interface still scrolls, when using the touchpad of an ipad pro
    // window.addEventListener('touchstart', this.start)
    // window.addEventListener('touchmove', this.change)
    // window.addEventListener('touchend', this.end)
  }

  removeEventListeners(): void {
    const {bindElement} = this

    bindElement.removeEventListener('gesturestart', this.start)
    bindElement.removeEventListener('gesturechange', this.change)
    bindElement.removeEventListener('gestureend', this.end)
    // TODO: interface still scrolls, when using the touchpad of an ipad pro
    // window.removeEventListener('touchstart', this.start)
    // window.removeEventListener('touchmove', this.change)
    // window.removeEventListener('touchend', this.end)
  }

  destroy(): void {
    this.removeEventListeners()
  }

  start = (event: Event): boolean => {
    const {viewport} = this.engine
    const {scale} = viewport
    const {clientX, clientY} = event as GestureEvent

    log('start', {viewportScale: scale.x, clientX, clientY})

    this.state = {startScale: scale.x, clientX, clientY}
    event.preventDefault()
    return false
  }

  change = (event: Event): boolean => {
    const {state} = this
    const {zoomAtPoint, scheduleRender} = this.engine

    if (!state) return false

    const {clientX, clientY, startScale} = state
    const {scale: changeScale} = event as GestureEvent

    zoomAtPoint({clientX, clientY, scale: startScale * changeScale})
    scheduleRender()

    event.preventDefault()
    return false
  }

  end = (event: Event): boolean => {
    const {scale} = this.engine.viewport

    log('end', {viewportScale: scale.x})

    this.state = null
    event.preventDefault()
    return false
  }
}

export default GestureEvents
