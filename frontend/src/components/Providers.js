import React from 'react'
import {SnackbarProvider} from 'notistack'
import {IntlProvider} from 'react-intl'
import {BrowserRouter as Router} from 'react-router-dom'
import {QueryCache, ReactQueryCacheProvider} from 'react-query'

import CssBaseline from '@material-ui/core/CssBaseline'
import MuiThemeProvider from '@material-ui/styles/ThemeProvider'

import config, {ConfigContext} from '../styles/config'
import theme from '../styles/theme'
import messages from '../intl'
import {AuthProvider} from '../contexts/auth'
import DialogProvider from '../contexts/dialog'
import {TrackingContextProvider} from '../contexts/tracking'

const queryCache = new QueryCache()

const Providers = ({children}) => (
  <ConfigContext.Provider value={config}>
    <MuiThemeProvider theme={theme}>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <CssBaseline />
        <IntlProvider locale="en" messages={messages.en}>
          <SnackbarProvider maxSnack={5}>
            <Router>
              <AuthProvider>
                <TrackingContextProvider>
                  <DialogProvider>{children}</DialogProvider>
                </TrackingContextProvider>
              </AuthProvider>
            </Router>
          </SnackbarProvider>
        </IntlProvider>
      </ReactQueryCacheProvider>
    </MuiThemeProvider>
  </ConfigContext.Provider>
)

export default Providers
