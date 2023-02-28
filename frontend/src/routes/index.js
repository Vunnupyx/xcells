import React from 'react'
import {Redirect, Route, Switch} from 'react-router-dom'

import NotFound from '../components/NotFound'
import MapsRouter from './MapsRouter'
import HomePageLayout from '../components/layout/HomePageLayout'
import HiddenForUser from '../components/hide/HiddenForUser'
import HiddenForGuest from '../components/hide/HiddenForGuest'
import BenchmarkResult from '../components/pages/BenchmarkResult'
import FirstLoginDialog from '../components/FirstLoginDialog'

const Routes = () => (
  <Switch>
    <Route component={BenchmarkResult} path="/benchmarkResult" />
    <Route path="/welcome">
      <MapsRouter />
      <HiddenForGuest>
        <FirstLoginDialog />
      </HiddenForGuest>
    </Route>
    <Route path="/maps">
      <MapsRouter />
    </Route>
    <Route path="/" exact>
      <HiddenForGuest>
        <Redirect to="/maps" />
      </HiddenForGuest>
      <HiddenForUser>
        <Redirect to="/maps/public" />
      </HiddenForUser>
    </Route>
    <Route>
      <HomePageLayout>
        <NotFound />
      </HomePageLayout>
    </Route>
  </Switch>
)

export default Routes
