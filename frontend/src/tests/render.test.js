import React from 'react'
import ReactDOM from 'react-dom'

import 'jest-canvas-mock'

import Table from '../components/table/Table'

import CookieNotification from '../components/CookieNotification'
import Copyright from '../components/Copyright'
import SimpleDialog from '../components/SimpleDialog'
import Drawer from '../components/Drawer'
import ErrorBound from '../components/ErrorBound'
import NotFound from '../components/NotFound'
import ProgressModal from '../components/ProgressModal'
import Providers from '../components/Providers'
import Version from '../components/Version'
import {MapStoreProvider} from '../contexts/mapStore'

const components = [
  {
    component: Table,
    props: {
      data: [{test: 'TEST', test2: 'TEST', test3: 'TEST'}],
      columns: [
        {Header: 'test', accessor: 'test'},
        {Header: 'test', accessor: 'test2'},
        {Header: 'test', accessor: 'test3'},
      ],
    },
  },
  {
    component: CookieNotification,
  },
  {
    component: Copyright,
  },
  {
    component: SimpleDialog,
    props: {
      title: 'title',
      text: 'text',
      open: true,
      onClose: () => true,
    },
  },
  {
    component: Drawer,
    props: {
      open: true,
      onClose: () => null,
    },
  },
  {
    component: ErrorBound,
  },
  {
    component: NotFound,
  },
  {
    component: NotFound,
  },
  {
    component: ProgressModal,
  },
  {
    component: Version,
  },
]

describe('renders without crashing', () => {
  components.forEach(({component: Component, props}) =>
    it(Component.name, () => {
      const div = document.createElement('div')
      ReactDOM.render(
        <Providers>
          <MapStoreProvider>
            <Component {...props} />
          </MapStoreProvider>
        </Providers>,
        div,
      )
    }),
  )
})
