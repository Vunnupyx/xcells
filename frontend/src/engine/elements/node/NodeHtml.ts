import * as PIXI from 'pixi.js'
import {Grid, GridOptions} from 'ag-grid-community'
import {IMAGE_POSITIONS} from '../../../shared/config/constants'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import {IDisplayObjectTypeCategoryNode} from '../types'
import NODE_DETAILS, {NodeDetail} from './NODE_DETAILS'
import NODE_DETAIL_LEVELS from './NODE_DETAIL_LEVELS'
import 'ag-grid-community/styles/ag-theme-alpine.css'

class NodeHtml extends PIXI.Sprite implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.image

  category = TARGET_CATEGORIES.node

  public static defaultMaxWidth = 2024

  public static defaultMaxHeight = 2024

  public maxWidth: number

  public maxHeight: number

  private _loading = false

  private _domElement: HTMLElement

  private _svgRoot: SVGSVGElement

  private _image: HTMLImageElement

  private _loadImage: HTMLImageElement

  private _gridOptions: GridOptions | undefined = undefined

  private lastNodeDetails: NodeDetail = NODE_DETAILS[NODE_DETAIL_LEVELS.normal]

  static isShown(node: PixiNode): boolean {
    return Boolean(node.gridOptions)
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeImage
    const image = new Image()

    this.texture = PIXI.Texture.from(image)

    const nssvg = 'http://www.w3.org/2000/svg'
    const nsxhtml = 'http://www.w3.org/1999/xhtml'
    const svgRoot = document.createElementNS(nssvg, 'svg')
    const foreignObject = document.createElementNS(nssvg, 'foreignObject')
    const domElement = document.createElementNS(nsxhtml, 'div')

    // Arbitrary max size
    foreignObject.setAttribute('width', '100%')
    foreignObject.setAttribute('height', '100%')
    svgRoot.appendChild(foreignObject)
    foreignObject.appendChild(domElement)

    this.maxWidth = NodeHtml.defaultMaxWidth
    this.maxHeight = NodeHtml.defaultMaxHeight
    this._domElement = domElement
    this._svgRoot = svgRoot
    this._image = image
    this._loadImage = new Image()
  }

  measureHtml() {
    Object.assign(this._domElement, {
      style: 'width: 100%; height: 100%',
    })
    new Grid(this._domElement, this._gridOptions || {})

    // Measure the contents using the shadow DOM
    document.body.appendChild(this._svgRoot)
    const contentBounds = this._domElement.getBoundingClientRect()
    this._svgRoot.remove()

    const contentWidth = Math.min(this.maxWidth, Math.ceil(contentBounds.width))
    const contentHeight = Math.min(this.maxHeight, Math.ceil(contentBounds.height))

    this._svgRoot.setAttribute('width', contentWidth.toString())
    this._svgRoot.setAttribute('height', contentHeight.toString())

    return {
      width: contentWidth,
      height: contentHeight,
    }
  }

  async updateImage() {
    const {_gridOptions: lastLoadedGridOptions, _image: image, _loadImage: loadImage} = this
    const {gridOptions} = this.node

    if (gridOptions === lastLoadedGridOptions) return
    this._gridOptions = gridOptions

    const {width, height} = this.measureHtml()
    // eslint-disable-next-line no-multi-assign
    this.texture.baseTexture.width = image.width = loadImage.width = Math.ceil(Math.max(1, width))
    // eslint-disable-next-line no-multi-assign
    this.texture.baseTexture.height = image.height = loadImage.height = Math.ceil(Math.max(1, height))

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
          if (this.texture.baseTexture.valid) {
            await this.texture.baseTexture.resource.load()
          }
          resolve()
        }
        const svgURL = new XMLSerializer().serializeToString(this._svgRoot)

        loadImage.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgURL)}`
      })
    }
  }

  redraw(nodeDetails: NodeDetail): void {
    const {node, texture} = this
    const {headerHeight, imagePosition: storeImagePosition, width, height} = this.node
    const {borderSize: styleBorderSize, cardSiblingSeparator} = CONFIG.nodes

    const {showImage} = nodeDetails
    this.lastNodeDetails = nodeDetails

    this.visible = showImage

    if (!showImage) return

    this.updateImage()

    const borderSize = node.getBorderColor() ? styleBorderSize : styleBorderSize

    const innerWidth = width - 2 * borderSize - cardSiblingSeparator
    const innerHeight = height - 2 * borderSize - cardSiblingSeparator

    const imagePosition = storeImagePosition || IMAGE_POSITIONS.body

    // only if texture was already loaded
    if (texture.valid) {
      const {width: textureWidth, height: textureHeight} = texture.baseTexture
      if (imagePosition === IMAGE_POSITIONS.body) {
        const innerHeightBody = height - headerHeight - (height !== headerHeight ? borderSize : 0)
        const isImageHigher = innerWidth / textureWidth > innerHeightBody / textureHeight

        if (isImageHigher) {
          this.width = innerHeightBody * (textureWidth / textureHeight)
          this.height = innerHeightBody
        } else {
          this.width = innerWidth
          this.height = innerWidth * (textureHeight / textureWidth)
        }
        this.x = borderSize + innerWidth / 2 - this.width / 2
        this.y = headerHeight
        texture.frame = new PIXI.Rectangle(0, 0, textureWidth, textureHeight)
      } else if (imagePosition === IMAGE_POSITIONS.stretch) {
        this.x = borderSize
        this.y = borderSize
        this.width = innerWidth
        this.height = innerHeight
        texture.frame = new PIXI.Rectangle(0, 0, textureWidth, textureHeight)
      } else if (imagePosition === IMAGE_POSITIONS.fullWidth) {
        const relativeImageHeight = textureHeight * (innerWidth / textureWidth)

        this.x = borderSize
        this.y = borderSize
        this.width = innerWidth

        if (innerHeight < relativeImageHeight) {
          this.height = innerHeight
          texture.frame = new PIXI.Rectangle(0, 0, textureWidth, textureWidth * (innerHeight / innerWidth))
        } else {
          this.height = relativeImageHeight
          texture.frame = new PIXI.Rectangle(0, 0, textureWidth, textureHeight)
        }
      } else {
        // IMAGE_POSITIONS.crop
        const isImageHigher = innerWidth / textureWidth > innerHeight / textureHeight
        if (isImageHigher) {
          const offset = 0.5 * Math.round(textureHeight - textureWidth * (innerHeight / innerWidth))
          texture.frame = new PIXI.Rectangle(0, offset, textureWidth, textureHeight - 2 * offset)
        } else {
          const offset = 0.5 * Math.round(textureWidth - textureHeight * (innerWidth / innerHeight))
          texture.frame = new PIXI.Rectangle(offset, 0, textureWidth - 2 * offset, textureHeight)
        }
        this.x = borderSize
        this.y = borderSize
        this.width = innerWidth
        this.height = innerHeight
      }
      texture.updateUvs()
    }
  }
}

export default NodeHtml
