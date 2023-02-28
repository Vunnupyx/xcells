const checkInIframe = () => {
  try {
    return window.self !== window.top
  } catch {
    // no access to window.top means we are in an iframe
    return true
  }
}

export default checkInIframe
