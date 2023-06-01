import React from 'react'
import {Redirect, Route, Switch, useRouteMatch} from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import HelmetTitle from '../components/wrapped/HelmetTitle'
import SettingsLayout from '../components/pages/settings/SettingsLayout'
import ProfilePage from '../components/pages/settings/user/ProfilePage'
import IntegrationPage from '../components/pages/settings/integration/IntegrationPage'

const MapsRouter = () => {
  const {path} = useRouteMatch()
  const {isLoggedIn} = useAuth()

  return (
    <Switch>
      {!isLoggedIn && <Redirect to="/maps" />}
      <Route path={path} exact>
        <SettingsLayout>
          <HelmetTitle titleId="pageTitle.settings" />
          <ProfilePage />
        </SettingsLayout>
      </Route>
      <Route path={`${path}/apps`} exact>
        <SettingsLayout>
          <HelmetTitle titleId="pageTitle.settings" />
          <IntegrationPage />
        </SettingsLayout>
      </Route>
    </Switch>
  )
}

export default MapsRouter
