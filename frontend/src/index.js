import React from 'react'
import {render} from 'react-dom'
import debug from 'debug'
// babel will handle this line and replace with what is needed https://babeljs.io/docs/en/babel-preset-env
import 'core-js'

import Routes from './routes'
import Providers from './components/Providers'
import ErrorBound from './components/ErrorBound'
import CookieNotification from './components/CookieNotification'
import AppNotifications from './components/AppNotifications'
// import registerServiceWorker from './utils/registerServiceWorker'

if (process.env.NODE_ENV !== 'production') {
  window.setDebug = logFilter => debug.enable(logFilter)
}

render(
  <Providers>
    <ErrorBound>
      <CookieNotification />
      <AppNotifications />
      <Routes />
    </ErrorBound>
  </Providers>,
  document.getElementById('root'),
)

// TODO: activate when we are really are in production and are able to work offline
// registerServiceWorker()
