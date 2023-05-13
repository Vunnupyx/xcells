import {Sprite} from '@pixi/sprite'
import type {IDestroyOptions} from '@pixi/display'
import * as PIXI from 'pixi.js'
import type PixiNode from '../../PixiNode'
import NODE_DETAILS, {NodeDetail} from './NODE_DETAILS'
import NODE_DETAIL_LEVELS from './NODE_DETAIL_LEVELS'

export default class NodeHtml extends Sprite {
  /**
   * Default opens when destroying.
   * @type {PIXI.IDestroyOptions}
   * @property {boolean} [texture=true] - Whether to destroy the texture.
   * @property {boolean} [children=false] - Whether to destroy the children.
   * @property {boolean} [baseTexture=true] - Whether to destroy the base texture.
   */
  public static defaultDestroyOptions: IDestroyOptions = {
    texture: true,
    children: false,
    baseTexture: true,
  }

  /** Default maxWidth, set at construction */
  public static defaultMaxWidth = 2024

  /** Default maxHeight, set at construction */
  public static defaultMaxHeight = 2024

  /** Default resolution, make sure autoResolution or defaultAutoResolution is `false`. */
  public static defaultResolution: number | undefined

  /** Default autoResolution for all HTMLText objects */
  public static defaultAutoResolution = true

  /** The maximum width in rendered pixels that the content can be, any larger will be hidden */
  public maxWidth: number

  /** The maximum height in rendered pixels that the content can be, any larger will be hidden */
  public maxHeight: number

  private lastNodeDetail: NodeDetail = NODE_DETAILS[NODE_DETAIL_LEVELS.normal]

  private _domElement: HTMLElement

  private _svgRoot: SVGSVGElement

  private _foreignObject: SVGForeignObjectElement

  private _image: HTMLImageElement

  private _loadImage: HTMLImageElement

  private _resolution: number

  private _html: string | undefined = undefined

  private _lastLoadedHtml: string | undefined = undefined

  private _autoResolution = true

  private _loading = false

  private dirty = false

  static isShown(node: PixiNode): boolean {
    return Boolean(node.html)
  }

  constructor(node: PixiNode) {
    super(PIXI.Texture.EMPTY)

    const image = new Image()
    const texture = PIXI.Texture.from<PIXI.ImageResource>(image, {
      scaleMode: PIXI.settings.SCALE_MODE,
      resourceOptions: {
        autoLoad: false,
      },
    })

    texture.orig = new PIXI.Rectangle()
    texture.trim = new PIXI.Rectangle()

    this.texture = texture

    const nssvg = 'http://www.w3.org/2000/svg'
    const nsxhtml = 'http://www.w3.org/1999/xhtml'
    const svgRoot = document.createElementNS(nssvg, 'svg')
    const foreignObject = document.createElementNS(nssvg, 'foreignObject')
    const domElement = document.createElementNS(nsxhtml, 'div')

    // Arbitrary max size
    foreignObject.setAttribute('width', '10000')
    foreignObject.setAttribute('height', '10000')
    foreignObject.style.overflow = 'hidden'
    svgRoot.appendChild(foreignObject)

    this.maxWidth = NodeHtml.defaultMaxWidth
    this.maxHeight = NodeHtml.defaultMaxHeight
    this._domElement = domElement
    this._svgRoot = svgRoot
    this._foreignObject = foreignObject
    this._foreignObject.appendChild(domElement)
    this._image = image
    this._loadImage = new Image()
    this._autoResolution = NodeHtml.defaultAutoResolution
    this._resolution = NodeHtml.defaultResolution ?? PIXI.settings.RESOLUTION
    this._html = node.html
  }

  /**
   * Calculate the size of the output html without actually drawing it.
   * This includes the `padding` in the `style` object.
   * This can be used as a fast-pass to do things like html-fitting.
   * @param {object} [overrides] - Overrides for the html, style, and resolution.
   * @param {string} [overrides.html] - The html to measure, if not specified, the current html is used.
   * @param {number} [overrides.resolution] - The resolution to measure, if not specified, the current resolution is used.
   * @returns {PIXI.ISize} Width and height of the measured html.
   */
  measureHtml(overrides?: {html?: string; resolution?: number}) {
    const {html} = {
      html: this._html,
      ...overrides,
    }

    Object.assign(this._domElement, {
      innerHTML: html,
    })

    // Measure the contents using the shadow DOM
    document.body.appendChild(this._svgRoot)
    const contentBounds = this._domElement.getBoundingClientRect()

    this._svgRoot.remove()

    const contentWidth = Math.min(this.maxWidth, Math.ceil(contentBounds.width))
    const contentHeight = Math.min(this.maxHeight, Math.ceil(contentBounds.height))

    this._svgRoot.setAttribute('width', contentWidth.toString())
    this._svgRoot.setAttribute('height', contentHeight.toString())

    // Undo the changes to the DOM element
    if (html !== this._html) {
      this._domElement.innerHTML = this._html as string
    }

    return {
      width: contentWidth,
      height: contentHeight,
    }
  }

