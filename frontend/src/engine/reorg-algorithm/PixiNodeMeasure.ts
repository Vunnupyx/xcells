import * as PIXI from 'pixi.js'
import {TextStyleFontWeight} from 'pixi.js'
import CONFIG from '../CONFIG'
import {Dimensions} from '../types'

const style = new PIXI.TextStyle({
  fontFamily: CONFIG.nodes.text.fontFamily,
  fontWeight: <TextStyleFontWeight>CONFIG.nodes.text.fontWeight.toString(),
  fontSize: CONFIG.nodes.text.size,
  lineHeight: CONFIG.nodes.text.lineHeight,
  align: 'left',
})

export function getTextDims(text: string | undefined, lineWidth?: number): Dimensions {
  if (text == null || text === '') {
    return {
      width: 0,
      height: CONFIG.nodes.gridSize,
    }
  }

  style.wordWrap = false
  const originalTextMetrics = PIXI.TextMetrics.measureText(text, style)

  if (lineWidth == null || originalTextMetrics.width <= lineWidth) {
    return {
      width: originalTextMetrics.width,
      height: originalTextMetrics.height,
    }
  }

  style.wordWrap = true
  style.wordWrapWidth = lineWidth

  const wrappedTextMetrics = PIXI.TextMetrics.measureText(text, style)
  return {
    width: wrappedTextMetrics.width,
    height: wrappedTextMetrics.height,
  }
}

export function getHeaderDims(title: string | undefined, width: number): Dimensions {
  const {width: textWidth, height: textHeight} = getTextDims(title, width - 2 * CONFIG.nodes.text.paddingLeft)
  return {
    width: textWidth + 3 * CONFIG.nodes.text.paddingLeft,
    height: textHeight + CONFIG.nodes.text.paddingBottom + CONFIG.nodes.text.paddingTop,
  }
}

export function getDimsToFitContent(title: string | undefined, origWidth: number, childDims: Dimensions): Dimensions {
  const {width: headerWidth} = getHeaderDims(title, origWidth)
  const {width: contentWidth, height: contentHeight} = childDims
  const width = Math.max(headerWidth, contentWidth) + CONFIG.nodes.gridSize
  const height = contentHeight + CONFIG.nodes.gridSize
  return {width, height}
}

export function ceilToCellSize(length: number): number {
  return Math.ceil(length / CONFIG.nodes.gridSize)
}

export function floorToCellSize(length: number): number {
  return Math.floor(length / CONFIG.nodes.gridSize)
}
