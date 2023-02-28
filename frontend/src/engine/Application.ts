import * as PIXI from 'pixi.js'
import debug from 'debug'
import Color from 'color'
import {AccessibilityManager} from '@pixi/accessibility'

import PERFORMANCE_MODE from './PERFORMANCE_MODE'
import CONFIG from './CONFIG'
import type {TApplicationOptions} from './types'
import logDuration from './utils/logDuration'

const log = debug('app:engine:Application')
const logError = log.extend('ERROR*', '::')
const logPerformance = log.extend('PERFORMANCE', '::')

/**
 * The Application class combines all resources needed for rendering: ticker, stage, renderer
 */
class Application extends PIXI.Application {
  private static getDeviceResolution(mode: PERFORMANCE_MODE): number {
    if (mode === PERFORMANCE_MODE.low) return 1
    if (mode === PERFORMANCE_MODE.high) return window.devicePixelRatio
    return Math.min(CONFIG.performance.maximumDevicePixelRatio, window.devicePixelRatio)
  }

  private static getAntiAlias(mode: PERFORMANCE_MODE): boolean {
    if (mode === PERFORMANCE_MODE.low) return false
    if (mode === PERFORMANCE_MODE.high) return true
    return window.devicePixelRatio <= 1
  }

  constructor(options: TApplicationOptions) {
    if (options.isAccessibilityEnabled) {
      PIXI.Renderer.registerPlugin('accessibility', AccessibilityManager)
    }

    super({
      backgroundColor: new Color(CONFIG.background.color).rgbNumber(),
      resolution: Application.getDeviceResolution(options.performanceMode),
      autoDensity: true,
      antialias: Application.getAntiAlias(options.performanceMode),
      width: window.innerWidth,
      height: window.innerHeight,
      powerPreference: 'high-performance',
      autoStart: false,
    })

    if (options.isAccessibilityEnabled) {
      const accessibilityManager = this.renderer.plugins.accessibility

      accessibilityManager.debug = localStorage.getItem('app.accessibility.debug') || false

      // TODO: work around, as accessible things need to be interactive
      const {updateAccessibleObjects} = accessibilityManager
      accessibilityManager.updateAccessibleObjects = (displayObject: PIXI.DisplayObject): void => {
        const wasInteractive = displayObject.interactive
        if (displayObject && displayObject.accessible) {
          displayObject.interactive = true
        }
        updateAccessibleObjects.call(accessibilityManager, displayObject)

        displayObject.interactive = wasInteractive
      }
    }

    this.stage.accessibleChildren = options.isAccessibilityEnabled
  }

  /**
   * when scheduling a new tick, this will save the promise when a new frame is rendered
   * @private
   */
  private renderPromise: Promise<void> | null = null

  scheduleRender(): Promise<void> {
    // app has been destroyed
    if (this.ticker === null) return Promise.resolve()
    // animation ongoing which means no additional rendering is neccessary
    if (this.ticker.started)
      return new Promise(resolve => {
        this.ticker.addOnce(() => resolve())
      })

    if (!this.renderPromise) {
      this.renderPromise = new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
          this.renderPromise = null

          // has the app been destroyed since this was scheduled?
          if (this.renderer === null) return

          try {
            const endDuration = logDuration(logPerformance, 'ticker update')
            this.render()
            endDuration()
          } catch (e) {
            logError('error while rendering a new frame')
            reject(e)
          }
          resolve()
        })
      })
    }

    return this.renderPromise
  }

  /**
   * Create a PIXI.TilingSprite for the background of the app
   */
  renderBackgroundSprite(): PIXI.TilingSprite {
    const {gridSize} = CONFIG.nodes
    const {color, dotColor, dotRadius, scale} = CONFIG.background
    const renderTexture = PIXI.RenderTexture.create({width: gridSize * scale, height: gridSize * scale})
    const graphic = new PIXI.Graphics()
    graphic.beginFill(Color(color).rgbNumber())
    graphic.drawRect(0, 0, gridSize * scale, gridSize * scale)
    graphic.endFill()
    graphic.beginFill(Color(dotColor).rgbNumber())
    graphic.drawCircle(dotRadius * scale, dotRadius * scale, dotRadius * scale)
    graphic.endFill()
    // render graphic into renderTexture
    this.renderer.render(graphic, {renderTexture})
    const tilingSprite = new PIXI.TilingSprite(renderTexture, this.screen.width, this.screen.height)
    tilingSprite.tileScale = new PIXI.Point(1 / scale, 1 / scale) as PIXI.ObservablePoint

    return tilingSprite
  }
}

export default Application
