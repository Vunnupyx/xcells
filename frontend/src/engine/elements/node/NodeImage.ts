import * as PIXI from 'pixi.js'
import debug from 'debug'
import {API_BASE_PATH, IMAGE_POSITIONS} from '../../../shared/config/constants'
import NODE_ELEMENT_TYPES from './NODE_ELEMENT_TYPES'
import CONFIG from '../../CONFIG'
import type PixiNode from '../../PixiNode'
import TARGET_CATEGORIES from '../../TARGET_CATEGORIES'
import NODE_ELEMENT_ZINDEX from './NODE_ELEMENT_ZINDEX'
import {IDisplayObjectTypeCategoryNode} from '../types'
import NODE_DETAILS, {NodeDetail} from './NODE_DETAILS'
import NODE_DETAIL_LEVELS from './NODE_DETAIL_LEVELS'

const log = debug('app:NodeImage')

class NodeImage extends PIXI.Sprite implements IDisplayObjectTypeCategoryNode {
  type = NODE_ELEMENT_TYPES.image

  category = TARGET_CATEGORIES.node

  private lastLoadedImageUrl = ''

  private lastNodeDetails: NodeDetail = NODE_DETAILS[NODE_DETAIL_LEVELS.normal]

  static isShown(node: PixiNode): boolean {
    return Boolean(node.image || node.file || node.isUrl)
  }

  constructor(public node: PixiNode) {
    super()
    this.zIndex = NODE_ELEMENT_ZINDEX.NodeImage
  }

  updateImage() {
    const {node, lastLoadedImageUrl} = this
    const {mapId} = this.node.engine.store

    let imageUrl = ''
    if (node.image) {
      imageUrl = `/maps/${mapId}/images/${node.image}`
    } else if (node.file) {
      imageUrl = `/maps/${mapId}/files/${node.file}/thumbnail`
    } else if (node.title && node.isUrl) {
      imageUrl = `/url/thumbnail?${new URLSearchParams({url: node.title})}`
    }

    const url = `${API_BASE_PATH}${imageUrl}`

    if (url === lastLoadedImageUrl) return
    this.lastLoadedImageUrl = url

    log('loading new background image', {url})

    // the PIXI loader takes care of fetching the image
    const loadingTexture = PIXI.Texture.from(url)
    this.texture = loadingTexture.clone()
    loadingTexture.once('update', () => {
      // only update the image, when the container still exists, e.g. the map did not change
      if (!node.isDestroyed) {
        node.setCache(false)
        this.texture = loadingTexture.clone()
        this.redraw(this.lastNodeDetails)
        node.engine.scheduleRender().then()
      }
    })
    loadingTexture.on('error', () => {
      log(`error loading resource from ${url}`)
    })
  }

  redraw(nodeDetails: NodeDetail): void {
    const {node, texture} = this
    const {headerHeight, image, file, isUrl, imagePosition: storeImagePosition, width, height} = this.node
    const {borderSize: styleBorderSize, cardSiblingSeparator} = CONFIG.nodes

    const {showImage} = nodeDetails
    this.lastNodeDetails = nodeDetails

    this.visible = showImage

    if (!showImage) return

    this.updateImage()

    // TODO: think about a way to hide borders, maybe only if no image exists
    const borderSize = node.getBorderColor() ? styleBorderSize : styleBorderSize

    const innerWidth = width - 2 * borderSize - cardSiblingSeparator
    const innerHeight = height - 2 * borderSize - cardSiblingSeparator

    const imagePosition =
      storeImagePosition || (image && IMAGE_POSITIONS.crop) || ((isUrl || file) && IMAGE_POSITIONS.body)

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

export default NodeImage