  async updateHtml(): Promise<void> {
    const {_image: image, _loadImage: loadImage, html} = this

    if (!this.dirty || html === this._lastLoadedHtml) {
      return
    }

    this._lastLoadedHtml = html

    const {width, height} = this.measureHtml()

    // Make sure canvas is at least 1x1 so it drawable
    // for sub-pixel sizes, round up to avoid clipping
    // we update both images, to make sure bounds are correct synchronously
    // eslint-disable-next-line no-multi-assign
    image.width = loadImage.width = Math.ceil(Math.max(1, width))
    // eslint-disable-next-line no-multi-assign
    image.height = loadImage.height = Math.ceil(Math.max(1, height))

    if (!this._loading) {
      this._loading = true
      await new Promise<void>(resolve => {
        loadImage.onload = async () => {
          // Fake waiting for the image to load
          this._loading = false

          // Swap image and loadImage, we do this to avoid
          // flashes between updateHtml calls, usually when
          // the onload time is longer than updateHtml time
          image.src = loadImage.src
          loadImage.onload = null
          loadImage.src = ''

          // Force update the texture
          this.updateTexture()
          resolve()
        }
        const svgURL = new XMLSerializer().serializeToString(this._svgRoot)

        loadImage.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgURL)}`
      })
    }
  }

  /** The raw image element that is rendered under-the-hood. */
  public get source(): HTMLImageElement {
    return this._image
  }

  /**
   * Update the texture resource.
   * @private
   */
  updateTexture() {
    const {texture, _image: image, resolution} = this
    const {baseTexture} = texture

    // eslint-disable-next-line no-multi-assign
    texture.trim.width = texture._frame.width = image.width / resolution
    // eslint-disable-next-line no-multi-assign
    texture.trim.height = texture._frame.height = image.height / resolution

    texture.orig.width = texture._frame.width
    texture.orig.height = texture._frame.height

    // call sprite onTextureUpdate to update scale if _width or _height were set
    this._onTextureUpdate()

    baseTexture.setRealSize(image.width, image.height, resolution)

    this.dirty = false
  }

  redraw(nodeDetail: NodeDetail) {
    const {showImage} = nodeDetail
    this.lastNodeDetail = nodeDetail

    this.visible = showImage

    if (!showImage) return

    if (this._autoResolution) {
      this.dirty = true
    }

    this.updateHtml()
    this.dirty = false
  }

  /**
   * Get the local bounds.
   * @param {PIXI.Rectangle} rect - Input rectangle.
   * @returns {PIXI.Rectangle} Local bounds
   */
  getLocalBounds(rect: PIXI.Rectangle) {
    this.updateHtml()

    return super.getLocalBounds(rect)
  }

  _calculateBounds() {
    this.updateHtml()
    this.calculateVertices()
    // if we have already done this on THIS frame.
    ;(this as any)._bounds.addQuad(this.vertexData)
  }

  /**
   * Destroy this Html object. Don't use after calling.
   * @param {boolean|object} options - Same as Sprite destroy options.
   */
  destroy(options?: boolean | IDestroyOptions | undefined) {
    if (typeof options === 'boolean') {
      options = {children: options}
    }

    options = {...NodeHtml.defaultDestroyOptions, ...options}

    super.destroy(options)

    const forceClear: any = null

    this._svgRoot?.remove()
    this._svgRoot = forceClear
    this._domElement?.remove()
    this._domElement = forceClear
    this._foreignObject?.remove()
    this._foreignObject = forceClear

    this._loadImage.src = ''
    this._loadImage.onload = null
    this._loadImage = forceClear
    this._image.src = ''
    this._image = forceClear
  }

  /**
   * Get the width in pixels.
   * @member {number}
   */
  get width() {
    this.updateHtml()

    return (Math.abs(this.scale.x) * this._image.width) / this.resolution
  }

  set width(
    value, // eslint-disable-line require-jsdoc
  ) {
    this.updateHtml()

    const s = PIXI.utils.sign(this.scale.x) || 1

    this.scale.x = (s * value) / this._image.width / this.resolution
    this._width = value
  }

  /**
   * Get the height in pixels.
   * @member {number}
   */
  get height() {
    this.updateHtml()

    return (Math.abs(this.scale.y) * this._image.height) / this.resolution
  }

  set height(
    value, // eslint-disable-line require-jsdoc
  ) {
    this.updateHtml()

    const s = PIXI.utils.sign(this.scale.y) || 1

    this.scale.y = (s * value) / this._image.height / this.resolution
    this._height = value
  }

  get html() {
    return this._html
  }

  set html(
    html, // eslint-disable-line require-jsdoc
  ) {
    html = String(html === '' || html === null || html === undefined ? ' ' : html)
    html = this.sanitiseHtml(html)

    if (this._html === html) {
      return
    }
    this._html = html
    this.dirty = true
  }

  /**
   * The resolution / device pixel ratio of the canvas.
   * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
   * @member {number}
   * @default 1
   */
  get resolution(): number {
    return this._resolution
  }

  set resolution(
    value: number, // eslint-disable-line require-jsdoc
  ) {
    this._autoResolution = false

    if (this._resolution === value) {
      return
    }

    this._resolution = value
    this.dirty = true
  }

  /**
   * Sanitise html - replace `<br>` with `<br/>`, `&nbsp;` with `&#160;`
   * @param html
   * @see https://www.sitepoint.com/community/t/xhtml-1-0-transitional-xml-parsing-error-entity-nbsp-not-defined/3392/3
   */
  private sanitiseHtml(html: string): string {
    return html
      .replace(/<br>/gi, '<br/>')
      .replace(/<hr>/gi, '<hr/>')
      .replace(/&nbsp;/gi, '&#160;')
  }
}
