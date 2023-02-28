/* eslint-disable */
const upvoty = {
  debug: false,
  error: false,
  //
  preventScrollEvent: false,
  //
  boardHash: null,
  postHash: null,
  userHash: null,
  settings: {},
  iframe: null,
  counters: {send: 1, receive: 1},

  async init(settings) {
    let authData

    try {
      upvoty.settings = this.setSettings(settings)

      if (upvoty.error) {
        console.log('Error initializing widget')
        return false
      }

      const idfy = new XMLHttpRequest()
      idfy.open('POST', `https://${upvoty.settings.baseUrl}/front/handleExternalLogin/`, !0)
      idfy.withCredentials = !0
      const formData = new FormData()
      formData.append('userData', JSON.stringify(settings))
      idfy.send(formData)

      const response = await new Promise((resolve, reject) => {
        idfy.onerror = function (e) {
          e.preventDefault()
          reject(idfy)
        }
        idfy.onload = function () {
          if (idfy.status !== 200) {
            console.log(`Response-Error (${idfy.status}) Upvoty identify: ${idfy.responseText}`)
            reject(idfy)
          }
          resolve(idfy.response)
        }
      })

      authData = JSON.parse(response)

    } catch (e) {
      console.log(`Error Upvoty identify: ${e.message}`)
      return
    }

    // let is_safari = navigator.userAgent.indexOf('Safari') > -1
    // const is_chrome = navigator.userAgent.indexOf('Chrome') > -1
    // if (is_chrome && is_safari) {
    //   is_safari = false
    // }
    // if (is_safari) {
    //   if (!document.cookie.match(/^(.*;)?\s*fixed\s*=\s*[^;]+(.*)?$/)) {
    //     document.cookie = 'fixed=fixed; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/'
    //     window.location.replace(`https://${upvoty.settings.baseUrl}/widget-fix-iframe-3rd.html`)
    //   }
    //   window.addEventListener('touchstart', {})
    //   window.addEventListener('touchend', {})
    // }
    //
    const d = document.querySelectorAll('div[data-upvoty]')[0]
    upvoty.iframe = document.createElement('iframe')
    //
    upvoty.iframe.name = 'ifr_upvoty'
    upvoty.iframe.width = '100%'
    upvoty.iframe.height = '100%'
    upvoty.iframe.id = 'upvoty-iframe' // +upvoty.settings.id;
    upvoty.iframe.allowtransparency = true
    upvoty.iframe.style.border = '0'

    upvoty.settings.originHref = window.location.href

    let fixedLayout = 'roadmap'

    if (upvoty.listeners()) {
      upvoty.iframe.referrerPolicy = 'origin'
      upvoty.iframe.sandbox =
        'allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation allow-modals'
      upvoty.iframe.src = `https://${upvoty.settings.baseUrl}/front/iframe/`
      if (upvoty.settings.startPage === 'changelog') {
        upvoty.iframe.src += 'changelog/'
        fixedLayout = null
      }
      if (upvoty.settings.startPage === 'roadmap') {
        upvoty.iframe.src += 'roadmap/'
      }
      if (upvoty.settings.startPage === 'feedbackWidget') {
        fixedLayout = 'widget'
      }
      if (upvoty.settings.boardHash !== undefined) {
        upvoty.iframe.src += `${upvoty.settings.boardHash}/`
        fixedLayout = 'board'
      }

      if (fixedLayout != null) {
        upvoty.iframe.src += `?fixedLayout=${fixedLayout}`
      }
      if (upvoty.settings.ssoToken !== undefined && upvoty.settings.ssoToken != null) {
        upvoty.iframe.src += '&loginMethod=sso'
      }
      if (upvoty.settings.extension !== undefined && upvoty.settings.extension != null) {
        upvoty.iframe.src += `&widgetExtension=${upvoty.settings.extension}`
      }

      if (window.location.search !== '') {
        const url = new URL(window.location.href)
        const loginToken = url.searchParams.get('__loginToken')
        if (loginToken !== null) {
          upvoty.iframe.src += `&loginToken=${authData.hash}`
        }
      }

      upvoty.bindEvent(upvoty.iframe, 'beforeunload', upvoty.destroy)
      upvoty.bindEvent(upvoty.iframe, 'unload', upvoty.destroy)
      d.appendChild(upvoty.iframe)
    }
  },
  destroy() {
    try {
      upvoty.unbindEvent(window, 'message', upvoty.func_trigger_message)
      upvoty.unbindEvent(upvoty.iframe, 'load', upvoty.func_trigger_load)
      upvoty.unbindEvent(window, 'resize', upvoty.func_trigger_resize)
      upvoty.unbindEvent(upvoty.elmScrollTrigger, 'scroll', upvoty.func_trigger_scroll)
      upvoty.iframe.remove()
    } catch (e) {
      // console.log('Error Upvoty destroy: ' + e.message);
    }
  },
  setSettings(settings) {
    if (!settings.baseUrl) {
      upvoty.error = true
      console.log('Error: baseUrl not set')
    }
    if (!settings.offsetTop) {
      settings.offsetTop = 100
    }
    if (settings.offsetBottom) {
      settings.offsetBottom = 40
    }
    if (settings.startPage) {
      settings.startPage = 'board'
    }
    if (settings.id) {
      settings.id = '1'
    }
    return settings
  },

  sendMessage(inputData) {
    if (upvoty.debug) console.log([`PARENT-SEND:${upvoty.counters.send++}`, inputData])
    upvoty.iframe.contentWindow.postMessage(JSON.stringify(inputData), '*')
  },

  bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
      element.addEventListener(eventName, eventHandler, false)
    } else if (element.attachEvent) {
      element.attachEvent(`on${eventName}`, eventHandler)
    }
    // console.log(['Upvoty bindEvent:' + eventName, element, eventHandler]);
  },
  unbindEvent(element, eventName, eventHandler) {
    if (element.removeEventListener) {
      element.removeEventListener(eventName, eventHandler, false)
    } else if (element.detachEvent) {
      element.detachEvent(`on${eventName}`, eventHandler)
    }
    // console.log(['Upvoty unbindEvent:' + eventName, element, eventHandler]);
  },
  elmScrollTrigger: window,
  listeners() {
    try {
      upvoty.bindEvent(window, 'message', upvoty.func_trigger_message)
      let elem = null
      if ((elem = document.getElementById('feedback'))) {
        const children = elem.childNodes
        for (let i = 0; i < children.length; i++) {
          if (children[i].className && children[i].className.split(' ').indexOf('section-body') >= 0) {
            upvoty.elmScrollTrigger = children[i]
            break
          }
        }
      }
      upvoty.bindEvent(upvoty.elmScrollTrigger, 'scroll', upvoty.func_trigger_scroll)
      upvoty.bindEvent(window, 'resize', upvoty.func_trigger_resize)
      upvoty.bindEvent(upvoty.iframe, 'load', upvoty.func_trigger_load)
      //
      return true
    } catch (e) {
      console.log(`Error Upvoty listeners: ${e.message}`)
    }
    return false
  },

  /** ******** events ***** */
  func_trigger_message(e) {
    if (e.data !== undefined) {
      var inputData = {}
      try {
        inputData = JSON.parse(e.data)
        if (upvoty.debug) console.log([`PARENT-RECIEVE:${upvoty.counters.receive++}`, [inputData.method, inputData]])
        if (inputData.method == 'init') {
          var inputData = {
            method: 'settings',
            data: upvoty.settings,
          }
          upvoty.sendMessage(inputData)
        } else if (inputData.action == 'dimensions') {
          // upvoty.iframe.width = inputData.document.width;
          upvoty.iframe.height = inputData.document.height + 4
        } else if (inputData.action == 'resetScroll') {
          if (!upvoty.preventScrollEvent) {
            upvoty.preventScrollEvent = true
            if (window.scrollY > 0 && upvoty.iframe.getBoundingClientRect().top < 0) {
              var gotoPos =
                window.scrollY > 0 && upvoty.iframe.getBoundingClientRect().top < 0
                  ? upvoty.iframe.getBoundingClientRect().top + window.scrollY - upvoty.settings.offsetTop
                  : 0
              if (gotoPos > 0) {
                window.scrollTo(0, gotoPos)
              }
            }
            setTimeout(function () {
              upvoty.preventScrollEvent = false
            }, 250)
          }
        } else if (inputData.action == 'doScroll') {
          if (!upvoty.preventScrollEvent) {
            upvoty.preventScrollEvent = true
            const newTop = inputData.top
            if (window.scrollY > 0 && newTop + upvoty.iframe.getBoundingClientRect().top != window.scrollY) {
              var gotoPos =
                newTop +
                (window.scrollY > 0 && upvoty.iframe.getBoundingClientRect().top < 0
                  ? upvoty.iframe.getBoundingClientRect().top + window.scrollY - upvoty.settings.offsetTop
                  : 0)
              if (gotoPos > 0) {
                window.scrollTo(0, gotoPos)
              }
            }
            setTimeout(function () {
              upvoty.preventScrollEvent = false
            }, 250)
          }
        }
      } catch (x) {}
    }
  },
  func_trigger_scroll(e) {
    if (!upvoty.preventScrollEvent) {
      upvoty.sendMessage({
        event: 'scrolled',
        offsetWindow: window.scrollY,
        offsetElement: upvoty.iframe.getBoundingClientRect().top + window.pageYOffset,
        endOfPage:
          (upvoty.elmScrollTrigger === window &&
            document.body.scrollHeight - window.scrollY - upvoty.settings.offsetBottom <= window.innerHeight) ||
          upvoty.iframe.getBoundingClientRect().bottom - upvoty.settings.offsetBottom <= window.innerHeight,
      })
    }
  },
  func_trigger_resize() {
    upvoty.sendMessage({event: 'resized'})
  },
  func_trigger_load() {
    upvoty.sendMessage({event: 'loaded'})
  },
}

export default upvoty
