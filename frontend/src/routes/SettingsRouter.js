import React from 'react'
import {Redirect, Route, Switch, useRouteMatch} from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import HelmetTitle from '../components/wrapped/HelmetTitle'
import SettingsLayout from '../components/layout/SettingsLayout'
import ProfileSettings from '../components/pages/ProfileSettings'
import AppsSettings from '../components/pages/AppsSettings'

const MapsRouter = () => {
  const {path} = useRouteMatch()
  const {isLoggedIn} = useAuth()

  return (
    <Switch>
      {!isLoggedIn && <Redirect to="/maps" />}
      <Route path={path} exact>
        <SettingsLayout>
          <HelmetTitle titleId="pageTitle.settings" />
          <ProfileSettings />
        </SettingsLayout>
      </Route>
      <Route path={`${path}/apps`} exact>
        <SettingsLayout>
          <HelmetTitle titleId="pageTitle.settings" />
          <AppsSettings />
        </SettingsLayout>
      </Route>
    </Switch>
  )
}

export default MapsRouter
