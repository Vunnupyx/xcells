import * as PIXI from 'pixi.js'

const checkWebGL = () => {
  return PIXI.utils.isWebGLSupported()
}

export default checkWebGL
