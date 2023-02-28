export const isDesktopSafari = window.safari !== undefined

export const isMac = /Macintosh/.test(navigator.userAgent)

export const isMobile = /mobile/i.test(navigator.userAgent) && !/ipad|tablet/i.test(navigator.userAgent)

export const isTablet = /ipad|tablet/i.test(navigator.userAgent)

export const hasTouchscreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0

export const isLocalHost =
  // local development
  window.location.hostname === 'localhost' ||
  // used for remove develepment, for example from another device inside your wifi
  window.location.hostname.startsWith('192.') ||
  // used for automated testing from within a docker container to a local development server
  window.location.hostname.startsWith('172.17.') ||
  // used in the automated gitlab ci pipeline
  window.location.hostname.includes('e2e')
