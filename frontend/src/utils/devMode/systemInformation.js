let getGpuInfo
let getPlatformInfo
let getSystemRamEstimation
let modifyGpuInfo
let getJsHeapInfo
let roundedToDecimalPlace

/**
 * Gets system information
 *
 * @returns {string} System information rendered as a string
 */
export const getSystemInformation = () => ({
  gpu: modifyGpuInfo(getGpuInfo()),
  memory: getSystemRamEstimation(),
  heap: getJsHeapInfo(),
  platform: getPlatformInfo(),
})

getGpuInfo = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      // const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    }
  } catch (e) {
    // nothing yet
  }
  return 'GPU unknown'
}

getPlatformInfo = () => {
  try {
    const platformInfo = navigator.platform
    const threads = navigator.hardwareConcurrency

    return `${platformInfo} with ${threads} Threads`
  } catch (e) {
    // Trick the linter. It does allow neither 'Can\'t' nor "Can't"
    return `Can${String.fromCharCode(39)}t access platform information.`
  }
}

getSystemRamEstimation = () => (navigator.deviceMemory === undefined ? 'unknown' : `${navigator.deviceMemory}GB`)

getJsHeapInfo = (unit = 1000 ** 2) => {
  try {
    const limit = roundedToDecimalPlace(window.performance.memory.jsHeapSizeLimit / unit, 2)
    const allocated = roundedToDecimalPlace(window.performance.memory.totalJSHeapSize / unit, 2)
    const used = roundedToDecimalPlace(window.performance.memory.usedJSHeapSize / unit, 2)
    let usage = (window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit) * 100
    usage = roundedToDecimalPlace(usage, 2)

    return {limit, allocated, used, usage}
  } catch (e) {
    return {}
  }
}

roundedToDecimalPlace = (val, place) => {
  const unit = 10 ** place
  return Math.round(val * unit) / unit
}

/**
 * Makes GPU information better to read
 *
 * @param str GPU information
 * @returns {string} Formatted GPU information
 */
modifyGpuInfo = str => {
  let mod = String(str)

  const angleMatch = mod.match(/(ANGLE[ ][(])(.+)([)])/m)
  if (angleMatch) {
    mod = `${angleMatch[2]} with ANGLE`
  } else if (mod.startsWith('Mesa DRI')) {
    mod = `${mod.substring(8)} with Mesa DRI`
  }

  mod = mod.replace('NVIDIA Corporation,', 'NVIDIA ')
  mod = mod.replace('Intel(R)', 'Intel')
  mod = mod.replace('ATI Technologies Inc., AMD', 'AMD')
  mod = mod.replace('Adreno (TM)', 'Adreno')
  mod = mod.replace('Radeon (TM)', 'Radeon')

  // Remove information like /PCIe/SSE2
  mod = mod.replace(/[/][a-zA-Z0-9]+[/][a-zA-Z0-9]+/gm, '')

  mod = mod.replace(', OpenGL', '\nOpenGL ')

  return mod
}
